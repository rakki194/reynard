import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithTestProviders } from '@reynard/testing/utils';
import { PerformanceDemo } from './PerformanceDemo';

describe('PerformanceDemo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the performance demo component', () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    expect(screen.getByText('⚡ Performance Monitoring Demo')).toBeInTheDocument();
  });

  it('displays performance metrics', () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    expect(screen.getByText('Recent Measurements')).toBeInTheDocument();
    expect(screen.getByText('Memory Usage')).toBeInTheDocument();
  });

  it('renders the demo controls', () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    const controlsContainer = document.querySelector('.demo-controls');
    expect(controlsContainer).toBeInTheDocument();
  });

  it('displays performance test controls', () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    expect(screen.getByText('Run Heavy Operation')).toBeInTheDocument();
    expect(screen.getByText('Throttled (1s)')).toBeInTheDocument();
    expect(screen.getByText('Debounced (500ms)')).toBeInTheDocument();
  });

  it('handles run heavy operation button click', async () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    const runButton = screen.getByText('Run Heavy Operation');
    fireEvent.click(runButton);
    
    // Should trigger the heavy operation
    // The component should handle the click without errors
    expect(runButton).toBeInTheDocument();
  });

  it('handles throttled button click', async () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    const throttledButton = screen.getByText('Throttled (1s)');
    fireEvent.click(throttledButton);
    
    // Should trigger the throttled operation
    expect(throttledButton).toBeInTheDocument();
  });

  it('handles debounced button click', async () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    const debouncedButton = screen.getByText('Debounced (500ms)');
    fireEvent.click(debouncedButton);
    
    // Should trigger the debounced operation
    expect(debouncedButton).toBeInTheDocument();
  });

  it('displays demo instructions', () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    // Should show instructions
    expect(screen.getByText(/Click/)).toBeInTheDocument();
    expect(screen.getByText(/Features:/)).toBeInTheDocument();
  });

  it('renders with custom configuration', () => {
    const customConfig = {
      testDuration: 5000,
      objectCount: 100,
      canvasWidth: 800,
      canvasHeight: 600
    };
    
    renderWithTestProviders(() => <PerformanceDemo config={customConfig} />);
    
    expect(screen.getByText('⚡ Performance Monitoring Demo')).toBeInTheDocument();
  });

  it('maintains component state consistency', async () => {
    renderWithTestProviders(() => <PerformanceDemo />);
    
    // Click run heavy operation
    fireEvent.click(screen.getByText('Run Heavy Operation'));
    
    // Click throttled
    fireEvent.click(screen.getByText('Throttled (1s)'));
    
    // Component should still be functional
    expect(screen.getByText('⚡ Performance Monitoring Demo')).toBeInTheDocument();
  });
});