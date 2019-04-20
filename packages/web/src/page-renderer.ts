import { NextFunction, Request, Response } from 'express'
import { getRepoInfo, getRepoReadme, RepoInfo, MarkupFile } from './github'

export interface RenderPageOptions {
  owner: string
  repo: string
  filePath: string
  ref?: string
}

const renderMarkupFile = (res: Response, repoInfo: RepoInfo, markupFile: MarkupFile) => {
  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
        <title>${repoInfo.owner}/${repoInfo.repo}${repoInfo.description ? `: ${repoInfo.description}` : ''} - ViewDoc</title>
        <link rel="stylesheet" type="text/css" href="https://rawcdn.githack.com/mblode/marx/49921073cbb2e01d50a9cc66164c5e5cc0abec97/css/marx.min.css">
      </head>
      <body><main>${markupFile.htmlContent}</main></body>
    </html>
  `)
}

export const renderPage = async (options: RenderPageOptions, req: Request, res: Response, next: NextFunction) => {
  const { owner, repo, filePath } = options
  const repoInfo: RepoInfo = await getRepoInfo(owner, repo)
  const ref = options.ref || repoInfo.defaultBranch
  if (filePath === '/') {
    // Render root readme
    const readme: MarkupFile = await getRepoReadme(repoInfo, ref)
    renderMarkupFile(res, repoInfo, readme)
    return
  }
  next()
}
