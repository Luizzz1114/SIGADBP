import { beforeEach, vi } from 'vitest';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:3000/api-sigadbp'
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  data: {},
  getItem: vi.fn((key) => localStorageMock.data[key] || null),
  setItem: vi.fn((key, value) => { localStorageMock.data[key] = value; }),
  removeItem: vi.fn((key) => { delete localStorageMock.data[key]; }),
  clear: vi.fn(() => { localStorageMock.data = {}; })
};

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Global test utilities
export const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.data = {};
});