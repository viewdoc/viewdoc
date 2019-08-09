import { DocPageParams } from './doc-page-params'
import { ExportFormat } from './export-input-params'

export interface ExportParams {
  readonly docPageParams: DocPageParams
  readonly format: ExportFormat
}
