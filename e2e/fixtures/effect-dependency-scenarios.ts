/**
 * 🦊 EFFECT DEPENDENCY SCENARIOS
 * 
 * Test scenarios for SolidJS createEffect dependency array issues.
 */

import type { ITestUserData } from "./user-data";
import { TestUserData } from "./user-data";
import type { IEffectDependencyScenario } from "./effect-dependency-types";

/**
 * Effect Dependency Test Scenarios Factory
 */
export class EffectDependencyScenarios {
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
        failureReason: "Object recreated on every render causes infinite API calls"
      },
      {
        name: "array_dependency_recreation",
        description: "Tests array recreation in dependency array",
        scenarioType: "array_recreation", 
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Array recreated on every render causes infinite API calls"
      },
      {
        name: "function_dependency_recreation",
        description: "Tests function recreation in dependency array",
        scenarioType: "function_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Function recreated on every render causes infinite API calls"
      },
      {
        name: "nested_object_dependency",
        description: "Tests nested object recreation in dependency array",
        scenarioType: "nested_object",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 3,
        userData: TestUserData.getValidUser(),
        shouldFail: true,
        failureReason: "Nested object recreated on every render causes infinite API calls"
      }
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
        shouldFail: false
      },
      {
        name: "memoized_dependencies",
        description: "Tests memoized dependency pattern",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 1,
        userData: TestUserData.getValidUser(),
        shouldFail: false
      },
      {
        name: "primitive_dependencies",
        description: "Tests primitive value dependencies",
        scenarioType: "object_recreation",
        expectedApiCalls: 1,
        maxAllowedApiCalls: 1,
        userData: TestUserData.getValidUser(),
        shouldFail: false
      }
    ];
  }
}
