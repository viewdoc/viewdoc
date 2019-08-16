import { ExporterConfig } from '@viewdoc/api'
import { ExportInputParams } from '@viewdoc/core/lib/doc'
import { SiteConfigResolver } from '@viewdoc/core/lib/site-config'
import bodyParser from 'body-parser'
import config from 'config'
import spawn from 'cross-spawn'
import crypto from 'crypto'
import express, { Application, Request, Response } from 'express'
import { createReadStream, ensureDirSync, readFileSync, removeSync, writeFileSync } from 'fs-extra'
import path from 'path'

export class App {
  public app: Application
  private exporterConfig!: ExporterConfig
  private readonly siteConfigResolver: SiteConfigResolver

  constructor () {
    this.app = express()
    this.config()
    this.siteConfigResolver = new SiteConfigResolver()
  }

  private config (): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.post('/', (req, res) => this.process(req, res))
    this.exporterConfig = config.get('exporter')
  }

  private async process (req: Request, res: Response) {
    const inputParams: ExportInputParams = req.body
    const id = crypto.randomBytes(16).toString('hex')
    const basePath = path.join(this.exporterConfig.basePath, id)
    const inputPath = path.join(basePath, 'input.html')
    const outputPath = path.join(basePath, `output.${inputParams.format || 'mobi'}`)
    const themeCss: string = this.siteConfigResolver.getTheme(inputParams.siteConfig)
    const baseCss: string = readFileSync(
      path.join(__dirname, '../node_modules/@viewdoc/page-style/dist/main.css'),
      'utf-8',
    )
    const html = `<html><head><style type="text/css">${baseCss}</style><style type="text/css">${themeCss}</style></head><body><main>${inputParams.html}</main></body></html>`
    ensureDirSync(basePath)
    writeFileSync(inputPath, html)
    const error = await this.convert(inputPath, outputPath)
    if (!error) {
      const output = createReadStream(outputPath)
      output.pipe(res)
    } else {
      res.status(500)
    }
    removeSync(basePath)
  }

  private convert (inputPath: string, outputPath: string, options?: string[]): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      spawn('ebook-convert', [inputPath, outputPath].concat(options || []), {
        stdio: ['pipe', process.stdout, process.stderr],
      })
        .on('close', resolve)
        .on('error', reject)
    })
  }
}
