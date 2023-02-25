import { authController } from '~/server/controllers/authController'
import { authMiddleware } from '~/server/serverMiddleware/authMiddleware'
const app = createApp()
const router = createRouter()

router.post('/signup', authController.signup())
router.post('/login', authController.login())
router.get('/logout', authController.logout())
router.get('/refresh', authController.refresh())
router.get(
  '/data',
  defineEventHandler(event => {
    authMiddleware(event)
    return 'hello'
  })
)

export default useBase('/api/auth', router.handler)
