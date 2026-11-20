import { generarDias, generarHoras } from "./slots.js";
import { transicionPaso, animarExito } from "../animaciones.js";

const PASOS = [
  { titulo: "Elige el servicio" },
  { titulo: "Elige al barbero" },
  { titulo: "Elige el día" },
  { titulo: "Elige la hora" },
  { titulo: "Tus datos" },
  { titulo: "Así queda tu solicitud" }
];

export function moneda(valor) {
  const texto = String(Math.round(Number(valor))).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${texto}`;
}

export function validarNombre(valor) {
  const nombre = String(valor ?? "").trim().replace(/\s+/g, " ");
  if (!nombre) return { ok: false, mensaje: "Escribe tu nombre." };
  if (nombre.length < 2) return { ok: false, mensaje: "El nombre queda muy corto." };
  if (nombre.length > 80) return { ok: false, mensaje: "El nombre es demasiado largo." };
  if (!/\p{L}/u.test(nombre)) return { ok: false, mensaje: "El nombre necesita al menos una letra." };
  return { ok: true, valor: nombre };
}

export function validarTelefono(valor) {
  const escrito = String(valor ?? "").trim();
  if (!escrito) return { ok: false, mensaje: "Escribe tu celular." };
  const compacto = escrito.replace(/[\s().-]/g, "");
  if (!/^\+?\d+$/.test(compacto)) {
    return { ok: false, mensaje: "Ese celular no parece de Colombia. Usa 10 dígitos, por ejemplo 300 123 4567." };
  }
  const normal = compacto.replace(/^\+/, "");
  const local = normal.startsWith("57") && normal.length === 12 ? normal.slice(2) : normal;
  if (!/^3\d{9}$/.test(local)) {
    return { ok: false, mensaje: "Ese celular no parece de Colombia. Usa 10 dígitos, por ejemplo 300 123 4567." };
  }
  return { ok: true, valor: escrito, local };
}

export function validarNota(valor) {
  const nota = String(valor ?? "").trim();
  if (nota.length > 180) return { ok: false, mensaje: "La nota es muy larga. Déjala en 180 caracteres." };
  return { ok: true, valor: nota };
}

function nodo(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([clave, valor]) => {
    if (valor == null || valor === false) return;
    if (clave === "class") el.className = valor;
    else if (clave === "text") el.textContent = valor;
    else el.setAttribute(clave, valor === true ? "" : valor);
  });
  [].concat(children).forEach((hijo) => {
    if (hijo == null || hijo === false) return;
    el.append(hijo instanceof Node ? hijo : document.createTextNode(String(hijo)));
  });
  return el;
}

function estadoVacio(preset = {}) {
  return {
    paso: 0,
    servicioId: preset.servicio || preset.servicioId || "",
    barberoId: preset.barbero || preset.barberoId || "",
    fecha: "",
    hora: "",
    nombre: "",
    telefono: "",
    nota: "",
    errores: {}
  };
}

export function iniciarReserva({ config, store }) {
  const capa = document.getElementById("modal");
  const dialogo = capa.querySelector(".dialogo");
  const cuerpo = document.getElementById("reserva-cuerpo");
  const pasoEl = document.getElementById("reserva-paso");
  const progreso = document.getElementById("reserva-progreso");
  const errorEl = document.getElementById("reserva-error");
  const vivo = document.getElementById("reserva-vivo");
  const atras = document.getElementById("reserva-atras");
  const seguir = document.getElementById("reserva-seguir");
  const fondo = [...document.querySelectorAll("[data-fondo]")];
  let state = estadoVacio();
  let origen = null;
  let ticket = 0;

  function servicioActual() {
    return config.servicios.find((item) => item.id === state.servicioId) || null;
  }

  function barberoActual() {
    if (state.barberoId === "cualquiera") return { id: "cualquiera", nombre: "Cualquiera" };
    return config.barberos.find((item) => item.id === state.barberoId) || null;
  }

  function setError(mensaje) {
    if (!mensaje) {
      errorEl.hidden = true;
      errorEl.textContent = "";
      return;
    }
    errorEl.hidden = false;
    errorEl.textContent = mensaje;
    vivo.textContent = mensaje;
  }

  function marcarProgreso() {
    const actual = state.paso + 1;
    pasoEl.textContent = `Paso ${actual} de ${PASOS.length}`;
    progreso.setAttribute("aria-valuenow", String(actual));
    progreso.setAttribute("aria-valuetext", `Paso ${actual} de ${PASOS.length}`);
    dialogo.dataset.paso = String(actual);
    [...progreso.children].forEach((segmento, indice) => {
      segmento.classList.toggle("hecho", indice < actual);
    });
    atras.hidden = state.paso === 0;
    seguir.hidden = state.paso === PASOS.length - 1;
    seguir.textContent = state.paso === 4 ? "Revisar" : "Seguir";
  }

  function enfocables() {
    return [...dialogo.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])")].filter((el) => !el.closest("[hidden]") && el.getAttribute("aria-hidden") !== "true");
  }

  function bloquear(activo) {
    document.body.classList.toggle("sin-scroll", activo);
    document.body.classList.toggle("modal-abierto", activo);
    const ancho = activo ? Math.max(0, window.innerWidth - document.documentElement.clientWidth) : 0;
    document.documentElement.style.setProperty("--compensa", `${ancho}px`);
    fondo.forEach((el) => {
      el.inert = activo;
    });
  }

  async function ocupadasEn(fecha, barberoId, horas) {
    if (barberoId === "cualquiera") {
      if (!config.barberos.length) return new Set();
      const listas = await Promise.all(config.barberos.map((barbero) => store.listarOcupacion(fecha, barbero.id)));
      const conjuntos = listas.map((lista) => new Set(lista));
      return new Set(horas.filter((hora) => conjuntos.every((conjunto) => conjunto.has(hora))));
    }
    const lista = await store.listarOcupacion(fecha, barberoId);
    const conjunto = new Set(lista);
    return new Set(horas.filter((hora) => conjunto.has(hora)));
  }

  function pintarOpciones(grupo, name, valor) {
    grupo.querySelectorAll("input").forEach((input) => {
      input.checked = input.value === valor;
    });
  }

  function pintarChips(selector, valor) {
    cuerpo.querySelectorAll(selector).forEach((boton) => {
      const elegido = boton.dataset.fecha === valor || boton.dataset.hora === valor;
      boton.classList.toggle("elegido", elegido);
      boton.setAttribute("aria-pressed", elegido ? "true" : "false");
    });
  }

  function titulo(texto) {
    return nodo("h2", { id: "reserva-titulo", tabindex: "-1", text: texto });
  }

  function renderServicio() {
    const grupo = nodo("div", { class: "opciones", role: "radiogroup", "aria-label": "Servicio" });
    config.servicios.forEach((item) => {
      const input = nodo("input", { type: "radio", name: "servicio", value: item.id });
      input.checked = item.id === state.servicioId;
      grupo.append(
        nodo("label", { class: "opcion" }, [
          input,
          nodo("span", { class: "opcion-nombre", text: item.nombre }),
          nodo("span", { class: "opcion-meta", text: `${item.duracion} min · ${moneda(item.precio)}` }),
          nodo("span", { class: "opcion-desc", text: item.descripcion })
        ])
      );
    });
    cuerpo.replaceChildren(titulo(PASOS[0].titulo), nodo("p", { class: "paso-ayuda", text: "El precio y el tiempo quedan fijos desde aquí." }), grupo);
  }

  function renderBarbero() {
    const grupo = nodo("div", { class: "opciones", role: "radiogroup", "aria-label": "Barbero" });
    const opciones = [{ id: "cualquiera", nombre: "Cualquiera", meta: "La primera silla libre", desc: "Te asignamos a quien esté disponible en esa hora." }, ...config.barberos.map((item) => ({
      id: item.id,
      nombre: item.nombre,
      meta: item.categoria,
      desc: item.especialidad
    }))];
    opciones.forEach((item) => {
      const input = nodo("input", { type: "radio", name: "barbero", value: item.id });
      input.checked = item.id === state.barberoId;
      grupo.append(
        nodo("label", { class: "opcion" }, [
          input,
          nodo("span", { class: "opcion-nombre", text: item.nombre }),
          nodo("span", { class: "opcion-meta", text: item.meta }),
          nodo("span", { class: "opcion-desc", text: item.desc })
        ])
      );
    });
    cuerpo.replaceChildren(titulo(PASOS[1].titulo), nodo("p", { class: "paso-ayuda", text: "Si no tienes preferencia, elige cualquiera." }), grupo);
  }

  function renderDia() {
    const servicio = servicioActual();
    const dias = generarDias(config.horario, { duracion: servicio.duracion, cantidad: 14 });
    const grupo = nodo("div", { class: "chips", role: "group", "aria-label": "Día" });
    dias.forEach((dia) => {
      const boton = nodo("button", {
        type: "button",
        class: dia.iso === state.fecha ? "chip elegido" : "chip",
        "data-fecha": dia.iso,
        "aria-pressed": dia.iso === state.fecha ? "true" : "false"
      }, dia.corto);
      grupo.append(boton);
    });
    const vacio = dias.length ? null : nodo("p", { text: "No hay días con hora en las próximas semanas." });
    cuerpo.replaceChildren(titulo(PASOS[2].titulo), nodo("p", { class: "paso-ayuda", text: "Solo se muestran días abiertos, con hora por delante." }), vacio, grupo);
  }

  async function renderHora(mio) {
    const servicio = servicioActual();
    const dia = generarDias(config.horario, { duracion: servicio.duracion, cantidad: 21 }).find((item) => item.iso === state.fecha);
    cuerpo.replaceChildren(titulo(PASOS[3].titulo), nodo("p", { class: "paso-ayuda", text: "Revisando la silla…" }));
    if (!dia) {
      if (mio !== ticket) return;
      cuerpo.replaceChildren(titulo(PASOS[3].titulo), nodo("p", { text: "Ese día ya no tiene horas. Vuelve y elige otro." }));
      return;
    }
    const horas = generarHoras({
      abre: dia.abre,
      cierra: dia.cierra,
      duracion: servicio.duracion,
      fechaISO: dia.iso
    });
    const ocupadas = await ocupadasEn(dia.iso, state.barberoId, horas);
    if (mio !== ticket) return;
    if (state.hora && (!horas.includes(state.hora) || ocupadas.has(state.hora))) state.hora = "";
    const grupo = nodo("div", { class: "chips", role: "group", "aria-label": "Hora" });
    horas.forEach((hora) => {
      const ocupada = ocupadas.has(hora);
      const boton = nodo("button", {
        type: "button",
        class: ocupada ? "chip ocupada" : state.hora === hora ? "chip elegido" : "chip",
        "data-hora": hora,
        "aria-pressed": !ocupada && state.hora === hora ? "true" : "false",
        "aria-label": ocupada ? `${hora} ocupada` : hora
      }, ocupada ? `${hora} ocupada` : hora);
      if (ocupada) boton.disabled = true;
      grupo.append(boton);
    });
    const ayuda = horas.length
      ? "Las horas ocupadas están marcadas. No se guardan: es para que el recorrido se vea real."
      : "Hoy ya no quedan horas. Elige otro día.";
    cuerpo.replaceChildren(titulo(PASOS[3].titulo), nodo("p", { class: "paso-ayuda", text: ayuda }), grupo);
  }

  function campoTexto({ id, etiqueta, name, value, error, tipo = "text", extra = {} }) {
    const input = nodo("input", { id, name, type: tipo, autocomplete: extra.autocomplete || "off", inputmode: extra.inputmode, maxlength: extra.maxlength });
    input.value = value;
    if (error) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", `${id}-error`);
    }
    return nodo("div", { class: error ? "campo malo" : "campo" }, [
      nodo("label", { for: id, text: etiqueta }),
      input,
      error ? nodo("p", { class: "mensaje-error", id: `${id}-error`, text: error }) : null
    ]);
  }

  function renderDatos() {
    const nota = nodo("textarea", { id: "nota", name: "nota", rows: "3", maxlength: "180" });
    nota.value = state.nota;
    if (state.errores.nota) {
      nota.setAttribute("aria-invalid", "true");
      nota.setAttribute("aria-describedby", "nota-error");
    }
    cuerpo.replaceChildren(
      titulo(PASOS[4].titulo),
      nodo("p", { class: "paso-ayuda", text: "Te escribimos a este celular si hay que mover la hora." }),
      nodo("div", { class: "formulario" }, [
        campoTexto({
          id: "nombre",
          etiqueta: "Nombre",
          name: "nombre",
          value: state.nombre,
          error: state.errores.nombre,
          extra: { autocomplete: "name", maxlength: "80" }
        }),
        campoTexto({
          id: "telefono",
          etiqueta: "Celular",
          name: "telefono",
          value: state.telefono,
          error: state.errores.telefono,
          tipo: "tel",
          extra: { autocomplete: "tel", inputmode: "tel", maxlength: "22" }
        }),
        nodo("div", { class: state.errores.nota ? "campo malo" : "campo" }, [
          nodo("label", { for: "nota", text: "Nota (opcional)" }),
          nota,
          state.errores.nota ? nodo("p", { class: "mensaje-error", id: "nota-error", text: state.errores.nota }) : null
        ])
      ])
    );
    const primero = state.errores.nombre ? "nombre" : state.errores.telefono ? "telefono" : state.errores.nota ? "nota" : null;
    if (primero) document.getElementById(primero)?.focus();
  }

  function mensajeWhatsapp(servicio, barbero, etiquetaDia) {
    const lineas = [
      `Hola ${config.nombre}, quiero reservar:`,
      `Servicio: ${servicio.nombre} (${servicio.duracion} min, ${moneda(servicio.precio)})`,
      `Barbero: ${barbero.nombre}`,
      `Día: ${etiquetaDia}`,
      `Hora: ${state.hora}`,
      `Nombre: ${state.nombre}`,
      `Celular: ${state.telefono}`
    ];
    if (state.nota) lineas.push(`Nota: ${state.nota}`);
    return lineas.join("\n");
  }

  async function renderListo(mio) {
    const servicio = servicioActual();
    const barbero = barberoActual();
    const dia = generarDias(config.horario, { duracion: servicio.duracion, cantidad: 21 }).find((item) => item.iso === state.fecha);
    const exito = nodo("div", { class: "exito", "data-exito": "" });
    exito.innerHTML = '<svg viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30"></circle><path d="M22 38 l10 10 l18-22"></path></svg>';
    const filas = [
      ["Servicio", servicio.nombre],
      ["Duración", `${servicio.duracion} min`],
      ["Precio", moneda(servicio.precio)],
      ["Barbero", barbero.nombre],
      ["Día", dia ? dia.etiqueta : state.fecha],
      ["Hora", state.hora],
      ["Nombre", state.nombre],
      ["Celular", state.telefono]
    ];
    if (state.nota) filas.push(["Nota", state.nota]);
    const resumen = nodo("dl", { class: "resumen" });
    filas.forEach(([termino, dato]) => {
      resumen.append(nodo("div", {}, [nodo("dt", { text: termino }), nodo("dd", { text: dato })]));
    });
    const numero = String(config.whatsapp || "").replace(/\D/g, "");
    const enlace = nodo("a", {
      id: "reserva-wa",
      class: "btn btn-rojo",
      target: "_blank",
      rel: "noopener noreferrer"
    }, "Enviar por WhatsApp");
    if (numero) enlace.href = `https://wa.me/${numero}?text=${encodeURIComponent(mensajeWhatsapp(servicio, barbero, dia ? dia.etiqueta : state.fecha))}`;
    else {
      enlace.href = "#ubicacion";
      enlace.removeAttribute("target");
    }
    cuerpo.replaceChildren(
      exito,
      titulo(PASOS[5].titulo),
      nodo("p", { class: "paso-ayuda", text: "Al enviar, se abre WhatsApp con este resumen. La silla queda firme cuando te respondemos." }),
      config.mostrarAvisoDemo ? nodo("p", { class: "aviso-demo", text: "Demostración: esta cita aún no se registra en un sistema." }) : null,
      resumen
    );
    document.querySelector(".dialogo-pie").append(enlace);
    animarExito(exito);
    try {
      const respuesta = await store.crearCita({
        servicioId: servicio.id,
        barberoId: barbero.id,
        fecha: state.fecha,
        hora: state.hora,
        nombre: state.nombre,
        telefono: state.telefono,
        nota: state.nota
      });
      if (mio !== ticket) return;
      if (respuesta && respuesta.ok === false) setError("No pudimos armar la solicitud. Intenta de nuevo.");
    } catch (error) {
      if (mio === ticket) setError("No pudimos armar la solicitud. Intenta de nuevo.");
    }
  }

  async function pintar(animar) {
    const mio = ++ticket;
    setError("");
    document.querySelector(".dialogo-pie #reserva-wa")?.remove();
    marcarProgreso();
    if (state.paso === 0) renderServicio();
    else if (state.paso === 1) renderBarbero();
    else if (state.paso === 2) renderDia();
    else if (state.paso === 3) await renderHora(mio);
    else if (state.paso === 4) renderDatos();
    else await renderListo(mio);
    if (mio !== ticket) return;
    if (animar) transicionPaso(cuerpo);
    if (capa.hidden) return;
    if (state.paso !== 4 || !Object.keys(state.errores).length) {
      document.getElementById("reserva-titulo")?.focus();
    }
  }

  function validarPaso() {
    if (state.paso === 0 && !servicioActual()) return "Elige un servicio para seguir.";
    if (state.paso === 1 && !barberoActual()) return "Elige un barbero, o cualquiera.";
    if (state.paso === 2 && !state.fecha) return "Elige un día para seguir.";
    if (state.paso === 3 && !state.hora) return "Elige una hora libre.";
    if (state.paso === 4) {
      const nombre = validarNombre(state.nombre);
      const telefono = validarTelefono(state.telefono);
      const nota = validarNota(state.nota);
      state.errores = {};
      if (!nombre.ok) state.errores.nombre = nombre.mensaje;
      else state.nombre = nombre.valor;
      if (!telefono.ok) state.errores.telefono = telefono.mensaje;
      else state.telefono = telefono.valor;
      if (!nota.ok) state.errores.nota = nota.mensaje;
      else state.nota = nota.valor;
      if (Object.keys(state.errores).length) return "Revisa los campos marcados.";
    }
    return "";
  }

  async function abrir(disparo) {
    origen = disparo;
    state = estadoVacio({
      servicio: disparo?.dataset?.servicio || "",
      barbero: disparo?.dataset?.barbero || ""
    });
    await pintar(false);
    capa.hidden = false;
    bloquear(true);
    document.getElementById("reserva-titulo")?.focus();
  }

  function cerrar() {
    ticket += 1;
    capa.hidden = true;
    bloquear(false);
    state = estadoVacio();
    cuerpo.replaceChildren();
    document.querySelector(".dialogo-pie #reserva-wa")?.remove();
    setError("");
    const vuelve = origen;
    origen = null;
    vuelve?.focus?.();
  }

  atras.addEventListener("click", () => {
    if (state.paso === 0) return;
    state.paso -= 1;
    state.errores = {};
    pintar(true);
  });

  seguir.addEventListener("click", async () => {
    const mensaje = validarPaso();
    if (mensaje) {
      if (state.paso === 4) await pintar(false);
      setError(mensaje);
      return;
    }
    state.errores = {};
    state.paso += 1;
    pintar(true);
  });

  document.getElementById("reserva-cerrar").addEventListener("click", cerrar);
  capa.addEventListener("click", (evento) => {
    if (evento.target === capa) cerrar();
  });

  document.addEventListener("keydown", (evento) => {
    if (capa.hidden) return;
    if (evento.key === "Escape") {
      evento.preventDefault();
      cerrar();
      return;
    }
    if (evento.key !== "Tab") return;
    const lista = enfocables();
    if (!lista.length) return;
    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    if (evento.shiftKey && document.activeElement === primero) {
      evento.preventDefault();
      ultimo.focus();
    } else if (!evento.shiftKey && document.activeElement === ultimo) {
      evento.preventDefault();
      primero.focus();
    }
  });

  cuerpo.addEventListener("change", (evento) => {
    const campo = evento.target;
    if (campo.name === "servicio") {
      state.servicioId = campo.value;
      state.fecha = "";
      state.hora = "";
      pintarOpciones(campo.closest(".opciones"), "servicio", state.servicioId);
    }
    if (campo.name === "barbero") {
      state.barberoId = campo.value;
      state.hora = "";
    }
  });

  cuerpo.addEventListener("click", (evento) => {
    const fecha = evento.target.closest("[data-fecha]");
    if (fecha) {
      state.fecha = fecha.dataset.fecha;
      state.hora = "";
      pintarChips("[data-fecha]", state.fecha);
      return;
    }
    const hora = evento.target.closest("[data-hora]");
    if (hora && !hora.disabled) {
      state.hora = hora.dataset.hora;
      pintarChips("[data-hora]", state.hora);
    }
  });

  cuerpo.addEventListener("input", (evento) => {
    const campo = evento.target;
    if (campo.name === "nombre") state.nombre = campo.value;
    if (campo.name === "telefono") state.telefono = campo.value;
    if (campo.name === "nota") state.nota = campo.value;
    campo.removeAttribute("aria-invalid");
    campo.closest(".campo")?.classList.remove("malo");
    campo.closest(".campo")?.querySelector(".mensaje-error")?.remove();
  });

  document.addEventListener("click", (evento) => {
    const disparo = evento.target.closest("[data-reservar]");
    if (!disparo) return;
    if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey || evento.button !== 0) return;
    evento.preventDefault();
    abrir(disparo);
  });

  return { abrir, cerrar };
}
