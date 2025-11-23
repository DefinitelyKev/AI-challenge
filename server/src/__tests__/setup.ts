import { beforeAll, afterAll } from 'vitest';

// Load environment variables for tests
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-api-key';
  process.env.OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  process.env.PORT = '8999';
});

afterAll(() => {
  // Cleanup if needed
});
