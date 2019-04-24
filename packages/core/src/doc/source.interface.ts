import { RepoInterface } from './repo.interface'

export interface GetRepoOptions {
  readonly ownerName: string
  readonly repoName: string
}

export interface SourceInterface {
  readonly id: string
  getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined>
}
