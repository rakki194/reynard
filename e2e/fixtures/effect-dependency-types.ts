/**
 * 🦊 EFFECT DEPENDENCY TYPES
 *
 * Type definitions for testing SolidJS createEffect dependency array issues.
 */

import type { ITestUserData } from "./user-data";

/**
 * Effect Dependency Test Scenario Interface
 */
export interface IEffectDependencyScenario {
  name: string;
  description: string;
  scenarioType: "object_recreation" | "array_recreation" | "function_recreation" | "nested_object";
  expectedApiCalls: number;
  maxAllowedApiCalls: number;
  userData: ITestUserData;
  shouldFail: boolean;
  failureReason?: string;
}

/**
 * API Call Tracking Interface
 */
export interface IApiCallTracker {
  endpoint: string;
  method: string;
  timestamp: number;
  requestId: string;
  payload?: unknown;
  responseStatus?: number;
  responseTime?: number;
}

/**
 * Effect Execution Metrics Interface
 */
export interface IEffectMetrics {
  effectId: string;
  executionCount: number;
  lastExecution: number;
  averageExecutionTime: number;
  totalExecutionTime: number;
  dependencyChanges: number;
  isInfiniteLoop: boolean;
}

/**
 * Cloudflare-Style Tenant Service Mock
 */
export interface ITenantServiceMock {
  organizationId: string;
  userId: string;
  permissions: string[];
  lastUpdated: number;
  metadata: {
    source: string;
    version: string;
    timestamp: number;
  };
}
