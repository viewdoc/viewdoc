import { FormatInterface, HtmlContent } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class SimpleFormat implements FormatInterface {
  constructor (readonly id: string, readonly extensions: string[], private readonly markupService: MarkupService) {}

  getHtmlContent (rawContent: string): Promise<HtmlContent> {
    return this.markupService.convertToHtml(rawContent, this.id)
  }
}
