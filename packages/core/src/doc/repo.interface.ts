import { DocContent } from './doc-content'
import { FormatInterface } from './format.interface'

export interface GetDocContentOptions {
  readonly ref: string
  readonly docPath: string
  readonly formats: FormatInterface[]
}

export interface RepoInfo {
  readonly owner: string
  readonly repo: string
  readonly defaultBranch: string
  readonly description?: string
  readonly homePage?: string
  readonly license?: string
}

export interface RepoInterface {
  readonly info: RepoInfo
  getCommitRef (ref?: string): Promise<string | undefined>
  getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined>
}
