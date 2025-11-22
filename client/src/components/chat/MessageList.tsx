import { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "../../schemas";
import { colors, styleUtils } from "../../lib/theme";

interface MessageListProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
}

export function MessageList({ messages, isStreaming }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        borderRadius: 2,
        backgroundColor: colors.alpha.messageContainer,
        border: `1px solid ${colors.alpha.primary[8]}`,
        ...styleUtils.scrollbar,
      }}
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />
      ))}
      {/* Auto-scroll anchor */}
      <div ref={messagesEndRef} />
    </Box>
  );
}
