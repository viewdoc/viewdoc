import NuxtConfiguration from '@nuxt/config'
import path from 'path'
import sass from 'sass'

const nuxtConfig: NuxtConfiguration = {
  rootDir: __dirname,
  srcDir: path.join(__dirname, 'src'),
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 4000,
  },
  render: {
    // Disable render.fallback so that .md files can be rendered
    fallback: false,
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
  css: [path.join(__dirname, 'src/assets/main.scss')],
  build: {
    extractCSS: true,
    typescript: {
      typeCheck: {
        // Only check src files
        reportFiles: ['src/**/*.{ts,tsx}'],
      },
    },
    loaders: {
      scss: {
        implementation: sass,
      },
    },
  },
}

export default nuxtConfig
