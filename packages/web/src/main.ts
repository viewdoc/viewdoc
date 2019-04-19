import compression from 'compression'
import express, { Express } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { pageRouter } from './page-router'

const start = async () => {
  const app: Express = express()
  app.use(helmet())
  app.use(compression())
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
  }
  app.use(pageRouter)
  app.listen(4000)
}

if (require.main === module) {
  start().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
