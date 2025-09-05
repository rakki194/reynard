/**
 * Test setup for backend API testing
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { MockBackendServer } from './mockServer';

// Global test server instance
let testServer: MockBackendServer | null = null;

// Helper function to get or create test server
const getOrCreateTestServer = async (): Promise<MockBackendServer> => {
  if (!testServer) {
    testServer = new MockBackendServer(3003); // Use different port for tests
    await testServer.start();
    (global as any).testServer = testServer;
  }
  return testServer;
};

beforeAll(async () => {
  // Start the mock server for testing
  await getOrCreateTestServer();
}, 30000); // 30 second timeout

afterAll(async () => {
  // Stop the mock server after all tests
  if (testServer) {
    await testServer.stop();
    testServer = null;
  }
}, 10000); // 10 second timeout

beforeEach(async () => {
  // Clear data before each test to ensure isolation
  const server = await getOrCreateTestServer();
  server.clearData();
});

// Helper function to make API requests
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const url = `http://localhost:3003/api${endpoint}`;
  return fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
};

// Helper function to get test server instance
export const getTestServer = async (): Promise<MockBackendServer> => {
  return await getOrCreateTestServer();
};
