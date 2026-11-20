(function () {
  const DIAS = [
    ["lunes", "Lunes"],
    ["martes", "Martes"],
    ["miercoles", "Miércoles"],
    ["jueves", "Jueves"],
    ["viernes", "Viernes"],
    ["sabado", "Sábado"],
    ["domingo", "Domingo"]
  ];

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function arrow() {
    return '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function waHref(text) {
    const number = digits(CONFIG.whatsapp);
    const base = "https://wa.me/" + number;
    return text ? base + "?text=" + encodeURIComponent(text) : base;
  }

  function igHref() {
    const handle = String(CONFIG.instagram || "").replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
    return "https://instagram.com/" + handle;
  }

  function mapHref() {
    if (CONFIG.mapa) return CONFIG.mapa;
    return "https://maps.google.com/?q=" + encodeURIComponent(CONFIG.direccion || "");
  }

  function waVisible() {
    const number = digits(CONFIG.whatsapp);
    if (number.length === 12 && number.startsWith("57")) {
      return "+57 " + number.slice(2, 5) + " " + number.slice(5, 8) + " " + number.slice(8);
    }
    return number ? "+" + number : "";
  }

  function iniciales(nombre) {
    return String(nombre || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(function (part) { return part[0]; })
      .join("")
      .toUpperCase();
  }

  function minPrecio() {
    const prices = (CONFIG.servicios || []).map(function (item) { return item.precio; });
    return prices.length ? Math.min.apply(null, prices) : 0;
  }

  function openDays() {
    return DIAS.filter(function (day) { return CONFIG.horario.semana[day[0]]; }).length;
  }

  function setHref(id, href, label) {
    const node = document.getElementById(id);
    if (!node) return;
    node.href = href;
    if (label) node.setAttribute("aria-label", label);
  }

  function renderProof() {
    const node = document.getElementById("hero-proof");
    const stat = (CONFIG.confianza || [])[0];
    if (!node || !stat) return;
    const prefix = stat.ejemplo ? "Ejemplo · " : "";
    node.textContent = (prefix + stat.valor + (stat.sufijo || "") + " " + stat.etiqueta).replace(/\s+/g, " ");
  }

  function renderMarquee() {
    const track = document.getElementById("marquee");
    if (!track) return;
    const items = (CONFIG.servicios || []).map(function (item) {
      return item.nombre + " · " + LordsSlots.pesos(item.precio);
    });
    if (!items.length) items.push(CONFIG.nombre);
    const html = items.map(function (item) { return "<li>" + esc(item) + "</li>"; }).join("");
    track.innerHTML = "<ul>" + html + "</ul><ul aria-hidden=\"true\">" + html + "</ul>";
  }

  function renderTrust() {
    const root = document.getElementById("trust");
    if (!root) return;
    const items = (CONFIG.confianza || []).map(function (item) {
      return {
        valor: item.valor,
        unidad: item.sufijo || "",
        etiqueta: item.etiqueta,
        ejemplo: !!item.ejemplo,
        label: (item.ejemplo ? "Ejemplo: " : "") + item.valor + (item.sufijo || "") + " " + item.etiqueta
      };
    });
    items.push({
      valor: openDays(),
      unidad: "",
      etiqueta: "días abiertos",
      ejemplo: false,
      label: openDays() + " días abiertos"
    });
    items.push({
      valor: (CONFIG.barberos || []).length,
      unidad: "",
      etiqueta: "en el equipo",
      ejemplo: false,
      label: (CONFIG.barberos || []).length + " personas en el equipo"
    });
    root.innerHTML = items.map(function (item, index) {
      return '<article class="stat" data-reveal style="--d:' + Math.min(index, 4) + '" aria-label="' + esc(item.label) + '">' +
        '<p class="stat-num" aria-hidden="true"><span data-count="' + esc(item.valor) + '">0</span>' +
        (item.unidad ? '<span class="unit">' + esc(item.unidad) + "</span>" : "") +
        "</p>" +
        '<p class="stat-label">' + esc(item.etiqueta) + "</p>" +
        (item.ejemplo ? '<span class="badge">Ejemplo</span>' : "") +
        "</article>";
    }).join("");
  }

  function renderWays() {
    const services = document.getElementById("ways-servicios");
    const barbers = document.getElementById("ways-barberos");
    if (services) {
      services.innerHTML = (CONFIG.servicios || []).map(function (item, index) {
        return '<button type="button" class="pick" data-open-reserva data-service="' + esc(item.id) + '" data-reveal style="--d:' + Math.min(index, 4) + '">' +
          '<span class="pick-shine" aria-hidden="true"></span>' +
          '<span class="pick-kicker">' + esc(LordsSlots.duracionTexto(item.duracion)) + "</span>" +
          '<span class="pick-title">' + esc(item.nombre) + "</span>" +
          '<span class="pick-text">' + esc(item.descripcion) + "</span>" +
          '<span class="pick-row"><span>' + esc(LordsSlots.pesos(item.precio)) + '</span><span class="pick-go">Reservar ' + arrow() + "</span></span>" +
          "</button>";
      }).join("");
    }
    if (barbers) {
      barbers.innerHTML = (CONFIG.barberos || []).map(function (item, index) {
        const face = item.foto
          ? '<img class="avatar" src="' + esc(item.foto) + '" alt="" width="96" height="96" loading="lazy">'
          : '<span class="avatar" aria-hidden="true">' + esc(iniciales(item.nombre)) + "</span>";
        return '<button type="button" class="pick pick-person" data-open-reserva data-barber="' + esc(item.id) + '" data-reveal style="--d:' + Math.min(index, 4) + '">' +
          '<span class="pick-shine" aria-hidden="true"></span>' +
          face +
          '<span class="pick-copy"><span class="pick-kicker">' + esc(item.categoria) + "</span>" +
          '<span class="pick-title">' + esc(item.nombre) + "</span>" +
          '<span class="pick-text">' + esc(item.especialidad) + "</span></span>" +
          '<span class="pick-go">Agendar ' + arrow() + "</span>" +
          "</button>";
      }).join("");
    }
  }

  function renderMenu() {
    const list = document.getElementById("menu-list");
    const desde = document.getElementById("desde");
    if (desde) {
      desde.innerHTML = "<span>Desde</span><strong>" + esc(LordsSlots.pesos(minPrecio())) + "</strong>";
    }
    if (!list) return;
    list.innerHTML = (CONFIG.servicios || []).map(function (item, index) {
      return '<li class="menu-row" data-reveal style="--d:' + Math.min(index, 4) + '">' +
        "<div><h3>" + esc(item.nombre) + "</h3><p>" + esc(item.descripcion) + "</p></div>" +
        '<div class="menu-side"><p class="menu-meta">' + esc(LordsSlots.duracionTexto(item.duracion)) + "</p>" +
        '<p class="menu-price">' + esc(LordsSlots.pesos(item.precio)) + "</p>" +
        '<button type="button" class="btn btn-small" data-open-reserva data-service="' + esc(item.id) + '">Reservar ' + arrow() + "</button></div>" +
        "</li>";
    }).join("");
  }

  function renderTeam() {
    const track = document.getElementById("equipo-track");
    if (!track) return;
    track.innerHTML = (CONFIG.barberos || []).map(function (item, index) {
      const face = item.foto
        ? '<img class="avatar avatar-lg" src="' + esc(item.foto) + '" alt="Retrato de ' + esc(item.nombre) + '" width="640" height="640" loading="lazy">'
        : '<span class="avatar avatar-lg" aria-hidden="true">' + esc(iniciales(item.nombre)) + "</span>";
      return '<article class="person" data-reveal style="--d:' + Math.min(index, 4) + '">' +
        face +
        '<p class="stamp">' + esc(item.categoria) + "</p>" +
        "<h3>" + esc(item.nombre) + "</h3>" +
        "<p>" + esc(item.especialidad) + "</p>" +
        '<button type="button" class="btn btn-small" data-open-reserva data-barber="' + esc(item.id) + '">Agendar ' + arrow() + "</button>" +
        "</article>";
    }).join("");
  }

  function renderGallery() {
    const track = document.getElementById("galeria-track");
    if (!track) return;
    track.innerHTML = (CONFIG.galeria || []).map(function (item) {
      return "<figure class=\"shot\">" +
        '<img src="' + esc(item.src) + '" alt="' + esc(item.alt) + '" width="800" height="1000" loading="lazy">' +
        "<figcaption>" + esc(item.titulo) + (item.ejemplo ? ' <span class="badge">Ejemplo</span>' : "") + "</figcaption>" +
        "</figure>";
    }).join("");
  }

  function renderGuarantee() {
    const node = document.getElementById("garantia");
    if (node) node.textContent = CONFIG.garantia || "";
    const badge = document.getElementById("garantia-ejemplo");
    if (badge) badge.hidden = !CONFIG.datosEjemplo;
  }

  function renderVisit() {
    const address = document.getElementById("direccion");
    const badge = document.getElementById("direccion-ejemplo");
    const hours = document.getElementById("horas");
    const map = document.getElementById("mapa");
    if (address) address.textContent = CONFIG.direccion || "";
    if (badge) badge.hidden = !CONFIG.datosEjemplo;
    if (map) {
      map.href = mapHref();
      map.target = "_blank";
      map.rel = "noopener noreferrer";
    }
    if (!hours) return;
    hours.innerHTML = DIAS.map(function (day) {
      const conf = CONFIG.horario.semana[day[0]];
      const value = conf ? LordsSlots.formatHora(conf.abre) + " – " + LordsSlots.formatHora(conf.cierra) : "Cerrado";
      return '<li class="' + (conf ? "" : "is-closed") + '"><span>' + day[1] + "</span><span>" + esc(value) + "</span></li>";
    }).join("");
    const foot = document.getElementById("footer-horas");
    if (foot) foot.innerHTML = hours.innerHTML;
  }

  function renderFaq() {
    const root = document.getElementById("faq");
    if (!root) return;
    root.innerHTML = (CONFIG.preguntas || []).map(function (item, index) {
      const panelId = "faq-panel-" + index;
      const btnId = "faq-btn-" + index;
      return '<div class="acc-item" data-acc>' +
        '<h3><button type="button" id="' + btnId + '" aria-expanded="false" aria-controls="' + panelId + '">' +
        "<span>" + esc(item.q) + '</span><span class="acc-icon" aria-hidden="true"></span></button></h3>' +
        '<div class="acc-panel" id="' + panelId + '" role="region" aria-labelledby="' + btnId + '" aria-hidden="true"><div><p>' + esc(item.a) + "</p></div></div>" +
        "</div>";
    }).join("");
  }

  function renderLinks() {
    const href = waHref();
    ["aviso-wa", "float-wa", "footer-wa"].forEach(function (id) {
      setHref(id, href);
    });
    const ig = igHref();
    ["float-ig", "footer-ig"].forEach(function (id) {
      setHref(id, ig);
    });
    const phone = document.getElementById("footer-tel");
    if (phone) phone.textContent = waVisible();
    const handle = document.getElementById("footer-handle");
    if (handle) handle.textContent = "@" + String(CONFIG.instagram || "").replace(/^@/, "");
    const note = document.getElementById("datos-ejemplo");
    if (note) note.hidden = !CONFIG.datosEjemplo;
    const teamNote = document.getElementById("equipo-ejemplo");
    if (teamNote) teamNote.hidden = !CONFIG.datosEjemplo;
    const priceNote = document.getElementById("precios-ejemplo");
    if (priceNote) priceNote.hidden = !CONFIG.datosEjemplo;
    document.title = CONFIG.nombre + " — Luce listo antes de salir";
    const og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", document.title);
  }

  renderProof();
  renderMarquee();
  renderTrust();
  renderWays();
  renderMenu();
  renderTeam();
  renderGallery();
  renderGuarantee();
  renderVisit();
  renderFaq();
  renderLinks();
})();
