import { ExportInputParams } from '@viewdoc/core/lib/doc'
import axios, { AxiosInstance } from 'axios'
import { Readable } from 'stream'
import { ExporterServiceConfig } from './config'

export class ExporterService {
  private readonly client: AxiosInstance

  constructor (exporterServiceConfig: ExporterServiceConfig) {
    const { baseUrl } = exporterServiceConfig
    this.client = axios.create({ baseURL: baseUrl, responseType: 'stream' })
  }

  async process (exportInputParams: ExportInputParams): Promise<Readable> {
    return (await this.client.post<Readable>('/', exportInputParams)).data
  }
}
