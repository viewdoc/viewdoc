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

interface ProcessedHtmlContent {
  readonly body: string
  readonly toc: string
}

interface HeadingElement {
  readonly order: number
  readonly url: string
  readonly text: string
}

export class SourceHelper {
  decodeBase64 (data: string): string {
    return Buffer.from(data, 'base64').toString()
  }

  async createDocContent (createDocContentOptions: CreateDocContentOptions): Promise<DocContent> {
    const { options, info, resolvedPath, format, content } = createDocContentOptions
    const { originalRepoId, siteConfig } = options
    const { output } = await format.getHtmlContent(content)
    const { body, toc } = this.transformHtml(output, info, originalRepoId, resolvedPath)
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

  private transformHtml (
    html: string,
    info: RepoInfo,
    originalRepoId: string,
    resolvedPath: string,
  ): ProcessedHtmlContent {
    const query: CheerioStatic = cheerio.load(html, { xmlMode: true })
    const currentUrl = urlJoin('/', info.owner, originalRepoId, resolvedPath)
    // Fix internal urls
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
    // Create table of contents
    const headings: HeadingElement[] = []
    query('h2,h3,h4').each((index, element) => {
      const heading = query(element)
      const text = heading
        .clone()
        .children()
        .remove()
        .end()
        .text()
        .replace(/^\s+|\s+$/g, '')
      headings.push({
        order: +element.name[1] - 1,
        url: heading.find('a').attr('href'),
        text,
      })
    })
    const toc = headings
      .map((heading) => {
        return `<div style="margin-left: ${heading.order * 15}px"><a href='${heading.url}'>${heading.text}</a></div>`
      })
      .join('')
    return {
      body: query.html(),
      toc,
    }
  }
}
