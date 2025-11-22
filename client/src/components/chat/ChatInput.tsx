import { useState, FormEvent, ChangeEvent } from "react";
import { Box, TextField, Button, Paper, CircularProgress } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isStreaming: boolean;
}

export function ChatInput({ onSubmit, isStreaming }: ChatInputProps) {
  const [input, setInput] = useState("");

  const canSubmit = input.trim().length > 0 && !isStreaming;

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    onSubmit(input);
    setInput("");
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1 }}>
        <TextField
          fullWidth
          id="chat-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="What legal request do you have?"
          disabled={isStreaming}
          variant="outlined"
          size="small"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit}
          endIcon={isStreaming ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{ minWidth: 120 }}
        >
          {isStreaming ? "Thinking" : "Send"}
        </Button>
      </Box>
    </Paper>
  );
}
