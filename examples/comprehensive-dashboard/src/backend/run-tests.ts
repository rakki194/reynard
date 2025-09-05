/**
 * Test runner for backend API tests
 *
 * This script starts the mock server once and runs all tests sequentially
 */

import { MockBackendServer } from "./mockServer";

async function runTests() {
  console.log("🚀 Starting Backend API Tests for Comprehensive Dashboard");

  // Start the mock server
  const server = new MockBackendServer(3003);
  await server.start();
  console.log("✅ Mock server started on port 3003");

  try {
    // Run tests sequentially
    console.log("\n📋 Running Authentication API Tests...");
    await import("./__tests__/auth.test");

    console.log("\n📋 Running Dashboard API Tests...");
    await import("./__tests__/dashboard.test");

    console.log("\n📋 Running Gallery API Tests...");
    await import("./__tests__/gallery.test");

    console.log("\n📋 Running Settings API Tests...");
    await import("./__tests__/settings.test");

    console.log("\n📋 Running Integration Tests...");
    await import("./__tests__/integration.test");

    console.log("\n✅ All backend tests completed successfully!");
  } catch (error) {
    console.error("❌ Test execution failed:", error);
    process.exit(1);
  } finally {
    // Stop the server
    await server.stop();
    console.log("🛑 Mock server stopped");
  }
}

// Run the tests
runTests().catch(console.error);
