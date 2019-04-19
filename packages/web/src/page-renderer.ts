import { NextFunction, Request, Response } from 'express'
import { getRepoInfo, getRepoReadme, RepoInfo } from './github'

export interface RenderPageOptions {
  owner: string
  repo: string
  filePath: string
  ref?: string
}

const renderHtml = (res: Response, body: string) => {
  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
        <link rel="stylesheet" type="text/css" href="https://igoradamenko.github.io/awsm.css/css/awsm_theme_white.min.css">
      </head>
      <body>${body}</body>
    </html>
  `)
}

export const renderPage = async (options: RenderPageOptions, req: Request, res: Response, next: NextFunction) => {
  const { owner, repo, filePath } = options
  const repoInfo: RepoInfo = await getRepoInfo(owner, repo)
  const ref = options.ref || repoInfo.defaultBranch
  if (filePath === '/') {
    // Render root readme
    const readme = await getRepoReadme(repoInfo, ref)
    renderHtml(res, readme)
    return
  }
  next()
}
