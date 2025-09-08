import { it, expect } from 'vitest';
import {
  createBaseVitestConfig,
  createComponentTestConfig,
  createUtilityTestConfig,
  createIntegrationTestConfig,
} from '../index';

export function testConfigExports() {
  it('should export all configuration utilities', () => {
    expect(createBaseVitestConfig).toBeDefined();
    expect(createComponentTestConfig).toBeDefined();
    expect(createUtilityTestConfig).toBeDefined();
    expect(createIntegrationTestConfig).toBeDefined();
  });
}

