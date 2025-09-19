import { test, expect } from "@playwright/test";

interface TestResult {
  scenario: string;
  configuration: any;
  metrics: {
    renderCount: number;
    apiCalls: number;
    successfulCalls: number;
    failedCalls: number;
    rateLimitedCalls: number;
    circuitBreakerCalls: number;
    averageResponseTime: number;
    errorRate: number;
    infiniteLoopDetected: boolean;
  };
  backendStatus: any;
}

test.describe("🔬 Empirical Analysis: Cloudflare Outage Prevention", () => {
  let testResults: TestResult[] = [];

  // Helper function to configure the mock API server
  async function configureServer(page: any, config: any) {
    const response = await page.evaluate(async (configData: any) => {
      return await fetch("http://localhost:12526/api/v1/control/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
      }).then(r => r.json());
    }, config);

    console.log(`🔧 Server configured:`, response);
    return response;
  }

  // Helper function to reset the mock API server
  async function resetServer(page: any) {
    const response = await page.evaluate(async () => {
      return await fetch("http://localhost:12526/api/v1/control/reset", {
        method: "GET",
      }).then(r => r.json());
    });

    console.log(`🔄 Server reset:`, response);
    return response;
  }

  // Helper function to get server status
  async function getServerStatus(page: any) {
    const response = await page.evaluate(async () => {
      return await fetch("http://localhost:12526/api/v1/control/status", {
        method: "GET",
      }).then(r => r.json());
    });

    return response;
  }

  // Helper function to run a test scenario
  async function runScenario(page: any, scenarioName: string, config: any, effectCode: string) {
    console.log(`\n🧪 Running scenario: ${scenarioName}`);
    console.log(`📋 Configuration:`, config);

    // Reset server state
    await resetServer(page);

    // Configure server
    await configureServer(page, config);

    // Inject effect monitor
    await page.evaluate(() => {
      window.effectMonitor = {
        alertMessages: [],
        effectExecutions: new Map(),
        apiCalls: [],
        trackEffectExecution(effectId: string, executionTime: number, dependencies: any) {
          if (!this.effectExecutions.has(effectId)) {
            this.effectExecutions.set(effectId, []);
          }
          this.effectExecutions.get(effectId)?.push({
            timestamp: Date.now(),
            executionTime,
            dependencies,
          });
          const executions = this.effectExecutions.get(effectId)!;
          if (executions.length > 5) {
            this.alertMessages.push(`INFINITE LOOP DETECTED in effect "${effectId}": ${executions.length} executions`);
          }
        },
        trackApiCall(endpoint: string, method: string, requestId: string, status = 200, responseTime = 0) {
          this.apiCalls.push({
            endpoint,
            method,
            requestId,
            status,
            responseTime,
            timestamp: Date.now(),
          });
        },
        getAlertMessages() {
          return this.alertMessages;
        },
        getEffectMetrics(effectId: string) {
          const executions = this.effectExecutions.get(effectId);
          if (!executions || executions.length === 0) return null;
          const executionCount = executions.length;
          const isInfiniteLoop = executionCount > 5;
          return { executionCount, isInfiniteLoop };
        },
      };
    });

    // Execute the effect code
    const result = await page.evaluate(async (code: string) => {
      let renderCount = 0;
      let apiCallCount = 0;
      let successfulCalls = 0;
      let failedCalls = 0;
      let rateLimitedCalls = 0;
      let circuitBreakerCalls = 0;
      let totalResponseTime = 0;

      // Execute the provided effect code
      eval(code);

      return {
        renderCount,
        apiCallCount,
        successfulCalls,
        failedCalls,
        rateLimitedCalls,
        circuitBreakerCalls,
        totalResponseTime,
      };
    }, effectCode);

    // Wait for monitoring to complete
    await page.waitForTimeout(2000);

    // Get monitoring results
    const browserAlerts = await page.evaluate(() => {
      return window.effectMonitor.getAlertMessages();
    });

    const browserEffectMetrics = await page.evaluate(() => {
      return window.effectMonitor.getEffectMetrics("test-effect");
    });

    const browserApiStats = await page.evaluate(() => {
      const calls = window.effectMonitor.apiCalls;
      const successfulCalls = calls.filter(call => call.status >= 200 && call.status < 300);
      const failedCalls = calls.filter(call => call.status >= 400);
      const rateLimitedCalls = calls.filter(call => call.status === 429);
      const circuitBreakerCalls = calls.filter(call => call.status === 503);

      return {
        totalCalls: calls.length,
        successfulCalls: successfulCalls.length,
        failedCalls: failedCalls.length,
        rateLimitedCalls: rateLimitedCalls.length,
        circuitBreakerCalls: circuitBreakerCalls.length,
        averageResponseTime: calls.reduce((sum, call) => sum + call.responseTime, 0) / calls.length || 0,
        errorRate: failedCalls.length / calls.length || 0,
      };
    });

    // Get final server status
    const backendStatus = await getServerStatus(page);

    const testResult: TestResult = {
      scenario: scenarioName,
      configuration: config,
      metrics: {
        renderCount: result.renderCount,
        apiCalls: browserApiStats.totalCalls,
        successfulCalls: browserApiStats.successfulCalls,
        failedCalls: browserApiStats.failedCalls,
        rateLimitedCalls: browserApiStats.rateLimitedCalls,
        circuitBreakerCalls: browserApiStats.circuitBreakerCalls,
        averageResponseTime: browserApiStats.averageResponseTime,
        errorRate: browserApiStats.errorRate,
        infiniteLoopDetected: browserAlerts.some(msg => msg.includes("INFINITE LOOP DETECTED")),
      },
      backendStatus,
    };

    testResults.push(testResult);

    console.log(`📊 Results for ${scenarioName}:`, testResult.metrics);

    return testResult;
  }

  test("🧪 Comprehensive Empirical Analysis", async ({ page }) => {
    // Navigate to test page
    await page.goto("/effect-test-page.html");

    // Test 1: Baseline - No protections, problematic pattern
    await runScenario(
      page,
      "Baseline - No Protections",
      {
        rate_limiting_enabled: false,
        circuit_breaker_enabled: false,
        failure_simulation_enabled: false,
      },
      `
      // Simulate the problematic Cloudflare pattern
      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        // This object is recreated on every render - the bug!
        const tenantService = {
          organizationId: "org-123",
          userId: "user-456",
          permissions: ["read", "write"],
          metadata: {
            source: "dashboard",
            version: "1.0.0",
            timestamp: Date.now() // This changes every time!
          }
        };

        // Track the effect execution
        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, tenantService);

        // Make API call
        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 2: Rate Limiting Only
    await runScenario(
      page,
      "Rate Limiting Only",
      {
        rate_limiting_enabled: true,
        circuit_breaker_enabled: false,
        failure_simulation_enabled: false,
        rate_limit_requests: 5,
      },
      `
      // Same problematic pattern but with rate limiting
      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        const tenantService = {
          organizationId: "org-123",
          userId: "user-456",
          permissions: ["read", "write"],
          metadata: {
            source: "dashboard",
            version: "1.0.0",
            timestamp: Date.now()
          }
        };

        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, tenantService);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 3: Circuit Breaker Only
    await runScenario(
      page,
      "Circuit Breaker Only",
      {
        rate_limiting_enabled: false,
        circuit_breaker_enabled: true,
        failure_simulation_enabled: true,
        failure_rate: 0.1,
        circuit_breaker_threshold: 3,
      },
      `
      // Same problematic pattern but with circuit breaker
      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        const tenantService = {
          organizationId: "org-123",
          userId: "user-456",
          permissions: ["read", "write"],
          metadata: {
            source: "dashboard",
            version: "1.0.0",
            timestamp: Date.now()
          }
        };

        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, tenantService);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 4: Combined Protections
    await runScenario(
      page,
      "Combined Protections",
      {
        rate_limiting_enabled: true,
        circuit_breaker_enabled: true,
        failure_simulation_enabled: true,
        failure_rate: 0.1,
        rate_limit_requests: 5,
        circuit_breaker_threshold: 3,
      },
      `
      // Same problematic pattern but with all protections
      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        const tenantService = {
          organizationId: "org-123",
          userId: "user-456",
          permissions: ["read", "write"],
          metadata: {
            source: "dashboard",
            version: "1.0.0",
            timestamp: Date.now()
          }
        };

        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, tenantService);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 5: Frontend Prevention - Stable References
    await runScenario(
      page,
      "Frontend Prevention - Stable References",
      {
        rate_limiting_enabled: false,
        circuit_breaker_enabled: false,
        failure_simulation_enabled: false,
      },
      `
      // Frontend prevention: stable object reference
      const stableTenantService = {
        organizationId: "org-123",
        userId: "user-456",
        permissions: ["read", "write"],
        metadata: {
          source: "dashboard",
          version: "1.0.0"
          // ✅ NO timestamp that changes every render!
        }
      };

      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        // Use the stable reference
        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, stableTenantService);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 6: Frontend Prevention - Primitive Dependencies
    await runScenario(
      page,
      "Frontend Prevention - Primitive Dependencies",
      {
        rate_limiting_enabled: false,
        circuit_breaker_enabled: false,
        failure_simulation_enabled: false,
      },
      `
      // Frontend prevention: primitive dependencies
      const organizationId = "org-123";
      const userId = "user-456";
      const permissions = ["read", "write"];

      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        // Use primitive values as dependencies
        const dependencies = { organizationId, userId, permissions };
        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, dependencies);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Test 7: Complete Solution - Frontend + Backend
    await runScenario(
      page,
      "Complete Solution - Frontend + Backend",
      {
        rate_limiting_enabled: true,
        circuit_breaker_enabled: true,
        failure_simulation_enabled: true,
        failure_rate: 0.1,
        rate_limit_requests: 5,
        circuit_breaker_threshold: 3,
      },
      `
      // Complete solution: stable frontend + backend protections
      const stableTenantService = {
        organizationId: "org-123",
        userId: "user-456",
        permissions: ["read", "write"],
        metadata: {
          source: "dashboard",
          version: "1.0.0"
        }
      };

      for (let i = 0; i < 10; i++) {
        renderCount++;
        
        window.effectMonitor.trackEffectExecution("test-effect", Math.random() * 10, stableTenantService);

        try {
          apiCallCount++;
          const startTime = Date.now();
          const response = await fetch("http://localhost:12526/api/v1/organizations", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });
          const responseTime = Date.now() - startTime;
          totalResponseTime += responseTime;
          
          if (response.ok) {
            successfulCalls++;
          } else if (response.status === 429) {
            rateLimitedCalls++;
          } else if (response.status === 503) {
            circuitBreakerCalls++;
          } else {
            failedCalls++;
          }

          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, response.status, responseTime);
        } catch (error) {
          failedCalls++;
          window.effectMonitor.trackApiCall("/api/v1/organizations", "GET", \`req-\${apiCallCount}\`, 0, 0);
        }
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    `
    );

    // Analyze and log results
    console.log("\n📊 EMPIRICAL ANALYSIS RESULTS:");
    console.log("=====================================");

    testResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.scenario}`);
      console.log(`   Configuration:`, result.configuration);
      console.log(`   Metrics:`, result.metrics);
      console.log(`   Backend Status:`, result.backendStatus);
    });

    // Save results to file for analysis
    await page.evaluate(results => {
      const dataStr = JSON.stringify(results, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "empirical-analysis-results.json";
      link.click();
      URL.revokeObjectURL(url);
    }, testResults);

    // Basic assertions to ensure tests ran
    expect(testResults.length).toBe(7);
    expect(testResults[0].metrics.infiniteLoopDetected).toBe(true); // Baseline should detect infinite loop
    expect(testResults[4].metrics.infiniteLoopDetected).toBe(false); // Stable references should prevent it
    expect(testResults[5].metrics.infiniteLoopDetected).toBe(false); // Primitive dependencies should prevent it
  });
});
