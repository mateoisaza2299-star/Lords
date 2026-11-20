const ZONA = "America/Bogota";
const CLAVES = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const SEMANA = { Sun: "domingo", Mon: "lunes", Tue: "martes", Wed: "miercoles", Thu: "jueves", Fri: "viernes", Sat: "sabado" };

export function fechaBogota(fecha = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "short"
  });
  const partes = Object.fromEntries(
    fmt.formatToParts(fecha).filter((parte) => parte.type !== "literal").map((parte) => [parte.type, parte.value])
  );
  const hora = Number(partes.hour);
  const minuto = Number(partes.minute);
  return {
    iso: `${partes.year}-${partes.month}-${partes.day}`,
    minutos: hora * 60 + minuto,
    clave: SEMANA[partes.weekday]
  };
}

export function sumarDiasISO(iso, dias) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(anio, mes - 1, dia + dias, 17, 0, 0));
  const mm = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(utc.getUTCDate()).padStart(2, "0");
  return `${utc.getUTCFullYear()}-${mm}-${dd}`;
}

export function claveDia(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  return CLAVES[new Date(Date.UTC(anio, mes - 1, dia, 17, 0, 0)).getUTCDay()];
}

export function etiquetaFecha(iso) {
  const [anio, mes, dia] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia, 17, 0, 0));
  const larga = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: ZONA
  }).format(fecha);
  const corta = new Intl.DateTimeFormat("es-CO", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: ZONA
  }).format(fecha);
  const capital = (texto) => texto.charAt(0).toUpperCase() + texto.slice(1);
  return { larga: capital(larga), corta: capital(corta) };
}

function aMinutos(hhmm) {
  const [hora, minuto] = hhmm.split(":").map(Number);
  return hora * 60 + minuto;
}

function aHora(total) {
  const hora = Math.floor(total / 60);
  const minuto = total % 60;
  return `${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}`;
}

export function generarHoras({ abre, cierra, duracion, fechaISO, ahora = new Date() }) {
  const inicio = aMinutos(abre);
  const fin = aMinutos(cierra);
  const hoy = fechaBogota(ahora);
  const horas = [];
  for (let minuto = inicio; minuto + duracion <= fin; minuto += duracion) {
    if (hoy.iso === fechaISO && minuto <= hoy.minutos) continue;
    horas.push(aHora(minuto));
  }
  return horas;
}

export function generarDias(horario, { desde = new Date(), cantidad = 14, duracion = 30 } = {}) {
  const base = fechaBogota(desde);
  const dias = [];
  for (let i = 0; dias.length < cantidad && i < 40; i += 1) {
    const iso = sumarDiasISO(base.iso, i);
    const clave = claveDia(iso);
    const franja = horario[clave];
    if (!franja?.abre || !franja?.cierra) continue;
    const horas = generarHoras({
      abre: franja.abre,
      cierra: franja.cierra,
      duracion,
      fechaISO: iso,
      ahora: desde
    });
    if (!horas.length) continue;
    const etiquetas = etiquetaFecha(iso);
    dias.push({
      iso,
      clave,
      etiqueta: etiquetas.larga,
      corto: etiquetas.corta,
      abre: franja.abre,
      cierra: franja.cierra
    });
  }
  return dias;
}
