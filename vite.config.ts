import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `legacy/` se conserva en el repositorio como referencia interna, pero NO se
// publica: no se copia a `dist` ni se enlaza desde la interfaz.
export default defineConfig({
  // Las URLs relativas permiten servir el mismo build desde raíz o subcarpeta.
  base: './',
  plugins: [react()],
})
