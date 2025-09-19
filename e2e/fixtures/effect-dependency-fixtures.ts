/**
 * 🦊 EFFECT DEPENDENCY FIXTURES
 *
 * Fixtures for testing SolidJS createEffect dependency array issues that caused the
 * Cloudflare outage. These fixtures simulate the exact scenarios that led to infinite
 * API call loops.
 */

import type { ITestUserData } from "./user-data";
import { TestUserData } from "./user-data";
import type {
  IEffectDependencyScenario,
  IApiCallTracker,
  IEffectMetrics,
  ITenantServiceMock,
} from "./effect-dependency-types";

/**
 * Effect Dependency Test Scenarios Factory
 */
export class EffectDependencyFixtures {
  /**
   * Get scenarios that simulate the Cloudflare outage conditions
   */
  static getCloudflareOutageScenarios(): IEffectDependencyScenario[] {
    return [
      {
        name: "cloudflare_tenant_service_bug",
        description: "Simulates the exact Cloudflare bug: object recreation in dependency array",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Object recreated on every render causes infinite API calls",
      },
      {
        name: "array_dependency_recreation",
        description: "Tests array recreation in dependency array",
        scenarioType: "array_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Array recreated on every render causes infinite API calls",
      },
      {
        name: "function_dependency_recreation",
        description: "Tests function recreation in dependency array",
        scenarioType: "function_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Function recreated on every render causes infinite API calls",
      },
      {
        name: "nested_object_dependency",
        description: "Tests nested object recreation in dependency array",
        scenarioType: "nested_object",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Nested object recreated on every render causes infinite API calls",
      },
    ];
  }

  /**
   * Get prevention pattern scenarios
   */
  static getPreventionPatternScenarios(): IEffectDependencyScenario[] {
    return [
      {
        name: "stable_object_reference",
        description: "Tests stable object reference pattern",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 1,
        userData: TestUserData.getValidUser(),
        shouldFail: false,
      },
      {
        name: "memoized_dependencies",
        description: "Tests memoized dependency pattern",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 1,
        userData: TestUserData.getValidUser(),
        shouldFail: false,
      },
      {
        name: "primitive_dependencies",
        description: "Tests primitive value dependencies",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 1,
        userData: TestUserData.getValidUser(),
        shouldFail: false,
      },
    ];
  }

  /**
   * Create a problematic tenant service object (recreated on every call)
   */
  static createProblematicTenantService(): ITenantServiceMock {
    return {
      organizationId: "org-123",
      userId: "user-456",
      permissions: ["read", "write"],
      lastUpdated: Date.now(),
      metadata: {
        source: "dashboard",
        version: "1.0.0",
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Create a stable tenant service object (same reference)
   */
  static createStableTenantService(): ITenantServiceMock {
    const stableMetadata = {
      source: "dashboard",
      version: "1.0.0",
      timestamp: Date.now(),
    };

    return {
      organizationId: "org-123",
      userId: "user-456",
      permissions: ["read", "write"],
      lastUpdated: Date.now(),
      metadata: stableMetadata,
    };
  }

  /**
   * Create problematic array (recreated on every call)
   */
  static createProblematicArray(): unknown[] {
    return [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
      { id: 3, name: "item3" },
    ];
  }

  /**
   * Create stable array (same reference)
   */
  static createStableArray(): unknown[] {
    const stableArray = [
      { id: 1, name: "item1" },
      { id: 2, name: "item2" },
      { id: 3, name: "item3" },
    ];
    return stableArray;
  }

  /**
   * Create problematic function (recreated on every call)
   */
  static createProblematicFunction(): () => void {
    return () => {
      console.log("This function is recreated every time!");
    };
  }

  /**
   * Create stable function (same reference)
   */
  static createStableFunction(): () => void {
    const stableFunction = () => {
      console.log("This function maintains the same reference!");
    };
    return stableFunction;
  }

  /**
   * Create nested object that causes issues
   */
  static createProblematicNestedObject(): Record<string, unknown> {
    return {
      level1: {
        level2: {
          level3: {
            data: "nested data",
            timestamp: Date.now(),
          },
        },
      },
    };
  }

  /**
   * Create stable nested object
   */
  static createStableNestedObject(): Record<string, unknown> {
    const stableTimestamp = Date.now();
    return {
      level1: {
        level2: {
          level3: {
            data: "nested data",
            timestamp: stableTimestamp,
          },
        },
      },
    };
  }

  /**
   * Generate mock API call tracker
   */
  static createApiCallTracker(endpoint: string, method: string = "GET", payload?: unknown): IApiCallTracker {
    return {
      endpoint,
      method,
      timestamp: Date.now(),
      requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
      payload,
      responseStatus: 200,
      responseTime: Math.random() * 100 + 50,
    };
  }

  /**
   * Generate effect execution metrics
   */
  static createEffectMetrics(effectId: string, executionCount: number = 0): IEffectMetrics {
    return {
      effectId,
      executionCount,
      lastExecution: Date.now(),
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      dependencyChanges: 0,
      isInfiniteLoop: executionCount > 10,
    };
  }

  /**
   * Simulate the exact Cloudflare dashboard scenario
   */
  static getCloudflareDashboardScenario(): {
    componentName: string;
    effectDescription: string;
    problematicCode: string;
    fixedCode: string;
    apiEndpoint: string;
  } {
    return {
      componentName: "DashboardComponent",
      effectDescription: "Fetch organization data on component mount and when dependencies change",
      problematicCode: `
// ❌ PROBLEMATIC CODE (causes infinite loop)
createEffect(() => {
  // This object is recreated on every render!
  const tenantService = {
    organizationId: props.organizationId,
    userId: user.id,
    permissions: user.permissions,
    metadata: {
      source: "dashboard",
      version: "1.0.0",
      timestamp: Date.now() // This changes every time!
    }
  };
  
  // This API call runs infinitely because tenantService is always "new"
  fetchOrganizationData(tenantService);
}, [tenantService]); // ❌ Object reference changes every render
`,
      fixedCode: `
// ✅ FIXED CODE (stable references)
const tenantService = createMemo(() => ({
  organizationId: props.organizationId,
  userId: user.id,
  permissions: user.permissions,
  metadata: {
    source: "dashboard", 
    version: "1.0.0",
    timestamp: Date.now()
  }
}));

createEffect(() => {
  // Now tenantService is stable and only changes when actual dependencies change
  fetchOrganizationData(tenantService());
}, [tenantService]); // ✅ Stable memoized reference
`,
      apiEndpoint: "/api/v1/organizations",
    };
  }

  /**
   * Get performance thresholds for detecting infinite loops
   */
  static getPerformanceThresholds(): {
    maxApiCallsPerSecond: number;
    maxEffectExecutions: number;
    maxMemoryUsageMB: number;
    maxCpuUsagePercent: number;
  } {
    return {
      maxApiCallsPerSecond: 10,
      maxEffectExecutions: 5,
      maxMemoryUsageMB: 100,
      maxCpuUsagePercent: 80,
    };
  }
}
