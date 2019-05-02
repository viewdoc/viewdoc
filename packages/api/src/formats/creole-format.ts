import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class CreoleFormat implements FormatInterface {
  readonly id: string = 'creole'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.creole']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (creoleContent: string): Promise<string> {
    return this.markupService.convertToHtml(creoleContent, this.id)
  }
}
