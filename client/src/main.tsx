import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { QueryProvider } from "./providers";
import { theme } from "./lib/theme";
import { logger } from "./lib/logger";
import App from "./App";
import "./index.css";

// Log application initialization
logger.appInit({
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
});

const container = document.getElementById("root");

if (!container) {
  logger.error("Root element not found", new Error('Root element with id "root" not found'));
  throw new Error('Root element with id "root" not found');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryProvider>
        <App />
      </QueryProvider>
    </ThemeProvider>
  </StrictMode>
);
