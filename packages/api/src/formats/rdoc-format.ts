import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class RdocFormat implements FormatInterface {
  readonly id: string = 'rdoc'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.rdoc']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (rdocContent: string): Promise<string> {
    return this.markupService.convertToHtml(rdocContent, this.id)
  }
}
