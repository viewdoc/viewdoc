import { ViewDocApi } from '@viewdoc/api'
import { DocContent, DocPageParams } from '@viewdoc/core/lib/doc'
import bodyParser from 'body-parser'
import compression from 'compression'
import config from 'config'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'

const api = new ViewDocApi({
  cache: config.get('cache'),
  github: config.get('github'),
})

const app = express()
app.use(helmet())
app.use(compression())
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/doc-content', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pageParams: DocPageParams = req.query
    const docContent: DocContent | undefined = await api.getDocContent(pageParams, 'github')
    if (!docContent) {
      next()
      return
    }
    res.json(docContent)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export default app
