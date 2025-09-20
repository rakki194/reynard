import { afterEach, beforeAll } from "vitest";
// import { cleanup } from "@solidjs/testing-library";

// Cleanup after each test case
afterEach(() => {
  // cleanup();
});

// Mock Monaco Editor for testing
beforeAll(() => {
  // Mock Monaco Editor
  (global as any).MonacoEnvironment = {
    getWorker: () => new Worker("data:text/javascript;base64," + btoa("self.postMessage({});")),
  };
});
