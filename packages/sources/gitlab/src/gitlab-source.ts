import { GetRepoOptions, RepoInterface, SourceInterface } from '@viewdoc/core/lib/source'
import { GitlabApi, ReposGetResponse } from './gitlab-api'
import { GitlabRepo } from './gitlab-repo'

export class GitlabSource implements SourceInterface {
  readonly id: string = 'gitlab'
  readonly subdomains: string[] = ['gl', 'gitlab']

  constructor (private readonly gitlabApi: GitlabApi) {}

  async getRepo (getRepoOptions: GetRepoOptions): Promise<RepoInterface | undefined> {
    const { owner, repo } = getRepoOptions
    const projectId = `${owner}/${repo}`
    const reposGet: ReposGetResponse | undefined = await this.gitlabApi.getRepoResponse({ projectId })
    if (!reposGet) {
      return
    }
    return new GitlabRepo({ gitlabApi: this.gitlabApi, projectId, owner, repo, reposGet })
  }
}
