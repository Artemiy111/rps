import { z } from 'zod'

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(12),
  password: z.string().min(6).max(30),
})

export const signupSchema = z
  .object({
    username: z.string().trim().min(3).max(12),
    password: z.string().min(6).max(30),
    repeatPassword: z.string(),
  })
  .refine(({ password, repeatPassword }) => password === repeatPassword, {
    message: "Passwords  don't match",
    path: ['repeatPassword'],
  })
