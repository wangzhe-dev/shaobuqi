import { Router } from 'express'
import { authRouter } from './auth'
import { draftsRouter } from './drafts'
import { meRouter } from './me'
import { skillsRouter } from './skills'
import { statsRouter } from './stats'

export const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/skills', skillsRouter)
apiRouter.use('/me', meRouter)
apiRouter.use('/stats', statsRouter)
apiRouter.use('/drafts', draftsRouter)
