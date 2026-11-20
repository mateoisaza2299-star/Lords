(function () {
  const TITLES = [
    "¿Qué te hacemos?",
    "¿Con quién te sientas?",
    "¿Qué día vienes?",
    "¿A qué hora llegas?",
    "¿Cómo te avisamos?",
    "Listo. Este es tu resumen."
  ];
  const dialog = document.getElementById("reserva-dialog");
  const panel = dialog.querySelector("[data-panel]");
  let state = blank();
  let lastOpener = null;
  let renderToken = 0;
  let busy = false;

  function blank() {
    return {
      step: 1,
      serviceId: null,
      barberId: null,
      date: null,
      time: null,
      nombre: "",
      telefono: "",
      nota: ""
    };
  }

  function reservaStore() {
    return window.LORDS_STORE || store;
  }

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function arrow() {
    return '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function serviceById(id) {
    return (CONFIG.servicios || []).find(function (item) { return item.id === id; }) || null;
  }

  function barberById(id) {
    return (CONFIG.barberos || []).find(function (item) { return item.id === id; }) || null;
  }

  function validarNombre(value) {
    const text = String(value || "").trim().replace(/\s+/g, " ");
    if (!text) return "Escribe tu nombre.";
    if (text.length < 2) return "El nombre queda muy corto.";
    if (text.length > 60) return "El nombre es muy largo.";
    if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(text)) return "Usa solo letras. Ejemplo: Mateo Díaz.";
    return "";
  }

  function validarTelefono(value) {
    const text = String(value || "").trim();
    if (!text) return "Escribe tu celular.";
    let number = text.replace(/\D/g, "");
    if (number.startsWith("57") && (number.length === 12 || number.length === 11)) number = number.slice(2);
    if (/^3\d{9}$/.test(number) || /^60\d{8}$/.test(number)) return "";
    return "Usa un teléfono de Colombia. Ejemplo: 300 123 4567.";
  }

  function closedCopy() {
    const names = {
      lunes: "lunes",
      martes: "martes",
      miercoles: "miércoles",
      jueves: "jueves",
      viernes: "viernes",
      sabado: "sábado",
      domingo: "domingo"
    };
    const closed = Object.keys(names).filter(function (key) { return !CONFIG.horario.semana[key]; });
    if (!closed.length) return "Solo verás días con el local abierto.";
    if (closed.length === 1) return "No mostramos el " + names[closed[0]] + " porque el local está cerrado.";
    return "No mostramos los días cerrados: " + closed.map(function (key) { return names[key]; }).join(", ") + ".";
  }

  function waHref(text) {
    const number = String(CONFIG.whatsapp || "").replace(/\D/g, "");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  }

  function buildCita() {
    const service = serviceById(state.serviceId);
    const barber = state.barberId === "cualquiera" ? null : barberById(state.barberId);
    return {
      serviceId: state.serviceId,
      barberId: state.barberId,
      date: state.date,
      time: state.time,
      nombre: state.nombre.trim().replace(/\s+/g, " "),
      telefono: state.telefono.trim(),
      nota: state.nota.trim(),
      servicio: service ? service.nombre : "",
      barbero: state.barberId === "cualquiera" ? "Cualquiera" : (barber ? barber.nombre : ""),
      duracion: service ? service.duracion : 0,
      precio: service ? service.precio : 0
    };
  }

  function mensaje(cita) {
    const lines = [
      "Hola, quiero reservar en " + CONFIG.nombre + ".",
      "Servicio: " + cita.servicio + " (" + LordsSlots.duracionTexto(cita.duracion) + ")",
      "Precio: " + LordsSlots.pesos(cita.precio),
      "Barbero: " + cita.barbero,
      "Día: " + LordsSlots.formatFechaLarga(cita.date),
      "Hora: " + LordsSlots.formatHora(cita.time),
      "Nombre: " + cita.nombre,
      "Celular: " + cita.telefono
    ];
    if (cita.nota) lines.push("Nota: " + cita.nota);
    if (CONFIG.mostrarAvisoDemo) lines.push("Mensaje enviado desde la web en modo demostración.");
    return lines.join("\n");
  }

  function syncForm() {
    const form = panel.querySelector("[data-form]");
    if (!form) return;
    state.nombre = form.nombre.value;
    state.telefono = form.telefono.value;
    state.nota = form.nota.value;
  }

  function showStepError(message) {
    const node = panel.querySelector("[data-step-error]");
    if (node) node.textContent = message || "";
  }

  function setFieldError(name, message) {
    const input = panel.querySelector('[name="' + name + '"]');
    const error = panel.querySelector('[data-error-for="' + name + '"]');
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (error) error.textContent = message || "";
  }

  function validate() {
    if (state.step === 1 && !state.serviceId) {
      showStepError("Elige un servicio para seguir.");
      return false;
    }
    if (state.step === 2 && !state.barberId) {
      showStepError("Elige un barbero o Cualquiera.");
      return false;
    }
    if (state.step === 3 && !state.date) {
      showStepError("Elige un día.");
      return false;
    }
    if (state.step === 4 && !state.time) {
      showStepError("Elige una hora.");
      return false;
    }
    if (state.step === 5) {
      syncForm();
      const nameError = validarNombre(state.nombre);
      const phoneError = validarTelefono(state.telefono);
      const noteError = state.nota.trim().length > 180 ? "Deja la nota en 180 caracteres o menos." : "";
      setFieldError("nombre", nameError);
      setFieldError("telefono", phoneError);
      setFieldError("nota", noteError);
      if (nameError || phoneError || noteError) return false;
    }
    return true;
  }

  function option(attrs, title, meta, pressed) {
    return '<button type="button" class="option" aria-pressed="' + (pressed ? "true" : "false") + '" ' + attrs + '>' +
      '<span class="option-title">' + esc(title) + '</span><span class="option-meta">' + esc(meta) + "</span></button>";
  }

  async function markup() {
    if (state.step === 1) {
      const buttons = (CONFIG.servicios || []).map(function (item) {
        return option(
          'data-service-option="' + esc(item.id) + '"',
          item.nombre,
          LordsSlots.duracionTexto(item.duracion) + " · " + LordsSlots.pesos(item.precio),
          state.serviceId === item.id
        );
      }).join("");
      const chosen = state.barberId ? barberById(state.barberId) : null;
      const hint = chosen
        ? '<p class="helper">Sigues con ' + esc(chosen.nombre) + ". Lo puedes cambiar en el siguiente paso.</p>"
        : "";
      const empty = buttons || "<p>Agrega servicios en js/config.js.</p>";
      return hint + '<div class="options" role="group" aria-label="Servicios">' + empty + '</div><p class="step-error" data-step-error aria-live="polite"></p>';
    }
    if (state.step === 2) {
      const people = (CONFIG.barberos || []).map(function (item) {
        return option(
          'data-barber-option="' + esc(item.id) + '"',
          item.nombre,
          item.categoria + " · " + item.especialidad,
          state.barberId === item.id
        );
      }).join("");
      return '<div class="options" role="group" aria-label="Barberos">' +
        option('data-barber-option="cualquiera"', "Cualquiera", "Te asignamos a quien tenga el hueco.", state.barberId === "cualquiera") +
        people +
        '</div><p class="step-error" data-step-error aria-live="polite"></p>';
    }
    if (state.step === 3) {
      const days = LordsSlots.listOpenDays(12).map(function (iso) {
        return '<button type="button" class="day" data-day-option="' + esc(iso) + '" aria-pressed="' + (state.date === iso ? "true" : "false") + '">' +
          esc(LordsSlots.formatFechaCorta(iso)) + "</button>";
      }).join("");
      return '<p class="helper">' + esc(closedCopy()) + '</p><div class="days" role="group" aria-label="Días">' +
        (days || "<p>No hay días abiertos en el horario.</p>") +
        '</div><p class="step-error" data-step-error aria-live="polite"></p>';
    }
    if (state.step === 4) {
      const service = serviceById(state.serviceId);
      const duration = service ? service.duracion : 30;
      const times = LordsSlots.listTimes(state.date, duration);
      const occupancy = await reservaStore().listOccupancy({
        date: state.date,
        barberId: state.barberId || "cualquiera",
        times: times
      });
      const busyTimes = new Set((occupancy && occupancy.occupied) || []);
      const buttons = times.map(function (time) {
        const taken = busyTimes.has(time);
        if (taken) {
          return '<button type="button" class="time" disabled>' + esc(LordsSlots.formatHora(time)) + " · Ocupada</button>";
        }
        return '<button type="button" class="time" data-time-option="' + esc(time) + '" aria-pressed="' + (state.time === time ? "true" : "false") + '">' +
          esc(LordsSlots.formatHora(time)) + "</button>";
      }).join("");
      const helper = "Este servicio dura " + LordsSlots.duracionTexto(duration) + ". La hora tiene que caber antes del cierre.";
      const body = buttons || "<p>Este día ya no tiene horas. Elige otro.</p>";
      return '<p class="helper">' + esc(helper) + '</p><div class="times" role="group" aria-label="Horas">' + body +
        '</div><p class="step-error" data-step-error aria-live="polite"></p>';
    }
    if (state.step === 5) {
      return '<form data-form novalidate>' +
        '<div class="field"><label for="reserva-nombre">Nombre</label>' +
        '<input id="reserva-nombre" name="nombre" autocomplete="name" required maxlength="60" value="' + esc(state.nombre) + '">' +
        '<p class="field-error" data-error-for="nombre" aria-live="polite"></p></div>' +
        '<div class="field"><label for="reserva-tel">Celular</label>' +
        '<input id="reserva-tel" name="telefono" type="tel" inputmode="tel" autocomplete="tel" required placeholder="300 123 4567" value="' + esc(state.telefono) + '">' +
        '<p class="field-error" data-error-for="telefono" aria-live="polite"></p></div>' +
        '<div class="field"><label for="reserva-nota">Nota <span class="optional">(opcional)</span></label>' +
        '<textarea id="reserva-nota" name="nota" maxlength="180" rows="3">' + esc(state.nota) + "</textarea>" +
        '<p class="field-error" data-error-for="nota" aria-live="polite"></p></div>' +
        '<p class="helper">Con esto armamos el mensaje. Esta página no lo guarda.</p></form>';
    }
    const cita = buildCita();
    const href = waHref(mensaje(cita));
    const rows = [
      ["Servicio", cita.servicio + " · " + LordsSlots.duracionTexto(cita.duracion)],
      ["Precio", LordsSlots.pesos(cita.precio)],
      ["Barbero", cita.barbero],
      ["Día", LordsSlots.formatFechaLarga(cita.date)],
      ["Hora", LordsSlots.formatHora(cita.time)],
      ["Nombre", cita.nombre],
      ["Celular", cita.telefono]
    ];
    if (cita.nota) rows.push(["Nota", cita.nota]);
    const summary = rows.map(function (row) {
      return "<div><dt>" + esc(row[0]) + "</dt><dd>" + esc(row[1]) + "</dd></div>";
    }).join("");
    const note = CONFIG.mostrarAvisoDemo
      ? '<p class="demo-note">Demostración: esta cita aún no se registra en un sistema.</p>'
      : "";
    return '<div class="success"><svg class="success-mark" viewBox="0 0 72 72" aria-hidden="true"><circle cx="36" cy="36" r="30" fill="none" stroke="currentColor" stroke-width="2"></circle><path d="M24 37.5 32.5 46 49 28" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
      '<p class="success-lead">Revisa los datos y envíalos por WhatsApp.</p><dl class="summary">' + summary + "</dl>" +
      note +
      '<a class="btn" data-wa href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">Enviar por WhatsApp ' + arrow() + "</a></div>";
  }

  function updateChrome() {
    const stepLabel = document.getElementById("reserva-paso");
    const title = document.getElementById("reserva-titulo");
    const bar = dialog.querySelector("[data-progress]");
    const back = dialog.querySelector("[data-back]");
    const next = dialog.querySelector("[data-next]");
    if (stepLabel) stepLabel.textContent = "Paso " + state.step + " de 6";
    if (title) title.textContent = TITLES[state.step - 1];
    if (bar) bar.style.setProperty("--p", String(state.step / 6));
    if (back) back.hidden = state.step === 1;
    if (next) next.hidden = state.step === 6;
  }

  async function paintStep(direction) {
    const token = ++renderToken;
    busy = true;
    let html;
    try {
      html = await markup();
    } catch (error) {
      html = '<p class="step-error">No pudimos armar este paso. Vuelve a intentar.</p>';
    }
    if (token !== renderToken) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const first = panel.dataset.ready !== "1";
    let applied = false;
    const apply = function () {
      if (applied || token !== renderToken) return;
      applied = true;
      panel.innerHTML = html;
      panel.dataset.ready = "1";
      panel.classList.remove("is-leave", "is-enter");
      updateChrome();
      if (!reduce && !first) {
        panel.classList.add("is-enter");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            if (token === renderToken) panel.classList.remove("is-enter");
          });
        });
      }
      busy = false;
      const focusable = panel.querySelector("[aria-pressed='true'], input, button, a");
      if (focusable) focusable.focus();
    };
    if (first || reduce) {
      apply();
      return;
    }
    panel.style.setProperty("--shift", direction < 0 ? "16px" : "-16px");
    panel.classList.add("is-leave");
    const finish = function (event) {
      if (event && event.target !== panel) return;
      if (event && event.propertyName && event.propertyName !== "opacity") return;
      panel.removeEventListener("transitionend", finish);
      apply();
    };
    panel.addEventListener("transitionend", finish);
    window.setTimeout(function () { finish(); }, 450);
  }

  function openReserva(preset) {
    state = blank();
    const serviceId = preset && preset.serviceId;
    const barberId = preset && preset.barberId;
    if (serviceId && serviceById(serviceId)) state.serviceId = serviceId;
    if (barberId && barberById(barberId)) state.barberId = barberId;
    lastOpener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    paintStep(1);
  }

  function next() {
    if (busy) return;
    if (!validate()) return;
    if (state.step >= 6) return;
    state.step += 1;
    paintStep(1);
  }

  function back() {
    if (busy || state.step <= 1) return;
    syncForm();
    state.step -= 1;
    paintStep(-1);
  }

  function press(selector, attr, value) {
    panel.querySelectorAll(selector).forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.getAttribute(attr) === value));
    });
  }

  document.addEventListener("click", function (event) {
    const opener = event.target.closest("[data-open-reserva]");
    if (!opener) return;
    event.preventDefault();
    openReserva({
      serviceId: opener.getAttribute("data-service"),
      barberId: opener.getAttribute("data-barber")
    });
  });

  dialog.addEventListener("click", function (event) {
    if (event.target.closest("[data-next]")) {
      event.preventDefault();
      next();
      return;
    }
    if (event.target.closest("[data-back]")) {
      event.preventDefault();
      back();
      return;
    }
    if (event.target.closest("[data-close]")) {
      event.preventDefault();
      dialog.close();
      return;
    }
    const service = event.target.closest("[data-service-option]");
    if (service) {
      const id = service.getAttribute("data-service-option");
      if (state.serviceId !== id) state.time = null;
      state.serviceId = id;
      press("[data-service-option]", "data-service-option", id);
      showStepError("");
      return;
    }
    const barber = event.target.closest("[data-barber-option]");
    if (barber) {
      const id = barber.getAttribute("data-barber-option");
      if (state.barberId !== id) state.time = null;
      state.barberId = id;
      press("[data-barber-option]", "data-barber-option", id);
      showStepError("");
      return;
    }
    const day = event.target.closest("[data-day-option]");
    if (day) {
      const iso = day.getAttribute("data-day-option");
      if (state.date !== iso) state.time = null;
      state.date = iso;
      press("[data-day-option]", "data-day-option", iso);
      showStepError("");
      return;
    }
    const time = event.target.closest("[data-time-option]");
    if (time) {
      state.time = time.getAttribute("data-time-option");
      press("[data-time-option]", "data-time-option", state.time);
      showStepError("");
      return;
    }
    if (event.target.closest("[data-wa]")) {
      reservaStore().createAppointment(buildCita());
    }
  });

  dialog.addEventListener("input", function (event) {
    const field = event.target;
    if (!field.name || !Object.prototype.hasOwnProperty.call(state, field.name)) return;
    state[field.name] = field.value;
  });

  dialog.addEventListener("submit", function (event) {
    if (!event.target.matches("[data-form]")) return;
    event.preventDefault();
    next();
  });

  dialog.addEventListener("close", function () {
    renderToken += 1;
    busy = false;
    state = blank();
    panel.innerHTML = "";
    delete panel.dataset.ready;
    const returnTo = lastOpener;
    lastOpener = null;
    if (returnTo && returnTo.isConnected) returnTo.focus();
  });
})();
