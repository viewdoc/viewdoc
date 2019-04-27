export interface RepoInfo {
  readonly owner: string
  readonly repo: string
  readonly defaultBranch: string
  readonly description?: string
  readonly homePage?: string
  readonly license?: string
}
