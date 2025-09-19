import { test, expect } from "@playwright/test";

const MOCK_API_SERVER_URL = "http://localhost:12526";

// Helper function to configure the mock API server
async function configureServer(page, config) {
  console.log("📋 Configuration:", config);
  const response = await page.evaluate(
    async (serverUrl, configData) => {
      const res = await fetch(`${serverUrl}/api/v1/control/configure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      });
      return res.json();
    },
    MOCK_API_SERVER_URL,
    config
  );
  console.log("🔄 Server configure:", response);
  return response;
}

// Helper function to reset the mock API server
async function resetServer(page) {
  const response = await page.evaluate(async serverUrl => {
    const res = await fetch(`${serverUrl}/api/v1/control/reset`, { method: "POST" });
    return res.json();
  }, MOCK_API_SERVER_URL);
  console.log("🔄 Server reset:", response);
  return response;
}

// Helper function to get server status
async function getServerStatus(page) {
  const response = await page.evaluate(async serverUrl => {
    const res = await fetch(`${serverUrl}/api/v1/control/status`);
    return res.json();
  }, MOCK_API_SERVER_URL);
  return response;
}

// Helper function to make rapid API calls
async function makeRapidApiCalls(page, count: number, delay: number = 0) {
  const results = await page.evaluate(
    async (serverUrl, numCalls, callDelay) => {
      const responses = [];
      for (let i = 0; i < numCalls; i++) {
        try {
          const startTime = Date.now();
          const response = await fetch(`${serverUrl}/api/v1/organizations`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const responseTime = Date.now() - startTime;

          responses.push({
            callNumber: i + 1,
            status: response.status,
            statusText: response.statusText,
            responseTime,
            success: response.ok,
          });

          if (callDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, callDelay));
          }
        } catch (error) {
          responses.push({
            callNumber: i + 1,
            status: 0,
            statusText: error.message,
            responseTime: 0,
            success: false,
          });
        }
      }
      return responses;
    },
    MOCK_API_SERVER_URL,
    count,
    delay
  );
  return results;
}

test.describe("🛡️ Backend Protection Mechanisms Demo", () => {
  test.beforeEach(async ({ page }) => {
    // Reset server state before each test
    await resetServer(page);
  });

  test("🚨 Rapid Request Detection - Blocks Infinite Loops", async ({ page }) => {
    console.log("\n🧪 Testing Rapid Request Detection...");

    // Configure server with aggressive rapid request detection
    await configureServer(page, {
      rapid_request_detection_enabled: true,
      rapid_request_threshold: 3, // Block after 3 requests in 1 second
      rapid_request_window: 1, // 1 second window
      rate_limiting_enabled: false, // Disable rate limiting to focus on rapid detection
      circuit_breaker_enabled: false,
    });

    // Make rapid API calls (simulating infinite loop)
    const results = await makeRapidApiCalls(page, 5, 0); // 5 calls with no delay

    console.log("📊 API Call Results:");
    results.forEach(result => {
      console.log(`  Call ${result.callNumber}: ${result.status} ${result.statusText} (${result.responseTime}ms)`);
    });

    // Check that some requests were blocked
    const blockedRequests = results.filter(r => r.status === 429);
    const successfulRequests = results.filter(r => r.success);

    expect(blockedRequests.length).toBeGreaterThan(0);
    expect(successfulRequests.length).toBeLessThan(5);

    // Get server status to verify protection was triggered
    const status = await getServerStatus(page);
    console.log("🛡️ Server Protection Status:", status.rapid_request_detection);

    expect(status.rapid_request_detection.status).toBe("triggered");
    expect(status.rapid_request_detection.current_requests).toBeGreaterThanOrEqual(3);
  });

  test("🔄 Request Pattern Detection - Blocks Identical Requests", async ({ page }) => {
    console.log("\n🧪 Testing Request Pattern Detection...");

    // Configure server with request pattern detection
    await configureServer(page, {
      request_pattern_detection_enabled: true,
      identical_request_threshold: 3, // Block after 3 identical requests
      cache_window: 5, // 5 second cache window
      rate_limiting_enabled: false,
      circuit_breaker_enabled: false,
      rapid_request_detection_enabled: false,
    });

    // Make identical requests (simulating infinite loop with same endpoint)
    const results = await makeRapidApiCalls(page, 5, 100); // 5 calls with 100ms delay

    console.log("📊 API Call Results:");
    results.forEach(result => {
      console.log(`  Call ${result.callNumber}: ${result.status} ${result.statusText} (${result.responseTime}ms)`);
    });

    // Check that some requests were blocked
    const blockedRequests = results.filter(r => r.status === 429);
    const successfulRequests = results.filter(r => r.success);

    expect(blockedRequests.length).toBeGreaterThan(0);
    expect(successfulRequests.length).toBeLessThan(5);

    // Get server status to verify protection was triggered
    const status = await getServerStatus(page);
    console.log("🛡️ Server Protection Status:", status.request_pattern_detection);

    expect(status.request_pattern_detection.current_cache_size).toBeGreaterThan(0);
  });

  test("⚡ Combined Protection - All Mechanisms Working Together", async ({ page }) => {
    console.log("\n🧪 Testing Combined Protection Mechanisms...");

    // Configure server with all protection mechanisms enabled
    await configureServer(page, {
      rate_limiting_enabled: true,
      rate_limit_requests: 3, // 3 requests per 10 seconds
      circuit_breaker_enabled: true,
      circuit_breaker_threshold: 2, // Circuit breaker after 2 failures
      rapid_request_detection_enabled: true,
      rapid_request_threshold: 2, // Block after 2 requests in 1 second
      request_pattern_detection_enabled: true,
      identical_request_threshold: 2, // Block after 2 identical requests
      failure_simulation_enabled: true,
      failure_rate: 0.3, // 30% failure rate to trigger circuit breaker
    });

    // Make multiple API calls to trigger different protection mechanisms
    const results = await makeRapidApiCalls(page, 8, 50); // 8 calls with 50ms delay

    console.log("📊 API Call Results:");
    results.forEach(result => {
      console.log(`  Call ${result.callNumber}: ${result.status} ${result.statusText} (${result.responseTime}ms)`);
    });

    // Analyze results
    const successfulRequests = results.filter(r => r.success);
    const rateLimitedRequests = results.filter(r => r.status === 429);
    const circuitBreakerRequests = results.filter(r => r.status === 503);
    const serverErrorRequests = results.filter(r => r.status >= 500);

    console.log(`📈 Results Summary:`);
    console.log(`  Successful: ${successfulRequests.length}`);
    console.log(`  Rate Limited (429): ${rateLimitedRequests.length}`);
    console.log(`  Circuit Breaker (503): ${circuitBreakerRequests.length}`);
    console.log(`  Server Errors (5xx): ${serverErrorRequests.length}`);

    // Verify that protection mechanisms were triggered
    expect(rateLimitedRequests.length + circuitBreakerRequests.length).toBeGreaterThan(0);

    // Get final server status
    const status = await getServerStatus(page);
    console.log("🛡️ Final Server Status:");
    console.log(`  Rate Limiting: ${status.rate_limiting.status}`);
    console.log(`  Circuit Breaker: ${status.circuit_breaker.status}`);
    console.log(`  Rapid Request Detection: ${status.rapid_request_detection.status}`);
    console.log(`  Request Pattern Detection: ${status.request_pattern_detection.current_cache_size} patterns cached`);
  });

  test("🔧 Protection Configuration - Dynamic Settings", async ({ page }) => {
    console.log("\n🧪 Testing Dynamic Protection Configuration...");

    // Start with all protections disabled
    await configureServer(page, {
      rate_limiting_enabled: false,
      circuit_breaker_enabled: false,
      rapid_request_detection_enabled: false,
      request_pattern_detection_enabled: false,
    });

    // Make requests - should all succeed
    const results1 = await makeRapidApiCalls(page, 5, 0);
    const successful1 = results1.filter(r => r.success);
    expect(successful1.length).toBe(5);
    console.log("✅ All requests succeeded with protections disabled");

    // Enable rapid request detection
    await configureServer(page, {
      rapid_request_detection_enabled: true,
      rapid_request_threshold: 2,
    });

    // Make rapid requests - should be blocked
    const results2 = await makeRapidApiCalls(page, 5, 0);
    const blocked2 = results2.filter(r => r.status === 429);
    expect(blocked2.length).toBeGreaterThan(0);
    console.log("🚨 Rapid requests blocked after enabling protection");

    // Reset and enable rate limiting
    await resetServer(page);
    await configureServer(page, {
      rate_limiting_enabled: true,
      rate_limit_requests: 2,
    });

    // Make requests - should hit rate limit
    const results3 = await makeRapidApiCalls(page, 5, 0);
    const rateLimited3 = results3.filter(r => r.status === 429);
    expect(rateLimited3.length).toBeGreaterThan(0);
    console.log("🚫 Rate limiting active and blocking requests");
  });

  test("📊 Protection Effectiveness Metrics", async ({ page }) => {
    console.log("\n🧪 Testing Protection Effectiveness Metrics...");

    // Configure server with moderate protection settings
    await configureServer(page, {
      rate_limiting_enabled: true,
      rate_limit_requests: 4,
      rapid_request_detection_enabled: true,
      rapid_request_threshold: 3,
      request_pattern_detection_enabled: true,
      identical_request_threshold: 3,
    });

    // Simulate a Cloudflare-style infinite loop scenario
    const results = await makeRapidApiCalls(page, 10, 0); // 10 rapid calls

    // Calculate effectiveness metrics
    const totalRequests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const blockedRequests = results.filter(r => r.status === 429).length;
    const protectionRate = (blockedRequests / totalRequests) * 100;
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalRequests;

    console.log("📊 Protection Effectiveness Metrics:");
    console.log(`  Total Requests: ${totalRequests}`);
    console.log(`  Successful: ${successfulRequests}`);
    console.log(`  Blocked: ${blockedRequests}`);
    console.log(`  Protection Rate: ${protectionRate.toFixed(1)}%`);
    console.log(`  Average Response Time: ${averageResponseTime.toFixed(1)}ms`);

    // Verify protection was effective
    expect(protectionRate).toBeGreaterThan(0);
    expect(blockedRequests).toBeGreaterThan(0);

    // Get server status for additional metrics
    const status = await getServerStatus(page);
    console.log("🛡️ Server Protection Metrics:");
    console.log(`  Rate Limiting Status: ${status.rate_limiting.status}`);
    console.log(`  Rapid Request Status: ${status.rapid_request_detection.status}`);
    console.log(`  Request Patterns Cached: ${status.request_pattern_detection.current_cache_size}`);
  });
});
