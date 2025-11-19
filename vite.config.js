import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [vue()],
    server: {
      host: '127.0.0.1',
      port: 3000,
    },
  }

  if (command === 'build') {
    // [IMPORTANT] REPLACE '<REPO_NAME>' with your repository name (e.g., '/my-app/')
    // If deploying to https://username.github.io, set this to '/'
    config.base = '/momofee/'
  }

  return config
})
