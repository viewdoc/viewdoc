import { DocPage, ViewDocApi } from '@viewdoc/api'
import config from 'config'
import express, { NextFunction, Request, Response, Router } from 'express'

interface PageParams {
  owner: string
  repoId: string
  0?: string // optional file path
}

const createPageHandler = (api: ViewDocApi, sourceId: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const params = req.params as PageParams
      const { owner, repoId } = params
      const docPath = `/${params[0] || ''}`
      const docPage: DocPage | undefined = await api.getDocPage({ owner, repoId, docPath }, sourceId)
      if (!docPage) {
        next()
        return
      }
      const repoTitle = `${docPage.info.owner}/${docPage.info.repo}${
        docPage.info.description ? `: ${docPage.info.description}` : ''
      }`
      res.send(`
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
            <title>${repoTitle} - ViewDoc</title>
            ${docPage.content.stylesheets
              .map((stylesheetUrl) => `<link rel="stylesheet" type="text/css" href="${stylesheetUrl}">`)
              .join('\n')}
          </head>
          <body>
            ${docPage.content.body}
            ${docPage.content.scripts
              .map((scriptUrl) => `<script type="text/javascript" src="${scriptUrl}"></script>`)
              .join('\n')}
          </body>
        </html>
      `)
    } catch (err) {
      next(err)
    }
  }
}

export const createPageRouter = async () => {
  const api = new ViewDocApi()
  await api.start({
    cache: config.get('cache'),
    github: config.get('github'),
  })
  const githubPageHandler = createPageHandler(api, 'github')
  const pageRouter: Router = express.Router()
  pageRouter.get('/:owner/:repoId', githubPageHandler)
  pageRouter.get('/:owner/:repoId/*', githubPageHandler)
  return pageRouter
}
