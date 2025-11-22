import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/constants";
import { chatRequestSchema } from "../schemas";
import type { ChatRequest } from "../schemas";

/**
 * Chat service - Encapsulates all chat-related API operations
 */
export const chatService = {
  /**
   * Sends chat message and streams response
   *
   * @param messages - Array of chat messages (conversation history)
   * @returns ReadableStream for streaming response
   * @throws {Error} If validation fails or API request fails
   */
  async sendMessage(messages: ChatRequest["messages"]): Promise<ReadableStream<Uint8Array>> {
    // Validate request before sending
    const validatedRequest = chatRequestSchema.parse({ messages });

    // Send request via API client
    return apiClient.postStream(API_ENDPOINTS.CHAT, validatedRequest);
  },
};
