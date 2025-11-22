import { useEffect, useRef } from "react";
import { Paper } from "@mui/material";
import { ChatMessage } from "./ChatMessage";
import { EmptyState } from "../ui";
import type { ChatMessage as ChatMessageType } from "../../schemas";

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

  return (
    <Paper
      elevation={2}
      sx={{
        flex: 1,
        mb: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        backgroundColor: "background.paper",
      }}
    >
      {messages.length === 0 ? (
        <EmptyState message="No messages yet... Make a request!" />
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} isStreaming={isStreaming} />
          ))}
          {/* Auto-scroll anchor */}
          <div ref={messagesEndRef} />
        </>
      )}
    </Paper>
  );
}
