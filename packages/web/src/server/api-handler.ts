import { ViewDocApi } from '@viewdoc/api'
import { DocContent, DocPageParams, ExportInputParams, ExportParams } from '@viewdoc/core/lib/doc'
import bodyParser from 'body-parser'
import compression from 'compression'
import config from 'config'
import express, { NextFunction, Request, Response } from 'express'
import helmet from 'helmet'
import morgan from 'morgan'
import { Readable } from 'stream'

const api = new ViewDocApi({
  markupService: config.get('markupService'),
  exporterService: config.get('exporterService'),
  cache: config.get('cache'),
  github: config.get('github'),
  gitlab: config.get('gitlab'),
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
    const subdomain = req.subdomains && req.subdomains[0]
    const docContent: DocContent | undefined = await api.getDocContent(pageParams, subdomain)
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

app.get('/export', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exportParams: ExportParams = {
      docPageParams: req.query,
      format: req.query.format,
    }
    const subdomain = req.subdomains && req.subdomains[0]
    const docContent: DocContent | undefined = await api.getDocContent(exportParams.docPageParams, subdomain)
    if (!docContent) {
      next()
      return
    }
    const exportInputParams: ExportInputParams = {
      siteConfig: docContent.siteConfig,
      html: docContent.body,
      format: exportParams.format,
    }
    const stream: Readable = await api.exportDocContent(exportInputParams)
    if (!stream) {
      next()
      return
    }
    res.attachment(`${exportParams.docPageParams.repoId}.${exportParams.format}`)
    stream.pipe(res)
  } catch (err) {
    console.log(err)
    next(err)
  }
})

export default app
