import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers";
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
    <QueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryProvider>
  </StrictMode>
);
