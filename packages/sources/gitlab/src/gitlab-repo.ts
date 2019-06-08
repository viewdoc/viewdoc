import { DocContent, RepoInfo } from '@viewdoc/core/lib/doc'
import { FormatInterface } from '@viewdoc/core/lib/format'
import { SiteConfig } from '@viewdoc/core/lib/site-config'
import { GetDocContentOptions, RepoInterface, SourceHelper } from '@viewdoc/core/lib/source'
import path from 'path'
import { GitlabApi, GitlabFileResponse, ReposGetCommitResponse, ReposGetResponse } from './gitlab-api'

const helper = new SourceHelper()

export interface GitlabRepoOptions {
  readonly gitlabApi: GitlabApi
  readonly projectId: string
  readonly owner: string
  readonly repo: string
  readonly reposGet: ReposGetResponse
}

export class GitlabRepo implements RepoInterface {
  private readonly gitlabApi: GitlabApi
  private readonly projectId: string
  private readonly readmePath: string
  readonly info: RepoInfo

  constructor (gitlabRepoOptions: GitlabRepoOptions) {
    const { gitlabApi, projectId, owner, repo, reposGet } = gitlabRepoOptions
    this.gitlabApi = gitlabApi
    this.info = {
      owner,
      repo,
      defaultBranch: reposGet.default_branch,
      description: reposGet.description,
    }
    this.projectId = projectId
    this.readmePath = path.basename(reposGet.readme_url)
  }

  async getCommitRef (ref?: string): Promise<string | undefined> {
    const reposGetCommit: ReposGetCommitResponse | undefined = await this.gitlabApi.getReposGetCommitResponse({
      projectId: this.projectId,
      ref: ref || this.info.defaultBranch,
    })
    if (!reposGetCommit) {
      return
    }
    return reposGetCommit.id
  }

  async getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { originalPath } = getDocContentOptions
    if (originalPath === '/') {
      // If originalPath is root, return the readme of the repo
      return this.getDocContentFromRepoReadme(getDocContentOptions)
    }
    const defaultExtension = '.md'
    if (path.extname(originalPath) !== defaultExtension) {
      // Try originalPath with default extension, because it is most likely used
      const content: DocContent | undefined = await this.getDocContent({
        ...getDocContentOptions,
        originalPath: `${originalPath}${defaultExtension}`,
      })
      if (content) {
        return content
      }
    }
    return this.getDocContentFromOriginalPath(getDocContentOptions)
  }

  async getSiteConfig (ref: string, siteConfigPath: string): Promise<SiteConfig | undefined> {
    try {
      const file: GitlabFileResponse | undefined = await this.gitlabApi.getFileResponse({
        projectId: this.projectId,
        ref,
        path: siteConfigPath,
      })
      if (!file) {
        return
      }
      const siteConfigContent: string = await this.getFileContent(ref, file)
      const siteConfig: SiteConfig = helper.parseSiteConfig(siteConfigContent)
      return siteConfig
    } catch (err) {
      console.log('Failed to get site config', err)
      return
    }
  }

  private async getDocContentFromOriginalPath (
    getDocContentOptions: GetDocContentOptions,
  ): Promise<DocContent | undefined> {
    const { commitRef, originalPath } = getDocContentOptions
    const file: GitlabFileResponse | undefined = await this.gitlabApi.getFileResponse({
      projectId: this.projectId,
      ref: commitRef,
      path: originalPath,
    })
    // If originalPath is a file, return it
    if (file) {
      return this.getDocContentFromFile(getDocContentOptions, file)
    }
    const filesInDir: GitlabFileResponse[] | undefined = await this.gitlabApi.getTreeResponse({
      projectId: this.projectId,
      ref: commitRef,
      path: originalPath,
    })
    if (!filesInDir) {
      return
    }
    // If originalPath is a directory, return its readme file
    return this.getDocContentFromDirectory(getDocContentOptions, filesInDir)
  }

  private async getDocContentFromRepoReadme (
    getDocContentOptions: GetDocContentOptions,
  ): Promise<DocContent | undefined> {
    const { commitRef, formatManager } = getDocContentOptions
    const readmeFile: GitlabFileResponse | undefined = await this.gitlabApi.getFileResponse({
      projectId: this.projectId,
      ref: commitRef,
      path: this.readmePath,
    })
    if (!readmeFile) {
      return
    }
    const format: FormatInterface | undefined = formatManager.findFormatByFileName(readmeFile.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      resolvedPath: readmeFile.path,
      format,
      content: await this.getFileContent(commitRef, readmeFile),
      options: getDocContentOptions,
    })
  }

  private async getDocContentFromDirectory (
    getDocContentOptions: GetDocContentOptions,
    filesInDir: GitlabFileResponse[],
  ): Promise<DocContent | undefined> {
    const { commitRef, formatManager } = getDocContentOptions
    for (const file of filesInDir) {
      if (path.parse(file.name).name.toLowerCase() === 'readme') {
        const format: FormatInterface | undefined = formatManager.findFormatByFileName(file.name)
        if (format) {
          return helper.createDocContent({
            info: this.info,
            resolvedPath: file.path,
            format,
            content: await this.getFileContent(commitRef, file),
            options: getDocContentOptions,
          })
        }
      }
    }
    return
  }

  private async getDocContentFromFile (
    getDocContentOptions: GetDocContentOptions,
    file: GitlabFileResponse,
  ): Promise<DocContent | undefined> {
    const { commitRef, formatManager } = getDocContentOptions
    const format: FormatInterface | undefined = formatManager.findFormatByFileName(file.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      info: this.info,
      resolvedPath: file.path,
      format,
      content: await this.getFileContent(commitRef, file),
      options: getDocContentOptions,
    })
  }

  private async getFileContent (ref: string, file: GitlabFileResponse): Promise<string> {
    if (file.content) {
      return helper.decodeBase64(file.content)
    }
    const reposGetContents: GitlabFileResponse | undefined = await this.gitlabApi.getFileResponse({
      projectId: this.projectId,
      ref,
      path: file.path,
    })
    if (!reposGetContents || !reposGetContents.content) {
      throw new Error(`${file.path} is not a file`)
    }
    return reposGetContents.content ? helper.decodeBase64(reposGetContents.content) : ''
  }
}
