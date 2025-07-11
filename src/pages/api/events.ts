import type { APIContext } from 'astro';
import {
  createEventSchemaRelaxed,
  getEventsQuerySchema,
} from '@/schemas/event.schema';
import { EventService } from '@/services/event.service';
import {
  handleApiError,
  parseJsonBody,
  handleServiceError,
  ApiErrors,
} from '@/middleware/error-handler';
import { ErrorLogService } from '@/services/error-log.service';
import type {
  CreateEventCommand,
  EventResponseDto,
  EventsListResponseDto,
  EventsQueryParams,
} from '@/types';

export const prerender = false;

/**
 * POST /api/events - Create a new event
 *
 * Creates a new event with complete event information including location, timing,
 * and proper date validation. Uses session-based authentication from middleware.
 *
 * @param context - Astro API context with request and locals
 * @returns Response with created event data or error
 */
export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let user: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let requestBody: any;

  try {
    // Step 1: Authentication verification using middleware-provided user
    user = locals.user;

    if (!user) {
      throw ApiErrors.unauthorized(
        'Authentication required. Please log in to create events.'
      );
    }

    // Step 2: Parse and validate request body
    requestBody = await parseJsonBody(request);

    const validationResult = createEventSchemaRelaxed.safeParse(requestBody);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: CreateEventCommand = validationResult.data;

    // Step 3: Business logic validation and event creation
    const eventService = new EventService(locals.supabase);

    try {
      const eventResponse: EventResponseDto = await eventService.createEvent(
        command,
        user.id
      );

      // Step 4: Success response
      return new Response(JSON.stringify(eventResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (serviceError: any) {
      // Step 5: Handle business logic errors using centralized error handler
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(
        request,
        user.id
      );
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
    return await handleApiError(error, context, user?.id, requestBody);
  }
}

/**
 * GET /api/events - List all events with filtering and pagination
 *
 * Provides public access to retrieve a paginated list of all events with advanced
 * filtering capabilities including DJ filtering, location-based search, date ranges,
 * and upcoming events filtering. Optimized for performance with proper indexing.
 *
 * @param context - Astro API context with request and locals
 * @returns Response with paginated event list or error
 */
export async function GET(context: APIContext): Promise<Response> {
  const { request, locals } = context;

  try {
    // Step 1: Parse and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());

    const validationResult = getEventsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw ApiErrors.validation(validationErrors);
    }

    // Transform validated params to match service expectations
    const validatedParams: EventsQueryParams = {
      user_id: validationResult.data.user_id,
      country: validationResult.data.country,
      city: validationResult.data.city,
      venue: validationResult.data.venue,
      date_from: validationResult.data.date_from,
      date_to: validationResult.data.date_to,
      upcoming_only: validationResult.data.upcoming_only,
      page: validationResult.data.page,
      limit: validationResult.data.limit,
    };

    // Step 2: Fetch events with filtering and pagination
    const eventService = new EventService(locals.supabase);

    try {
      const eventsResponse: EventsListResponseDto =
        await eventService.getEvents(validatedParams);

      // Step 3: Success response
      return new Response(JSON.stringify(eventsResponse), {
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
