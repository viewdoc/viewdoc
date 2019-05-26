import cheerio from 'cheerio'
import isRelativeUrl from 'is-relative-url'
import jsYaml from 'js-yaml'
import url from 'url'
import urlJoin from 'url-join'
import { DocContent, RepoInfo } from '../doc'
import { FormatInterface } from '../format'
import { SiteConfig } from '../site-config'
import { GetDocContentOptions } from './repo-interface'

export interface CreateDocContentOptions {
  readonly options: GetDocContentOptions
  readonly info: RepoInfo
  readonly resolvedPath: string
  readonly format: FormatInterface
  readonly content: string
}

export class SourceHelper {
  decodeBase64 (data: string): string {
    return Buffer.from(data, 'base64').toString()
  }

  async createDocContent (createDocContentOptions: CreateDocContentOptions): Promise<DocContent> {
    const { options, info, resolvedPath, format, content } = createDocContentOptions
    const { originalRepoId, siteConfig } = options
    const { toc, output } = await format.getHtmlContent(content)
    const body = this.transformHtml(output, info, originalRepoId, resolvedPath)
    return {
      info,
      resolvedPath,
      toc,
      body,
      siteConfig,
    }
  }

  parseSiteConfig (siteConfigContent: string): SiteConfig {
    return jsYaml.safeLoad(siteConfigContent)
  }

  private transformHtml (html: string, info: RepoInfo, originalRepoId: string, resolvedPath: string): string {
    const query: CheerioStatic = cheerio.load(html)
    const currentUrl = urlJoin('/', info.owner, originalRepoId, resolvedPath)
    query('a').each((index, element) => {
      const anchor = query(element)
      const originalUrl = anchor.attr('href')
      if (isRelativeUrl(originalUrl) && !originalUrl.startsWith('#')) {
        const resolvedUrl = originalUrl.startsWith('/')
          ? urlJoin('/', info.owner, originalRepoId, originalUrl)
          : url.resolve(currentUrl, originalUrl || './')
        anchor.attr('href', resolvedUrl)
      }
    })
    return query.html()
  }
}
