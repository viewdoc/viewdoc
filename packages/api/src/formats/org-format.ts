import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class OrgFormat implements FormatInterface {
  readonly id: string = 'org'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.org']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (orgContent: string): Promise<string> {
    return this.markupService.convertToHtml(orgContent, this.id)
  }
}
