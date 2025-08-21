// src/lib/validations/auth.ts
import * as z from 'zod'

export const signUpSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username is too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
})

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>

// Legacy exports for backward compatibility
export const loginSchema = signInSchema
export const registerSchema = signUpSchema
export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export type LoginFormData = SignInFormData
export type RegisterFormData = SignUpFormData
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>