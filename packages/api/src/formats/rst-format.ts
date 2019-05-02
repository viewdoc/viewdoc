import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class RstFormat implements FormatInterface {
  readonly id: string = 'rst'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.rst']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (rstContent: string): Promise<string> {
    return this.markupService.convertToHtml(rstContent, this.id)
  }
}
