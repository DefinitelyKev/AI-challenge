import { useState, FormEvent, ChangeEvent, KeyboardEvent } from "react";
import { Box, TextField, Button, Paper, CircularProgress } from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { colors } from "../../lib/theme";

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Submit on Enter (without Shift)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSubmit) {
        onSubmit(input);
        setInput("");
      }
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mt: 2,
        borderRadius: 2,
        backgroundColor: colors.alpha.cardDark,
        border: `1px solid ${colors.alpha.primary[20]}`,
        backdropFilter: "blur(8px)",
      }}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
        <TextField
          fullWidth
          id="chat-input"
          multiline
          maxRows={4}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Describe your legal request..."
          disabled={isStreaming}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={!canSubmit}
          endIcon={isStreaming ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
          sx={{
            minWidth: 120,
            height: 48,
            borderRadius: 2,
          }}
        >
          {isStreaming ? "Thinking" : "Send"}
        </Button>
      </Box>
    </Paper>
  );
}
