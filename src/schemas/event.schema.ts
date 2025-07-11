import { z } from 'zod';

/**
 * Validation schema for date parameters
 * Used for event date validation and filtering
 */
export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date');

/**
 * Validation schema for time parameters (24-hour format)
 * Used for event time validation
 */
export const timeParamSchema = z
  .string()
  .regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    'Time must be in HH:MM format (24-hour)'
  )
  .optional();

/**
 * Validation schema for creating a new event - TESTING VERSION (NO DATE RESTRICTIONS)
 * Validates all required fields but removes date validation constraints for testing
 */
export const createEventSchemaNoValidation = z.object({
  event_name: z
    .string()
    .min(1, 'Event name is required')
    .max(10000, 'Event name must be less than 10,000 characters')
    .trim(),

  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),

  venue_name: z
    .string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be less than 200 characters')
    .trim(),

  event_date: dateParamSchema, // Only validates format, no date restrictions

  event_time: timeParamSchema,
});

/**
 * Validation schema for creating a new event - RELAXED VERSION (NO PAST DATES, NO ONE YEAR LIMIT)
 * Validates all required fields and rejects past dates but allows any future date
 */
export const createEventSchemaRelaxed = z.object({
  event_name: z
    .string()
    .min(1, 'Event name is required')
    .max(10000, 'Event name must be less than 10,000 characters')
    .trim(),

  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),

  venue_name: z
    .string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be less than 200 characters')
    .trim(),

  event_date: dateParamSchema.refine((date) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Event must be today or in the future (no past dates)
    return eventDate >= today;
  }, 'Event date must be today or in the future'),

  event_time: timeParamSchema,
});

/**
 * Validation schema for updating an event (PUT /api/events/{id})
 * All fields are required for complete replacement
 */
export const updateEventSchema = z.object({
  event_name: z
    .string()
    .min(1, 'Event name is required')
    .max(10000, 'Event name must be less than 10,000 characters')
    .trim(),

  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country must be less than 100 characters')
    .trim(),

  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be less than 100 characters')
    .trim(),

  venue_name: z
    .string()
    .min(1, 'Venue name is required')
    .max(200, 'Venue name must be less than 200 characters')
    .trim(),

  event_date: dateParamSchema.refine((date) => {
    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Event must be today or in the future
    return eventDate >= today;
  }, 'Event date must be today or in the future'),

  event_time: timeParamSchema,
});

/**
 * Validation schema for event ID path parameter
 * Used in GET, PUT, DELETE /api/events/{id}
 */
export const eventIdParamSchema = z.object({
  id: z.string().uuid('Invalid event ID format'),
});

/**
 * Validation schema for query parameters in GET /api/events
 * Includes filtering and pagination parameters
 */
export const getEventsQuerySchema = z
  .object({
    // User filtering
    user_id: z.string().uuid('Invalid user ID format').optional(),

    // Location filtering
    country: z
      .string()
      .max(100, 'Country filter must be less than 100 characters')
      .trim()
      .optional(),

    city: z
      .string()
      .max(100, 'City filter must be less than 100 characters')
      .trim()
      .optional(),

    venue: z
      .string()
      .max(200, 'Venue filter must be less than 200 characters')
      .trim()
      .optional(),

    // Date filtering
    date_from: dateParamSchema.optional(),
    date_to: dateParamSchema.optional(),

    // Upcoming events filter
    upcoming_only: z
      .string()
      .optional()
      .transform((val) => {
        if (!val) return false;
        return val.toLowerCase() === 'true';
      }),

    // Pagination
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val >= 1, 'Page must be a positive integer'),

    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine(
        (val) => val >= 1 && val <= 100,
        'Limit must be between 1 and 100'
      ),
  })
  .refine(
    (data) => {
      // Validate date range if both dates are provided
      if (data.date_from && data.date_to) {
        return new Date(data.date_from) <= new Date(data.date_to);
      }
      return true;
    },
    {
      message: 'date_from must be before or equal to date_to',
      path: ['date_from'],
    }
  );
