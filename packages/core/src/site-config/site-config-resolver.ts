import { createTheme } from '@viewdoc/tiny.css'
import { RepoInfo } from '../doc'
import { SiteConfig } from './site-config'

export class SiteConfigResolver {
  getTitle (info: RepoInfo, siteConfig?: SiteConfig) {
    return (
      (siteConfig && siteConfig.title) || `${info.owner}/${info.repo}${info.description ? `: ${info.description}` : ''}`
    )
  }

  getTheme (siteConfig?: SiteConfig) {
    const base = (siteConfig && siteConfig.theme && siteConfig.theme.base) || 'light'
    const options = siteConfig && siteConfig.theme && siteConfig.theme.options
    return createTheme(base, options)
  }
}
