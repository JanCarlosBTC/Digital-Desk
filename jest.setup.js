// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock global fetch
global.fetch = jest.fn();

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
});