export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8999";

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  CHAT: "/api/chat",
  CONFIG: "/api/config",
  RULES: "/api/config/rules",
} as const;

/**
 * Message roles
 */
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

/**
 * HTTP Methods
 */
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
} as const;

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE_JSON: "application/json",
} as const;
