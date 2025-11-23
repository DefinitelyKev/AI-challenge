import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiClient, ApiError } from '../lib/api-client';

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

// Mock logger
vi.mock('../lib/logger', () => ({
  logger: {
    apiRequest: vi.fn(),
    error: vi.fn(),
    streamEvent: vi.fn(),
  },
}));

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('get', () => {
    it('should make a GET request', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      });

      const result = await apiClient.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).toEqual(mockData);
    });

    it('should throw ApiError on failed request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });
  });

  describe('post', () => {
    it('should make a POST request with body', async () => {
      const requestBody = { name: 'Test' };
      const mockResponse = { id: 1, ...requestBody };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/test', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('put', () => {
    it('should make a PUT request with body', async () => {
      const requestBody = { id: 1, name: 'Updated' };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => requestBody,
      });

      const result = await apiClient.put('/test/1', requestBody);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })
      );
      expect(result).toEqual(requestBody);
    });
  });

  describe('delete', () => {
    it('should make a DELETE request', async () => {
      const mockResponse = { success: true };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.delete('/test/1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/test/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow('Network error');
    });

    it('should handle non-JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(apiClient.get('/test')).rejects.toThrow('Invalid JSON');
    });
  });
});
