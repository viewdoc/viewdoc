export enum ExportFormat {
  'epub',
  'mobi',
  'pdf',
}

export interface ExportInputParams {
  readonly html: string
  readonly format: ExportFormat
}
