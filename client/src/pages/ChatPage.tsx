import { Container, Typography, Box, Fade, IconButton, Tooltip, Chip } from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { MessageList, ChatInput } from "../components/chat";
import { ErrorDisplay } from "../components/ui";
import type { ChatMessage } from "../schemas";
import { colors, styleUtils } from "../lib/theme";

interface ChatPageProps {
  chatState: {
    messages: ChatMessage[];
    sendMessage: (content: string) => void;
    clearMessages: () => void;
    isStreaming: boolean;
    error: string | null;
    setError: (error: string | null) => void;
  };
}

const SUGGESTION_QUESTIONS = [
  "I need help with an employment contract review",
  "Question about intellectual property rights",
  "Need assistance with a vendor agreement",
  "Data privacy compliance inquiry",
];

export default function ChatPage({ chatState }: ChatPageProps) {
  const { messages, sendMessage, clearMessages, isStreaming, error, setError } = chatState;
  const showWelcome = messages.length === 0;

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        py: 3,
        overflow: "hidden",
      }}
    >
      {/* Header with Clear Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        {showWelcome ? (
          <Box sx={{ flex: 1 }} />
        ) : (
          <Typography variant="h6" sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </Typography>
        )}
        {messages.length > 0 && (
          <Tooltip title="Clear chat history">
            <IconButton
              onClick={clearMessages}
              disabled={isStreaming}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              <DeleteOutline />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Welcome Section */}
      {showWelcome && (
        <Fade in={showWelcome} timeout={600}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                ...styleUtils.gradientText,
                mb: 2,
              }}
            >
              Welcome to Legal Frontdoor
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 600, mx: "auto", mb: 4 }}>
              Describe your legal request and I'll help route it to the right team member.
            </Typography>

            {/* Suggestion Questions */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 600, mx: "auto" }}>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                Try asking:
              </Typography>
              {SUGGESTION_QUESTIONS.map((question, index) => (
                <Chip
                  key={index}
                  label={question}
                  onClick={() => handleSuggestionClick(question)}
                  disabled={isStreaming}
                  sx={{
                    py: 2.5,
                    px: 1,
                    height: "auto",
                    "& .MuiChip-label": {
                      whiteSpace: "normal",
                      textAlign: "left",
                      fontSize: "0.9rem",
                    },
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: colors.alpha.primary[12],
                      transform: "translateX(4px)",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        </Fade>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <MessageList messages={messages} isStreaming={isStreaming} />
      </Box>

      {/* Error Display */}
      {error && (
        <Box sx={{ mt: 2 }}>
          <ErrorDisplay error={error} onDismiss={() => setError(null)} />
        </Box>
      )}

      {/* Input - Fixed at bottom */}
      <Box sx={{ mt: 2 }}>
        <ChatInput onSubmit={sendMessage} isStreaming={isStreaming} />
      </Box>
    </Container>
  );
}
