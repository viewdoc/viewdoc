import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class MediawikiFormat implements FormatInterface {
  readonly id: string = 'mediawiki'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.wiki', '.mediawiki']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (mediawikiContent: string): Promise<string> {
    return this.markupService.convertToHtml(mediawikiContent, this.id)
  }
}
