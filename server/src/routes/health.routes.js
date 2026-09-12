import { Router } from 'express'

const router = Router()

router.get('/', (_request, response) => {
  response.json({ service: 'lighthouse-marketplace-api', status: 'ok' })
})

export default router
