# 🎲 Sorteo al Azar

Aplicación web de sorteos por nombres con suspenso garantizado. Construida con React, Tailwind CSS, Framer Motion y canvas-confetti.

## Stack

- **React 18** — hooks funcionales
- **Vite 5** — bundler ultrarrápido
- **Tailwind CSS 3** — utility-first styling
- **Framer Motion** — animaciones de transición
- **canvas-confetti** — efecto de confetti en ganadores
- **Lucide React** — iconos
- **Web Audio API** — sonidos tick-tac y fanfarria (sin dependencias externas)

## Características

- ✅ Vista de configuración con título, lista de participantes y cantidad de ganadores
- ✅ Contador animado de 10 a 0 con círculo de progreso SVG
- ✅ Transiciones fluidas entre vistas (Framer Motion)
- ✅ Algoritmo Fisher-Yates para aleatoriedad sin repetición
- ✅ Ganadores eliminados del pool para sorteos sucesivos
- ✅ Persistencia en `localStorage` (título, participantes restantes, historial)
- ✅ Historial de rondas anteriores
- ✅ Importar participantes desde `.txt` o `.csv`
- ✅ Drag & drop de archivos
- ✅ Sonidos generados con Web Audio API
- ✅ Confetti al revelar ganadores
- ✅ Diseño dark mode, responsive
- ✅ **Cronómetro para el público** (pestaña *Cronómetro*):
  - Cuenta regresiva con tiempos rápidos (1, 3, 5, 10, 15, 20, 30, 45, 60 min) o manual (h : m : s)
  - Cuenta hasta una hora del día (ej. "El desfile comienza en…" hasta las 6:00 PM)
  - Cronómetro ascendente
  - Texto sobre el reloj y mensaje final editables, con sugerencias
  - Sumar / restar 1 minuto sin detener la cuenta, pausa y reinicio
  - Tic-tac en los últimos 10 s, alarma y confetti al terminar (opcionales)
  - "Mostrar en esta pantalla" o "Abrir ventana para el proyector" (`#pantalla`), sincronizada con el panel
  - Atajos: Espacio (iniciar/pausar), F (pantalla completa), + / − (1 min), R (reiniciar), Esc (volver)

## Instalación

```bash
# Clonar / descomprimir el proyecto
cd sorteo-app

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview
```

## Deploy

### Vercel (recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Arrastra la carpeta `dist/` a netlify.com/drop
```

### GitHub Pages
```bash
# En vite.config.js, ajusta base al nombre de tu repo:
# base: '/nombre-del-repo/'
npm run build
# Sube el contenido de dist/ a la rama gh-pages
```

## Estructura

```
src/
├── components/
│   ├── SetupView.jsx      # Pantalla de configuración
│   ├── CounterView.jsx    # Contador animado 10→0
│   ├── ResultsView.jsx    # Ganadores + confetti
│   ├── TimerPanel.jsx     # Panel de configuración del cronómetro
│   └── TimerDisplay.jsx   # Reloj grande para la pantalla del evento
├── hooks/
│   ├── useSorteoState.js  # Estado persistido en localStorage
│   ├── useTimerStore.js   # Estado del cronómetro (sincronizado entre ventanas)
│   └── useAudio.js        # Sonidos via Web Audio API
├── utils/
│   └── shuffle.js         # Fisher-Yates + parseParticipants
├── App.jsx                # Orquestador de vistas
├── main.jsx               # Entry point
└── index.css              # Tailwind + estilos globales
```

## En producción

Usada en eventos reales de Rotary y Rotaract (Distrito 4370): la versión del **Desfile de Modas Rosa 2026** está en [desfile-rosa.netlify.app](https://desfile-rosa.netlify.app), con la identidad de "Juntos por una vida Color de Rosa".

Hecho por [CODE ATD](https://codeatd.dev).
