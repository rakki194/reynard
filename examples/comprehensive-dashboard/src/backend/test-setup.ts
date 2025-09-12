/**
 * Test setup for comprehensive dashboard backend
 *
 * @deprecated Use setupBackendTest from reynard-testing instead
 */

import { setupBackendTest } from "reynard-testing";

// Use unified backend test setup with custom port for comprehensive dashboard
setupBackendTest(15383);

// Re-export helpers for backward compatibility
export const apiRequest = (global as any).apiRequest;
export const getTestServer = (global as any).getTestServer;
