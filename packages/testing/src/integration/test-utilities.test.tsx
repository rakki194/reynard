import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Component } from 'solid-js';
import { screen } from '@solidjs/testing-library';
import {
  renderWithTestProviders,
  useTestAppContext,
  createMockTestResource,
  mockFns,
  setupBrowserMocks,
  resetBrowserMocks,
} from '../index';

describe('Test Utilities Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupBrowserMocks();
  });

  afterEach(() => {
    resetBrowserMocks();
  });

  it('should work together with render utilities', () => {
    const TestComponent: Component = () => {
      const context = useTestAppContext();
      return <div data-testid="test">{context.theme}</div>;
    };
    
    renderWithTestProviders(() => <TestComponent />);
    expect(screen.getByTestId('test')).toHaveTextContent('light');
  });

  it('should work with mock resources', () => {
    const testData = { id: 1, name: 'Test' };
    const resource = createMockTestResource(testData);
    
    expect(resource()).toEqual(testData);
    expect(resource.loading).toBe(false);
    expect(resource.state).toBe('ready');
  });

  it('should work with mock functions', async () => {
    const response = await mockFns.saveCaption();
    expect(response).toBeInstanceOf(Response);
  });
});
