import { API_BASE_URL, HTTP_HEADERS } from "./constants";
import { logger } from "./logger";

/**
 * Custom error class for API errors
 * Provides structured error information
 */
export class ApiError extends Error {
  constructor(public status: number, public statusText: string, message?: string) {
    super(message || `HTTP Error ${status}: ${statusText}`);
    this.name = "ApiError";
  }
}

/**
 * API Client class - Singleton pattern
 * Handles all HTTP communication with the backend
 */
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Builds full URL from endpoint
   */
  private buildUrl(endpoint: string): string {
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handles fetch response and error checking with logging
   */
  private async handleResponse<T>(response: Response, method: string, endpoint: string, startTime: number): Promise<T> {
    const duration = performance.now() - startTime;

    // Log the request
    logger.apiRequest(method, endpoint, response.status, duration);

    if (!response.ok) {
      const error = new ApiError(response.status, response.statusText);
      logger.error("API request failed", error, {
        method,
        endpoint,
        statusCode: response.status,
        durationMs: duration,
      });
      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const startTime = performance.now();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
    });

    return this.handleResponse<T>(response, "GET", endpoint, startTime);
  }

  /**
   * POST request
   */
  async post<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
    const startTime = performance.now();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResponse>(response, "POST", endpoint, startTime);
  }

  /**
   * PUT request
   */
  async put<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
    const startTime = performance.now();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResponse>(response, "PUT", endpoint, startTime);
  }

  /**
   * DELETE request
   */
  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    const startTime = performance.now();
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
    });

    return this.handleResponse<TResponse>(response, "DELETE", endpoint, startTime);
  }

  /**
   * POST request with streaming response
   * Used for chat streaming feature
   */
  async postStream<TRequest>(endpoint: string, body: TRequest): Promise<ReadableStream<Uint8Array>> {
    const startTime = performance.now();

    logger.streamEvent("start", { endpoint });

    try {
      const response = await fetch(this.buildUrl(endpoint), {
        method: "POST",
        headers: {
          "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
        },
        body: JSON.stringify(body),
      });

      const duration = performance.now() - startTime;
      logger.apiRequest("POST", endpoint, response.status, duration, { streaming: true });

      if (!response.ok) {
        const error = new ApiError(response.status, response.statusText);
        logger.error("Stream request failed", error, {
          endpoint,
          statusCode: response.status,
          durationMs: duration,
        });
        throw error;
      }

      if (!response.body) {
        const error = new Error("Response body is null - streaming not supported");
        logger.error("Stream body is null", error, { endpoint });
        throw error;
      }

      return response.body;
    } catch (error) {
      logger.streamEvent("error", { endpoint, error: String(error) });
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/mocking
export { ApiClient };
