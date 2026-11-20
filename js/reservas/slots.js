const LordsSlots = (function () {
  const ORDEN = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  const DIAS_LARGOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const MESES_CORTOS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

  function clock() {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
    const map = {};
    fmt.formatToParts(new Date()).forEach(function (part) {
      map[part.type] = part.value;
    });
    let hour = map.hour;
    if (hour === "24") hour = "00";
    return {
      iso: map.year + "-" + map.month + "-" + map.day,
      hhmm: String(hour).padStart(2, "0") + ":" + String(map.minute).padStart(2, "0")
    };
  }

  function todayISO() {
    return clock().iso;
  }

  function nowHHMM() {
    return clock().hhmm;
  }

  function addDays(iso, amount) {
    const bits = iso.split("-").map(Number);
    const date = new Date(Date.UTC(bits[0], bits[1] - 1, bits[2] + amount));
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return date.getUTCFullYear() + "-" + month + "-" + day;
  }

  function weekdayIndex(iso) {
    const bits = iso.split("-").map(Number);
    return new Date(Date.UTC(bits[0], bits[1] - 1, bits[2], 17, 0, 0)).getUTCDay();
  }

  function weekdayKey(iso) {
    return ORDEN[weekdayIndex(iso)];
  }

  function dayConfig(iso) {
    return CONFIG.horario.semana[weekdayKey(iso)] || null;
  }

  function toMin(hhmm) {
    const bits = hhmm.split(":").map(Number);
    return bits[0] * 60 + bits[1];
  }

  function fromMin(mins) {
    const hour = Math.floor(mins / 60);
    const minute = mins % 60;
    return String(hour).padStart(2, "0") + ":" + String(minute).padStart(2, "0");
  }

  function isPast(iso, hhmm) {
    if (iso !== todayISO()) return false;
    return hhmm <= nowHHMM();
  }

  function listTimes(iso, durationMin) {
    const day = dayConfig(iso);
    if (!day || !day.abre || !day.cierra) return [];
    const step = CONFIG.horario.intervalo || 30;
    const start = toMin(day.abre);
    const end = toMin(day.cierra);
    const duration = Number(durationMin) || step;
    const times = [];
    for (let cursor = start; cursor + duration <= end; cursor += step) {
      const hhmm = fromMin(cursor);
      if (!isPast(iso, hhmm)) times.push(hhmm);
    }
    return times;
  }

  function listOpenDays(count) {
    const total = count || 12;
    const out = [];
    let iso = todayISO();
    const today = iso;
    for (let i = 0; i < total + 21 && out.length < total; i += 1) {
      const day = dayConfig(iso);
      if (day && day.abre && day.cierra) {
        const probe = listTimes(iso, CONFIG.horario.intervalo || 30);
        if (iso !== today || probe.length) out.push(iso);
      }
      iso = addDays(iso, 1);
    }
    return out;
  }

  function formatHora(hhmm) {
    const bits = hhmm.split(":");
    let hour = Number(bits[0]);
    const suffix = hour < 12 ? "a. m." : "p. m.";
    hour = hour % 12 || 12;
    return hour + ":" + bits[1] + " " + suffix;
  }

  function formatFechaCorta(iso) {
    const bits = iso.split("-").map(Number);
    const index = weekdayIndex(iso);
    return DIAS_CORTOS[index] + " " + bits[2] + " " + MESES_CORTOS[bits[1] - 1];
  }

  function formatFechaLarga(iso) {
    const bits = iso.split("-").map(Number);
    const index = weekdayIndex(iso);
    return DIAS_LARGOS[index] + " " + bits[2] + " de " + MESES[bits[1] - 1] + " de " + bits[0];
  }

  function duracionTexto(min) {
    const value = Number(min) || 0;
    if (value < 60) return value + " min";
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? hours + " h " + rest + " min" : hours + " h";
  }

  function pesos(value) {
    const amount = Math.round(Number(value) || 0);
    const body = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (amount < 0 ? "-" : "") + "$" + body;
  }

  return {
    todayISO: todayISO,
    addDays: addDays,
    weekdayKey: weekdayKey,
    listOpenDays: listOpenDays,
    listTimes: listTimes,
    formatHora: formatHora,
    formatFechaCorta: formatFechaCorta,
    formatFechaLarga: formatFechaLarga,
    duracionTexto: duracionTexto,
    pesos: pesos
  };
})();
