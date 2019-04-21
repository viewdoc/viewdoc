import { NextFunction, Request, Response } from 'express'
import joinUrl from 'url-join'
import { getRepoFile, getRepoInfo, getRepoReadme, MarkupFile, RepoInfo } from './github'

export interface RenderPageOptions {
  owner: string
  repo: string
  filePath: string
  ref?: string
}

const renderMarkupFile = (res: Response, repoInfo: RepoInfo, markupFile: MarkupFile) => {
  const repoTitle = `${repoInfo.owner}/${repoInfo.repo}${repoInfo.description ? `: ${repoInfo.description}` : ''}`
  res.send(`
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
        <title>${repoTitle} - ViewDoc</title>
        <link rel="stylesheet" type="text/css" href="https://rawcdn.githack.com/mblode/marx/49921073cbb2e01d50a9cc66164c5e5cc0abec97/css/marx.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/themes/prism.min.css">
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/toolbar/prism-toolbar.min.css">
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/prism.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/toolbar/prism-toolbar.min.js"></script>
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.16.0/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js"></script>
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
  const file: MarkupFile | undefined = await getRepoFile(repoInfo, ref, filePath)
  if (!file) {
    res.redirect(joinUrl('https://github.com', owner, repo, 'blob', ref, filePath))
    return
  }
  renderMarkupFile(res, repoInfo, file)
}
