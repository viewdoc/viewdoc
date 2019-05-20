import jsYaml from 'js-yaml'
import { DocContent, RepoInfo } from '../doc'
import { FormatInterface } from '../format'
import { SiteConfig } from '../site-config'

export interface CreateDocContentOptions {
  readonly info: RepoInfo
  readonly name: string
  readonly docPath: string
  readonly format: FormatInterface
  readonly content: string
  readonly siteConfig?: SiteConfig
}

export class SourceHelper {
  decodeBase64 (data: string): string {
    return Buffer.from(data, 'base64').toString()
  }

  async createDocContent (createDocContentOptions: CreateDocContentOptions): Promise<DocContent> {
    const { info, name, docPath, format, content, siteConfig } = createDocContentOptions
    const { toc, output: body } = await format.getHtmlContent(content)
    return {
      info,
      name,
      docPath,
      toc,
      body,
      siteConfig,
    }
  }

  parseSiteConfig (siteConfigContent: string): SiteConfig {
    return jsYaml.safeLoad(siteConfigContent)
  }
}
