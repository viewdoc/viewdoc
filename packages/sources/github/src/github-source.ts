import Octokit, { ReposGetParams, ReposGetResponse } from '@octokit/rest'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { GetRepoOptions, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubRepo } from './github-repo'

export interface GithubSourceOptions {
  readonly accessToken: string
  readonly cache: CacheInterface
}

export class GithubSource implements SourceInterface {
  readonly id: string = 'github'

  private readonly octokit: Octokit
  private readonly requestCache: CacheInterface

  constructor (githubSourceOptions: GithubSourceOptions) {
    const { accessToken, cache } = githubSourceOptions
    this.octokit = new Octokit({ auth: accessToken })
    this.requestCache = cache
  }

  async getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined> {
    const { owner, repo } = getRepoOptions
    const reposGet: ReposGetResponse | undefined = await this.getRepoResponse({ owner, repo })
    if (!reposGet) {
      return
    }
    return new GithubRepo({ octokit: this.octokit, requestCache: this.requestCache, owner, repo, reposGet })
  }

  private getRepoResponse (params: ReposGetParams): Promise<ReposGetResponse | undefined> {
    return this.requestCache.getValue(
      `github/repos/${params.owner}/${params.repo}`,
      async () => {
        try {
          return (await this.octokit.repos.get(params)).data
        } catch (err) {
          if (err.status === 404) {
            return
          }
          throw err
        }
      },
      { minutes: 5 },
    )
  }
}
