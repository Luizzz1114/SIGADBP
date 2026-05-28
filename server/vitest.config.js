import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**/*.js', 'src/middlewares/**/*.js'],
      exclude: ['src/index.js', 'src/config/**', 'src/tests/**']
    },
    setupFiles: ['./tests/setup.js'],
    testTimeout: 10000,
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});