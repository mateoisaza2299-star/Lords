export const CONFIG = {
  nombre: "Lords",
  modo: "demo",
  mostrarAvisoDemo: true,
  datosEjemplo: true,
  whatsapp: "573001112233",
  instagram: "lords.ejemplo",
  direccion: {
    linea: "Carrera 14 #86-21",
    ciudad: "Bogotá",
    barrio: "Chapinero",
    mapa: "https://www.google.com/maps/search/?api=1&query=Carrera+14+86-21+Chapinero+Bogota"
  },
  horario: {
    lunes: { abre: "10:00", cierra: "20:00" },
    martes: { abre: "10:00", cierra: "20:00" },
    miercoles: { abre: "10:00", cierra: "20:00" },
    jueves: { abre: "10:00", cierra: "20:00" },
    viernes: { abre: "10:00", cierra: "21:00" },
    sabado: { abre: "09:00", cierra: "19:00" },
    domingo: null
  },
  garantia: "Si el corte no te convence antes de salir, lo ajustamos en la misma cita.",
  servicios: [
    {
      id: "corte",
      nombre: "Corte",
      descripcion: "Forma, contorno y un acabado que mañana sigue viéndose bien.",
      duracion: 45,
      precio: 40000
    },
    {
      id: "barba",
      nombre: "Barba",
      descripcion: "Toalla caliente, navaja y el perfil en su sitio.",
      duracion: 30,
      precio: 28000
    },
    {
      id: "combo",
      nombre: "Corte y barba",
      descripcion: "Todo en una sola cita. Sales de una vez.",
      duracion: 75,
      precio: 62000
    },
    {
      id: "nino",
      nombre: "Corte niño",
      descripcion: "Para menores de 12. Sin afán y con paciencia.",
      duracion: 30,
      precio: 30000
    },
    {
      id: "cejas",
      nombre: "Cejas",
      descripcion: "Una limpieza corta para enmarcar la cara.",
      duracion: 15,
      precio: 18000
    }
  ],
  barberos: [
    {
      id: "ejemplo-a",
      nombre: "Ejemplo A",
      foto: "",
      categoria: "Senior",
      especialidad: "Fades y estructura",
      ejemplo: true
    },
    {
      id: "ejemplo-b",
      nombre: "Ejemplo B",
      foto: "",
      categoria: "Barbero",
      especialidad: "Barba y navaja",
      ejemplo: true
    },
    {
      id: "ejemplo-c",
      nombre: "Ejemplo C",
      foto: "",
      categoria: "Master",
      especialidad: "Cortes clásicos",
      ejemplo: true
    }
  ],
  confianza: [
    { valor: 45, sufijo: " min", etiqueta: "Duración de un corte" },
    { valor: 6, sufijo: " días", etiqueta: "Agenda de la semana" },
    { valor: 1, sufijo: " silla", etiqueta: "Por cada reserva" }
  ]
};
