import { useState, useCallback } from "react";
import { chatService } from "../services";
import { MESSAGE_ROLES } from "../lib/constants";
import { logger } from "../lib/logger";
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
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sends a message and streams the response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      const userText = content.trim();

      if (!userText || isStreaming) {
        logger.debug("Send message ignored", {
          reason: !userText ? "empty input" : "already streaming",
        });
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

      logger.userInteraction("send_message", "chat_input", {
        messageCount: conversation.length,
        messageLength: userText.length,
      });

      const streamStartTime = performance.now();

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
            const streamDuration = performance.now() - streamStartTime;
            logger.streamEvent("complete", {
              chunkCount,
              responseLength: assistantText.length,
              durationMs: streamDuration,
            });
            break;
          }

          if (value) {
            chunkCount++;
            const chunk = decoder.decode(value, { stream: true });
            assistantText += chunk;

            if (chunkCount === 1) {
              logger.streamEvent("chunk", { firstChunk: true });
            }

            // Update assistant message with accumulated text
            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantText } : msg))
            );
          }
        }

        // Finalize decoding
        assistantText += decoder.decode();

        // Final update to ensure all text is captured
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantText } : msg))
        );

        logger.performance("chat_stream_total", performance.now() - streamStartTime);
      } catch (caughtError) {
        const errorMessage = caughtError instanceof Error ? caughtError.message : "Something went wrong";
        logger.error("Chat message failed", caughtError, {
          messageCount: conversation.length,
        });
        setError(errorMessage);

        // Remove assistant message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== assistantMessage.id));
      } finally {
        setIsStreaming(false);
      }
    },
    [messages, isStreaming]
  );

  /**
   * Clears all messages and resets state
   */
  const clearMessages = useCallback(() => {
    logger.userInteraction("clear_messages", "chat_page");
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
