import { CONFIG } from "./config.js";
import { crearStoreDemo } from "./reservas/store-demo.js";
import { iniciarReserva, moneda } from "./reservas/flow.js";
import { iniciarAnimaciones } from "./animaciones.js";

function textoFranja(franja) {
  if (!franja?.abre || !franja?.cierra) return "Cerrado";
  return `${franja.abre} – ${franja.cierra}`;
}

function iniciales(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map((parte) => parte[0] || "").join("").toUpperCase();
}

function aplicarConfig(config) {
  const desde = Math.min(...config.servicios.map((item) => item.precio));
  document.querySelectorAll("[data-desde]").forEach((el) => {
    el.textContent = moneda(desde);
  });
  document.querySelectorAll("[data-garantia]").forEach((el) => {
    el.textContent = config.garantia;
  });
  const direccion = `${config.direccion.linea}, ${config.direccion.barrio}, ${config.direccion.ciudad}`;
  document.querySelectorAll("[data-direccion]").forEach((el) => {
    el.textContent = direccion;
  });
  document.querySelectorAll("[data-mapa]").forEach((el) => {
    el.href = config.direccion.mapa;
  });
  Object.entries(config.horario).forEach(([dia, franja]) => {
    document.querySelectorAll(`[data-hora-dia="${dia}"]`).forEach((el) => {
      el.textContent = textoFranja(franja);
    });
  });
  config.servicios.forEach((servicio, indice) => {
    const campos = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: moneda(servicio.precio),
      duracion: `${servicio.duracion} min`,
      indice: String(indice + 1).padStart(2, "0")
    };
    Object.entries(campos).forEach(([campo, valor]) => {
      document.querySelectorAll(`[data-s="${servicio.id}"][data-c="${campo}"]`).forEach((el) => {
        el.textContent = valor;
      });
    });
  });
  config.barberos.forEach((barbero) => {
    const campos = {
      nombre: barbero.nombre,
      categoria: barbero.categoria,
      especialidad: barbero.especialidad,
      iniciales: iniciales(barbero.nombre)
    };
    Object.entries(campos).forEach(([campo, valor]) => {
      document.querySelectorAll(`[data-b="${barbero.id}"][data-c="${campo}"]`).forEach((el) => {
        el.textContent = valor;
      });
    });
    document.querySelectorAll(`[data-b="${barbero.id}"][data-c="ejemplo"]`).forEach((el) => {
      el.hidden = !barbero.ejemplo;
    });
    if (!barbero.foto) return;
    document.querySelectorAll(`[data-b-card="${barbero.id}"] .avatar`).forEach((avatar) => {
      const img = document.createElement("img");
      img.src = barbero.foto;
      img.alt = "";
      img.width = 320;
      img.height = 320;
      avatar.append(img);
    });
  });
  config.confianza.forEach((item, indice) => {
    document.querySelectorAll(`[data-confianza="${indice}"]`).forEach((el) => {
      el.dataset.hasta = String(item.valor);
      el.dataset.sufijo = item.sufijo;
      el.textContent = `${item.valor}${item.sufijo}`;
      const etiqueta = el.parentElement?.querySelector("[data-confianza-etiqueta]");
      if (etiqueta) etiqueta.textContent = item.etiqueta;
    });
  });
  const select = document.getElementById("hero-barbero");
  if (select) {
    const valor = select.value || "cualquiera";
    select.replaceChildren();
    const cualquiera = document.createElement("option");
    cualquiera.value = "cualquiera";
    cualquiera.textContent = "Cualquiera";
    select.append(cualquiera);
    config.barberos.forEach((barbero) => {
      const opcion = document.createElement("option");
      opcion.value = barbero.id;
      opcion.textContent = barbero.nombre;
      select.append(opcion);
    });
    if ([...select.options].some((opcion) => opcion.value === valor)) select.value = valor;
  }
  const numero = String(config.whatsapp).replace(/\D/g, "");
  document.querySelectorAll("[data-wa]").forEach((el) => {
    const texto = el.dataset.texto || `Hola ${config.nombre}, quiero reservar una silla`;
    el.href = `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
  });
  const usuario = String(config.instagram).replace(/^@/, "");
  document.querySelectorAll("[data-ig]").forEach((el) => {
    el.href = `https://instagram.com/${usuario}`;
  });
  document.querySelectorAll("[data-ig-user]").forEach((el) => {
    el.textContent = `@${usuario}`;
  });
  if (!config.datosEjemplo) {
    document.querySelectorAll(".nota-ejemplo").forEach((el) => {
      el.hidden = true;
    });
  }
}

function marcarImagenes() {
  document.querySelectorAll(".marco img").forEach((img) => {
    const marco = img.closest(".marco");
    const listo = () => marco.classList.add("lista");
    if (img.complete && img.naturalWidth > 0) listo();
    else {
      img.addEventListener("load", listo, { once: true });
      img.addEventListener("error", listo, { once: true });
    }
  });
}

function iniciarMenu() {
  const boton = document.querySelector(".menu-btn");
  const nav = document.getElementById("menu");
  if (!boton || !nav) return;
  const cerrar = () => {
    boton.setAttribute("aria-expanded", "false");
    boton.setAttribute("aria-label", "Abrir menú");
    nav.classList.remove("abierto");
    document.body.classList.remove("menu-abierto");
  };
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", abierto ? "false" : "true");
    boton.setAttribute("aria-label", abierto ? "Abrir menú" : "Cerrar menú");
    nav.classList.toggle("abierto", !abierto);
    document.body.classList.toggle("menu-abierto", !abierto);
    if (!abierto) nav.querySelector("a")?.focus();
  });
  nav.addEventListener("click", (evento) => {
    if (evento.target.closest("a")) cerrar();
  });
  document.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-reservar]")) cerrar();
  });
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && nav.classList.contains("abierto")) {
      cerrar();
      boton.focus();
    }
  });
  window.matchMedia("(max-width: 1040px)").addEventListener("change", (evento) => {
    if (!evento.matches) cerrar();
  });
}

function iniciarAcordeon() {
  document.querySelectorAll(".acordeon button").forEach((boton) => {
    boton.addEventListener("click", () => {
      const panel = document.getElementById(boton.getAttribute("aria-controls"));
      const abierto = boton.getAttribute("aria-expanded") === "true";
      boton.setAttribute("aria-expanded", abierto ? "false" : "true");
      if (panel) panel.hidden = abierto;
    });
  });
}

function iniciarHero() {
  const chips = [...document.querySelectorAll("[data-servicio-chip]")];
  const reservar = document.getElementById("hero-reservar");
  const continuar = document.getElementById("hero-continuar");
  const barbero = document.getElementById("hero-barbero");
  if (!chips.length || !continuar) return;
  const marcar = (id) => {
    chips.forEach((chip) => {
      const activo = chip.dataset.servicioChip === id;
      chip.classList.toggle("elegido", activo);
      chip.setAttribute("aria-pressed", activo ? "true" : "false");
    });
    if (reservar) reservar.dataset.servicio = id;
    continuar.dataset.servicio = id;
  };
  chips.forEach((chip) => {
    chip.addEventListener("click", () => marcar(chip.dataset.servicioChip));
  });
  const sincronizarBarbero = () => {
    if (!barbero) return;
    continuar.dataset.barbero = barbero.value;
    if (reservar) reservar.dataset.barbero = barbero.value;
  };
  barbero?.addEventListener("change", sincronizarBarbero);
  sincronizarBarbero();
}

const store = crearStoreDemo();

aplicarConfig(CONFIG);
marcarImagenes();
iniciarHero();
iniciarMenu();
iniciarAcordeon();
iniciarAnimaciones();
iniciarReserva({ config: CONFIG, store });
