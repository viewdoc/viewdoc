import Octokit, {
  ReposGetCommitParams,
  ReposGetCommitResponse,
  ReposGetContentsParams,
  ReposGetParams,
  ReposGetReadmeParams,
  ReposGetReadmeResponse,
  ReposGetResponse,
  Response,
} from '@octokit/rest'
import { CacheInterface } from '@viewdoc/core/lib/cache'

export { ReposGetResponse, ReposGetCommitResponse, ReposGetReadmeResponse }

export interface GithubApiOptions {
  readonly accessToken: string
  readonly cache: CacheInterface
}

export interface GithubFileResponse {
  name: string
  path: string
  content?: string
}

export type ReposGetContentsResponse = GithubFileResponse | GithubFileResponse[]

export class GithubApi {
  private readonly octokit: Octokit
  private readonly requestCache: CacheInterface

  constructor (githubApiOptions: GithubApiOptions) {
    const { accessToken, cache } = githubApiOptions
    this.octokit = new Octokit({ auth: accessToken })
    this.requestCache = cache
  }

  getRepoResponse (params: ReposGetParams): Promise<ReposGetResponse | undefined> {
    return this.requestCache.getValue(
      `github/repos/${params.owner}/${params.repo}`,
      () => this.requestWithNotFound(this.octokit.repos.get(params)),
      { minutes: 5 },
    )
  }

  getReposGetCommitResponse (params: ReposGetCommitParams): Promise<ReposGetCommitResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposCommit/${params.owner}/${params.repo}/${params.commit_sha}`,
      () => this.requestWithNotFound(this.octokit.repos.getCommit(params)),
      { minutes: 1 },
    )
  }

  getReadmeResponse (params: ReposGetReadmeParams): Promise<ReposGetReadmeResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposReadme/${params.owner}/${params.repo}/${params.ref}`,
      () => this.requestWithNotFound(this.octokit.repos.getReadme(params)),
      { hours: 6 },
    )
  }

  getContentsReponse (params: ReposGetContentsParams): Promise<ReposGetContentsResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposContents/${params.owner}/${params.repo}/${params.ref}:${params.path}`,
      () => this.requestWithNotFound(this.octokit.repos.getContents(params)),
      { hours: 6 },
    )
  }

  private async requestWithNotFound<T> (request: Promise<Response<T>>): Promise<T | undefined> {
    try {
      return (await request).data
    } catch (err) {
      if (err.status === 404) {
        return
      }
      throw err
    }
  }
}
