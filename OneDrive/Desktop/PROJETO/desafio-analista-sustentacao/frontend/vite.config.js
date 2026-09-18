import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Libera escuta na rede local (0.0.0.0)
    port: 5173,
    allowedHosts: [
      'upstage-procurer-hardcover.ngrok-free.dev', // Seu host específico do Ngrok
      '.ngrok-free.app',                           // Libera qualquer subdomínio .ngrok-free.app
      '.ngrok-free.dev'                            // Libera qualquer subdomínio .ngrok-free.dev
    ]
  }
})