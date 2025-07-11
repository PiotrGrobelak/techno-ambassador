import {
  useErrorHandler,
  type ClientError,
} from '@/shared/composables/useErrorHandler';

/**
 * HTTP client wrapper with enhanced error handling for API integration
 * Provides type-safe methods for API calls with standardized error handling
 */
export function useApiClient() {
  const baseURL = '/api';
  const errorHandler = useErrorHandler();

  /**
   * Enhanced error handling for HTTP responses
   */
  async function handleResponse<T>(
    response: Response,
    endpoint: string
  ): Promise<T> {
    if (!response.ok) {
      // Parse the error using our error handler
      const clientError = await errorHandler.parseHttpError(response);

      // Create an Error object that includes the ClientError information
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as unknown as { clientError: ClientError }).clientError =
        clientError;
      (error as unknown as { endpoint: string }).endpoint = endpoint;

      throw error;
    }

    try {
      const data = await response.json();
      return data as T;
    } catch (parseError) {
      console.error(
        `Failed to parse JSON response for ${endpoint}:`,
        parseError
      );
      throw new Error(`Invalid JSON response from ${endpoint}`);
    }
  }

  /**
   * Enhanced GET request with centralized error handling
   * @param endpoint - API endpoint path
   * @returns Promise with typed response
   */
  async function get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return await handleResponse<T>(response, endpoint);
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced POST request with centralized error handling
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @returns Promise with typed response
   */
  async function post<T>(endpoint: string, body?: unknown): Promise<T> {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      return await handleResponse<T>(response, endpoint);
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced PUT request with centralized error handling
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @returns Promise with typed response
   */
  async function put<T>(endpoint: string, body?: unknown): Promise<T> {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
      });

      return await handleResponse<T>(response, endpoint);
    } catch (error) {
      console.error(`API PUT error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Enhanced DELETE request with centralized error handling
   * @param endpoint - API endpoint path
   * @returns Promise with typed response
   */
  async function del<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      return await handleResponse<T>(response, endpoint);
    } catch (error) {
      console.error(`API DELETE error for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Extract ClientError from API error if available
   * @param error - Error from API call
   * @returns ClientError if available, otherwise null
   */
  function getClientError(error: unknown): ClientError | null {
    return (error as { clientError: ClientError })?.clientError || null;
  }

  /**
   * Check if error is a specific type
   * @param error - Error to check
   * @param errorType - Error type to check for
   * @returns boolean indicating if error matches type
   */
  function isErrorType(error: unknown, errorType: string): boolean {
    const clientError = getClientError(error);
    return clientError?.type === errorType;
  }

  return {
    get,
    post,
    put,
    delete: del,
    getClientError,
    isErrorType,
    // Re-export error handler for convenience
    errorHandler,
  };
}
