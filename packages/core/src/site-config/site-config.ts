import { BaseThemeName, Theme } from '@viewdoc/tiny.css'

export interface ThemeConfig {
  readonly base: BaseThemeName
  readonly options?: Theme
}

export interface SiteConfig {
  readonly title?: string
  readonly theme?: ThemeConfig
}
