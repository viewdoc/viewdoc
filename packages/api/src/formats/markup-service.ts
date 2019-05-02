import axios, { AxiosInstance } from 'axios'
import { MarkupServiceConfig } from '../config'

export class MarkupService {
  private readonly client: AxiosInstance

  constructor (markupServiceConfig: MarkupServiceConfig) {
    const { baseUrl } = markupServiceConfig
    this.client = axios.create({ baseURL: baseUrl })
  }

  async convertToHtml (content: string, formatId: string): Promise<string> {
    return (await this.client.post<string>(formatId, content)).data
  }
}
