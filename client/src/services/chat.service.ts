import { apiClient } from "../lib/api-client";
import { API_ENDPOINTS } from "../lib/constants";
import { chatRequestSchema } from "../schemas";
import type { ChatRequest } from "../schemas";

/**
 * Chat service
 */
export const chatService = {
  /**
   * Sends chat message and streams response
   */
  async sendMessage(messages: ChatRequest["messages"]): Promise<ReadableStream<Uint8Array>> {
    // Validate request before sending
    const validatedRequest = chatRequestSchema.parse({ messages });

    // Send request via API client
    return apiClient.postStream(API_ENDPOINTS.CHAT, validatedRequest);
  },
};
