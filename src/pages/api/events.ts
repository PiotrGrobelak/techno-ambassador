import type { APIContext } from 'astro';
import { createEventSchemaRelaxed, getEventsQuerySchema } from '@/schemas/event.schema';
import { EventService } from '@/services/event.service';
import { 
  handleApiError, 
  parseJsonBody, 
  handleServiceError,
  // verifyAuthentication,
  ApiErrors 
} from '@/middleware/error-handler';
import { ErrorLogService } from '@/services/error-log.service';
import type { 
  CreateEventCommand, 
  EventResponseDto, 
  EventsListResponseDto, 
  EventsQueryParams 
} from '@/types';
import { DEFAULT_USER_ID } from '@/db/supabase.client';

export const prerender = false

/**
 * POST /api/events - Create a new event (NO AUTH REQUIRED - FOR TESTING)
 * 
 * Creates a new event with complete event information including location, timing,
 * and proper date validation. Authentication disabled for testing purposes.
 * Uses a default user ID for all events.
 * 
 * @param context - Astro API context with request and locals
 * @returns Response with created event data or error
 */
export async function POST(context: APIContext): Promise<Response> {
  const { request, locals } = context;
  // let user: any;
  let requestBody: any;
  
  try {
    // Step 1: Authentication verification - DISABLED FOR TESTING
    // user = await verifyAuthentication(request, locals.supabase);
    
    // Use default user ID for testing (replace with actual user UUID from your database)
    const defaultUserId = DEFAULT_USER_ID;

    // Step 2: Parse and validate request body
    requestBody = await parseJsonBody(request);
    
    const validationResult = createEventSchemaRelaxed.safeParse(requestBody);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: CreateEventCommand = validationResult.data;

    // Step 3: Business logic validation and event creation
    const eventService = new EventService(locals.supabase);
    
    try {
      const eventResponse: EventResponseDto = await eventService.createEvent(command, defaultUserId);

      // Step 4: Success response
      return new Response(JSON.stringify(eventResponse), {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 5: Handle business logic errors using centralized error handler
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request, defaultUserId);
      const contextWithBody = ErrorLogService.addRequestBodyToContext(errorContext, requestBody);
      
      const apiError = await handleServiceError(serviceError, contextWithBody, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 6: Centralized error handling with logging
    return await handleApiError(error, context, "00000000-0000-0000-0000-000000000001", requestBody);
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
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
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
      limit: validationResult.data.limit
    };

    // Step 2: Fetch events with filtering and pagination
    const eventService = new EventService(locals.supabase);
    
    try {
      const eventsResponse: EventsListResponseDto = await eventService.getEvents(validatedParams);

      // Step 3: Success response
      return new Response(JSON.stringify(eventsResponse), {
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