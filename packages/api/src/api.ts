import { AsciidocFormat } from '@viewdoc/asciidoc'
import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, FormatInterface, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubSource } from '@viewdoc/github'
import { MarkdownFormat } from '@viewdoc/markdown'
import { DateTime } from 'luxon'
import { ApiConfig } from './config'
import { DocPage } from './doc-page'

export interface GetDocPageOptions {
  owner: string
  repoId: string
  docPath: string
}

export class ViewDocApi {
  private started: boolean = false
  private readonly sources: SourceInterface[] = []
  private readonly formats: FormatInterface[] = []

  async start (config: ApiConfig): Promise<void> {
    if (this.started) {
      return
    }
    const cache: CacheInterface = new FileBasedCache({
      ...config.cache,
      getDirName (expiredAt: DateTime): string {
        return expiredAt.toFormat('yyyyMMdd-HH')
      },
      cleanDirEvery: { hours: 1 },
    })
    await cache.start()
    this.sources.push(new GithubSource({ ...config.github, cache }))
    this.formats.push(new MarkdownFormat(), new AsciidocFormat())
    this.started = true
  }

  async getDocPage (getDocPageOptions: GetDocPageOptions, sourceId: string): Promise<DocPage | undefined> {
    this.ensureStarted()
    const source: SourceInterface | undefined = this.sources.find((sourceToCheck) => sourceToCheck.id === sourceId)
    if (!source) {
      return
    }
    const { owner, repoId, docPath } = getDocPageOptions
    const repoIdsParts = repoId.split('@')
    const repo: RepoInterface | undefined = await source.getRepo({ owner, repo: repoIdsParts[0] })
    if (!repo) {
      return
    }
    const ref: string | undefined = await repo.getCommitRef(repoIdsParts[1])
    if (!ref) {
      return
    }
    const docContent: DocContent | undefined = await repo.getDocContent({ ref, docPath, formats: this.formats })
    if (!docContent) {
      return
    }
    return {
      info: repo.info,
      content: docContent,
    }
  }

  private ensureStarted (): void {
    if (!this.started) {
      throw new Error('ViewDocApi is not started')
    }
  }
}
