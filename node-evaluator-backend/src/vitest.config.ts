// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Crucial: You are testing a Node backend, not a browser
    include: ['**/*.{test,spec}.ts'],
    // If Supertest fails to import, you might need to bail out of threads
    pool: 'forks', 
  },
});