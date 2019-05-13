import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, DocPageParams, FormatInterface, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { SiteConfig } from '@viewdoc/core/lib/doc/site-config'
import { GithubSource } from '@viewdoc/github'
import { DateTime } from 'luxon'
import { ApiConfig } from './config'
import {
  AsciidocFormat,
  CreoleFormat,
  MarkdownFormat,
  MarkupService,
  MediawikiFormat,
  OrgFormat,
  PodFormat,
  RdocFormat,
  RstFormat,
  TextileFormat,
} from './formats'

export class ViewDocApi {
  private ready: boolean = false
  private readonly sources: SourceInterface[] = []
  private readonly formats: FormatInterface[] = []

  constructor (private readonly config: ApiConfig) {}

  async getDocContent (docPageParams: DocPageParams, sourceId: string): Promise<DocContent | undefined> {
    await this.ensureReady()
    const source: SourceInterface | undefined = this.sources.find((sourceToCheck) => sourceToCheck.id === sourceId)
    if (!source) {
      return
    }
    const { owner, repoId, docPath } = docPageParams
    const repoIdsParts = repoId.split('@')
    const repo: RepoInterface | undefined = await source.getRepo({ owner, repo: repoIdsParts[0] })
    if (!repo) {
      return
    }
    const ref: string | undefined = await repo.getCommitRef(repoIdsParts[1])
    if (!ref) {
      return
    }
    const siteConfig: SiteConfig | undefined = await repo.getSiteConfig(ref, '.viewdoc-config')
    const docContent: DocContent | undefined = await repo.getDocContent({
      ref,
      docPath,
      formats: this.formats,
      siteConfig,
    })
    return docContent
  }

  private async ensureReady (): Promise<void> {
    if (this.ready) {
      return
    }
    const cache: CacheInterface = new FileBasedCache({
      ...this.config.cache,
      getDirName (expiredAt: DateTime): string {
        return expiredAt.toFormat('yyyyMMdd-HH')
      },
      cleanDirEvery: { hours: 1 },
    })
    await cache.start()
    const markupService: MarkupService = new MarkupService(this.config.markupService)
    this.sources.push(new GithubSource({ ...this.config.github, cache }))
    this.formats.push(
      new AsciidocFormat(markupService),
      new CreoleFormat(markupService),
      new MarkdownFormat(markupService),
      new MediawikiFormat(markupService),
      new OrgFormat(markupService),
      new PodFormat(markupService),
      new RdocFormat(markupService),
      new RstFormat(markupService),
      new TextileFormat(markupService),
    )
    this.ready = true
  }
}
