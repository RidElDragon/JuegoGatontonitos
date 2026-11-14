# Cuentas y guardado con Firebase (plan Spark)

La integración está preparada, pero desactivada: `js/firebase-config.js` tiene configuración `null`. El juego sigue funcionando como invitado. No se ha creado ni desplegado ningún proyecto externo.

## Activar el proyecto gratuito

1. Entra en https://console.firebase.google.com/ y crea un proyecto. Puedes omitir Analytics. Mantén el plan **Spark**, sin vincular una cuenta de facturación.
2. Registra una aplicación **web** y copia su objeto `firebaseConfig` en `window.CAT_FIREBASE_CONFIG`, dentro de `js/firebase-config.js`. Son los datos públicos de la aplicación: no uses credenciales privadas ni una cuenta de servicio.
3. En Authentication, activa el proveedor **Correo electrónico/contraseña**. Configura una política de contraseñas y protección contra enumeración de correos en la consola. Revisa también la plantilla de recuperación de contraseña.
4. Crea una base **Cloud Firestore Standard**, con la ubicación que prefieras. Usa modo producción. **Publica `firestore.rules` antes de usar las cuentas**; no habilites reglas abiertas de prueba.
5. Publica la configuración de índices de `firestore.indexes.json`. Desactiva los índices de `progress`: no hacemos búsquedas por los valores internos del guardado.
6. Sirve el juego desde HTTP en localhost o desde HTTPS al publicarlo; las cuentas no se activan al abrir `index.html` con doble clic. En Authentication > Settings > Authorized domains, autoriza el dominio donde lo publiques (y `localhost` si vas a usarlo).
7. Opcional: registra la aplicación web en App Check y coloca su clave pública reCAPTCHA v3 en `CAT_APP_CHECK_SITE_KEY`. Revisa primero las métricas antes de activar enforcement para Firestore. App Check reduce el abuso, pero no valida victorias ni evita todas las trampas.

Para publicar con la CLI, desde una terminal con Node y npm disponibles:

```powershell
npm ci
npx firebase login
npx firebase deploy --project TU_PROJECT_ID --only firestore:rules,firestore:indexes,hosting
```

Sustituye `TU_PROJECT_ID` por el ID real. El repositorio incluye `firebase.json`; no hace falta ejecutar `firebase init`. Comprueba el proyecto seleccionado antes del deploy. La configuración de Hosting excluye herramientas, pruebas, dependencias y archivos ocultos. No subas secretos al directorio público del juego.

## Qué se guarda

Un documento `/players/{uid}` contiene `schema`, `revision`, `updatedAt` (hora del servidor) y `progress`. Incluye mejoras, tickets, tesoros, expedición y consumibles; progreso de Historia/Eventos/Leyenda; escuadrón y formas; almacén agrupado y misiones; logros y bestiario; y la última batalla infinita guardada. El sonido sigue siendo una preferencia de cada dispositivo.

No se guardan contraseñas en Firestore, el código ni el almacenamiento local del juego. Las recibe Firebase Authentication mediante su SDK. El SDK gestiona la sesión persistente; cerrar sesión la elimina de este navegador.

No se usa compresión: los datos importantes siguen disponibles para las reglas y la inspección de conflictos. El cliente comprueba el esquema completo antes de subir o instalar una partida. Las reglas del servidor aplican propiedad por UID, revisiones, hora de servidor, rangos de XP/tickets/mejoras/niveles y restricciones estructurales básicas. **No validan todos los valores internos de los mapas de logros, tesoros, expedición, inventario o bestiario, ni prueban que se ganó una batalla**. Un usuario determinado puede modificar su propio progreso dentro de esas restricciones. No es un sistema apto todavía para clasificaciones competitivas o premios con valor económico.

## Elección de partida y conflictos

- Iniciar sesión no reemplaza ni sube automáticamente una partida no vinculada.
- «Subir partida local» vincula la partida con la cuenta, con confirmación cuando hay que elegir un origen. Si existe una partida remota, la elección la reemplaza; no suma XP ni objetos.
- «Descargar partida de la cuenta» obtiene la última versión del servidor, guarda un respaldo local y recarga el juego para actualizar todos los módulos.
- Las subidas usan una transacción: si cambió la revisión en otro dispositivo, se detienen y hay que elegir nuevamente. No se usa la hora del dispositivo para decidir qué partida gana.
- Una cuenta vinculada comprueba cambios locales periódicamente. Espera al menos 30 segundos entre intentos automáticos de subida. Las subidas manuales se pueden solicitar desde el panel.
- Sin conexión, el juego mantiene su guardado local. Al recuperar conexión, comprueba la revisión del servidor antes de reintentar. No dependemos de una petición de red durante el cierre de la pestaña: para cambiar de dispositivo inmediatamente, usa «Subir partida local» y espera a ver «Progreso guardado en la nube».
- Cerrar sesión conserva un respaldo local de la cuenta, incluidos cambios pendientes, y restaura la partida de invitado. «Recuperar respaldo local de esta cuenta» permite recuperar esos cambios tras volver a iniciar sesión. Los respaldos permanecen en ese navegador; no son copias de seguridad remotas.
- El modo desarrollador y sandbox no se sincronizan. Los cambios de escuadrón y formas en modo desarrollador se restauran al salir.
- Cambiar de perfil en una pestaña recarga las otras pestañas del mismo origen para que no guarden estado de otro perfil. Evita jugar simultáneamente desde varias pestañas.
- «Reiniciar todo el progreso» también sincroniza ese reinicio si la partida está vinculada; el diálogo lo indica.

## Pruebas locales sin un proyecto real

```powershell
npm ci
npm test
npm run test:rules
node tools/smoke-browser.cjs
```

Las pruebas de reglas requieren Java 21 o posterior; descargan el emulador y usan únicamente el proyecto ficticio `demo-cat-battle`. Las pruebas unitarias simulan el proveedor de autenticación. La prueba de navegador usa Edge con un perfil temporal y comprueba el modo invitado y la interfaz sin configuración; se puede indicar otra ruta de Chrome/Edge con `CAT_TEST_BROWSER`.

Todavía hace falta verificar registro, recuperación de correo y sincronización entre dispositivos contra el proyecto real después de crearlo y configurar sus dominios/reglas. Ninguna prueba local se conecta a una cuenta Firebase real.

Documentación: https://firebase.google.com/docs/auth/web/password-auth y https://firebase.google.com/docs/firestore/security/rules-conditions

## Eliminar una cuenta

En el panel de cuenta, «Eliminar cuenta» abre un formulario con un campo de contraseña oculto. Hay que introducir la contraseña actual y confirmar el aviso definitivo. Se reautentica con Firebase antes de borrar datos; la contraseña no se persiste.

Primero se borran el documento `/players/{uid}` y se crea una marca mínima `/accountDeletions/{uid}` en un mismo lote atómico de Firestore. La marca contiene solamente la fecha de solicitud; su ruta usa el UID, sin correo ni progreso. Las reglas impiden recrear el progreso de ese UID, incluso con una sesión antigua. Tanto la marca como el borrado exigen una autenticación reciente (últimos cinco minutos) y solo los puede solicitar el dueño. No es posible listar ni eliminar estas marcas desde el cliente.

Después se elimina el usuario de Authentication. Si falla este segundo paso, el progreso de la nube ya está borrado y se desactivan las subidas: el panel indica que hay que reintentar «Eliminar cuenta» para terminar. Se puede volver a iniciar sesión para completar una eliminación pendiente.

Al finalizar, se borra el respaldo local de esa cuenta y su revisión de sincronización en el navegador actual, y se restaura el invitado. Las copias descargadas previamente en otros dispositivos no se pueden borrar a distancia con esta implementación; las reglas bloquean que vuelvan a subirse con el UID eliminado.

**Publica las reglas nuevas junto con el código**. Las reglas anteriores no permiten leer la marca ni borrar el progreso. Desde la raíz del proyecto:

```powershell
npx firebase deploy --project TU_PROJECT_ID --only firestore:rules,hosting
```

Las pruebas de eliminación utilizan cuentas simuladas y el emulador. No eliminan usuarios del proyecto real.

## Acceso por nombre de usuario

La extensión opcional de Cloudflare mantiene los correos en un directorio privado y conserva el inicio directo por correo. La configuración y despliegue del plan gratuito se describen en [workers/username-api/README.md](../workers/username-api/README.md). No necesitas Firebase Hosting ni un servidor de pago. Al eliminar una cuenta, la API retira también su nombre y correo del directorio antes de finalizar la eliminación de Authentication.
