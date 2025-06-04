import { z } from 'zod';

// Base email validation schema
const emailSchema = z
  .string()
  .min(1, 'Email address is required')
  .email('Please enter a valid email address')
  .transform(email => email.toLowerCase().trim());

// Base password validation schema
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and number'
  );

// Login request schema
export const LoginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Registration request schema
export const RegisterRequestSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

// Password reset request schema
export const ResetPasswordRequestSchema = z.object({
  email: emailSchema,
});

// Password update request schema
export const UpdatePasswordRequestSchema = z.object({
  password: passwordSchema,
  passwordConfirmation: z.string().min(1, 'Password confirmation is required'),
}).refine(
  (data) => data.password === data.passwordConfirmation,
  {
    message: 'Passwords do not match',
    path: ['passwordConfirmation'],
  }
);

// Response schemas for type safety
export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
});

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  message: z.string(),
});

export const RegisterResponseSchema = z.object({
  user: AuthUserSchema,
  message: z.string(),
  needsEmailVerification: z.boolean(),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const SuccessMessageResponseSchema = z.object({
  message: z.string(),
});

// Type exports for use in endpoints
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type UpdatePasswordRequest = z.infer<typeof UpdatePasswordRequestSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type SuccessMessageResponse = z.infer<typeof SuccessMessageResponseSchema>; 