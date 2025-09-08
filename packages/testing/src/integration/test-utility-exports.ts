import { it, expect } from 'vitest';
import {
  renderWithTestProviders,
  useTestAppContext,
  createMockTestResource,
  mockFns,
  mockAppContext,
} from '../index';

export function testUtilityExports() {
  it('should export all test utilities', () => {
    expect(renderWithTestProviders).toBeDefined();
    expect(useTestAppContext).toBeDefined();
    expect(createMockTestResource).toBeDefined();
    expect(mockFns).toBeDefined();
    expect(mockAppContext).toBeDefined();
  });
}
