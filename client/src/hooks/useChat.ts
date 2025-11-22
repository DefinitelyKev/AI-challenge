import { useState, useCallback } from "react";
import { chatService } from "../services";
import { MESSAGE_ROLES } from "../lib/constants";
import type { ChatMessage } from "../schemas";

/**
 * Creates a new chat message with a unique ID
 */
const createMessage = (role: ChatMessage["role"], content: string): ChatMessage => ({
  id: crypto.randomUUID(),
  role,
  content,
});

/**
 * useChat - Manages chat state and streaming functionality
 *
 * @returns Chat state and actions
 *
 * Usage:
 * const { messages, sendMessage, isStreaming, error } = useChat();
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sends a message and streams the response
   *
   * @param content - User message content
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const userText = content.trim();

      if (!userText || isStreaming) {
        console.log("[useChat] Ignoring send - empty input or already streaming");
        return;
      }

      // Create user and assistant messages
      const userMessage = createMessage(MESSAGE_ROLES.USER, userText);
      const assistantMessage = createMessage(MESSAGE_ROLES.ASSISTANT, "");

      // Add messages to state optimistically
      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setError(null);
      setIsStreaming(true);

      // Build conversation payload
      const conversation = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      console.log("[useChat] Sending", conversation.length, "messages to server");

      try {
        // Get streaming response from service
        const stream = await chatService.sendMessage(conversation);

        // Process stream
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";
        let chunkCount = 0;

        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            console.log("[useChat] Stream done, received", chunkCount, "chunks");
            break;
          }

          if (value) {
            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            assistantText += chunk;

            if (chunkCount === 1) {
              console.log("[useChat] First chunk received");
            }

            // Update assistant message with accumulated text
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantText } : msg))
            );
          }
        }

        // Finalize decoding
        assistantText += decoder.decode();
        console.log("[useChat] Final text length:", assistantText.length);

        // Final update to ensure all text is captured
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantText } : msg))
        );
      } catch (caughtError) {
        const errorMessage = caughtError instanceof Error ? caughtError.message : "Something went wrong";
        console.error("[useChat] Error:", caughtError);
        setError(errorMessage);

        // Remove assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id));
      } finally {
        console.log("[useChat] Cleaning up");
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  /**
   * Clears all messages and resets state
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
    isStreaming,
    error,
    setError,
  };
}
