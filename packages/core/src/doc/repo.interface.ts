import { DocContent } from './doc-content'
import { FormatInterface } from './format.interface'

export interface GetDocContentOptions {
  readonly ref: string
  readonly docPath: string
  readonly formats: FormatInterface[]
}

export interface RepoInterface {
  readonly name: string
  readonly ownerName: string
  readonly defaultBranch: string
  readonly description?: string
  readonly homePage?: string
  readonly license?: string
  getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined>
}
