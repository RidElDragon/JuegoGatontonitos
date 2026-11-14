# Inicio por nombre de usuario con Cloudflare Workers Free

El juego sigue en GitHub Pages y Firebase conserva las cuentas y partidas. La API de esta carpeta usa **Workers Free + D1 Free** únicamente para un directorio privado de nombres. No necesita Firebase Admin, claves privadas ni un servidor en tu PC. No se ha desplegado ni creado ningún recurso remoto automáticamente.

## Prepararlo en tu cuenta gratuita

1. Crea una cuenta en https://dash.cloudflare.com/ si no tienes una. Mantén Workers y D1 en el **plan gratuito**; no actives una suscripción Workers Paid ni añadas facturación para este proyecto. No necesitas comprar un dominio: usaremos `workers.dev`.
2. Desde `E:\cat-battle`, con Node y npm disponibles:

```powershell
npm.cmd ci
npx.cmd wrangler login
npx.cmd wrangler d1 create gatontopia-usernames --config workers/username-api/wrangler.jsonc
```

3. El comando de D1 muestra un `database_id`. Sustituye `REEMPLAZA_CON_EL_ID_DE_TU_D1` en `workers/username-api/wrangler.jsonc` por ese ID. No cambies el nombre del binding `DB`.
4. Revisa las variables en ese mismo archivo: `FIREBASE_PROJECT_ID` debe ser tu proyecto de Firebase (`gatontopia`) y `ALLOWED_ORIGINS` debe incluir el origen de GitHub Pages: `https://rideldragon.github.io`, **sin** `/JuegoGatontonitos`. Si usas varios orígenes, sepáralos por comas. Evita comodines.
5. Crea las tablas y publica la API:

```powershell
npx.cmd wrangler d1 execute gatontopia-usernames --remote --file workers/username-api/schema.sql --config workers/username-api/wrangler.jsonc
npx.cmd wrangler deploy --config workers/username-api/wrangler.jsonc
npx.cmd wrangler secret put FIREBASE_WEB_API_KEY --config workers/username-api/wrangler.jsonc
```

El último comando te pide un valor: pega **la API key web del mismo proyecto Firebase**, que ya aparece como `apiKey` en tu configuración web. No uses una clave privada ni un JSON de cuenta de servicio. Hasta introducir esta variable, el servicio responderá que no está configurado. Si la API key tiene restricciones de sitios HTTP, las peticiones del Worker podrían rechazarse: usa una clave del mismo proyecto que permita al servidor llamar a Identity Toolkit, sin quitar las reglas de Firestore.

6. El despliegue muestra una URL HTTPS como `https://gatontopia-usernames.TU_SUBDOMINIO.workers.dev`. Pon **tu URL real** en `js/username-config.js`:

```js
window.CAT_USERNAME_API = 'https://gatontopia-usernames.TU_SUBDOMINIO.workers.dev';
```

7. Publica los archivos actualizados del juego en GitHub Pages. El `index.html` incluye una versión nueva del script para evitar la caché anterior. Esta función no necesita reglas nuevas de Firestore: usa las reglas de eliminación de cuentas que ya publicaste.

Las cuentas actuales entran por correo como antes. Después de iniciar sesión aparece la opción para elegir un nombre. Las cuentas nuevas lo eligen durante el registro una vez configurada la API.

## Qué ocurre al usarlo

- Los nombres tienen entre 3 y 20 caracteres: letras ASCII, números y `_`. No distinguen mayúsculas y son únicos. Se conserva la escritura elegida para mostrarlos. Por ahora cada cuenta puede asignarse un solo nombre, sin renombrarlo desde el juego.
- El formulario de inicio acepta usuario **o correo**. El de registro usa correo, contraseña y nombre. La recuperación siempre pide correo.
- Si el nombre está ocupado cuando Firebase ya creó la cuenta, **no se borra la cuenta**: el panel lo explica y permite elegir otro nombre. Se puede seguir entrando por correo.
- El directorio D1 guarda nombre, UID y correo, de forma privada. Los datos no se incluyen en el repositorio, en Firestore público ni en una respuesta de búsqueda de nombre.
- Para iniciar por nombre, la API recibe la contraseña por HTTPS y la verifica en Firebase. Solo después devuelve el correo de la propia cuenta; el SDK termina el inicio de sesión normal. Esto realiza dos comprobaciones de acceso en Firebase. No se devuelven los tokens de la petición del Worker.
- Las contraseñas no se almacenan en D1, en registros del Worker ni en archivos. Firebase Authentication sigue gestionando su almacenamiento seguro. El código del Worker evita registrar cuerpos, tokens y errores sin filtrar.
- La asignación y consulta del nombre exigen un ID token válido de Firebase. El correo y UID se obtienen de Firebase, nunca de campos enviados por el cliente. No hay una ruta para listar usuarios.
- La API limita los intentos por IP y por nombre usando bindings nativos de Cloudflare. Son límites básicos por ubicación de Cloudflare, no una garantía de bloqueo global perfecto. CORS se restringe a los orígenes configurados; la seguridad no depende solo de CORS.
- Si configuraste App Check en el juego, sus tokens se reenvían a Firebase junto con las peticiones REST. No desactives las reglas de Firestore para solucionar un error de conexión.
- Si la API no está disponible o se agota una cuota gratuita, el inicio directo por correo sigue disponible. La asignación de nombres y su retirada deberán reintentarse al recuperar el servicio. No actives un plan de pago para superar el límite.

## Eliminación de cuenta

Mantén configurada la URL mientras haya cuentas con nombre. Tras confirmar la contraseña, el juego marca la eliminación en Firestore, elimina el progreso y solicita a la API retirar el nombre y correo de D1. La API comprueba la marca de eliminación y borra la entrada en una transacción, dejando solo el UID en `deleted_accounts` para impedir que una petición antigua vuelva a reservar un nombre. Después se elimina el acceso en Firebase Authentication.

El nombre queda libre para otra cuenta. Si falla la retirada del directorio, el panel mantiene la eliminación pendiente para reintentar. El juego no informa de una eliminación completa mientras la API siga pendiente. No retires permanentemente la API sin limpiar antes su directorio privado.

## Validación local sin publicar

```powershell
npm.cmd test
npx.cmd wrangler deploy --config workers/username-api/wrangler.jsonc --dry-run
node tools/smoke-browser.cjs
```

Las pruebas usan SQLite en memoria y respuestas simuladas de Firebase; no crean cuentas reales ni consultan tu directorio. El dry-run solo empaqueta la API. Después de activar el proyecto real, prueba con una cuenta de prueba: registrar un nombre, acceder por ese nombre y por correo, rechazar un duplicado con distintas mayúsculas y eliminar la cuenta para comprobar que el nombre se libera.

Cuotas oficiales: https://developers.cloudflare.com/workers/platform/pricing/
Autenticación REST: https://firebase.google.com/docs/reference/rest/auth
