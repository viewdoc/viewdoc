import path from 'path'
import { DocContent } from './doc-content'
import { FormatInterface } from './format.interface'
import { RepoInfo } from './repo-info'

export interface CreateDocContentOptions {
  readonly info: RepoInfo
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
    const { info, name, format, content } = createDocContentOptions
    const body = await format.getHtmlContent(content)
    return {
      info,
      name,
      path: createDocContentOptions.path,
      body: `<main>${body}</main>`,
    }
  }
}
