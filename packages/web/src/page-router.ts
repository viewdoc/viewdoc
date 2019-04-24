import { DocContent, FormatInterface, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubSource } from '@viewdoc/github'
import { MarkdownFormat } from '@viewdoc/markdown'
import config from 'config'
import express, { NextFunction, Request, Response, Router } from 'express'

interface GithubConfig {
  accessToken: string
}

const githubConfig: GithubConfig = config.get<GithubConfig>('github')
const source: SourceInterface = new GithubSource({ accessToken: githubConfig.accessToken })
const formats: FormatInterface[] = [new MarkdownFormat()]

interface PageParams {
  ownerName: string
  repoId: string
  0?: string // optional file path
}

const handlePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.params as PageParams
    const { ownerName, repoId } = params
    const docPath = `/${params[0] || ''}`
    const repoIdsParts = repoId.split('@')
    const repoName = repoIdsParts[0]
    const repo: RepoInterface | undefined = await source.getRepo({ ownerName, repoName })
    if (!repo) {
      next()
      return
    }
    const ref = repoIdsParts[1] || repo.defaultBranch
    const docContent: DocContent | undefined = await repo.getDocContent({ ref, docPath, formats })
    if (!docContent) {
      next()
      return
    }
    const repoTitle = `${repo.ownerName}/${repo.name}${repo.description ? `: ${repo.description}` : ''}`
    res.send(`
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
          <title>${repoTitle} - ViewDoc</title>
          ${docContent.stylesheets
            .map((stylesheetUrl) => `<link rel="stylesheet" type="text/css" href="${stylesheetUrl}">`)
            .join('\n')}
        </head>
        <body>
          ${docContent.body}
          ${docContent.scripts
            .map((scriptUrl) => `<script type="text/javascript" src="${scriptUrl}"></script>`)
            .join('\n')}
        </body>
      </html>
    `)
  } catch (err) {
    next(err)
  }
}

export const pageRouter: Router = express.Router()

pageRouter.get('/:ownerName/:repoId', handlePage)
pageRouter.get('/:ownerName/:repoId/*', handlePage)
