import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, DocPageParams } from '@viewdoc/core/lib/doc'
import { FormatInterface, FormatManager } from '@viewdoc/core/lib/format'
import { SiteConfig } from '@viewdoc/core/lib/site-config'
import { RepoInterface, SourceInterface, SourceManager } from '@viewdoc/core/lib/source'
import { GithubApi, GithubSource } from '@viewdoc/github'
import { DateTime } from 'luxon'
import { ApiConfig } from './config'
import { MarkupService } from './markup-service'

export class ViewDocApi {
  private ready: boolean = false
  // These fields will be initialized in ensureReady.
  private sourceManager!: SourceManager
  private formatManager!: FormatManager

  constructor (private readonly config: ApiConfig) {}

  async getDocContent (docPageParams: DocPageParams, sourceId: string): Promise<DocContent | undefined> {
    await this.ensureReady()
    const { owner, repoId, path: originalPath } = docPageParams
    const repoIdsParts = repoId.split('@')
    const repo: RepoInterface | undefined = await this.getRepo(sourceId, owner, repoIdsParts[0])
    if (!repo) {
      return
    }
    return this.getDocContentFromRepo(repo, originalPath, repoId, repoIdsParts[1])
  }

  private async getRepo (sourceId: string, owner: string, repo: string): Promise<RepoInterface | undefined> {
    const source: SourceInterface | undefined = this.sourceManager.findById(sourceId)
    if (!source) {
      return
    }
    return source.getRepo({ owner, repo })
  }

  private async getDocContentFromRepo (
    repo: RepoInterface,
    originalPath: string,
    originalRepoId: string,
    originalRef?: string,
  ): Promise<DocContent | undefined> {
    // Use commitRef instead of originalRef for correct caching
    const resolvedRef: string | undefined = await repo.getCommitRef(originalRef)
    if (!resolvedRef) {
      return
    }
    const siteConfig: SiteConfig | undefined = await repo.getSiteConfig(resolvedRef, '.viewdoc-config')
    return repo.getDocContent({
      originalPath,
      originalRepoId,
      originalRef,
      resolvedRef,
      formatManager: this.formatManager,
      siteConfig,
    })
  }

  // Should call this in all public methods
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
    this.sourceManager = new SourceManager(this.createSources(cache))
    this.formatManager = new FormatManager(this.createFormats())
    this.ready = true
  }

  private createSources (cache: CacheInterface): SourceInterface[] {
    return [new GithubSource(new GithubApi({ ...this.config.github, cache }))]
  }

  private createFormats (): FormatInterface[] {
    const markupService: MarkupService = new MarkupService(this.config.markupService)
    // https://github.com/github/markup#markups
    return [
      markupService.createFormat('markdown', ['.md', '.mkdn', '.mdown', '.markdown']),
      markupService.createFormat('asciidoc', ['.asc', '.adoc', '.asciidoc']),
      markupService.createFormat('rst', ['.rst']),
      markupService.createFormat('rdoc', ['.rdoc']),
      markupService.createFormat('mediawiki', ['.wiki', '.mediawiki']),
      markupService.createFormat('textile', ['.textile']),
      markupService.createFormat('creole', ['.creole']),
      markupService.createFormat('org', ['.org']),
      markupService.createFormat('pod', ['.pod']),
    ]
  }
}
