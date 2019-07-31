import bodyParser from 'body-parser'
import spawn from 'cross-spawn'
import crypto from 'crypto'
import express, { Application, Request, Response } from 'express'
import { createReadStream, ensureDirSync, removeSync, writeFileSync } from 'fs-extra'
import path from 'path'

interface InputParams {
  readonly html: string
}

export class App {
  public app: Application

  constructor () {
    this.app = express()
    this.config()
  }

  private config (): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: false }))
    this.app.post('/', (req, res) => this.process(req, res))
  }

  private async process (req: Request, res: Response) {
    const inputParams: InputParams = req.body
    const id = crypto.randomBytes(16).toString('hex')
    const basePath = path.join(__dirname, `../../../tmp/exporter/${id}`)
    const inputPath = path.join(basePath, 'input.html')
    const outputPath = path.join(basePath, 'output.mobi')
    ensureDirSync(basePath)
    writeFileSync(inputPath, inputParams.html)
    const error = await this.convert(inputPath, outputPath)
    if (!error) {
      const output = createReadStream(outputPath, { encoding: 'base64' })
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
