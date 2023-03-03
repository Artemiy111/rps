import { authMiddleware } from '~/server/serverMiddleware/authMiddleware'

export default defineEventHandler(event => {
  authMiddleware(event)
  return 'hello'
})
