import { it, expect } from 'vitest';
import {
  renderWithTheme,
  renderWithRouter,
  renderWithNotifications,
  renderWithAllProviders,
  renderWithWrapper,
  renderWithProviders,
  renderWithErrorBoundary,
  renderWithSuspense,
  renderWithPerformanceMonitoring,
} from '../index';

export function testRenderExports() {
  it('should export all render utilities', () => {
    expect(renderWithTheme).toBeDefined();
    expect(renderWithRouter).toBeDefined();
    expect(renderWithNotifications).toBeDefined();
    expect(renderWithAllProviders).toBeDefined();
    expect(renderWithWrapper).toBeDefined();
    expect(renderWithProviders).toBeDefined();
    expect(renderWithErrorBoundary).toBeDefined();
    expect(renderWithSuspense).toBeDefined();
    expect(renderWithPerformanceMonitoring).toBeDefined();
  });
}
