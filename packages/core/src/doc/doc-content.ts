import { SiteConfig } from '../site-config'
import { RepoInfo } from './repo-info'

export interface DocContent {
  readonly info: RepoInfo
  readonly name: string
  readonly path: string
  readonly body: string
  readonly siteConfig?: SiteConfig
}
