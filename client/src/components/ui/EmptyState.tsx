import { Box, Typography, Fade } from "@mui/material";
import { Inbox } from "@mui/icons-material";

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <Fade in timeout={600}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          py: 8,
        }}
      >
        <Inbox
          sx={{
            fontSize: 64,
            color: "text.disabled",
            opacity: 0.3,
            mb: 1,
          }}
        />
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
          {message}
        </Typography>
        {action && <Box sx={{ mt: 1 }}>{action}</Box>}
      </Box>
    </Fade>
  );
}
