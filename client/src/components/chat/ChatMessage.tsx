import { Box, Typography, CircularProgress } from "@mui/material";
import { MESSAGE_ROLES } from "../../lib/constants";
import type { ChatMessage as ChatMessageType } from "../../schemas";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const isAssistant = message.role === MESSAGE_ROLES.ASSISTANT;

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        borderRadius: 1,
        backgroundColor: isUser ? "primary.main" : "background.default",
        color: isUser ? "primary.contrastText" : "text.primary",
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "80%",
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
        {isUser ? "You" : "Assistant"}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
        {message.content ||
          (isAssistant && isStreaming ? <CircularProgress size={16} sx={{ verticalAlign: "middle" }} /> : "")}
      </Typography>
    </Box>
  );
}
