import { Repo } from './repo'

export interface GetRepoOptions {
  readonly ownerName: string
  readonly repoName: string
}

export interface GitSource {
  readonly id: string
  getRepo (getRepoOptions: GetRepoOptions): Promise<Repo | undefined>
}
