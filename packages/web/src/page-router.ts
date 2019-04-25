import { FileBasedCache } from '@viewdoc/cache'
import { CacheInterface } from '@viewdoc/core/lib/cache'
import { DocContent, FormatInterface, RepoInterface, SourceInterface } from '@viewdoc/core/lib/doc'
import { GithubSource } from '@viewdoc/github'
import { MarkdownFormat } from '@viewdoc/markdown'
import config from 'config'
import express, { NextFunction, Request, Response, Router } from 'express'
import { DateTime, DurationObject } from 'luxon'

interface GithubConfig {
  accessToken: string
}

interface CacheConfig {
  basePath: string
  maxDataLength: number
  defaultMaxAge: DurationObject
}

const githubConfig: GithubConfig = config.get('github')
const cacheConfig: CacheConfig = config.get('cache')

interface PageParams {
  ownerName: string
  repoId: string
  0?: string // optional file path
}

const createPageHandler = (source: SourceInterface, formats: FormatInterface[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
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
      const ref: string | undefined = await repo.getCommitRef(repoIdsParts[1])
      if (!ref) {
        next()
        return
      }
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
}

export const createPageRouter = async () => {
  const cache: CacheInterface = new FileBasedCache({
    ...cacheConfig,
    getDirName (expiredAt: DateTime): string {
      return expiredAt.toFormat('yyyyMMdd-HH')
    },
    cleanDirEvery: { hours: 1 },
  })
  await cache.start()
  const formats: FormatInterface[] = [new MarkdownFormat()]
  const githubPageHandler = createPageHandler(
    new GithubSource({ accessToken: githubConfig.accessToken, cache }),
    formats,
  )
  const pageRouter: Router = express.Router()
  pageRouter.get('/:ownerName/:repoId', githubPageHandler)
  pageRouter.get('/:ownerName/:repoId/*', githubPageHandler)
  return pageRouter
}
