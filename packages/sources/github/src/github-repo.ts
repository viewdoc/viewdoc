import Octokit, {
  ReposGetCommitRefShaParams,
  ReposGetContentsParams,
  ReposGetReadmeParams,
  ReposGetReadmeResponse,
  ReposGetResponse,
} from '@octokit/rest'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import {
  DocContent,
  FormatInterface,
  GetDocContentOptions,
  RepoInfo,
  RepoInterface,
  SourceHelper,
} from '@viewdoc/core/lib/doc'
import { SiteConfig } from '@viewdoc/core/lib/site-config'
import path from 'path'

const helper = new SourceHelper()

export interface GithubRepoOptions {
  readonly octokit: Octokit
  readonly requestCache: CacheInterface
  readonly owner: string
  readonly repo: string
  readonly reposGet: ReposGetResponse
}

interface GithubFileResponse {
  name: string
  path: string
  content?: string
}

type ReposGetContentsResponse = GithubFileResponse | GithubFileResponse[]

interface ReposGetCommitRefResponse {
  sha: string
}

export class GithubRepo implements RepoInterface {
  private readonly octokit: Octokit
  private readonly requestCache: CacheInterface
  readonly info: RepoInfo

  constructor (githubRepoOptions: GithubRepoOptions) {
    const { octokit, requestCache, owner, repo, reposGet } = githubRepoOptions
    this.octokit = octokit
    this.requestCache = requestCache
    this.info = {
      owner,
      repo,
      defaultBranch: reposGet.default_branch,
      description: reposGet.description,
      homePage: reposGet.homepage,
      license: reposGet.license.key,
    }
  }

  async getCommitRef (ref?: string): Promise<string | undefined> {
    const reposGetCommitRef: ReposGetCommitRefResponse | undefined = await this.getReposGetCommitRefResponse({
      owner: this.info.owner,
      repo: this.info.repo,
      ref: ref || this.info.defaultBranch,
    })
    if (!reposGetCommitRef) {
      return
    }
    return reposGetCommitRef.sha
  }

  async getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { ref, docPath } = getDocContentOptions
    if (docPath === '/') {
      // If docPath is root, return the readme of the repo
      return this.getRepoReadmeContent(getDocContentOptions)
    }
    const defaultExtension = '.md'
    if (path.extname(docPath) !== defaultExtension) {
      // Try docPath with default extension first, because it is most likely used
      const content: DocContent | undefined = await this.getDocContent({
        ...getDocContentOptions,
        docPath: `${docPath}${defaultExtension}`,
      })
      if (content) {
        return content
      }
    }
    const reposGetContents: ReposGetContentsResponse | undefined = await this.getContentsReponse({
      owner: this.info.owner,
      repo: this.info.repo,
      ref,
      path: docPath,
    })
    if (!reposGetContents) {
      return
    }
    if (Array.isArray(reposGetContents)) {
      // If docPath is a directory, return its readme file
      const filesInDir: GithubFileResponse[] = reposGetContents
      return this.findReadmeInDir(getDocContentOptions, filesInDir)
    }
    // If docPath is a file, return it
    const file: GithubFileResponse = reposGetContents
    return this.getFile(getDocContentOptions, file)
  }

  async getSiteConfig (ref: string, siteConfigPath: string): Promise<SiteConfig | undefined> {
    try {
      const reposGetContents: ReposGetContentsResponse | undefined = await this.getContentsReponse({
        owner: this.info.owner,
        repo: this.info.repo,
        ref,
        path: siteConfigPath,
      })
      if (!reposGetContents || Array.isArray(reposGetContents)) {
        return
      }
      const file: GithubFileResponse = reposGetContents
      const siteConfigContent: string = await this.getFileContent(ref, file)
      const siteConfig: SiteConfig = helper.parseSiteConfig(siteConfigContent)
      return siteConfig
    } catch (err) {
      console.log('Failed to get site config', err)
      return
    }
  }

  private async getRepoReadmeContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { ref, formats, siteConfig } = getDocContentOptions
    const reposGetReadme: ReposGetReadmeResponse | undefined = await this.getReadmeResponse({
      owner: this.info.owner,
      repo: this.info.repo,
      ref,
    })
    if (!reposGetReadme) {
      return
    }
    const format: FormatInterface | undefined = helper.findFormat(formats, reposGetReadme.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      name: reposGetReadme.name,
      path: reposGetReadme.path,
      format,
      content: helper.decodeBase64(reposGetReadme.content),
      siteConfig,
    })
  }

  private async findReadmeInDir (
    getDocContentOptions: GetDocContentOptions,
    filesInDir: GithubFileResponse[],
  ): Promise<DocContent | undefined> {
    const { ref, formats, siteConfig } = getDocContentOptions
    for (const file of filesInDir) {
      if (path.parse(file.name).name.toLowerCase() === 'readme') {
        const format: FormatInterface | undefined = helper.findFormat(formats, file.name)
        if (format) {
          return helper.createDocContent({
            info: this.info,
            name: file.name,
            path: file.path,
            format,
            content: await this.getFileContent(ref, file),
            siteConfig,
          })
        }
      }
    }
    return
  }

  private async getFile (
    getDocContentOptions: GetDocContentOptions,
    file: GithubFileResponse,
  ): Promise<DocContent | undefined> {
    const { ref, formats, siteConfig } = getDocContentOptions
    const format: FormatInterface | undefined = helper.findFormat(formats, file.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      name: file.name,
      path: file.path,
      format,
      content: await this.getFileContent(ref, file),
      siteConfig,
    })
  }

  private async getFileContent (ref: string, file: GithubFileResponse): Promise<string> {
    if (file.content) {
      return helper.decodeBase64(file.content)
    }
    const reposGetContents: ReposGetContentsResponse | undefined = await this.getContentsReponse({
      owner: this.info.owner,
      repo: this.info.repo,
      ref,
      path: file.path,
    })
    if (!reposGetContents || Array.isArray(reposGetContents)) {
      throw new Error(`${file.path} is not a file`)
    }
    return reposGetContents.content ? helper.decodeBase64(reposGetContents.content) : ''
  }

  private getReposGetCommitRefResponse (
    params: ReposGetCommitRefShaParams,
  ): Promise<ReposGetCommitRefResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposCommitRef/${params.owner}/${params.repo}/${params.ref}`,
      async () => {
        try {
          return (await this.octokit.repos.getCommitRefSha(params)).data as ReposGetCommitRefResponse
        } catch (err) {
          if (err.status === 404) {
            return
          }
          throw err
        }
      },
      { minutes: 1 },
    )
  }

  private getReadmeResponse (params: ReposGetReadmeParams): Promise<ReposGetReadmeResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposReadme/${params.owner}/${params.repo}/${params.ref}`,
      async () => {
        try {
          return (await this.octokit.repos.getReadme(params)).data
        } catch (err) {
          if (err.status === 404) {
            return
          }
          throw err
        }
      },
      { hours: 6 },
    )
  }

  private getContentsReponse (params: ReposGetContentsParams): Promise<ReposGetContentsResponse | undefined> {
    return this.requestCache.getValue(
      `github/reposContents/${params.owner}/${params.repo}/${params.ref}:${params.path}`,
      async () => {
        try {
          return (await this.octokit.repos.getContents(params)).data
        } catch (err) {
          if (err.status === 404) {
            return
          }
          throw err
        }
      },
      { hours: 6 },
    )
  }
}
