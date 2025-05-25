import type { APIContext } from 'astro';
import { eventIdParamSchema, updateEventSchema } from '../../../schemas/event.schema';
import { EventService } from '../../../services/event.service';
import { 
  handleApiError, 
  parseJsonBody, 
  handleServiceError,
  // verifyAuthentication,
  ApiErrors 
} from '../../../middleware/error-handler';
import { ErrorLogService } from '../../../services/error-log.service';
import type { 
  UpdateEventCommand, 
  EventResponseDto, 
  EventListItemDto 
} from '../../../types';

export const prerender = false

/**
 * GET /api/events/{id} - Retrieve specific event details
 * 
 * Provides public access to retrieve detailed information about a specific event.
 * Returns comprehensive event data including complete location information, timing
 * details, and associated DJ information.
 * 
 * @param context - Astro API context with request, params, and locals
 * @returns Response with detailed event data or error
 */
export async function GET(context: APIContext): Promise<Response> {
  const { request, params, locals } = context;
  
  try {
    // Step 1: Validate path parameters
    const paramValidation = eventIdParamSchema.safeParse(params);
    
    if (!paramValidation.success) {
      const validationErrors = paramValidation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const { id: eventId } = paramValidation.data;

    // Step 2: Fetch detailed event data
    const eventService = new EventService(locals.supabase);
    
    try {
      const eventData: EventListItemDto = await eventService.getEventById(eventId);

      // Step 3: Success response
      return new Response(JSON.stringify({ data: eventData }), {
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
 * PUT /api/events/{id} - Update event (NO AUTH REQUIRED - FOR TESTING)
 * 
 * Allows updating any event. Authentication and ownership verification disabled
 * for testing purposes. Handles complete event updates with validation.
 * 
 * @param context - Astro API context with request, params, and locals
 * @returns Response with updated event data or error
 */
export async function PUT(context: APIContext): Promise<Response> {
  const { request, params, locals } = context;
  // let user: any;
  let requestBody: any;
  
  try {
    // Step 1: Authentication verification - DISABLED FOR TESTING
    // user = await verifyAuthentication(request, locals.supabase);
    
    // Use default user ID for testing
    const defaultUserId = "00000000-0000-0000-0000-000000000001";

    // Step 2: Validate path parameters
    const paramValidation = eventIdParamSchema.safeParse(params);
    
    if (!paramValidation.success) {
      const validationErrors = paramValidation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const { id: eventId } = paramValidation.data;

    // Step 3: Parse and validate request body
    requestBody = await parseJsonBody(request);
    
    const validationResult = updateEventSchema.safeParse(requestBody);
    
    if (!validationResult.success) {
      const validationErrors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const command: UpdateEventCommand = validationResult.data;

    // Step 4: Business logic validation and event update
    const eventService = new EventService(locals.supabase);
    
    try {
      const eventResponse: EventResponseDto = await eventService.updateEventNoAuth(
        eventId, 
        command
      );

      // Step 5: Success response
      return new Response(JSON.stringify(eventResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 6: Handle business logic errors
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request, defaultUserId);
      const contextWithBody = ErrorLogService.addRequestBodyToContext(errorContext, requestBody);
      
      const apiError = await handleServiceError(serviceError, contextWithBody, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 7: Centralized error handling with logging
    return await handleApiError(error, context, "00000000-0000-0000-0000-000000000001", requestBody);
  }
}

/**
 * DELETE /api/events/{id} - Delete event (NO AUTH REQUIRED - FOR TESTING)
 * 
 * Allows deleting any event. Authentication and ownership verification disabled
 * for testing purposes. Maintains basic validation for event existence.
 * 
 * @param context - Astro API context with request, params, and locals
 * @returns Response with success message or error
 */
export async function DELETE(context: APIContext): Promise<Response> {
  const { request, params, locals } = context;
  // let user: any;
  
  try {
    // Step 1: Authentication verification - DISABLED FOR TESTING
    // user = await verifyAuthentication(request, locals.supabase);
    
    // Use default user ID for testing
    const defaultUserId = "00000000-0000-0000-0000-000000000001";

    // Step 2: Validate path parameters
    const paramValidation = eventIdParamSchema.safeParse(params);
    
    if (!paramValidation.success) {
      const validationErrors = paramValidation.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));

      throw ApiErrors.validation(validationErrors);
    }

    const { id: eventId } = paramValidation.data;

    // Step 3: Business logic validation and event deletion
    const eventService = new EventService(locals.supabase);
    
    try {
      await eventService.deleteEventNoAuth(eventId);

      // Step 4: Success response
      return new Response(JSON.stringify({ message: 'Event successfully deleted' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (serviceError: any) {
      // Step 5: Handle business logic errors
      const errorLogService = new ErrorLogService(locals.supabase);
      const errorContext = ErrorLogService.createContextFromRequest(request, defaultUserId);
      
      const apiError = await handleServiceError(serviceError, errorContext, errorLogService);
      throw apiError;
    }

  } catch (error: any) {
    // Step 6: Centralized error handling with logging
    return await handleApiError(error, context, "00000000-0000-0000-0000-000000000001");
  }
} 