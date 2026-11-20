# Lords

Web estática de la barbería. Se publica desde la raíz, por ejemplo en GitHub Pages. No hay build ni dependencias.

## Editar los datos

La reserva lee un solo objeto, `CONFIG`, en `js/config.js`.

- `whatsapp`: número con indicativo, solo dígitos. Ejemplo: `573001112233`.
- `instagram`: usuario sin @.
- `direccion`, `horario`, `servicios`, `barberos` y `garantia`.
- `modo`: déjalo en `"demo"` hasta que haya base de datos.
- `mostrarAvisoDemo`: en `false` se oculta el texto de demostración del último paso.
- `datosEjemplo`: en `false` se ocultan las notas de “ejemplo”.

Los textos de la página (titulares, preguntas, bloques) están en `index.html`. Si cambias un precio, un servicio o un horario, el sitio vuelve a pintarlos desde `CONFIG`; deja el HTML de respaldo parecido para que la página siga leyéndose si el JavaScript no carga.

Las imágenes van en `img/`. Si un barbero no tiene `foto`, se ven sus iniciales. La galería usa `img/trabajo-01.svg` … `img/trabajo-04.svg`; sustitúyelas por fotos reales cuando las tengas.

El loader de la primera visita de la pestaña usa `sessionStorage` (`lords-visto`). No guarda datos de clientes y no usa `localStorage`.

## Reserva en demostración

No se guarda nada: ni citas, ni formularios, ni `localStorage`. Algunas horas se ven ocupadas de forma fija (el mismo día y el mismo barbero dan siempre el mismo resultado) para que el recorrido se sienta real. Esas horas no bloquean una agenda de verdad.

Al final, «Enviar por WhatsApp» abre `wa.me` con el resumen.

## Conectar una base de datos después

`js/reservas/store-demo.js` expone la interfaz que tiene que cumplir un store real:

- `listarOcupacion(fecha, barberoId)` → `Promise<string[]>` con horas `"HH:MM"` ocupadas
- `crearCita(cita)` → `Promise<{ ok, persistida, cita }>`
- `cancelarCita(id)` → `Promise<{ ok }>`

Para pasar a datos reales:

1. Crea `js/reservas/store-real.js` con esas tres funciones.
2. En `js/sitio.js`, usa ese store cuando `CONFIG.modo` ya no sea `"demo"`.
3. Pon `CONFIG.modo` en `"real"` y `CONFIG.mostrarAvisoDemo` en `false`.

No hace falta tocar `js/reservas/flow.js` ni el modal.
