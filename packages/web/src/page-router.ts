import express, { NextFunction, Request, Response, Router } from 'express'
import { renderPage } from './page-renderer'

export const pageRouter: Router = express.Router()

interface PageParams {
  owner: string
  repoId: string
  0: string
}

const parseRepoId = (repoId: string) => {
  const repoIdsParts = repoId.split('@')
  return {
    repo: repoIdsParts[0],
    ref: repoIdsParts[1],
  }
}

pageRouter.get('/:owner/:repoId', async (req: Request, res: Response, next: NextFunction) => {
  const params = req.params as PageParams
  await renderPage(
    {
      owner: params.owner,
      ...parseRepoId(params.repoId),
      filePath: '/',
    },
    req,
    res,
    next,
  )
})

pageRouter.get('/:owner/:repoId/*', async (req: Request, res: Response, next: NextFunction) => {
  const params = req.params as PageParams
  await renderPage(
    {
      owner: params.owner,
      ...parseRepoId(params.repoId),
      filePath: params[0],
    },
    req,
    res,
    next,
  )
})
