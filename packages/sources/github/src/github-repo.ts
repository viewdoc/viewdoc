import { DocContent, RepoInfo } from '@viewdoc/core/lib/doc'
import { FormatInterface } from '@viewdoc/core/lib/format'
import { SiteConfig } from '@viewdoc/core/lib/site-config'
import { GetDocContentOptions, RepoInterface, SourceHelper } from '@viewdoc/core/lib/source'
import path from 'path'
import {
  GithubApi,
  GithubFileResponse,
  ReposGetCommitRefResponse,
  ReposGetContentsResponse,
  ReposGetReadmeResponse,
  ReposGetResponse,
} from './github-api'

const helper = new SourceHelper()

export interface GithubRepoOptions {
  readonly githubApi: GithubApi
  readonly owner: string
  readonly repo: string
  readonly reposGet: ReposGetResponse
}

export class GithubRepo implements RepoInterface {
  private readonly githubApi: GithubApi
  readonly info: RepoInfo

  constructor (githubRepoOptions: GithubRepoOptions) {
    const { githubApi, owner, repo, reposGet } = githubRepoOptions
    this.githubApi = githubApi
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
    const reposGetCommitRef: ReposGetCommitRefResponse | undefined = await this.githubApi.getReposGetCommitRefResponse({
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
    const { docPath } = getDocContentOptions
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
    return this.getDocContentFromFullPath(getDocContentOptions)
  }

  async getSiteConfig (ref: string, siteConfigPath: string): Promise<SiteConfig | undefined> {
    try {
      const reposGetContents: ReposGetContentsResponse | undefined = await this.githubApi.getContentsReponse({
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

  private async getDocContentFromFullPath (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { ref, docPath } = getDocContentOptions
    const reposGetContents: ReposGetContentsResponse | undefined = await this.githubApi.getContentsReponse({
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

  private async getRepoReadmeContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { ref, formatManager, siteConfig } = getDocContentOptions
    const reposGetReadme: ReposGetReadmeResponse | undefined = await this.githubApi.getReadmeResponse({
      owner: this.info.owner,
      repo: this.info.repo,
      ref,
    })
    if (!reposGetReadme) {
      return
    }
    const format: FormatInterface | undefined = formatManager.findFormatByFileName(reposGetReadme.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      name: reposGetReadme.name,
      docPath: reposGetReadme.path,
      format,
      content: helper.decodeBase64(reposGetReadme.content),
      siteConfig,
    })
  }

  private async findReadmeInDir (
    getDocContentOptions: GetDocContentOptions,
    filesInDir: GithubFileResponse[],
  ): Promise<DocContent | undefined> {
    const { ref, formatManager, siteConfig } = getDocContentOptions
    for (const file of filesInDir) {
      if (path.parse(file.name).name.toLowerCase() === 'readme') {
        const format: FormatInterface | undefined = formatManager.findFormatByFileName(file.name)
        if (format) {
          return helper.createDocContent({
            info: this.info,
            name: file.name,
            docPath: file.path,
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
    const { ref, formatManager, siteConfig } = getDocContentOptions
    const format: FormatInterface | undefined = formatManager.findFormatByFileName(file.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      name: file.name,
      docPath: file.path,
      format,
      content: await this.getFileContent(ref, file),
      siteConfig,
    })
  }

  private async getFileContent (ref: string, file: GithubFileResponse): Promise<string> {
    if (file.content) {
      return helper.decodeBase64(file.content)
    }
    const reposGetContents: ReposGetContentsResponse | undefined = await this.githubApi.getContentsReponse({
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
}
