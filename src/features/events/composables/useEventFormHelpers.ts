/**
 * Event form helper utilities
 * Centralizes date handling and common form utilities
 */
export const useEventFormHelpers = () => {
  /**
   * Get minimum allowed date (today)
   */
  const getMinDate = (): Date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  /**
   * Get maximum allowed date (1 year from today)
   */
  const getMaxDate = (): Date => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate;
  };

  /**
   * Convert Date object to API-compatible string format (YYYY-MM-DD)
   */
  const formatDateForApi = (date: Date | string | null): string => {
    if (!date) return '';
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  /**
   * Convert string date to Date object for Calendar component
   */
  const parseDate = (dateString: string): Date => {
    return new Date(dateString + 'T00:00:00');
  };

  /**
   * Check if a date string represents a past event
   */
  const isPastDate = (dateString: string): boolean => {
    const eventDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  /**
   * Get initial form values based on mode and existing data
   */
  const getInitialValues = (mode: 'create' | 'edit', existingData?: any) => {
    if (mode === 'create') {
      return {
        event_name: '',
        country: '',
        city: '',
        venue_name: '',
        event_date: null,
        event_time: '',
      };
    }

    // Edit mode - return existing data with proper date conversion
    return {
      event_name: existingData?.event_name || '',
      country: existingData?.country || '',
      city: existingData?.city || '',
      venue_name: existingData?.venue_name || '',
      event_date: existingData?.event_date ? parseDate(existingData.event_date) : null,
      event_time: existingData?.event_time || '',
    };
  };

  return {
    getMinDate,
    getMaxDate,
    formatDateForApi,
    parseDate,
    isPastDate,
    getInitialValues,
  };
}; 