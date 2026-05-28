import { vi } from 'vitest';

// Mock JWT_SECRET for testing
process.env.JWT_SECRET = 'test-jwt-secret-for-testing-purposes';
process.env.PORT = 3001;

// Mock database pool
const mockQuery = vi.fn();
const mockConnect = vi.fn();

const mockClient = {
  query: mockQuery,
  release: vi.fn()
};

mockConnect.mockResolvedValue(mockClient);

// Store for test spies
export const mockPool = {
  query: mockQuery,
  connect: mockConnect,
  _mockClient: mockClient
};

export const resetMocks = () => {
  mockQuery.mockReset();
  mockConnect.mockReset();
  mockClient.query.mockReset();
  mockClient.release.mockReset();
};