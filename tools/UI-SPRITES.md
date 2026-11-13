# Sprites opcionales de la interfaz

Sin imágenes, el juego conserva su CSS. Una imagen ausente o que no se pueda cargar tampoco sustituye el CSS.

Después de agregar o cambiar recursos, ejecuta `tools/build-ui.bat`, `tools/build-ui.ps1` o `node tools/build-ui.js`. Los tres generan el mismo `js/ui-manifest.js`. No hace falta un servidor para leer la configuración: se incorpora al manifiesto.

## Fondos

En `img/ui/screens/<pantalla>/`, agrega `base.png` y, opcionalmente, `overlay.png`. Pantallas conectadas: `title`, `carousel`, `chapters`, `hub`, `upgrades`, `story`, `event`, `legend` y `troops`.

Para animar una capa, coloca todos sus cuadros del mismo tamaño en una sola fila horizontal y agrega `layers.json`:

```json
{"base":{"frames":4,"fps":6},"overlay":{"frames":2,"fps":4}}
```

Las capas sin configuración son estáticas. Los fondos cubren el área conservando proporciones y pueden recortarse. Las animaciones se pausan con la pantalla oculta.

## Botones

Imagen única: `img/ui/buttons/big-yellow.png`.

Con estados: `img/ui/buttons/big-yellow/normal.png`, `hover.png`, `active.png` y `disabled.png`. Solo `normal.png` es obligatorio; los otros estados son opcionales. Si existen ambos formatos, la carpeta tiene prioridad. Los PNG usan nueve secciones con bordes de 8 píxeles; el centro también se dibuja.

Nombres conectados: `big-yellow`, `save-blue`, `retreat-cyan`, `test-purple`, `cannon-red`, `back-gray`, `menu-default`, `set-default`, `story-default`, `event-default`, `gacha-default`, `icon-default`, `hub-back`, `carousel-arrow`, `mode-card`, `chapter-card` y `close-x`. `default.png` o la carpeta `default/` sirven como alternativa para los botones conectados sin imagen propia. Las reglas alcanzan los botones creados al abrir cada pantalla.

## Iconos

Agrega `img/ui/icons/<nombre>.png`. Los nombres y emojis asociados están en `js/00d-icons.js`. Los puntos de la interfaz que usan `getIcon` y `drawIconOrEmoji` mostrarán la imagen cuando se cargue correctamente; los demás mantienen sus emojis.

## Verificación

`node --test tests/ui-sprites.test.js`
