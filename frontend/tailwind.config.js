export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#f0f4ff', 100:'#dce8ff', 500:'#2563eb', 700:'#1d4ed8', 900:'#1e3a5f' },
        teal: { 50:'#f0fdfa', 500:'#14b8a6', 600:'#0d9488', 700:'#0f766e' }
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
}
