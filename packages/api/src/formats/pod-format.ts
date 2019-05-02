import { FormatInterface } from '@viewdoc/core/lib/doc'
import { MarkupService } from './markup-service'

export class PodFormat implements FormatInterface {
  readonly id: string = 'pod'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.pod']

  constructor (private readonly markupService: MarkupService) {}

  getHtmlContent (podContent: string): Promise<string> {
    return this.markupService.convertToHtml(podContent, this.id)
  }
}
