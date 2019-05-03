import NuxtConfiguration from '@nuxt/config'
import path from 'path'

const nuxtConfig: NuxtConfiguration = {
  rootDir: __dirname,
  srcDir: path.join(__dirname, 'src'),
  server: {
    port: process.env.PORT || 4000,
  },
  serverMiddleware: [{ path: '/viewdoc/x-api', handler: path.join(__dirname, 'src/server/api-handler') }],
  head: {
    titleTemplate: (title: string): string => {
      return `${title ? `${title} - ` : ''}ViewDoc`
    },
    meta: [
      { charset: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui',
      },
    ],
  },
  css: ['@viewdoc/styles/viewdoc-styles.css'],
  build: {
    extractCSS: true,
    typescript: {
      typeCheck: {
        // Only check src files
        reportFiles: ['src/**/*.{ts,tsx}'],
      },
    },
  },
}

export default nuxtConfig
