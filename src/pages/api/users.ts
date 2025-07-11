import type { APIContext } from 'astro';
import { createUserSchema, getUsersQuerySchema } from '@/schemas/user.schema';
import { UserService } from '@/services/user.service';
import {
  handleApiError,
  parseJsonBody,
  handleServiceError,
  ApiErrors,
} from '@/middleware/error-handler';
import { ErrorLogService } from '@/services/error-log.service';
import type {
  CreateUserCommand,
  UserResponseDto,
  UsersListResponseDto,
  UsersQueryParams,
} from '@/types';

export const prerender = false;

/**
 * POST /api/users - Create a new DJ profile
 *
 * Creates a new user with artist information, biography, optional social media links,
 * and required music style associations. Requires authentication.
 *
 * @param context - Astro API context with request and locals
 * @returns Response with created user data or error
 */
export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let requestBody: any;

  try {
    // Step 1: Get authenticated user from Supabase
    const {
      data: { user },
      error: authError,
    } = await locals.supabase.auth.getUser();

    if (authError || !user) {
      throw ApiErrors.unauthorized('You must be logged in to create a profile');
    }

    // Step 2: Parse and validate request body
    requestBody = await parseJsonBody(request);

    // Add authenticated user ID to the command
    const commandWithUserId = {
      ...requestBody,
      user_id: user.id,
    };

    const validationResult = createUserSchema.safeParse(commandWithUserId);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: CreateUserCommand = validationResult.data;

    // Step 3: Business logic validation and user creation
    const userService = new UserService(locals.supabase);

    try {
      const userResponse: UserResponseDto =
        await userService.createUser(command);

      // Step 4: Success response
      return new Response(JSON.stringify(userResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (serviceError: any) {
      // Step 5: Handle business logic errors using centralized error handler
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request);
      const contextWithBody = ErrorLogService.addRequestBodyToContext(
        errorContext,
        requestBody
      );

      const apiError = await handleServiceError(
        serviceError,
        contextWithBody,
        errorLogService
      );
      throw apiError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Step 6: Centralized error handling with logging
    return await handleApiError(error, context, undefined, requestBody);
  }
}

/**
 * GET /api/users - List all DJ profiles with filtering and pagination
 *
 * Provides public access to retrieve a paginated list of all DJ profiles with advanced
 * filtering capabilities including search, music style filtering, location-based search,
 * and availability checking.
 *
 * @param context - Astro API context with request and locals
 * @returns Response with paginated user list or error
 */
export async function GET(context: APIContext): Promise<Response> {
  const { request, locals } = context;

  try {
    // Step 1: Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validationResult = getUsersQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw ApiErrors.validation(validationErrors);
    }

    // Transform validated params to match service expectations
    const validatedParams: UsersQueryParams = {
      search: validationResult.data.search,
      music_styles: validationResult.data.music_styles
        ? validationResult.data.music_styles.join(',')
        : undefined,
      location: validationResult.data.location,
      available_from: validationResult.data.available_from,
      available_to: validationResult.data.available_to,
      page: validationResult.data.page,
      limit: validationResult.data.limit,
    };

    // Step 2: Fetch users with filtering and pagination
    const userService = new UserService(locals.supabase);

    try {
      const usersResponse: UsersListResponseDto =
        await userService.getUsers(validatedParams);

      // Step 3: Success response
      return new Response(JSON.stringify(usersResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (serviceError: any) {
      // Step 4: Handle business logic errors
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request);

      const apiError = await handleServiceError(
        serviceError,
        errorContext,
        errorLogService
      );
      throw apiError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Step 5: Centralized error handling with logging
    return await handleApiError(error, context);
  }
}
