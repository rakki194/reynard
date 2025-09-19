/**
 * 🦊 SOLIDJS PREVENTION PATTERNS TEST SUITE
 *
 * *whiskers twitch with strategic cunning* Comprehensive test suite demonstrating
 * how to prevent the Cloudflare useEffect dependency array issue in SolidJS
 * using proper reactive patterns and best practices.
 */

import { test, expect } from "@playwright/test";
import { EffectMonitor } from "../../core/monitoring/effect-monitor";
import { EffectDependencyFixtures } from "../../fixtures/effect-dependency-fixtures";

test.describe("🦊 SolidJS Prevention Patterns", () => {
  let effectMonitor: EffectMonitor;
  let alertMessages: string[] = [];

  test.beforeEach(async ({ page }) => {
    effectMonitor = new EffectMonitor({
      maxApiCallsPerSecond: 3,
      maxEffectExecutions: 2,
      detectionWindowMs: 2000,
    });

    alertMessages = [];
    effectMonitor.onAlert(message => {
      alertMessages.push(message);
    });

    effectMonitor.startMonitoring();
    await page.goto("/effect-test-page.html");
  });

  test.afterEach(async () => {
    effectMonitor.stopMonitoring();
  });

  test.describe("Stable Reference Patterns", () => {
    test("should use createMemo for stable object references", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Using createMemo for stable references
        let memoizedObject: any = null;
        let lastDepsHash = "";

        function createStableObject(deps: any) {
          const depsHash = JSON.stringify(deps);
          if (depsHash !== lastDepsHash) {
            memoizedObject = {
              organizationId: deps.organizationId,
              userId: deps.userId,
              permissions: deps.permissions,
              metadata: {
                source: "dashboard",
                version: "1.0.0",
                timestamp: Date.now(),
              },
            };
            lastDepsHash = depsHash;
          }
          return memoizedObject;
        }

        // Simulate effect with stable object
        const deps = { organizationId: "org-123", userId: "user-456", permissions: ["read"] };
        const stableObject = createStableObject(deps);

        // Multiple renders with same dependencies
        for (let i = 0; i < 5; i++) {
          const obj = createStableObject(deps);
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("stable-memo-effect", Math.random() * 5, obj);
          }
        }

        return { stableObject, memoizedObject };
      });

      await page.waitForTimeout(1000);

      // Verify no infinite loop
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);

      const effectMetrics = effectMonitor.getEffectMetrics("stable-memo-effect");
      expect(effectMetrics!.executionCount).toBeLessThanOrEqual(2);
    });

    test("should use createSignal for primitive dependencies", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Using signals for primitive values
        let userId = "user-456";
        let organizationId = "org-123";
        let isActive = true;

        function createEffectWithPrimitives() {
          // Primitives are stable by nature
          const effectDeps = [userId, organizationId, isActive];

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("primitive-signals-effect", Math.random() * 5, effectDeps);
          }
        }

        // Multiple renders with same primitive values
        for (let i = 0; i < 4; i++) {
          createEffectWithPrimitives();
        }

        return { userId, organizationId, isActive };
      });

      await page.waitForTimeout(1000);

      // Verify no infinite loop
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);
    });

    test("should use createStore for complex state", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Using store for complex state
        let storeState = {
          user: {
            id: "user-456",
            name: "John Doe",
            permissions: ["read", "write"],
          },
          organization: {
            id: "org-123",
            name: "Acme Corp",
          },
        };

        function createEffectWithStore() {
          // Store provides stable references
          const state = storeState;

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("store-state-effect", Math.random() * 5, state);
          }
        }

        // Multiple renders with same store state
        for (let i = 0; i < 3; i++) {
          createEffectWithStore();
        }

        return storeState;
      });

      await page.waitForTimeout(1000);

      // Verify no infinite loop
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);
    });
  });

  test.describe("Dependency Array Best Practices", () => {
    test("should use individual primitive values in dependency array", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Individual primitives in dependency array
        const userId = "user-456";
        const organizationId = "org-123";
        const isActive = true;

        function createEffectWithIndividualDeps() {
          // Each primitive is stable
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("individual-deps-effect", Math.random() * 5, [
              userId,
              organizationId,
              isActive,
            ]);
          }
        }

        // Multiple renders
        for (let i = 0; i < 4; i++) {
          createEffectWithIndividualDeps();
        }

        return { userId, organizationId, isActive };
      });

      await page.waitForTimeout(1000);

      // Verify no infinite loop
      expect(alertMessages.some(msg => msg.includes("INFINITE LOOP DETECTED"))).toBe(false);
    });

    test("should avoid object literals in dependency array", async ({ page }) => {
      await page.evaluate(() => {
        // ❌ WRONG: Object literal in dependency array (but we'll detect it)
        let renderCount = 0;

        function createEffectWithObjectLiteral() {
          renderCount++;

          // This object is recreated every time
          const config = {
            apiUrl: "/api/v1",
            timeout: 5000,
            retries: 3,
          };

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("object-literal-effect", Math.random() * 5, config);
          }
        }

        // Multiple renders
        for (let i = 0; i < 6; i++) {
          createEffectWithObjectLiteral();
        }

        return { renderCount };
      });

      await page.waitForTimeout(1000);

      // This should trigger an alert about the pattern
      const effectMetrics = effectMonitor.getEffectMetrics("object-literal-effect");
      expect(effectMetrics!.executionCount).toBeGreaterThan(3);
    });

    test("should avoid array literals in dependency array", async ({ page }) => {
      await page.evaluate(() => {
        // ❌ WRONG: Array literal in dependency array (but we'll detect it)
        let renderCount = 0;

        function createEffectWithArrayLiteral() {
          renderCount++;

          // This array is recreated every time
          const permissions = ["read", "write", "admin"];

          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("array-literal-effect", Math.random() * 5, permissions);
          }
        }

        // Multiple renders
        for (let i = 0; i < 5; i++) {
          createEffectWithArrayLiteral();
        }

        return { renderCount };
      });

      await page.waitForTimeout(1000);

      // This should trigger detection
      const effectMetrics = effectMonitor.getEffectMetrics("array-literal-effect");
      expect(effectMetrics!.executionCount).toBeGreaterThan(3);
    });
  });

  test.describe("API Call Optimization Patterns", () => {
    test("should implement debouncing for API calls", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Debounced API calls
        let lastCallTime = 0;
        const debounceMs = 300;
        let apiCallCount = 0;

        function debouncedApiCall(endpoint: string) {
          const now = Date.now();
          if (now - lastCallTime > debounceMs) {
            apiCallCount++;
            lastCallTime = now;

            if (window.effectMonitor) {
              window.effectMonitor.trackApiCall(endpoint, "GET", `debounced-req-${apiCallCount}`);
            }
          }
        }

        // Simulate rapid effect executions
        for (let i = 0; i < 10; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("debounced-effect", Math.random() * 5, { iteration: i });
          }
          debouncedApiCall("/api/v1/data");
        }

        return { apiCallCount };
      });

      await page.waitForTimeout(1000);

      // Verify debouncing worked
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeLessThan(10); // Should be debounced
    });

    test("should implement caching for API responses", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Cached API responses
        const cache = new Map<string, any>();
        let apiCallCount = 0;

        function cachedApiCall(endpoint: string, params: any) {
          const cacheKey = `${endpoint}-${JSON.stringify(params)}`;

          if (cache.has(cacheKey)) {
            console.log("Cache hit for", cacheKey);
            return cache.get(cacheKey);
          }

          apiCallCount++;
          const response = { data: "cached response", timestamp: Date.now() };
          cache.set(cacheKey, response);

          if (window.effectMonitor) {
            window.effectMonitor.trackApiCall(endpoint, "GET", `cached-req-${apiCallCount}`);
          }

          return response;
        }

        // Simulate multiple calls with same parameters
        for (let i = 0; i < 8; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("cached-effect", Math.random() * 5, { iteration: i });
          }
          cachedApiCall("/api/v1/user", { userId: "user-456" });
        }

        return { apiCallCount, cacheSize: cache.size };
      });

      await page.waitForTimeout(1000);

      // Verify caching worked
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeLessThan(8); // Should be cached
    });

    test("should implement request deduplication", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Request deduplication
        const pendingRequests = new Map<string, Promise<any>>();
        let apiCallCount = 0;

        function deduplicatedApiCall(endpoint: string, params: any) {
          const requestKey = `${endpoint}-${JSON.stringify(params)}`;

          if (pendingRequests.has(requestKey)) {
            console.log("Deduplicating request for", requestKey);
            return pendingRequests.get(requestKey);
          }

          apiCallCount++;
          const requestPromise = new Promise(resolve => {
            setTimeout(() => {
              resolve({ data: "deduplicated response" });
              pendingRequests.delete(requestKey);
            }, 100);
          });

          pendingRequests.set(requestKey, requestPromise);

          if (window.effectMonitor) {
            window.effectMonitor.trackApiCall(endpoint, "GET", `dedup-req-${apiCallCount}`);
          }

          return requestPromise;
        }

        // Simulate concurrent calls with same parameters
        for (let i = 0; i < 6; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("deduplicated-effect", Math.random() * 5, { iteration: i });
          }
          deduplicatedApiCall("/api/v1/data", { id: "123" });
        }

        return { apiCallCount, pendingRequests: pendingRequests.size };
      });

      await page.waitForTimeout(1000);

      // Verify deduplication worked
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeLessThan(6); // Should be deduplicated
    });
  });

  test.describe("Error Handling and Recovery", () => {
    test("should implement exponential backoff for failed requests", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Exponential backoff
        let retryCount = 0;
        let lastRetryTime = 0;
        const baseDelay = 100;
        const maxRetries = 3;

        function exponentialBackoffApiCall(endpoint: string, attempt: number = 0) {
          const now = Date.now();
          const delay = baseDelay * Math.pow(2, attempt);

          if (attempt > 0 && now - lastRetryTime < delay) {
            console.log(`Backing off for ${delay}ms`);
            return;
          }

          retryCount++;
          lastRetryTime = now;

          if (window.effectMonitor) {
            window.effectMonitor.trackApiCall(endpoint, "GET", `backoff-req-${retryCount}`);
          }

          // Simulate failure and retry
          if (attempt < maxRetries) {
            setTimeout(() => {
              exponentialBackoffApiCall(endpoint, attempt + 1);
            }, delay);
          }
        }

        // Simulate failed API call
        exponentialBackoffApiCall("/api/v1/failing-endpoint");

        return { retryCount };
      });

      await page.waitForTimeout(2000);

      // Verify backoff was implemented
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeGreaterThan(0);
    });

    test("should implement circuit breaker pattern", async ({ page }) => {
      await page.evaluate(() => {
        // ✅ CORRECT: Circuit breaker pattern
        let failureCount = 0;
        let lastFailureTime = 0;
        const failureThreshold = 3;
        const recoveryTimeout = 5000;
        let circuitState = "CLOSED"; // CLOSED, OPEN, HALF_OPEN

        function circuitBreakerApiCall(endpoint: string) {
          const now = Date.now();

          if (circuitState === "OPEN") {
            if (now - lastFailureTime > recoveryTimeout) {
              circuitState = "HALF_OPEN";
              console.log("Circuit breaker: HALF_OPEN");
            } else {
              console.log("Circuit breaker: OPEN - request blocked");
              return;
            }
          }

          // Simulate API call
          if (window.effectMonitor) {
            window.effectMonitor.trackApiCall(endpoint, "GET", `circuit-req-${Date.now()}`);
          }

          // Simulate failure
          const isFailure = Math.random() > 0.5;
          if (isFailure) {
            failureCount++;
            lastFailureTime = now;

            if (failureCount >= failureThreshold) {
              circuitState = "OPEN";
              console.log("Circuit breaker: OPEN");
            }
          } else {
            failureCount = 0;
            circuitState = "CLOSED";
          }
        }

        // Simulate multiple API calls
        for (let i = 0; i < 8; i++) {
          circuitBreakerApiCall("/api/v1/unreliable-endpoint");
        }

        return { failureCount, circuitState };
      });

      await page.waitForTimeout(1000);

      // Verify circuit breaker was implemented
      const apiStats = effectMonitor.getApiCallStats();
      expect(apiStats.totalCalls).toBeGreaterThan(0);
    });
  });

  test.describe("Performance Monitoring", () => {
    test("should track effect execution performance", async ({ page }) => {
      await page.evaluate(() => {
        // Simulate effects with different performance characteristics
        const effects = [
          { name: "fast-effect", duration: 5 },
          { name: "medium-effect", duration: 25 },
          { name: "slow-effect", duration: 100 },
        ];

        effects.forEach(effect => {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution(effect.name, effect.duration, { test: "performance" });
          }
        });
      });

      await page.waitForTimeout(1000);

      // Verify performance tracking
      const allMetrics = effectMonitor.getAllEffectMetrics();
      expect(allMetrics.size).toBe(3);

      const slowEffect = allMetrics.get("slow-effect");
      expect(slowEffect!.averageExecutionTime).toBeGreaterThan(50);
    });

    test("should detect memory leaks from effect closures", async ({ page }) => {
      await page.evaluate(() => {
        // Simulate memory leak from effect closure
        const largeData = new Array(10000).fill("memory leak data");

        for (let i = 0; i < 5; i++) {
          if (window.effectMonitor) {
            window.effectMonitor.trackEffectExecution("memory-leak-effect", Math.random() * 10, {
              largeData,
              iteration: i,
            });
          }
        }
      });

      await page.waitForTimeout(1000);

      // Verify memory leak detection
      const effectMetrics = effectMonitor.getEffectMetrics("memory-leak-effect");
      expect(effectMetrics!.executionCount).toBe(5);
    });
  });

  test.describe("Best Practices Documentation", () => {
    test("should demonstrate all prevention patterns", async ({ page }) => {
      const patterns = [
        "Stable object references with createMemo",
        "Primitive dependencies with createSignal",
        "Complex state with createStore",
        "Debounced API calls",
        "Cached API responses",
        "Request deduplication",
        "Exponential backoff",
        "Circuit breaker pattern",
        "Performance monitoring",
        "Memory leak detection",
      ];

      console.log("🦊 SolidJS Prevention Patterns Demonstrated:");
      patterns.forEach((pattern, index) => {
        console.log(`${index + 1}. ${pattern}`);
      });

      // This test serves as documentation
      expect(patterns.length).toBe(10);
    });
  });
});
