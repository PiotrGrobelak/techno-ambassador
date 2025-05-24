import type { APIContext } from 'astro';
import { createUserSchema } from '../../schemas/user.schema';
import { UserService } from '../../services/user.service';
import { 
  handleApiError, 
  parseJsonBody, 
  handleServiceError,
  ApiErrors 
} from '../../middleware/error-handler';
import { ErrorLogService } from '../../services/error-log.service';
import type { CreateUserCommand, UserResponseDto } from '../../types';

/**
 * POST /api/users - Create a new DJ profile
 * 
 * Creates a new user with artist information, biography, optional social media links,
 * and required music style associations. No authentication required for registration.
 * 
 * @param context - Astro API context with request and locals
 * @returns Response with created user data or error
 */
export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  let requestBody: any;
  
  try {
    // Step 1: Parse and validate request body
    requestBody = await parseJsonBody(request);
    
    const validationResult = createUserSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: CreateUserCommand = validationResult.data;

    // Step 2: Business logic validation and user creation
    const userService = new UserService(locals.supabase);
    
    try {
      const userResponse: UserResponseDto = await userService.createUser(command);

      // Step 3: Success response
      return new Response(JSON.stringify(userResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 4: Handle business logic errors using centralized error handler
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request);
      const contextWithBody = ErrorLogService.addRequestBodyToContext(errorContext, requestBody);
      
      const apiError = await handleServiceError(serviceError, contextWithBody, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 5: Centralized error handling with logging
    return await handleApiError(error, context, undefined, requestBody);
  }
} 