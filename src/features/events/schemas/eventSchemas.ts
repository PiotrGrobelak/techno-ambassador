import { z } from 'zod';

// Base validation schemas
const eventNameSchema = z
  .string()
  .min(1, 'Event name is required')
  .max(100, 'Event name must be less than 100 characters')
  .trim();

const countrySchema = z
  .string()
  .min(1, 'Country is required')
  .max(50, 'Country must be less than 50 characters')
  .trim();

const citySchema = z
  .string()
  .min(1, 'City is required')
  .max(50, 'City must be less than 50 characters')
  .trim();

const venueNameSchema = z
  .string()
  .min(1, 'Venue name is required')
  .max(100, 'Venue name must be less than 100 characters')
  .trim();

// Accept Date objects by converting to YYYY-MM-DD string before validating
const eventDateSchema = z.preprocess(
  (val) => {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    return val;
  },
  z
    .string()
    .min(1, 'Event date is required')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')
    .refine((date) => {
      const eventDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today;
    }, 'Event date must be today or in the future')
    .refine((date) => {
      const eventDate = new Date(date);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      return eventDate <= oneYearFromNow;
    }, 'Event date must be within one year from today')
);

const eventTimeSchema = z
  .string()
  .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  .optional()
  .or(z.literal(''));

// Create event form schema
export const createEventSchema = z.object({
  event_name: eventNameSchema,
  country: countrySchema,
  city: citySchema,
  venue_name: venueNameSchema,
  event_date: eventDateSchema,
  event_time: eventTimeSchema,
});

// Update event form schema (identical to create)
export const updateEventSchema = createEventSchema;

// TypeScript types derived from schemas
export type CreateEventFormData = z.infer<typeof createEventSchema>;
export type UpdateEventFormData = z.infer<typeof updateEventSchema>;
