import { DocContent, RepoInfo } from '../doc'
import { FormatManager } from '../format'
import { SiteConfig } from '../site-config'

export interface GetDocContentOptions {
  readonly originalPath: string
  readonly originalRepoId: string
  readonly originalRef?: string
  readonly resolvedRef: string
  readonly formatManager: FormatManager
  readonly siteConfig?: SiteConfig
}

export interface RepoInterface {
  readonly info: RepoInfo
  getCommitRef (ref?: string): Promise<string | undefined>
  getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined>
  getSiteConfig (ref: string, siteConfigPath: string): Promise<SiteConfig | undefined>
}
