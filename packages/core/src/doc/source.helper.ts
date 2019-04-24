import path from 'path'
import { DocContent } from './doc-content'
import { FormatInterface } from './format.interface'

export interface CreateDocContentOptions {
  readonly name: string
  readonly path: string
  readonly format: FormatInterface
  readonly content: string
}

export class SourceHelper {
  decodeBase64 (data: string): string {
    return Buffer.from(data, 'base64').toString()
  }

  findFormat (formats: FormatInterface[], fileName: string): FormatInterface | undefined {
    const extName = path.extname(fileName).toLowerCase()
    return formats.find(({ extensions }) => extensions.includes(extName))
  }

  async createDocContent (createDocContentOptions: CreateDocContentOptions): Promise<DocContent> {
    const { name, format, content } = createDocContentOptions
    const body = await format.getHtmlContent(content)
    return {
      name,
      path: createDocContentOptions.path,
      stylesheets: [
        'https://rawcdn.githack.com/mblode/marx/49921073cbb2e01d50a9cc66164c5e5cc0abec97/css/marx.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/themes/prism.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/toolbar/prism-toolbar.min.css',
      ],
      scripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/prism.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/toolbar/prism-toolbar.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js',
      ],
      body: `<main>${body}</main>`,
    }
  }
}
