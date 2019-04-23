import { DocFormat } from '@viewdoc/core/lib/doc'
import marked from 'marked'

export class MarkdownFormat implements DocFormat {
  readonly id: string = 'markdown'

  // https://github.com/github/markup#markups
  readonly extensions: string[] = ['.md', '.mkdn', '.mdown', '.markdown']

  async getHtmlContent (markdownContent: string): Promise<string> {
    return marked(markdownContent, { gfm: true, mangle: false })
  }
}
