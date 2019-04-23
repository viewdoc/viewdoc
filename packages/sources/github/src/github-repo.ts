import Octokit, {
  ReposGetContentsParams,
  ReposGetReadmeParams,
  ReposGetReadmeResponse,
  ReposGetResponse,
} from '@octokit/rest'
import { DocContent, DocFormat, GetDocContentOptions, GitSourceHelper, Repo } from '@viewdoc/core/lib/doc'
import path from 'path'

const helper = new GitSourceHelper()

export interface GithubRepoOptions {
  readonly octokit: Octokit
  readonly ownerName: string
  readonly repoName: string
  readonly reposGet: ReposGetResponse
}

interface GithubFileResponse {
  name: string
  path: string
  content?: string
}

type ReposGetContentsResponse = GithubFileResponse | GithubFileResponse[]

export class GithubRepo implements Repo {
  private readonly octokit: Octokit
  readonly name: string
  readonly ownerName: string
  readonly defaultBranch: string
  readonly description?: string
  readonly homePage?: string
  readonly license?: string

  constructor (githubRepoOptions: GithubRepoOptions) {
    const { octokit, ownerName, repoName, reposGet } = githubRepoOptions
    this.octokit = octokit
    this.name = repoName
    this.ownerName = ownerName
    this.defaultBranch = reposGet.default_branch
    this.description = reposGet.description
    this.homePage = reposGet.homepage
    this.license = reposGet.license.key
  }

  async getDocContent (getDocContentOptions: GetDocContentOptions): Promise<DocContent | undefined> {
    const { ref, docPath } = getDocContentOptions
    if (docPath === '/') {
      // If docPath is root, return the readme of the repo
      return this.getRepoReadmeContent(getDocContentOptions)
    }
    const reposGetContents: ReposGetContentsResponse | undefined = await this.getContentsReponse({
      owner: this.ownerName,
      repo: this.name,
      ref,
      path: docPath,
    })
    if (!reposGetContents) {
      // If docPath is not found, try default extension
      const defaultExtension = '.md'
      if (path.extname(docPath) !== defaultExtension) {
        return this.getDocContent({ ...getDocContentOptions, docPath: `${docPath}${defaultExtension}` })
      }
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
    const { ref, formats } = getDocContentOptions
    const reposGetReadme: ReposGetReadmeResponse | undefined = await this.getReadmeResponse({
      owner: this.ownerName,
      repo: this.name,
      ref,
    })
    if (!reposGetReadme) {
      return
    }
    const format: DocFormat | undefined = helper.findFormat(formats, reposGetReadme.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      name: reposGetReadme.name,
      path: reposGetReadme.path,
      format,
      content: helper.decodeBase64(reposGetReadme.content),
    })
  }

  private async findReadmeInDir (
    getDocContentOptions: GetDocContentOptions,
    filesInDir: GithubFileResponse[],
  ): Promise<DocContent | undefined> {
    const { ref, formats } = getDocContentOptions
    for (const file of filesInDir) {
      if (path.parse(file.name).name.toLowerCase() === 'readme') {
        const format: DocFormat | undefined = helper.findFormat(formats, file.name)
        if (format) {
          return helper.createDocContent({
            name: file.name,
            path: file.path,
            format,
            content: await this.getFileContent(ref, file),
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
    const { ref, formats } = getDocContentOptions
    const format: DocFormat | undefined = helper.findFormat(formats, file.name)
    if (!format) {
      return
    }
    return helper.createDocContent({
      name: file.name,
      path: file.path,
      format,
      content: await this.getFileContent(ref, file),
    })
  }

  private async getFileContent (ref: string, file: GithubFileResponse): Promise<string> {
    if (file.content) {
      return helper.decodeBase64(file.content)
    }
    const reposGetContents: ReposGetContentsResponse | undefined = await this.getContentsReponse({
      owner: this.ownerName,
      repo: this.name,
      ref,
      path: file.path,
    })
    if (!reposGetContents || Array.isArray(reposGetContents)) {
      throw new Error(`${file.path} is not a file`)
    }
    return reposGetContents.content ? helper.decodeBase64(reposGetContents.content) : ''
  }

  private async getReadmeResponse (params: ReposGetReadmeParams): Promise<ReposGetReadmeResponse | undefined> {
    try {
      return (await this.octokit.repos.getReadme(params)).data
    } catch (err) {
      if (err.status === 404) {
        return
      }
      throw err
    }
  }

  private async getContentsReponse (params: ReposGetContentsParams): Promise<ReposGetContentsResponse | undefined> {
    try {
      return (await this.octokit.repos.getContents(params)).data
    } catch (err) {
      if (err.status === 404) {
        return
      }
      throw err
    }
  }
}
