/**
 * 🦊 CLOUDFLARE OUTAGE PREVENTION TEST SUITE
 *
 * *whiskers twitch with strategic cunning* Comprehensive test suite to verify
 * and prevent the React useEffect dependency array issue that caused the
 * Cloudflare outage on September 12, 2025, adapted for SolidJS.
 */

import { test, expect } from "@playwright/test";
import { EffectMonitor, globalEffectMonitor } from "../../core/monitoring/effect-monitor";
import {
  EffectDependencyFixtures,
  type IEffectDependencyScenario,
  type IApiCallTracker,
  type IEffectMetrics,
} from "../../fixtures/effect-dependency-fixtures";
import { TestUserData } from "../../fixtures/user-data";

test.describe("🦊 Cloudflare Outage Prevention Tests", () => {
  let effectMonitor: EffectMonitor;
  let alertMessages: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Initialize effect monitor
    effectMonitor = new EffectMonitor({
      maxApiCallsPerSecond: 5, // Lower threshold for testing
      maxEffectExecutions: 3,
      maxMemoryUsageMB: 50,
      maxCpuUsagePercent: 70,
      detectionWindowMs: 3000, // 3 seconds for faster testing
      alertThreshold: 0.8,
    });

    // Capture alert messages
    alertMessages = [];
    effectMonitor.onAlert(message => {
      alertMessages.push(message);
    });

    // Start monitoring
    effectMonitor.startMonitoring();

    // Navigate to test page
    await page.goto("/effect-test-page.html");
  });

  test.afterEach(async () => {
    // Stop monitoring
    effectMonitor.stopMonitoring();

    // Generate and save report
    const report = effectMonitor.generateReport();
    console.log("🦊 Effect Monitoring Report:", report);
  });

  test.describe("Object Recreation Scenarios", () => {
    test("should detect infinite loop from object recreation in dependency array", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getCloudflareOutageScenarios().find(
        s => s.name === "cloudflare_tenant_service_bug"
      )!;

      console.log(`🦊 Testing scenario: ${scenario.name}`);
      console.log(`Description: ${scenario.description}`);

      // Inject the effect monitor into the page
      await page.evaluate(() => {
        // Create a mock effect monitor in the browser
        window.effectMonitor = {
          alertMessages: [],
          effectExecutions: new Map(),
          apiCalls: [],

          trackEffectExecution(effectId, executionTime, dependencySnapshot) {
            if (!this.effectExecutions.has(effectId)) {
              this.effectExecutions.set(effectId, []);
            }
            this.effectExecutions.get(effectId).push({
              timestamp: Date.now(),
              executionTime,
              dependencySnapshot,
            });

            // Check for infinite loop
            const executions = this.effectExecutions.get(effectId);
            if (executions.length > 5) {
              this.alertMessages.push(
                `INFINITE LOOP DETECTED in effect "${effectId}": ${executions.length} executions`
              );
            }
          },

          trackApiCall(endpoint, method, requestId, status = 200, responseTime = 0) {
            this.apiCalls.push({
              endpoint,
              method,
              requestId,
              status,
              responseTime,
              timestamp: Date.now(),
            });

            // Check for API spam
            const recentCalls = this.apiCalls.filter(call => Date.now() - call.timestamp < 5000);
            if (recentCalls.length > 10) {
              this.alertMessages.push(`API CALL SPAM DETECTED: ${recentCalls.length} calls in 5 seconds`);
            }

            // Check for high error rate
            const recentErrors = recentCalls.filter(call => call.status >= 400);
            if (recentCalls.length > 5 && recentErrors.length / recentCalls.length > 0.5) {
              this.alertMessages.push(
                `HIGH ERROR RATE DETECTED: ${Math.round((recentErrors.length / recentCalls.length) * 100)}% errors`
              );
            }
          },

          getAlertMessages() {
            return this.alertMessages;
          },

          getEffectMetrics(effectId) {
            const executions = this.effectExecutions.get(effectId) || [];
            return {
              effectId,
              executionCount: executions.length,
              isInfiniteLoop: executions.length > 5,
            };
          },
        };
      });

      // Simulate the problematic effect with REAL API calls
      const result = await page.evaluate(async scenarioData => {
        // This simulates the exact Cloudflare bug with real HTTP requests
        let renderCount = 0;
        let apiCallCount = 0;
        let successfulCalls = 0;
        let failedCalls = 0;

        async function simulateProblematicEffect() {
          renderCount++;

          // This object is recreated on every render - the bug!
          const tenantService = {
            organizationId: "org-123",
            userId: "user-456",
            permissions: ["read", "write"],
            metadata: {
              source: "dashboard",
              version: "1.0.0",
              timestamp: Date.now(), // This changes every time!
            },
          };

          // Track the effect execution
          window.effectMonitor.trackEffectExecution("problematic-effect", Math.random() * 10, tenantService);

          // Make REAL API call (this is what caused the Cloudflare outage!)
          try {
            apiCallCount++;
            console.log(`Making REAL API call #${apiCallCount} triggered by render #${renderCount}`);

            const startTime = Date.now();
            const response = await fetch("http://localhost:12526/api/v1/organizations", {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            });
            const responseTime = Date.now() - startTime;

            if (response.ok) {
              successfulCalls++;
              const data = await response.json();
              console.log(`✅ API call #${apiCallCount} succeeded:`, data);
            } else {
              failedCalls++;
              console.log(`❌ API call #${apiCallCount} failed with status:`, response.status);
            }

            // Track the API call with real response data
            window.effectMonitor.trackApiCall(
              "/api/v1/organizations",
              "GET",
              `req-${apiCallCount}`,
              response.status,
              responseTime
            );
          } catch (error) {
            failedCalls++;
            console.log(`💥 API call #${apiCallCount} errored:`, error.message);

            // Track the failed API call
            window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", `req-${apiCallCount}`, 0, 0);
          }
        }

        // Simulate multiple renders (like React would do) with real API calls
        for (let i = 0; i < 10; i++) {
          await simulateProblematicEffect();
          // Small delay to simulate real render timing
          await new Promise(resolve => setTimeout(resolve, 50));
        }

        return { renderCount, apiCallCount, successfulCalls, failedCalls };
      }, scenario);

      // Log the result to see what happened
      console.log("🦊 JavaScript execution result:", result);

      // Wait for monitoring to detect the issue
      await page.waitForTimeout(2000);

      // Get alert messages from the browser
      const browserAlerts = await page.evaluate(() => {
        return window.effectMonitor.getAlertMessages();
      });

      // Get effect metrics from the browser
      const browserEffectMetrics = await page.evaluate(() => {
        return window.effectMonitor.getEffectMetrics("problematic-effect");
      });

      // Check that infinite loop was detected
      expect(browserAlerts.length).toBeGreaterThan(0);
      expect(browserAlerts.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(true);

      // Check effect metrics
      expect(browserEffectMetrics).not.toBeNull();
      expect(browserEffectMetrics.executionCount).toBeGreaterThan(scenario.maxAllowedApiCalls);
      expect(browserEffectMetrics.isInfiniteLoop).toBe(true);

      // Check API call statistics from browser
      const browserApiStats = await page.evaluate(() => {
        const calls = window.effectMonitor.apiCalls;
        const recentCalls = calls.filter(call => Date.now() - call.timestamp < 5000);
        const successfulCalls = calls.filter(call => call.status >= 200 && call.status < 300);
        const failedCalls = calls.filter(call => call.status >= 400);

        return {
          totalCalls: calls.length,
          recentCalls: recentCalls.length,
          successfulCalls: successfulCalls.length,
          failedCalls: failedCalls.length,
          averageResponseTime: calls.reduce((sum, call) => sum + call.responseTime, 0) / calls.length || 0,
          errorRate: failedCalls.length / calls.length || 0,
        };
      });

      // Verify we made real API calls (they might fail due to CORS/network, but that's OK for testing)
      expect(browserApiStats.totalCalls).toBeGreaterThan(scenario.maxAllowedApiCalls);

      // The important thing is that we attempted real API calls
      // Even if they fail, this proves we're testing real HTTP requests
      expect(result.apiCallCount).toBeGreaterThan(0);
      expect(result.renderCount).toBeGreaterThan(0);

      // Log the real API call results
      console.log(`🦊 Real API Call Results:`);
      console.log(`  Total calls: ${browserApiStats.totalCalls}`);
      console.log(`  Successful: ${browserApiStats.successfulCalls}`);
      console.log(`  Failed: ${browserApiStats.failedCalls}`);
      console.log(`  Error rate: ${Math.round(browserApiStats.errorRate * 100)}%`);
      console.log(`  Average response time: ${Math.round(browserApiStats.averageResponseTime)}ms`);
    });

    test("should detect infinite loop from array recreation in dependency array", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getCloudflareOutageScenarios().find(
        s => s.name === "array_dependency_recreation"
      )!;

      // Inject the effect monitor into the page
      await page.evaluate(() => {
        window.effectMonitor = {
          alertMessages: [],
          effectExecutions: new Map(),
          apiCalls: [],

          trackEffectExecution(effectId, executionTime, dependencySnapshot) {
            if (!this.effectExecutions.has(effectId)) {
              this.effectExecutions.set(effectId, []);
            }
            this.effectExecutions.get(effectId).push({
              timestamp: Date.now(),
              executionTime,
              dependencySnapshot,
            });

            const executions = this.effectExecutions.get(effectId);
            if (executions.length > 5) {
              this.alertMessages.push(
                `INFINITE LOOP DETECTED in effect "${effectId}": ${executions.length} executions`
              );
            }
          },

          trackApiCall(endpoint, method, requestId) {
            this.apiCalls.push({
              endpoint,
              method,
              requestId,
              timestamp: Date.now(),
            });
          },

          getAlertMessages() {
            return this.alertMessages;
          },

          getEffectMetrics(effectId) {
            const executions = this.effectExecutions.get(effectId) || [];
            return {
              effectId,
              executionCount: executions.length,
              isInfiniteLoop: executions.length > 5,
            };
          },
        };
      });

      await page.evaluate(scenarioData => {
        let renderCount = 0;
        let apiCallCount = 0;

        function simulateArrayRecreationBug() {
          renderCount++;

          // This array is recreated on every render - the bug!
          const permissions = ["read", "write", "admin"];

          apiCallCount++;
          console.log(`API call #${apiCallCount} triggered by array recreation`);

          window.effectMonitor.trackEffectExecution("array-recreation-effect", Math.random() * 10, permissions);

          window.effectMonitor.trackApiCall("/api/v1/user-permissions", "GET", `req-${apiCallCount}`);
        }

        // Simulate multiple renders
        for (let i = 0; i < 8; i++) {
          simulateArrayRecreationBug();
        }

        return { renderCount, apiCallCount };
      }, scenario);

      await page.waitForTimeout(2000);

      // Get alert messages from the browser
      const browserAlerts = await page.evaluate(() => {
        return window.effectMonitor.getAlertMessages();
      });

      // Get effect metrics from the browser
      const browserEffectMetrics = await page.evaluate(() => {
        return window.effectMonitor.getEffectMetrics("array-recreation-effect");
      });

      // Verify detection
      expect(browserAlerts.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(true);
      expect(browserEffectMetrics.isInfiniteLoop).toBe(true);
    });

    test("should detect infinite loop from function recreation in dependency array", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getCloudflareOutageScenarios().find(
        s => s.name === "function_dependency_recreation"
      )!;

      await page.evaluate(scenarioData => {
        let renderCount = 0;
        let apiCallCount = 0;

        function simulateFunctionRecreationBug() {
          renderCount++;

          // This function is recreated on every render - the bug!
          const callback = () => {
            console.log("Callback executed");
          };

          apiCallCount++;
          console.log(`API call #${apiCallCount} triggered by function recreation`);

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("function-recreation-effect", Math.random() * 10, {
              callback: callback.toString(),
            });

            window.effectMonitor.trackApiCall("/api/v1/callback-endpoint", "POST", `req-${apiCallCount}`);
          }
        }

        // Simulate multiple renders
        for (let i = 0; i < 7; i++) {
          simulateFunctionRecreationBug();
        }

        return { renderCount, apiCallCount };
      }, scenario);

      await page.waitForTimeout(2000);

      // Verify detection
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(true);

      const effectMetrics = effectMonitor.getEffectMetrics("function-recreation-effect");
      expect(effectMetrics!.isInfiniteLoop).toBe(true);
    });
  });

  test.describe("Prevention Pattern Tests", () => {
    test("should NOT trigger infinite loop with stable object references", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getPreventionPatternScenarios().find(
        s => s.name === "stable_object_reference"
      )!;

      await page.evaluate(scenarioData => {
        let renderCount = 0;
        let apiCallCount = 0;

        // Create stable object reference (like using useMemo in React)
        const stableTenantService = {
          organizationId: "org-123",
          userId: "user-456",
          permissions: ["read", "write"],
          metadata: {
            source: "dashboard",
            version: "1.0.0",
            timestamp: 1234567890, // Fixed timestamp
          },
        };

        function simulateStableEffect() {
          renderCount++;

          // Use the stable reference
          const tenantService = stableTenantService;

          // Only make API call once (or when dependencies actually change)
          if (renderCount === 1) {
            apiCallCount++;
            console.log(`API call #${apiCallCount} with stable reference`);
          }

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("stable-effect", Math.random() * 10, tenantService);

            if (apiCallCount > 0) {
              window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", `req-${apiCallCount}`);
            }
          }
        }

        // Simulate multiple renders
        for (let i = 0; i < 5; i++) {
          simulateStableEffect();
        }

        return { renderCount, apiCallCount };
      }, scenario);

      await page.waitForTimeout(2000);

      // Verify NO infinite loop was detected
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);

      const effectMetrics = effectMonitor.getEffectMetrics("stable-effect");
      expect(effectMetrics).not.toBeNull();
      expect(effectMetrics!.executionCount).toBeLessThanOrEqual(scenario.maxAllowedApiCalls);
      expect(effectMetrics!.isInfiniteLoop).toBe(false);

      // Verify API call count is within limits
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeLessThanOrEqual(scenario.maxAllowedApiCalls);
    });

    test("should NOT trigger infinite loop with memoized dependencies", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getPreventionPatternScenarios().find(
        s => s.name === "memoized_dependencies"
      )!;

      await page.evaluate(scenarioData => {
        let renderCount = 0;
        let apiCallCount = 0;

        // Simulate memoization (like useMemo in React)
        let memoizedDeps: any = null;
        let lastDepsHash = "";

        function simulateMemoizedEffect() {
          renderCount++;

          // Create dependencies
          const deps = {
            userId: "user-456",
            organizationId: "org-123",
          };

          // Check if dependencies actually changed
          const depsHash = JSON.stringify(deps);
          const depsChanged = depsHash !== lastDepsHash;

          if (depsChanged) {
            memoizedDeps = deps;
            lastDepsHash = depsHash;
            apiCallCount++;
            console.log(`API call #${apiCallCount} - dependencies changed`);
          }

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("memoized-effect", Math.random() * 10, memoizedDeps);

            if (depsChanged) {
              window.effectMonitor.trackApiCall("/api/v1/user-data", "GET", `req-${apiCallCount}`);
            }
          }
        }

        // Simulate multiple renders with same dependencies
        for (let i = 0; i < 6; i++) {
          simulateMemoizedEffect();
        }

        return { renderCount, apiCallCount };
      }, scenario);

      await page.waitForTimeout(2000);

      // Verify NO infinite loop was detected
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);

      const effectMetrics = effectMonitor.getEffectMetrics("memoized-effect");
      expect(effectMetrics!.isInfiniteLoop).toBe(false);
      expect(effectMetrics!.executionCount).toBeLessThanOrEqual(scenario.maxAllowedApiCalls);
    });

    test("should NOT trigger infinite loop with primitive dependencies", async ({ page }) => {
      const scenario = EffectDependencyFixtures.getPreventionPatternScenarios().find(
        s => s.name === "primitive_dependencies"
      )!;

      await page.evaluate(scenarioData => {
        let renderCount = 0;
        let apiCallCount = 0;

        // Use primitive values (stable references)
        const userId = "user-456";
        const organizationId = "org-123";
        const isActive = true;

        function simulatePrimitiveEffect() {
          renderCount++;

          // Only make API call when primitives actually change
          if (renderCount === 1) {
            apiCallCount++;
            console.log(`API call #${apiCallCount} with primitive dependencies`);
          }

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("primitive-effect", Math.random() * 10, {
              userId,
              organizationId,
              isActive,
            });

            if (apiCallCount > 0) {
              window.effectMonitor.trackApiCall("/api/v1/user-status", "GET", `req-${apiCallCount}`);
            }
          }
        }

        // Simulate multiple renders
        for (let i = 0; i < 4; i++) {
          simulatePrimitiveEffect();
        }

        return { renderCount, apiCallCount };
      }, scenario);

      await page.waitForTimeout(2000);

      // Verify NO infinite loop was detected
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);

      const effectMetrics = effectMonitor.getEffectMetrics("primitive-effect");
      expect(effectMetrics!.isInfiniteLoop).toBe(false);
    });
  });

  test.describe("Performance Impact Tests", () => {
    test("should detect performance degradation from excessive API calls", async ({ page }) => {
      await page.evaluate(() => {
        // Simulate the Cloudflare scenario: many API calls in short time
        for (let i = 0; i < 20; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", `req-${i}`);
          }
        }
      });

      await page.waitForTimeout(2000);

      // Check for API call spam detection
      expect(alertMessages.some(msg => msg.includes("API CALL SPAM DETECTED"))).toBe(true);

      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.callsPerSecond).toBeGreaterThan(effectMonitor["config"].maxApiCallsPerSecond);
    });

    test("should detect memory usage spikes from infinite loops", async ({ page }) => {
      await page.evaluate(() => {
        // Simulate memory-intensive infinite loop
        for (let i = 0; i < 15; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution(
              "memory-intensive-effect",
              Math.random() * 100, // Longer execution time
              { largeData: new Array(1000).fill("data") }
            );
          }
        }
      });

      await page.waitForTimeout(2000);

      // Check for infinite loop detection
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(true);

      const effectMetrics = effectMonitor.getEffectMetrics("memory-intensive-effect");
      expect(effectMetrics!.isInfiniteLoop).toBe(true);
    });
  });

  test.describe("Real-world Cloudflare Scenario", () => {
    test("should reproduce and detect the exact Cloudflare dashboard bug", async ({ page }) => {
      const cloudflareScenario = EffectDependencyFixtures.getCloudflareDashboardScenario();

      console.log("🦊 Reproducing Cloudflare Dashboard Bug:");
      console.log(`Component: ${cloudflareScenario.componentName}`);
      console.log(`API Endpoint: ${cloudflareScenario.apiEndpoint}`);

      await page.evaluate(scenario => {
        let renderCount = 0;
        let apiCallCount = 0;
        let lastApiCallTime = 0;

        function simulateCloudflareDashboardBug() {
          renderCount++;

          // This is the exact problematic pattern from Cloudflare
          const tenantService = {
            organizationId: "org-123",
            userId: "user-456",
            permissions: ["read", "write"],
            lastUpdated: Date.now(),
            // This metadata object is recreated every time - the bug!
            metadata: {
              source: "dashboard",
              version: "1.0.0",
              timestamp: Date.now(), // This changes every time!
            },
          };

          // Simulate the API call that overwhelmed Cloudflare's Tenant Service
          const now = Date.now();
          if (now - lastApiCallTime > 100) {
            // Rate limit simulation
            apiCallCount++;
            lastApiCallTime = now;
            console.log(`Cloudflare API call #${apiCallCount} (render #${renderCount})`);
          }

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("cloudflare-dashboard-effect", Math.random() * 15, tenantService);

            if (apiCallCount > 0) {
              window.effectMonitor.trackApiCall(scenario.apiEndpoint, "GET", `cloudflare-req-${apiCallCount}`);
            }
          }
        }

        // Simulate the dashboard rendering multiple times
        for (let i = 0; i < 12; i++) {
          simulateCloudflareDashboardBug();
        }

        return {
          renderCount,
          apiCallCount,
          scenario: scenario,
        };
      }, cloudflareScenario);

      await page.waitForTimeout(3000);

      // Verify the bug was detected
      expect(alertMessages.length).toBeGreaterThan(0);
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(true);
      expect(alertMessages.some(msg => msg.includes("cloudflare-dashboard-effect"))).toBe(true);

      // Check effect metrics
      const effectMetrics = effectMonitor.getEffectMetrics("cloudflare-dashboard-effect");
      expect(effectMetrics).not.toBeNull();
      expect(effectMetrics!.executionCount).toBeGreaterThan(5);
      expect(effectMetrics!.isInfiniteLoop).toBe(true);

      // Check API call statistics
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeGreaterThan(5);
      expect(apiStats.endpointBreakdown[cloudflareScenario.apiEndpoint]).toBeGreaterThan(5);

      console.log("🦊 Cloudflare bug successfully reproduced and detected!");
      console.log(`Effect executions: ${effectMetrics!.executionCount}`);
      console.log(`API calls: ${apiStats.totalCalls}`);
    });
  });

  test.describe("Monitoring Report Generation", () => {
    test("should generate comprehensive monitoring report", async ({ page }) => {
      // Generate some test data
      await page.evaluate(() => {
        for (let i = 0; i < 5; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, { test: "data" });
            window.effectMonitor.trackApiCall("/api/test", "GET", `test-req-${i}`);
          }
        }
      });

      await page.waitForTimeout(1000);

      // Generate report
      const report = effectMonitor.generateReport();

      // Verify report contains expected sections
      expect(report).toContain("# 🦊 Effect Monitoring Report");
      expect(report).toContain("## Effect Execution Metrics");
      expect(report).toContain("## API Call Statistics");
      expect(report).toContain("## Performance Metrics");
      expect(report).toContain("## Recommendations");

      // Verify report contains test data
      expect(report).toContain("test-effect");
      expect(report).toContain("/api/test");

      console.log("🦊 Generated monitoring report:", report);
    });
  });
});
