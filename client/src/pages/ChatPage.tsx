import { Container, Typography } from "@mui/material";
import { useChat } from "../hooks";
import { MessageList, ChatInput } from "../components/chat";
import { ErrorDisplay } from "../components/ui";

export default function ChatPage() {
  const { messages, sendMessage, isStreaming, error, setError } = useChat();

  return (
    <Container maxWidth="md" sx={{ height: "100%", display: "flex", flexDirection: "column", py: 3 }}>
      {/* Header */}
      <Typography variant="h3" component="h1" gutterBottom sx={{ color: "text.primary" }}>
        Frontdoor
      </Typography>

      {/* Messages */}
      <MessageList messages={messages} isStreaming={isStreaming} />

      {/* Error Display */}
      {error && <ErrorDisplay error={error} onDismiss={() => setError(null)} />}

      {/* Input */}
      <ChatInput onSubmit={sendMessage} isStreaming={isStreaming} />
    </Container>
  );
}
