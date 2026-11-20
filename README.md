# Lords

Web de la barbería Lords. HTML, CSS y JavaScript, sin build. Se publica en GitHub Pages desde la raíz del repositorio.

## Editar los datos

Todo lo editable está en `js/config.js`, en el objeto `CONFIG`.

- `nombre`, `whatsapp` (con indicativo, solo dígitos), `instagram`, `direccion` y `mapa` (si lo dejas vacío, el enlace se arma con la dirección).
- `horario.semana`: cada día con `abre` y `cierra` en formato `HH:MM`, o `null` si ese día está cerrado.
- `horario.intervalo`: minutos entre una hora y la siguiente.
- `servicios`: `nombre`, `descripcion`, `duracion` en minutos y `precio` en pesos.
- `barberos`: `nombre`, `foto` (ruta dentro de `img/`, o vacío para mostrar iniciales), `categoria` y `especialidad`.
- `modo`: déjalo en `"demo"` mientras no haya sistema de citas.
- `mostrarAvisoDemo`: ponlo en `false` para ocultar el texto de demostración cuando la cita sí se registre.

Los precios, el equipo, el horario, la galería y las preguntas de la página salen de ese archivo. Las fotos van en `img/`. `img/logo.png` es el sello de la cabecera, el pie y el favicon.

Los nombres, precios, la dirección y las cifras marcadas como ejemplo no son datos reales del local.

## Reservas

El flujo actual es una demostración. No guarda citas, no usa `localStorage` y no bloquea horas de verdad. Algunas franjas se ven ocupadas de forma fija para el mismo día y el mismo barbero, solo para que la pantalla se parezca a un día con gente.

La interfaz del almacén está en `js/reservas/store-demo.js`:

- `listOccupancy({ date, barberId, times })` devuelve las horas ocupadas de ese día.
- `createAppointment(cita)` crea la cita y responde `{ ok, id, demo }`.
- `cancelAppointment(id)` cancela una cita ya creada.

`js/reservas/flow.js` y el modal solo hablan con esas tres funciones. Para conectar una base de datos más adelante:

1. Crea un archivo nuevo, por ejemplo `js/reservas/store-api.js`, con las mismas tres funciones. Ahí va la llamada a tu API.
2. Cárgalo antes de `flow.js` y asigna ese objeto a `window.LORDS_STORE`.
3. Pon `mostrarAvisoDemo` en `false`.

No hace falta cambiar el modal ni los pasos. Las horas disponibles salen de `js/reservas/slots.js`, según el horario y la duración del servicio.
