import Octokit, { ReposGetParams, ReposGetResponse } from '@octokit/rest'
import { GetRepoOptions, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubRepo } from './github-repo'

export interface GithubSourceOptions {
  readonly accessToken: string
}

export class GithubSource implements SourceInterface {
  readonly id: string = 'github'

  private readonly octokit: Octokit

  constructor (options: GithubSourceOptions) {
    this.octokit = new Octokit({ auth: options.accessToken })
  }

  async getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined> {
    const { ownerName, repoName } = getRepoOptions
    const reposGet: ReposGetResponse | undefined = await this.getRepoResponse({ owner: ownerName, repo: repoName })
    if (!reposGet) {
      return
    }
    return new GithubRepo({ octokit: this.octokit, ownerName, repoName, reposGet })
  }

  private async getRepoResponse (params: ReposGetParams): Promise<ReposGetResponse | undefined> {
    try {
      return (await this.octokit.repos.get(params)).data
    } catch (err) {
      if (err.status === 404) {
        return
      }
      throw err
    }
  }
}
