function hash(texto) {
  let valor = 2166136261;
  for (let i = 0; i < texto.length; i += 1) {
    valor ^= texto.charCodeAt(i);
    valor = Math.imul(valor, 16777619);
  }
  return valor >>> 0;
}

function aHora(total) {
  const hora = Math.floor(total / 60);
  const minuto = total % 60;
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

export function estaOcupada(fecha, barberoId, hora) {
  return hash(`${fecha}|${barberoId}|${hora}`) % 5 < 2;
}

export function crearStoreDemo() {
  return {
    modo: "demo",
    async listarOcupacion(fecha, barberoId) {
      const horas = [];
      for (let minuto = 0; minuto < 24 * 60; minuto += 5) {
        const hora = aHora(minuto);
        if (estaOcupada(fecha, barberoId, hora)) horas.push(hora);
      }
      return horas;
    },
    async crearCita(cita) {
      return { ok: true, persistida: false, id: null, cita: { ...cita } };
    },
    async cancelarCita(id) {
      return { ok: true, persistida: false, id };
    }
  };
}
