import { Box, Typography, CircularProgress, Avatar, Fade } from "@mui/material";
import { Person, SmartToy } from "@mui/icons-material";
import { MESSAGE_ROLES } from "../../lib/constants";
import type { ChatMessage as ChatMessageType } from "../../schemas";
import { colors } from "../../lib/theme";

interface ChatMessageProps {
  message: ChatMessageType;
  isStreaming: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const isAssistant = message.role === MESSAGE_ROLES.ASSISTANT;

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
        }}
      >
        {/* Avatar */}
        <Avatar
          sx={{
            bgcolor: isUser ? "primary.main" : "background.paper",
            border: isUser ? "none" : "1.5px solid",
            borderColor: "divider",
            width: 40,
            height: 40,
          }}
        >
          {isUser ? <Person /> : <SmartToy />}
        </Avatar>

        {/* Message Content */}
        <Box
          sx={{
            flex: 1,
            maxWidth: "75%",
            p: 2.5,
            borderRadius: 2,
            backgroundColor: isUser ? "primary.main" : colors.alpha.cardLight,
            color: isUser ? "primary.contrastText" : "text.primary",
            border: isUser ? "none" : `1px solid ${colors.alpha.primary[15]}`,
            boxShadow: isUser ? `0 2px 8px ${colors.alpha.primary[25]}` : "0 2px 8px rgba(0, 0, 0, 0.15)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: isUser ? `0 4px 12px ${colors.alpha.primary[35]}` : `0 4px 12px ${colors.alpha.primary[15]}`,
              borderColor: isUser ? "none" : colors.alpha.primary[25],
            },
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              display: "block",
              mb: 1,
              opacity: 0.7,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              fontSize: "0.7rem",
            }}
          >
            {isUser ? "You" : "Assistant"}
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {message.content ||
              (isAssistant && isStreaming ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" sx={{ fontStyle: "italic", opacity: 0.7 }}>
                    Thinking...
                  </Typography>
                </Box>
              ) : (
                ""
              ))}
          </Typography>
        </Box>
      </Box>
    </Fade>
  );
}
