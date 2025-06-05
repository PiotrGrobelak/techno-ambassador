import type { APIContext } from 'astro';
import { updateUserSchema, userIdParamSchema } from '../../../schemas/user.schema';
import { UserService } from '../../../services/user.service';
import { 
  handleApiError, 
  parseJsonBody, 
  handleServiceError,
  ApiErrors
} from '../../../middleware/error-handler';
import { ErrorLogService } from '../../../services/error-log.service';
import type { 
  UpdateUserCommand, 
  UserResponseDto, 
  UserDetailResponseDto 
} from '../../../types';

export const prerender = false

/**
 * GET /api/users/{id} - Retrieve detailed DJ profile
 * 
 * Provides public access to retrieve detailed information about a specific DJ profile.
 * Returns comprehensive user data including full event history, complete music style 
 * associations, and all profile information.
 * 
 * @param context - Astro API context with request, params, and locals
 * @returns Response with detailed user profile or error
 */
export async function GET(context: APIContext): Promise<Response> {
  const { request, params, locals } = context;
  
  try {
    // Step 1: Validate path parameters
    const paramValidation = userIdParamSchema.safeParse(params);
    
    if (!paramValidation.success) {
      const validationErrors = paramValidation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const { id: userId } = paramValidation.data;

    // Step 2: Fetch detailed user profile
    const userService = new UserService(locals.supabase);
    
    try {
      const userDetailResponse: UserDetailResponseDto = await userService.getUserById(userId);

      // Step 3: Success response
      return new Response(JSON.stringify(userDetailResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 4: Handle business logic errors
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request);
      
      const apiError = await handleServiceError(serviceError, errorContext, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 5: Centralized error handling with logging
    return await handleApiError(error, context);
  }
}

/**
 * PUT /api/users/{id} - Update DJ profile
 * 
 * Allows users to update DJ profiles. Handles complete profile updates including 
 * artist information, biography, social media links, and music style associations.
 * Requires authentication to ensure users can only update their own profiles.
 * 
 * @param context - Astro API context with request, params, and locals
 * @returns Response with updated user data or error
 */
export async function PUT(context: APIContext): Promise<Response> {
  const { request, params, locals } = context;
  let requestBody: any;
  
  try {
    // Step 1: Get authenticated user from Supabase
    const { data: { user }, error: authError } = await locals.supabase.auth.getUser();
    
    if (authError || !user) {
      throw ApiErrors.unauthorized('You must be logged in to update a profile');
    }

    // Step 2: Validate path parameters
    const paramValidation = userIdParamSchema.safeParse(params);
    
    if (!paramValidation.success) {
      const validationErrors = paramValidation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const { id: userId } = paramValidation.data;

    // Step 3: Verify user can only update their own profile
    if (user.id !== userId) {
      throw ApiErrors.forbidden('You can only update your own profile');
    }

    // Step 4: Parse and validate request body
    requestBody = await parseJsonBody(request);
    
    // Add user ID to the command
    const commandWithUserId = {
      ...requestBody,
      user_id: userId
    };
    
    const validationResult = updateUserSchema.safeParse(commandWithUserId);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: UpdateUserCommand = {
      user_id: validationResult.data.user_id,
      artist_name: validationResult.data.artist_name,
      biography: validationResult.data.biography,
      instagram_url: validationResult.data.instagram_url || undefined,
      facebook_url: validationResult.data.facebook_url || undefined,
      music_style_ids: validationResult.data.music_style_ids
    };

    // Step 5: Business logic validation and user update
    const userService = new UserService(locals.supabase);
    
    try {
      const userResponse: UserResponseDto = await userService.updateUser(command);

      // Step 6: Success response
      return new Response(JSON.stringify(userResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 7: Handle business logic errors
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request);
      const contextWithBody = ErrorLogService.addRequestBodyToContext(errorContext, requestBody);
      
      const apiError = await handleServiceError(serviceError, contextWithBody, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 8: Centralized error handling with logging
    return await handleApiError(error, context, undefined, requestBody);
  }
} 