const store = (function () {
  function hash(value) {
    let h = 2166136261;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function pickOccupied(date, barberId, times) {
    if (!times || times.length < 3) return [];
    const busy = [];
    for (let i = 0; i < times.length; i += 1) {
      if (hash(date + "|" + barberId + "|" + times[i]) % 5 < 3) busy.push(times[i]);
    }
    return busy.slice(0, Math.max(0, times.length - 2));
  }

  function occupiedTimes(date, barberId, times) {
    if (barberId === "cualquiera") {
      const people = CONFIG.barberos || [];
      if (!people.length) return [];
      const sets = people.map(function (person) {
        return new Set(pickOccupied(date, person.id, times));
      });
      return times.filter(function (time) {
        return sets.every(function (set) { return set.has(time); });
      });
    }
    return pickOccupied(date, barberId, times);
  }

  async function listOccupancy(query) {
    const date = query && query.date;
    const barberId = query && query.barberId;
    const times = query && Array.isArray(query.times) ? query.times : [];
    return {
      date: date,
      barberId: barberId,
      occupied: occupiedTimes(date, barberId, times)
    };
  }

  async function createAppointment(cita) {
    if (!cita || !cita.nombre || !cita.telefono || !cita.date || !cita.time || !cita.serviceId) {
      return { ok: false, id: null, demo: true };
    }
    return { ok: true, id: null, demo: true };
  }

  async function cancelAppointment() {
    return { ok: true, demo: true };
  }

  return {
    listOccupancy: listOccupancy,
    createAppointment: createAppointment,
    cancelAppointment: cancelAppointment
  };
})();
