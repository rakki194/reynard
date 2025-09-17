/**
 * Mock Server Factory for E2E Testing
 *
 * Provides factory functions for creating mock backend server instances.
 */

import { MockBackendServer } from "./mock-backend-server";

/**
 * Create a mock backend server instance
 */
export async function createMockBackendServer(port: number = 8000): Promise<MockBackendServer> {
  const server = new MockBackendServer({
    port,
    baseUrl: `http://localhost:${port}`,
    debug: true,
  });

  await server.start();
  return server;
}
