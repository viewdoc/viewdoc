import { AsciidocFormat } from '@viewdoc/asciidoc'
import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, DocPageParams, FormatInterface, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubSource } from '@viewdoc/github'
import { MarkdownFormat } from '@viewdoc/markdown'
import { DateTime } from 'luxon'
import { ApiConfig } from './config'

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
    const docContent: DocContent | undefined = await repo.getDocContent({ ref, docPath, formats: this.formats })
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
    this.sources.push(new GithubSource({ ...this.config.github, cache }))
    this.formats.push(new MarkdownFormat(), new AsciidocFormat())
    this.ready = true
  }
}
