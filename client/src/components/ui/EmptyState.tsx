import { Box, Typography } from "@mui/material";

interface EmptyStateProps {
  message: string;
  action?: React.ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
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
      <Typography variant="body1" color="text.secondary" textAlign="center">
        {message}
      </Typography>
      {action && <Box>{action}</Box>}
    </Box>
  );
}
