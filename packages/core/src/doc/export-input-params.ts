import { SiteConfig } from '../site-config'

export enum ExportFormat {
  'epub',
  'mobi',
  'pdf',
}

export interface ExportInputParams {
  readonly siteConfig?: SiteConfig
  readonly html: string
  readonly format: ExportFormat
}
