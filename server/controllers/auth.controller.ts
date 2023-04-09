import type { UserWithTokensFromApi } from '~/types'

import { useValidatedBody } from 'h3-zod'

import { ApiError } from '~/server/errors/ApiError'

import { signupSchema, loginSchema } from '~/schema/auth.schema'

import { authService } from '~/server/services/auth.service'

const ONE_MONTH_IN_MS = 1000 * 60 * 60 * 30

class AuthController {
  signup() {
    return defineEventHandler(async (event): Promise<UserWithTokensFromApi> => {
      const body = await useValidatedBody(event, signupSchema)

      const userData = await authService.signup(body)

      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })

      return userData
    })
  }

  login() {
    return defineEventHandler(async (event): Promise<UserWithTokensFromApi> => {
      const body = await useValidatedBody(event, loginSchema)

      const userData = await authService.login(body)

      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })

      return userData
    })
  }

  refresh() {
    return defineEventHandler(async (event): Promise<UserWithTokensFromApi> => {
      const refreshToken = getCookie(event, 'refreshToken')
      if (refreshToken === undefined) throw ApiError.UnauthorizedError()

      const userData = await authService.refresh(refreshToken)
      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })
      return userData
    })
  }

  logout() {
    return defineEventHandler(async event => {
      const refreshToken = getCookie(event, 'refreshToken')
      if (refreshToken === undefined) throw ApiError.UnauthorizedError()

      const deletedToken = await authService.logout(refreshToken)
      deleteCookie(event, 'refreshToken')
      return deletedToken
    })
  }
}

export const authController = new AuthController()
