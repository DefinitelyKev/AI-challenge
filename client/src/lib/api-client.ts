import { API_BASE_URL, HTTP_HEADERS } from "./constants";

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
   * Handles fetch response and error checking
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
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
    const response = await fetch(this.buildUrl(endpoint), {
      method: "GET",
    });

    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResponse>(response);
  }

  /**
   * PUT request
   */
  async put<TRequest, TResponse>(endpoint: string, body: TRequest): Promise<TResponse> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "PUT",
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify(body),
    });

    return this.handleResponse<TResponse>(response);
  }

  /**
   * DELETE request
   */
  async delete<TResponse>(endpoint: string): Promise<TResponse> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "DELETE",
    });

    return this.handleResponse<TResponse>(response);
  }

  /**
   * POST request with streaming response
   * Used for chat streaming feature
   *
   * @returns ReadableStream for processing chunks
   * @throws ApiError if response is not ok
   */
  async postStream<TRequest>(endpoint: string, body: TRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(this.buildUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": HTTP_HEADERS.CONTENT_TYPE_JSON,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    if (!response.body) {
      throw new Error("Response body is null - streaming not supported");
    }

    return response.body;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing/mocking
export { ApiClient };
