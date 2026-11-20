const CONFIG = {
  nombre: "Lords",
  modo: "demo",
  mostrarAvisoDemo: true,
  datosEjemplo: true,
  whatsapp: "573001112233",
  instagram: "lords.barberia",
  direccion: "Carrera 13 #85-32, Chapinero, Bogotá",
  mapa: "",
  horario: {
    intervalo: 30,
    semana: {
      lunes: { abre: "10:00", cierra: "20:00" },
      martes: { abre: "10:00", cierra: "20:00" },
      miercoles: { abre: "10:00", cierra: "20:00" },
      jueves: { abre: "10:00", cierra: "20:00" },
      viernes: { abre: "10:00", cierra: "21:00" },
      sabado: { abre: "09:00", cierra: "20:00" },
      domingo: null
    }
  },
  servicios: [
    {
      id: "corte",
      nombre: "Corte clásico",
      descripcion: "Tijera o máquina, con el contorno limpio y el largo que te favorece.",
      duracion: 45,
      precio: 35000
    },
    {
      id: "corte-barba",
      nombre: "Corte y barba",
      descripcion: "El corte de arriba más la barba perfilada, con toalla caliente.",
      duracion: 70,
      precio: 55000
    },
    {
      id: "barba",
      nombre: "Barba con toalla",
      descripcion: "Perfil, navaja y toalla caliente. Sales con la cara despejada.",
      duracion: 30,
      precio: 25000
    },
    {
      id: "nino",
      nombre: "Corte niño",
      descripcion: "Para menores de 12. El mismo cuidado, en menos tiempo.",
      duracion: 30,
      precio: 28000
    },
    {
      id: "ritual",
      nombre: "Ritual completo",
      descripcion: "Corte, barba y cejas. El turno largo, para salir impecable.",
      duracion: 90,
      precio: 75000
    }
  ],
  barberos: [
    {
      id: "andres",
      nombre: "Andrés Rojas",
      foto: "",
      categoria: "Maestro",
      especialidad: "Cortes clásicos y degradados"
    },
    {
      id: "camilo",
      nombre: "Camilo Vera",
      foto: "",
      categoria: "Barbero",
      especialidad: "Barbas y perfiles"
    },
    {
      id: "sara",
      nombre: "Sara Molina",
      foto: "",
      categoria: "Barbero",
      especialidad: "Tijera y textura"
    }
  ],
  confianza: [
    { valor: 40, sufijo: "", etiqueta: "reservas por semana", ejemplo: true },
    { valor: 45, sufijo: " min", etiqueta: "el corte más pedido", ejemplo: true }
  ],
  garantia: "Si el corte no te convence, lo ajustamos dentro de los primeros 7 días.",
  galeria: [
    { src: "img/estilo-sello.svg", alt: "Gráfico de ejemplo: el sello circular de Lords", titulo: "El sello", ejemplo: true },
    { src: "img/estilo-pompa.svg", alt: "Gráfico de ejemplo: silueta de pompadour", titulo: "Pompadour", ejemplo: true },
    { src: "img/estilo-bigote.svg", alt: "Gráfico de ejemplo: línea de bigote", titulo: "La línea", ejemplo: true },
    { src: "img/estilo-corte.svg", alt: "Gráfico de ejemplo: cartel de corte", titulo: "Cartel de corte", ejemplo: true }
  ],
  preguntas: [
    {
      q: "¿Cómo reservo?",
      a: "Elige servicio, barbero, día y hora. Al final se abre WhatsApp con el resumen para que lo envíes."
    },
    {
      q: "¿Puedo pedir a cualquier barbero?",
      a: "Sí. En el segundo paso está Cualquiera: ves un hueco si al menos una persona del equipo está libre."
    },
    {
      q: "¿Qué hago si ya tengo cita?",
      a: "Escríbenos por WhatsApp. Desde ahí cambias la hora o cancelas."
    },
    {
      q: "¿La cita queda guardada en la página?",
      a: "No. Esta web arma el resumen y lo envías por WhatsApp. No guarda tu nombre ni tu celular."
    },
    {
      q: "¿Puedo ir sin reservar?",
      a: "Ejemplo: la silla es primero para quien tiene hora. Si queda un hueco, te recibimos."
    }
  ]
};

globalThis.CONFIG = CONFIG;
