import { SiteConfig } from '../site-config'
import { DocContent } from './doc-content'
import { FormatInterface } from './format.interface'
import { RepoInfo } from './repo-info'

export interface GetDocContentOptions {
  readonly ref: string
  readonly docPath: string
  readonly formats: FormatInterface[]
  readonly siteConfig?: SiteConfig
}

export interface RepoInterface {
  readonly info: RepoInfo
  getCommitRef (ref?: string): Promise<string | undefined>
  getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined>
  getSiteConfig (ref: string, siteConfigPath: string): Promise<SiteConfig | undefined>
}
