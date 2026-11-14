// Directorio privado. Firebase sigue siendo quien comprueba las contraseñas.
class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}
const invalidLogin = () => new HttpError(401, 'invalid-credentials', 'Usuario o contraseña incorrectos.');
export function normalizeUsername(value) {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(value.trim())) {
    throw new HttpError(400, 'invalid-username', 'Usa entre 3 y 20 letras sin acentos, números o guion bajo.');
  }
  return { key: value.trim().toLowerCase(), display: value.trim() };
}
async function readBody(request, fields) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new HttpError(415, 'json-required', 'Se requiere JSON.');
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, 'invalid-request', 'Solicitud inválida.');
  const chunks = []; let size = 0;
  try {
    while (true) {
      const part = await reader.read(); if (part.done) break;
      size += part.value.byteLength;
      if (size > 4096) { await reader.cancel(); throw new HttpError(413, 'request-too-large', 'Solicitud demasiado grande.'); }
      chunks.push(part.value);
    }
  } finally { reader.releaseLock(); }
  try {
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!body || Array.isArray(body) || Object.keys(body).length !== fields.length || !fields.every(key => Object.hasOwn(body, key))) throw Error('shape');
    return body;
  } catch { throw new HttpError(400, 'invalid-request', 'Solicitud inválida.'); }
}
export function createHandler({ fetch: externalFetch = globalThis.fetch } = {}) {
  async function external(url, options) {
    try { return await externalFetch(url, { ...options, signal: AbortSignal.timeout(10000) }); }
    catch { throw new HttpError(503, 'unavailable', 'El servicio no está disponible. Inténtalo más tarde o entra por correo.'); }
  }
  async function authCall(env, method, body, appCheckToken = null) {
    const response = await external(`https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${encodeURIComponent(env.FIREBASE_WEB_API_KEY)}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', ...(appCheckToken ? { 'X-Firebase-AppCheck': appCheckToken } : {}) }, body: JSON.stringify(body),
    });
    if (response.status === 429) throw new HttpError(429, 'too-many-attempts', 'Demasiados intentos. Espera un minuto.');
    if (response.status >= 500) throw new HttpError(503, 'unavailable', 'Firebase no está disponible temporalmente.');
    if (!response.ok) return null;
    return response.json();
  }
  async function authenticated(request, env) {
    const header = request.headers.get('authorization') || '';
    if (!header.startsWith('Bearer ') || header.length > 12000) throw new HttpError(401, 'unauthenticated', 'Vuelve a iniciar sesión.');
    const idToken = header.slice(7);
    const appCheckToken = request.headers.get('X-Firebase-AppCheck');
    const result = await authCall(env, 'lookup', { idToken }, appCheckToken);
    const account = result?.users?.[0];
    if (!account?.localId || !account.email || account.disabled) throw new HttpError(401, 'unauthenticated', 'Vuelve a iniciar sesión.');
    return { uid: account.localId, email: account.email, idToken, appCheckToken };
  }
  async function deleting(account, env) {
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/databases/(default)/documents/accountDeletions/${encodeURIComponent(account.uid)}`;
    const response = await external(url, { headers: { Authorization: 'Bearer ' + account.idToken, ...(account.appCheckToken ? { 'X-Firebase-AppCheck': account.appCheckToken } : {}) } });
    if (response.status === 404) return false;
    if (response.ok) return true;
    throw new HttpError(503, 'unavailable', 'No se pudo comprobar el estado de la cuenta.');
  }
  async function ensureLive(account, env) {
    const deleted = await env.DB.prepare('SELECT uid FROM deleted_accounts WHERE uid = ?').bind(account.uid).first();
    if (deleted || await deleting(account, env)) throw new HttpError(409, 'account-deleting', 'Esta cuenta está en proceso de eliminación. Entra por correo para terminar.');
  }
  async function login(request, env) {
    const body = await readBody(request, ['username', 'password']);
    let name;
    try { name = normalizeUsername(body.username); } catch { throw invalidLogin(); }
    if (typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 128) throw invalidLogin();
    if (!(await env.LOGIN_NAME_LIMIT.limit({ key: 'name:' + name.key })).success) throw new HttpError(429, 'too-many-attempts', 'Demasiados intentos. Espera un minuto.');
    const row = await env.DB.prepare('SELECT u.uid, u.email FROM usernames u WHERE u.username = ? AND NOT EXISTS (SELECT 1 FROM deleted_accounts d WHERE d.uid = u.uid)').bind(name.key).first();
    // También se consulta Firebase para nombres ausentes, sin distinguirlos de contraseñas incorrectas en la respuesta.
    const appCheckToken = request.headers.get('X-Firebase-AppCheck');
    const result = await authCall(env, 'signInWithPassword', { email: row?.email || 'unavailable-login@gatontopia.invalid', password: body.password, returnSecureToken: true }, appCheckToken);
    if (!row || !result?.idToken || result.localId !== row.uid || typeof result.email !== 'string') throw invalidLogin();
    try { await ensureLive({ uid: row.uid, idToken: result.idToken, appCheckToken }, env); }
    catch (e) { if (e.code === 'account-deleting') throw invalidLogin(); throw e; }
    // Solo quien demostró conocer la contraseña recibe su propio correo. No se devuelven tokens de Firebase.
    return { email: result.email };
  }
  async function profile(request, env) {
    const account = await authenticated(request, env);
    const row = await env.DB.prepare('SELECT display_name, email FROM usernames WHERE uid = ?').bind(account.uid).first();
    if (row && row.email !== account.email) await env.DB.prepare('UPDATE usernames SET email = ? WHERE uid = ?').bind(account.email, account.uid).run();
    return { username: row?.display_name || null };
  }
  async function claim(request, env) {
    const body = await readBody(request, ['username']), name = normalizeUsername(body.username);
    const account = await authenticated(request, env); await ensureLive(account, env);
    const existing = await env.DB.prepare('SELECT username, display_name FROM usernames WHERE uid = ?').bind(account.uid).first();
    if (existing) {
      if (existing.username !== name.key) throw new HttpError(409, 'already-named', 'Esta cuenta ya tiene un nombre de usuario.');
      return { username: existing.display_name };
    }
    try {
      const result = await env.DB.prepare('INSERT INTO usernames (username, uid, email, display_name) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM deleted_accounts WHERE uid = ?)').bind(name.key, account.uid, account.email, name.display, account.uid).run();
      if (!result.meta.changes) throw new HttpError(409, 'account-deleting', 'La cuenta está en proceso de eliminación.');
    } catch (e) {
      if (e instanceof HttpError) throw e;
      if (/constraint|unique/i.test(String(e.message))) throw new HttpError(409, 'username-taken', 'Ese nombre ya está ocupado. Elige otro.');
      throw e;
    }
    return { username: name.display };
  }
  async function remove(request, env) {
    const account = await authenticated(request, env);
    if (!await deleting(account, env)) throw new HttpError(409, 'deletion-not-started', 'Confirma primero la eliminación de la cuenta en el juego.');
    await env.DB.batch([
      env.DB.prepare('INSERT OR IGNORE INTO deleted_accounts (uid) VALUES (?)').bind(account.uid),
      env.DB.prepare('DELETE FROM usernames WHERE uid = ?').bind(account.uid),
    ]);
    return { deleted: true };
  }
  return async function handle(request, env) {
    const origin = request.headers.get('origin');
    const allowed = (env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'Vary': 'Origin', 'X-Content-Type-Options': 'nosniff' };
    if (origin && allowed.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Firebase-AppCheck';
    }
    function response(body, status = 200) { return new Response(body === null ? null : JSON.stringify(body), { status, headers }); }
    try {
      if (!origin || !allowed.includes(origin)) throw new HttpError(403, 'origin-denied', 'Origen no permitido.');
      if (request.method === 'OPTIONS') return response(null, 204);
      if (!env.DB || !env.AUTH_IP_LIMIT || !env.LOGIN_NAME_LIMIT || !env.FIREBASE_WEB_API_KEY || !env.FIREBASE_PROJECT_ID) throw new HttpError(503, 'not-configured', 'El acceso por usuario aún no está configurado. Puedes entrar por correo.');
      const ip = request.headers.get('CF-Connecting-IP');
      if (!ip) throw new HttpError(403, 'missing-client', 'Solicitud no válida.');
      if (!(await env.AUTH_IP_LIMIT.limit({ key: 'ip:' + ip })).success) throw new HttpError(429, 'too-many-attempts', 'Demasiados intentos. Espera un minuto.');
      const route = new URL(request.url).pathname.replace(/\/$/, '') || '/';
      if (route === '/login' && request.method === 'POST') return response(await login(request, env));
      if (route === '/username' && request.method === 'GET') return response(await profile(request, env));
      if (route === '/username' && request.method === 'POST') return response(await claim(request, env));
      if (route === '/username' && request.method === 'DELETE') return response(await remove(request, env));
      throw new HttpError(404, 'not-found', 'Ruta no encontrada.');
    } catch (e) {
      // No se registra el cuerpo, la contraseña, los tokens ni los errores sin filtrar del proveedor.
      return response({ code: e instanceof HttpError ? e.code : 'unavailable', message: e instanceof HttpError ? e.message : 'El servicio no está disponible. Inténtalo más tarde.' }, e instanceof HttpError ? e.status : 503);
    }
  };
}
export default { fetch: createHandler() };
