/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        /* CYBERPUNK NEON PALETTE */
        'void': '#050810',
        'layer-0': '#050810',
        'layer-1': '#0A0F1E',
        'layer-2': '#0D1520',
        'layer-3': '#131D2E',
        'layer-4': '#1A2740',

        /* Multi-Neon Accents */
        'matrix-green': '#00FF9F',
        'neon-green': '#00FF9F',
        'neon-green-dim': '#00CC7F',
        'neon-cyan': '#00E5FF',
        'neon-magenta': '#FF0055',
        'neon-orange': '#FF6B00',
        'neon-yellow': '#FCEE09',
        'neon-violet': '#BF40FF',
        'neon-pink': '#FF2D7B',

        /* Semantic */
        'success': '#00FF9F',
        'warning': '#FF6B00',
        'danger': '#FF0055',
        'info': '#00E5FF',

        /* Text */
        'text-bright': '#E8F0FF',
        'text-dim': '#6B7FA3',

        /* Aliases */
        'background': '#050810',
        'primary': '#00FF9F',
        'secondary': '#00E5FF',
        'accent': '#FF0055',
        'danger': '#FF0055',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'rajdhani': ['Rajdhani', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      clipPath: {
        'notch': 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        'aggressive': 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
        'hex': 'polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)',
      },
      animation: {
        'glitch': 'glitch-horizontal 0.3s ease-in-out',
        'flicker': 'neon-flicker 3s infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'border-glow': 'border-glow 1.5s ease-in-out infinite',
        'chromatic': 'chromatic-shift 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
