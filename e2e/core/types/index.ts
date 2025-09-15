/**
 * Core E2E Testing Types
 *
 * 🦊 *whiskers twitch with type precision* Shared type definitions for the
 * Reynard e2e testing framework.
 */

import { Page } from "@playwright/test";

/**
 * Base test configuration interface
 */
export interface BaseTestConfig {
  timeout?: number;
  retries?: number;
  parallel?: boolean;
  workers?: number;
}

/**
 * Test environment configuration
 */
export interface TestEnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  environment: "development" | "staging" | "production" | "e2e-testing";
  debug: boolean;
  headless: boolean;
}

/**
 * Test result interface
 */
export interface TestResult {
  success: boolean;
  duration: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  [key: string]: number;
}

/**
 * Test user data interface
 */
export interface TestUserData {
  username: string;
  email: string;
  password: string;
  role?: string;
  active?: boolean;
}

/**
 * Mock server configuration
 */
export interface MockServerConfig {
  port: number;
  basePath: string;
  endpoints: Record<string, unknown>;
  delay?: number;
}

/**
 * Security test configuration
 */
export interface SecurityTestConfig {
  targetUrl: string;
  attackTypes: string[];
  timeout: number;
  retries: number;
}

/**
 * DOM test configuration
 */
export interface DomTestConfig {
  testPage: string;
  selectors: Record<string, string>;
  assertions: string[];
}

/**
 * I18n test configuration
 */
export interface I18nTestConfig {
  languages: string[];
  testData: Record<string, unknown>;
  performanceThresholds: PerformanceMetrics;
}

/**
 * Page helper interface
 */
export interface PageHelper {
  page: Page;
  navigate(url: string): Promise<void>;
  waitForLoad(): Promise<void>;
  takeScreenshot(name: string): Promise<void>;
}

/**
 * Test suite configuration
 */
export interface TestSuiteConfig extends BaseTestConfig {
  name: string;
  description: string;
  tags: string[];
  environment: TestEnvironmentConfig;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}
