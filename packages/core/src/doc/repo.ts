import { DocContent } from './doc-content'
import { DocFormat } from './doc-format'

export interface GetDocContentOptions {
  readonly ref: string
  readonly docPath: string
  readonly formats: DocFormat[]
}

export interface Repo {
  readonly name: string
  readonly ownerName: string
  readonly defaultBranch: string
  readonly description?: string
  readonly homePage?: string
  readonly license?: string
  getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined>
}
