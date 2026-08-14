import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// `legacy/` no está en publicDir, así que se copia sin tocar el original.
const copyLegacy = (): Plugin => ({
  name: 'copy-legacy',
  apply: 'build',
  closeBundle() {
    const from = resolve(process.cwd(), 'legacy')
    if (!existsSync(from)) return
    cpSync(from, resolve(process.cwd(), 'dist/legacy'), { recursive: true })
  },
})

export default defineConfig({
  // Las URLs relativas permiten servir el mismo build desde raíz o subcarpeta.
  base: './',
  plugins: [react(), copyLegacy()],
})
