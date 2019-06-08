import { CacheInterface } from '@viewdoc/core/lib/cache'
import { Commits, Gitlab, Projects, Repositories, RepositoryFiles } from 'gitlab'

export interface GitlabApiOptions {
  readonly accessToken: string
  readonly cache: CacheInterface
}

export interface ReposGetParams {
  projectId: string
}

export interface ReposGetResponse {
  description: string
  readme_url: string
  default_branch: string
}

export interface ReposGetCommitParams {
  projectId: string
  ref: string
}

export interface ReposGetCommitResponse {
  id: string
}

export interface ReposGetContentsParams {
  projectId: string
  ref: string
  path: string
}

interface GitlabFileContentResponse {
  file_name: string
  file_path: string
  content: string
}

export interface GitlabFileResponse {
  name: string
  path: string
  content?: string
}

export interface GitlabInterface {
  Projects: Projects
  Commits: Commits
  RepositoryFiles: RepositoryFiles
  Repositories: Repositories
}

export class GitlabApi {
  private readonly gitlab: GitlabInterface
  private readonly requestCache: CacheInterface

  constructor (gitlabApiOptions: GitlabApiOptions) {
    const { accessToken, cache } = gitlabApiOptions
    this.gitlab = new Gitlab({ token: accessToken })
    this.requestCache = cache
  }

  getRepoResponse (params: ReposGetParams): Promise<ReposGetResponse | undefined> {
    return this.requestCache.getValue(
      `gitlab/repos/${params.projectId}`,
      () => this.requestWithNotFound(this.gitlab.Projects.show(params.projectId)),
      { minutes: 5 },
    )
  }

  getReposGetCommitResponse (params: ReposGetCommitParams): Promise<ReposGetCommitResponse | undefined> {
    return this.requestCache.getValue(
      `gitlab/reposCommit/${params.projectId}/${params.ref}`,
      () => this.requestWithNotFound(this.gitlab.Commits.show(params.projectId, params.ref)),
      { minutes: 1 },
    )
  }

  async getFileResponse (params: ReposGetContentsParams): Promise<GitlabFileResponse | undefined> {
    const fileResponse: GitlabFileContentResponse | undefined = await this.requestCache.getValue(
      `gitlab/reposFile/${params.projectId}/${params.ref}:${params.path}`,
      () => this.requestWithNotFound(this.gitlab.RepositoryFiles.show(params.projectId, params.path, params.ref)),
      { hours: 6 },
    )
    if (!fileResponse) {
      return
    }
    return {
      name: fileResponse.file_name,
      path: fileResponse.file_path,
      content: fileResponse.content,
    }
  }

  getTreeResponse (params: ReposGetContentsParams): Promise<GitlabFileResponse[] | undefined> {
    return this.requestCache.getValue(
      `gitlab/reposTree/${params.projectId}/${params.ref}:${params.path}`,
      () =>
        this.requestWithNotFound(
          this.gitlab.Repositories.tree(params.projectId, { path: params.path, ref: params.ref }),
        ),
      { hours: 6 },
    )
  }

  private async requestWithNotFound<T> (request: Promise<T>): Promise<T | undefined> {
    try {
      return await request
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return
      }
      throw err
    }
  }
}
