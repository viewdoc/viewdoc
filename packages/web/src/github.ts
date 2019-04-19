import Octokit, { ReposGetReadmeParams, ReposGetResponse } from '@octokit/rest'
import config from 'config'

interface GithubConfig {
  accessToken: string
}

const githubConfig: GithubConfig = config.get<GithubConfig>('github')

const octokit = new Octokit({
  auth: githubConfig.accessToken,
})

export interface RepoInfo {
  owner: string
  repo: string
  description?: string
  homePage?: string
  stargazers: number
  license: string
  defaultBranch: string
}

export const getRepoInfo = async (owner: string, repo: string): Promise<RepoInfo> => {
  const reposGet: ReposGetResponse = (await octokit.repos.get({ owner, repo })).data
  return {
    owner,
    repo,
    description: reposGet.description,
    homePage: reposGet.homepage,
    stargazers: reposGet.stargazers_count,
    license: reposGet.license.key,
    defaultBranch: reposGet.default_branch,
  }
}

export const getRepoReadme = async (repoInfo: RepoInfo, ref: string): Promise<string> => {
  const { owner, repo } = repoInfo
  const params: ReposGetReadmeParams = { owner, repo, ref }
  const paramsWithMediaType: ReposGetReadmeParams = {
    ...params,
    mediaType: {
      format: 'html',
    },
  } as ReposGetReadmeParams
  const reposGetReadme = (await octokit.repos.getReadme(paramsWithMediaType)).data
  return (reposGetReadme as unknown) as string
}
