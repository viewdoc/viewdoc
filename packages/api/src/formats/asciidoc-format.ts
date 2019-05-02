import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class AsciidocFormat implements FormatInterface {
  readonly id: string = 'asciidoc'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.asc', '.adoc', '.asciidoc']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (asciidocContent: string): Promise<string> {
    return this.markupService.convertToHtml(asciidocContent, this.id)
  }
}
