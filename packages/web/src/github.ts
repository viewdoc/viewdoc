import Octokit, { ReposGetResponse, ReposGetReadmeResponse } from '@octokit/rest'
import config from 'config'
import marked from 'marked'
import cheerio from 'cheerio'
import isRelativeUrl from 'is-relative-url'
import joinUrl from 'url-join'

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

type HtmlTransformer = (select: CheerioStatic, repoInfo: RepoInfo, ref: string) => void

const fixUrls = (select: CheerioStatic, repoInfo: RepoInfo, ref: string) => {
  select('img').each((index, element) => {
    const img = select(element)
    const url = img.attr('src')
    if (isRelativeUrl(url)) {
      img.attr('src', joinUrl('https://raw.githack.com', repoInfo.owner, repoInfo.repo, ref, url))
    }
  })
}

const transformHtml = (rawHtml: string, repoInfo: RepoInfo, ref: string): string => {
  const select: CheerioStatic = cheerio.load(rawHtml)
  const transformers: HtmlTransformer[] = [fixUrls]
  transformers.forEach((transformer) => transformer(select, repoInfo, ref))
  return select.html()
}

const markdownToHtml = (markdown: string, repoInfo: RepoInfo, ref: string): string => {
  return transformHtml(marked(markdown), repoInfo, ref)
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
    htmlContent: markdownToHtml(Buffer.from(reposGetReadme.content, 'base64').toString(), repoInfo, ref),
  }
}
