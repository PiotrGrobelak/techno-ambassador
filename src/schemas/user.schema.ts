import { z } from 'zod';

/**
 * Validation schema for creating a new user (POST /api/users)
 * Validates all required and optional fields with appropriate constraints
 */
export const createUserSchema = z.object({
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  
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
    .max(500, 'Instagram URL must be less than 500 characters')
    .trim()
    .optional(),
  
  facebook_url: z
    .string()
    .max(500, 'Facebook URL must be less than 500 characters')
    .trim()
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
 * All fields except user_id are optional for partial updates
 */
export const updateUserSchema = z.object({
  user_id: z
    .string()
    .uuid('Invalid user ID format'),
  
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
    .max(500, 'Instagram URL must be less than 500 characters')
    .trim()
    .optional(),
  
  facebook_url: z
    .string()
    .max(500, 'Facebook URL must be less than 500 characters')
    .trim()
    .optional(),
  
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

/**
 * Validation schema for user ID path parameter
 * Used in GET /api/users/{id} and PUT /api/users/{id}
 */
export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

/**
 * Type inference for user ID parameter
 */
export type UserIdParamSchema = z.infer<typeof userIdParamSchema>;

/**
 * Validation schema for pagination parameters
 * Reusable across different endpoints
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val >= 1, 'Page must be a positive integer'),
  
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 20)
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
});

/**
 * Validation schema for date parameters
 * Used for availability checking
 */
export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date');

/**
 * Validation schema for query parameters in GET /api/users
 * Includes search, filtering, and pagination parameters
 */
export const getUsersQuerySchema = z.object({
  // Search parameters
  search: z
    .string()
    .max(500, 'Search term must be less than 500 characters')
    .trim()
    .optional(),
  
  // Music style filtering
  music_styles: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return val.split(',').map(id => id.trim());
    })
    .refine((val) => {
      if (!val) return true;
      return val.every(id => z.string().uuid().safeParse(id).success);
    }, 'All music style IDs must be valid UUIDs'),
  
  // Location filtering
  location: z
    .string()
    .max(255, 'Location search term must be less than 255 characters')
    .trim()
    .optional(),
  
  // Availability filtering
  available_from: dateParamSchema.optional(),
  available_to: dateParamSchema.optional(),
  
  // Pagination
  page: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 1)
    .refine((val) => val >= 1, 'Page must be a positive integer'),
  
  limit: z
    .string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 20)
    .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100'),
}).refine((data) => {
  // Validate date range if both dates are provided
  if (data.available_from && data.available_to) {
    return new Date(data.available_from) <= new Date(data.available_to);
  }
  return true;
}, {
  message: 'available_from must be before or equal to available_to',
  path: ['available_from']
});

/**
 * Type inference for GET /api/users query parameters
 */
export type GetUsersQuerySchema = z.infer<typeof getUsersQuerySchema>; 