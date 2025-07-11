import { z } from 'zod';

// Base email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address');

// Base password validation schema
const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

// Login form schema
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Register form schema with password confirmation
export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

// Reset password form schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
});

// Update password form schema
export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  });

// TypeScript types derived from schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
