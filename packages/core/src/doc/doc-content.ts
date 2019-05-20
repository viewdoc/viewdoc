import { SiteConfig } from '../site-config'
import { RepoInfo } from './repo-info'

export interface DocContent {
  readonly info: RepoInfo
  readonly name: string
  readonly docPath: string
  readonly toc: string
  readonly body: string
  readonly siteConfig?: SiteConfig
}
