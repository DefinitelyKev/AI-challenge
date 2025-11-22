import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryProvider } from "./providers";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");

if (!container) {
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
