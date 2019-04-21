import Octokit, { ReposGetReadmeResponse, ReposGetResponse } from '@octokit/rest'
import cheerio from 'cheerio'
import config from 'config'
import isRelativeUrl from 'is-relative-url'
import marked from 'marked'
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
    const image = select(element)
    const url = image.attr('src')
    if (url && isRelativeUrl(url)) {
      image.attr('src', joinUrl('https://raw.githack.com', repoInfo.owner, repoInfo.repo, ref, url))
    }
  })
  select('a').each((index, element) => {
    const anchor = select(element)
    const url = anchor.attr('href')
    if (url && isRelativeUrl(url)) {
      anchor.attr('href', joinUrl(repoInfo.repo, url))
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

const decodeFileContent = (content: string): string => {
  return Buffer.from(content, 'base64').toString()
}

export const getRepoReadme = async (repoInfo: RepoInfo, ref: string): Promise<MarkupFile> => {
  const { owner, repo } = repoInfo
  const reposGetReadme: ReposGetReadmeResponse = (await octokit.repos.getReadme({ owner, repo, ref })).data
  return {
    path: reposGetReadme.path,
    htmlContent: markdownToHtml(decodeFileContent(reposGetReadme.content), repoInfo, ref),
  }
}

interface GithubFileResponse {
  name: string
  path: string
  content: string
}

type ReposGetContentsResponse = GithubFileResponse | GithubFileResponse[]

export const getRepoFile = async (
  repoInfo: RepoInfo,
  ref: string,
  filePath: string,
): Promise<MarkupFile | undefined> => {
  const { owner, repo } = repoInfo
  const content: ReposGetContentsResponse = (await octokit.repos.getContents({ owner, repo, ref, path: filePath })).data
  if (Array.isArray(content)) {
    // Directory
    const dirContent = content
    const indexFile = dirContent.find((subFile) => subFile.name.toLowerCase() === 'readme.md')
    if (indexFile) {
      return getRepoFile(repoInfo, ref, indexFile.path)
    }
    return
  }
  // File
  const fileContent = content
  if (fileContent.path.toLowerCase().indexOf('.md') !== -1) {
    return {
      path: fileContent.path,
      htmlContent: markdownToHtml(decodeFileContent(fileContent.content), repoInfo, ref),
    }
  }
  return
}
