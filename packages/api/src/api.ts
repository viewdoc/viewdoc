import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, DocPageParams } from '@viewdoc/core/lib/doc'
import { FormatInterface, FormatManager } from '@viewdoc/core/lib/format'
import { SiteConfig, SiteConfigResolver } from '@viewdoc/core/lib/site-config'
import { RepoInterface, SourceInterface, SourceManager } from '@viewdoc/core/lib/source'
import { GithubApi, GithubSource } from '@viewdoc/github'
import { GitlabApi, GitlabSource } from '@viewdoc/gitlab'
import { DateTime } from 'luxon'
import path from 'path'
import { ApiConfig } from './config'
import { MarkupService } from './markup-service'

export class ViewDocApi {
  private ready: boolean = false
  // These fields will be initialized in ensureReady.
  private sourceManager!: SourceManager
  private formatManager!: FormatManager

  constructor (private readonly config: ApiConfig) {}

  async getDocContent (docPageParams: DocPageParams, subdomain: string): Promise<DocContent | undefined> {
    await this.ensureReady()
    const { owner, repoId, path: docPath } = docPageParams
    const repoIdsParts = repoId.split('@')
    const repo: RepoInterface | undefined = await this.getRepo(subdomain, owner, repoIdsParts[0])
    if (!repo) {
      return
    }
    return this.getDocContentFromRepo(repo, docPath, repoId, repoIdsParts[1])
  }

  private async getRepo (subdomain: string, owner: string, repo: string): Promise<RepoInterface | undefined> {
    const source: SourceInterface | undefined = this.sourceManager.findBySubdomain(subdomain)
    if (!source) {
      return
    }
    return source.getRepo({ owner, repo })
  }

  private async getDocContentFromRepo (
    repo: RepoInterface,
    docPath: string,
    originalRepoId: string,
    originalRef?: string,
  ): Promise<DocContent | undefined> {
    // Use commitRef instead of originalRef for correct caching
    const commitRef: string | undefined = await repo.getCommitRef(originalRef)
    if (!commitRef) {
      return
    }
    const siteConfig: SiteConfig | undefined = await repo.getSiteConfig(commitRef, '.viewdoc-config')
    const siteConfigResolver = new SiteConfigResolver()
    return repo.getDocContent({
      originalPath: path.join(siteConfigResolver.getRootPath(siteConfig), docPath),
      originalRepoId,
      originalRef,
      commitRef,
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
    return [
      new GithubSource(new GithubApi({ ...this.config.github, cache })),
      new GitlabSource(new GitlabApi({ ...this.config.gitlab, cache })),
    ]
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
