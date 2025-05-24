import { z } from 'zod';

/**
 * Validation schema for creating a new user (POST /api/users)
 * Validates all required and optional fields with appropriate constraints
 */
export const createUserSchema = z.object({
  artist_name: z
    .string()
    .min(1, 'Artist name is required')
    .max(255, 'Artist name must be less than 255 characters')
    .trim(),
  
  biography: z
    .string()
    .min(1, 'Biography is required')
    .max(10000, 'Biography must be less than 10,000 characters')
    .trim(),
  
  instagram_url: z
    .string()
    .url('Invalid Instagram URL format')
    .max(500, 'Instagram URL must be less than 500 characters')
    .optional(),
  
  facebook_url: z
    .string()
    .url('Invalid Facebook URL format')
    .max(500, 'Facebook URL must be less than 500 characters')
    .optional(),
  
  music_style_ids: z
    .array(z.string().uuid('Invalid music style ID format'))
    .min(1, 'At least one music style is required')
    .max(50, 'Maximum 50 music styles allowed'),
});

/**
 * Type inference for CreateUserCommand from the Zod schema
 */
export type CreateUserCommandSchema = z.infer<typeof createUserSchema>;

/**
 * Validation schema for updating a user (PUT /api/users/{id})
 * All fields are optional for partial updates
 */
export const updateUserSchema = z.object({
  artist_name: z
    .string()
    .min(1, 'Artist name cannot be empty')
    .max(255, 'Artist name must be less than 255 characters')
    .trim()
    .optional(),
  
  biography: z
    .string()
    .min(1, 'Biography cannot be empty')
    .max(10000, 'Biography must be less than 10,000 characters')
    .trim()
    .optional(),
  
  instagram_url: z
    .string()
    .url('Invalid Instagram URL format')
    .max(500, 'Instagram URL must be less than 500 characters')
    .optional()
    .nullable(),
  
  facebook_url: z
    .string()
    .url('Invalid Facebook URL format')
    .max(500, 'Facebook URL must be less than 500 characters')
    .optional()
    .nullable(),
  
  music_style_ids: z
    .array(z.string().uuid('Invalid music style ID format'))
    .min(1, 'At least one music style is required')
    .max(50, 'Maximum 50 music styles allowed')
    .optional(),
});

/**
 * Type inference for UpdateUserCommand from the Zod schema
 */
export type UpdateUserCommandSchema = z.infer<typeof updateUserSchema>; 