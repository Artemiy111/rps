import type { UserData, Token } from '~/types'

import { useValidatedBody } from 'h3-zod'

import { ApiError } from '~/server/exceptions/ApiError'

import { signupSchema, loginSchema } from '~/schema/authSchema'

import { userService } from '~/server/services/userService'

const ONE_MONTH_IN_MS = 1000 * 60 * 60 * 30

class AuthController {
  signup() {
    return defineEventHandler(async (event): Promise<UserData> => {
      const body = await useValidatedBody(event, signupSchema)

      const userData = await userService.signup(body)

      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })

      return userData
    })
  }

  login() {
    return defineEventHandler(async (event): Promise<UserData> => {
      const body = await useValidatedBody(event, loginSchema)

      const userData = await userService.login(body)

      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })

      return userData
    })
  }

  refresh() {
    return defineEventHandler(async (event): Promise<UserData> => {
      const refreshToken = getCookie(event, 'refreshToken')
      if (refreshToken === undefined) throw ApiError.UnauthorizedError()

      const userData = await userService.refresh(refreshToken)
      setCookie(event, 'refreshToken', userData.refreshToken, {
        maxAge: ONE_MONTH_IN_MS,
        httpOnly: true,
      })
      return userData
    })
  }

  logout() {
    return defineEventHandler(async (event): Promise<Token> => {
      const refreshToken = getCookie(event, 'refreshToken')
      if (refreshToken === undefined) throw ApiError.UnauthorizedError()

      const deletedToken = await userService.logout(refreshToken)
      deleteCookie(event, 'refreshToken')
      return deletedToken
    })
  }
}

export const authController = new AuthController()
