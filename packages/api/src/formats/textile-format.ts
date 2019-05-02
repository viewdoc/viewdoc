import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class TextileFormat implements FormatInterface {
  readonly id: string = 'textile'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.textile']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (textileContent: string): Promise<string> {
    return this.markupService.convertToHtml(textileContent, this.id)
  }
}
