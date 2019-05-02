import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class MarkdownFormat implements FormatInterface {
  readonly id: string = 'markdown'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.md', '.mkdn', '.mdown', '.markdown']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (markdownContent: string): Promise<string> {
    return this.markupService.convertToHtml(markdownContent, this.id)
  }
}
