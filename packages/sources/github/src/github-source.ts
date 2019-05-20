import { GetRepoOptions, RepoInterface, SourceInterface } from '@viewdoc/core/lib/source'
import { GithubApi, ReposGetResponse } from './github-api'
import { GithubRepo } from './github-repo'

export class GithubSource implements SourceInterface {
  readonly id: string = 'github'

  constructor (private readonly githubApi: GithubApi) {}

  async getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined> {
    const { owner, repo } = getRepoOptions
    const reposGet: ReposGetResponse | undefined = await this.githubApi.getRepoResponse({ owner, repo })
    if (!reposGet) {
      return
    }
    return new GithubRepo({ githubApi: this.githubApi, owner, repo, reposGet })
  }
}
