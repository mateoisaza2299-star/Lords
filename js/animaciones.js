let reduceMq = null;
let finoMq = null;

function mediaReducida() {
  if (!reduceMq) reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  return reduceMq;
}

function mediaFina() {
  if (!finoMq) finoMq = window.matchMedia("(pointer: fine)");
  return finoMq;
}

export function movimientoReducido() {
  return mediaReducida().matches;
}

function punteroFino() {
  return mediaFina().matches && window.matchMedia("(hover: hover)").matches;
}

let cursorActivo = false;
let parallaxNodo = null;

export function transicionPaso(panel) {
  if (!panel) return;
  panel.classList.remove("entra");
  void panel.offsetWidth;
  panel.classList.add("entra");
}

export function animarExito(nodo) {
  if (!nodo) return;
  nodo.classList.remove("juega", "listo");
  void nodo.offsetWidth;
  nodo.classList.add(movimientoReducido() ? "listo" : "juega");
}

function cerrarLoader() {
  const loader = document.querySelector(".loader");
  if (!loader || loader.dataset.cerrado === "1") return;
  loader.dataset.cerrado = "1";
  loader.classList.add("sale");
  try {
    sessionStorage.setItem("lords-visto", "1");
  } catch {
    void 0;
  }
  window.setTimeout(() => loader.remove(), 320);
}

function prepararLoader() {
  const loader = document.querySelector(".loader");
  if (!loader) return;
  let visto = false;
  try {
    visto = sessionStorage.getItem("lords-visto") === "1";
  } catch (error) {
    visto = false;
  }
  if (visto) {
    loader.remove();
    return;
  }
  const inicio = performance.now();
  const alCargar = () => {
    const espera = Math.max(0, 420 - (performance.now() - inicio));
    window.setTimeout(cerrarLoader, espera);
  };
  if (document.readyState === "complete") alCargar();
  else window.addEventListener("load", alCargar, { once: true });
  window.setTimeout(cerrarLoader, 880);
}

function iniciarProgreso() {
  const barra = document.querySelector(".barra-scroll");
  if (!barra) return;
  let frame = 0;
  const pintar = () => {
    frame = 0;
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    const avance = alto > 0 ? window.scrollY / alto : 0;
    barra.style.transform = `scaleX(${Math.min(1, Math.max(0, avance))})`;
  };
  window.addEventListener("scroll", () => {
    if (!frame) frame = requestAnimationFrame(pintar);
  }, { passive: true });
  pintar();
}

function iniciarNav() {
  const enlaces = [...document.querySelectorAll(".nav-principal a[href^='#']")];
  const secciones = enlaces.map((enlace) => document.querySelector(enlace.getAttribute("href"))).filter(Boolean);
  if (!secciones.length) return;
  const observar = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      const activo = enlaces.find((enlace) => enlace.getAttribute("href") === `#${entrada.target.id}`);
      if (!activo) return;
      enlaces.forEach((enlace) => enlace.removeAttribute("aria-current"));
      activo.setAttribute("aria-current", "true");
    });
  }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
  secciones.forEach((seccion) => observar.observe(seccion));
}

function iniciarParallax() {
  parallaxNodo = document.querySelector("[data-parallax]");
  if (!parallaxNodo) return;
  let frame = 0;
  const pintar = () => {
    frame = 0;
    if (!parallaxNodo) return;
    if (movimientoReducido()) {
      parallaxNodo.style.setProperty("--desplazamiento", "0px");
      return;
    }
    const y = Math.min(window.scrollY * 0.08, 36);
    parallaxNodo.style.setProperty("--desplazamiento", `${y}px`);
  };
  window.addEventListener("scroll", () => {
    if (!frame) frame = requestAnimationFrame(pintar);
  }, { passive: true });
  pintar();
}

function animarNumero(el) {
  const destino = Number(el.dataset.hasta || 0);
  const sufijo = el.dataset.sufijo || "";
  const ancho = el.getBoundingClientRect().width;
  el.style.minWidth = `${Math.ceil(ancho)}px`;
  const inicio = performance.now();
  const duracion = 700;
  const tick = (ahora) => {
    if (movimientoReducido()) {
      el.textContent = `${destino}${sufijo}`;
      return;
    }
    const t = Math.min(1, (ahora - inicio) / duracion);
    const eased = 1 - (1 - t) ** 3;
    el.textContent = `${Math.round(destino * eased)}${sufijo}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function iniciarContadores() {
  const nodos = [...document.querySelectorAll("[data-contador]")];
  if (!nodos.length) return;
  if (movimientoReducido()) return;
  const observar = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      observar.unobserve(entrada.target);
      animarNumero(entrada.target);
    });
  }, { threshold: 0.6 });
  nodos.forEach((nodo) => observar.observe(nodo));
}

function iniciarMagnetico() {
  document.querySelectorAll("[data-magnetico]").forEach((el) => {
    if (el.dataset.magnetoListo === "1") return;
    el.dataset.magnetoListo = "1";
    el.addEventListener("mousemove", (evento) => {
      if (movimientoReducido() || !punteroFino()) {
        el.style.transform = "";
        return;
      }
      const caja = el.getBoundingClientRect();
      const x = evento.clientX - (caja.left + caja.width / 2);
      const y = evento.clientY - (caja.top + caja.height / 2);
      const dx = Math.max(-6, Math.min(6, x * 0.18));
      const dy = Math.max(-4, Math.min(4, y * 0.22));
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

function iniciarCursor() {
  const capa = document.querySelector(".cursor-capa");
  if (!capa || cursorActivo) return;
  cursorActivo = true;
  const punto = capa.querySelector(".cursor-punto");
  const anillo = capa.querySelector(".cursor-anillo");
  let x = 0;
  let y = 0;
  let ax = 0;
  let ay = 0;
  let corriendo = false;
  let visto = false;
  capa.classList.add("espera");
  window.addEventListener("pointermove", (evento) => {
    const fino = evento.pointerType === "mouse" && punteroFino() && !movimientoReducido();
    if (!fino) {
      document.documentElement.classList.remove("cursor-fino");
      capa.classList.add("espera");
      return;
    }
    x = evento.clientX;
    y = evento.clientY;
    if (!visto) {
      visto = true;
      ax = x;
      ay = y;
      anillo.style.transform = `translate(${x}px, ${y}px)`;
    }
    document.documentElement.classList.add("cursor-fino");
    capa.classList.remove("espera");
    punto.style.transform = `translate(${x}px, ${y}px)`;
    capa.classList.toggle("oculto", Boolean(evento.target.closest("input, textarea, select")));
    if (!corriendo) {
      corriendo = true;
      seguir();
    }
  }, { passive: true });
  function seguir() {
    if (!punteroFino() || movimientoReducido()) {
      corriendo = false;
      document.documentElement.classList.remove("cursor-fino");
      capa.classList.add("espera");
      return;
    }
    ax += (x - ax) * 0.2;
    ay += (y - ay) * 0.2;
    anillo.style.transform = `translate(${ax}px, ${ay}px)`;
    requestAnimationFrame(seguir);
  }
}

function aplicarPreferencias() {
  document.documentElement.classList.toggle("sin-movimiento", movimientoReducido());
  const cursorOk = punteroFino() && !movimientoReducido();
  if (!cursorOk) {
    document.documentElement.classList.remove("cursor-fino");
    document.querySelector(".cursor-capa")?.classList.add("espera");
  }
  if (parallaxNodo && movimientoReducido()) parallaxNodo.style.setProperty("--desplazamiento", "0px");
  if (cursorOk) iniciarCursor();
  if (cursorOk) iniciarMagnetico();
}

export function iniciarAnimaciones() {
  prepararLoader();
  aplicarPreferencias();
  iniciarProgreso();
  iniciarNav();
  iniciarParallax();
  iniciarContadores();
  if (punteroFino() && !movimientoReducido()) {
    iniciarCursor();
    iniciarMagnetico();
  }
  mediaReducida().addEventListener("change", aplicarPreferencias);
  mediaFina().addEventListener("change", aplicarPreferencias);
}
