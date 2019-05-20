import { RepoInterface } from './repo-interface'

export interface GetRepoOptions {
  readonly owner: string
  readonly repo: string
}

export interface SourceInterface {
  readonly id: string
  getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined>
}
