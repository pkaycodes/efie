import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base keeps the site portable on GitHub Pages project URLs,
  // custom domains and local previews alike. HashRouter means the document
  // path never changes, so relative asset paths stay stable.
  base: './',
  plugins: [react()],
})
