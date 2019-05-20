import { FormatInterface, HtmlContent } from '@viewdoc/core/lib/format'
import axios, { AxiosInstance } from 'axios'
import { MarkupServiceConfig } from './config'

export class MarkupService {
  private readonly client: AxiosInstance

  constructor (markupServiceConfig: MarkupServiceConfig) {
    const { baseUrl } = markupServiceConfig
    this.client = axios.create({ baseURL: baseUrl })
  }

  createFormat (id: string, extensions: string[]): FormatInterface {
    return {
      id,
      extensions,
      getHtmlContent: async (rawContent: string): Promise<HtmlContent> => {
        return (await this.client.post<HtmlContent>(id, rawContent)).data
      },
    }
  }
}
