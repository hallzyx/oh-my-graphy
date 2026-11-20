import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
export default defineConfig({ plugins: [react(), tailwindcss()], build: { rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules/@ui-sdk/')) return 'ui-sdk'; if (id.includes('node_modules/@xyflow/') || id.includes('node_modules/d3-') || id.includes('node_modules/zustand')) return 'flow'; if (id.includes('node_modules/react-dom/') || id.includes('node_modules/react/')) return 'react'; } } } }, resolve: { alias: { '@': path.resolve(import.meta.dirname, './src') } } })
