import { authMiddleware } from '~/server/serverMiddleware/auth.middleware'

export default defineEventHandler(event => {
  authMiddleware(event)
  return 'hello'
})
