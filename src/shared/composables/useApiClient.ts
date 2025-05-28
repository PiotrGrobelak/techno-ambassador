/**
 * HTTP client wrapper with error handling for API integration
 * Provides type-safe methods for API calls with standardized error handling
 */
export function useApiClient() {
  const baseURL = '/api'

  /**
   * Generic GET request with type safety
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
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error(`API GET error for ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Generic POST request with type safety
   * @param endpoint - API endpoint path
   * @param body - Request body data
   * @returns Promise with typed response
   */
  async function post<T>(endpoint: string, body?: any): Promise<T> {
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data as T
    } catch (error) {
      console.error(`API POST error for ${endpoint}:`, error)
      throw error
    }
  }

  return {
    get,
    post
  }
} 