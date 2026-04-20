/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch export / Design Shards palette
        'void': '#0e0e0e',
        'layer-0': '#0e0e0e',
        'layer-1': '#1c1b1b',
        'layer-2': '#201f1f',
        'layer-3': '#3a3939',
        
        'matrix-green': '#00ff00',
        'tactical-cyan': '#00fbfb',
        'warning-magenta': '#ac00ac',
        'critical-error': '#ffb4ab',
        
        // Custom requirements from prompt
        'background': '#141313',
        'primary': '#00ff00',
        'secondary': '#00fbfb',
        'accent': '#ac00ac',
        'danger': '#ffb4ab',
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
