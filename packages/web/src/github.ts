import Octokit, { ReposGetResponse, ReposGetReadmeResponse } from '@octokit/rest'
import config from 'config'
import marked from 'marked'

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

const markdownToHtml = (markdown: string): string => {
  return marked(markdown)
}

export interface MarkupFile {
  path: string
  htmlContent: string
}

export const getRepoReadme = async (repoInfo: RepoInfo, ref: string): Promise<MarkupFile> => {
  const { owner, repo } = repoInfo
  const reposGetReadme: ReposGetReadmeResponse = (await octokit.repos.getReadme({ owner, repo, ref })).data
  return {
    path: reposGetReadme.path,
    htmlContent: markdownToHtml(Buffer.from(reposGetReadme.content, 'base64').toString()),
  }
}
