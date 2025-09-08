import { it, expect } from 'vitest';
import {
  mockRouter,
  mockContext,
  createMockSolidResource,
} from '../index';

export function testSolidExports() {
  it('should export all SolidJS mocks', () => {
    expect(mockRouter).toBeDefined();
    expect(mockContext).toBeDefined();
    expect(createMockSolidResource).toBeDefined();
  });
}

