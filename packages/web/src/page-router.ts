import express, { NextFunction, Request, Response, Router } from 'express'
import { renderPage } from './page-renderer'

export const pageRouter: Router = express.Router()

interface PageParams {
  owner: string
  repoId: string
  0?: string // optional file path
}

const parseRepoId = (repoId: string) => {
  const repoIdsParts = repoId.split('@')
  return {
    repo: repoIdsParts[0],
    ref: repoIdsParts[1],
  }
}

const handlePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = req.params as PageParams
    await renderPage(
      {
        owner: params.owner,
        ...parseRepoId(params.repoId),
        filePath: params[0] || '/',
      },
      req,
      res,
      next,
    )
  } catch (err) {
    if (err.status === 404) {
      next()
      return
    }
    next(err)
  }
}

pageRouter.get('/:owner/:repoId', handlePage)
pageRouter.get('/:owner/:repoId/*', handlePage)
