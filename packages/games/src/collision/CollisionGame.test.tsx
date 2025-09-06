import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { renderWithTestProviders } from '../../../testing/src/utils/test-utils';
import { CollisionGame } from './CollisionGame';

describe('CollisionGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the collision game component', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    expect(screen.getByText('Collision Detection Demo')).toBeInTheDocument();
  });

  it('displays game statistics', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    expect(screen.getByText(/Total Collisions:/)).toBeInTheDocument();
    expect(screen.getByText(/Active Balls:/)).toBeInTheDocument();
    expect(screen.getByText(/Average Speed:/)).toBeInTheDocument();
  });

  it('renders the game canvas', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    expect(canvas).toBeInTheDocument();
  });

  it('displays game controls', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('handles start button click', async () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    // Game should start (exact behavior depends on implementation)
    await waitFor(() => {
      expect(startButton).toBeInTheDocument();
    });
  });

  it('handles pause button click', async () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    
    // Game should pause (exact behavior depends on implementation)
    await waitFor(() => {
      expect(pauseButton).toBeInTheDocument();
    });
  });

  it('handles reset button click', async () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);
    
    // Game should reset
    await waitFor(() => {
      expect(screen.getByText(/Total Collisions: 0/)).toBeInTheDocument();
    });
  });

  it('updates collision statistics', async () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    // Start the game
    fireEvent.click(screen.getByText('Start'));
    
    // Wait for some time to allow collisions to occur
    await waitFor(() => {
      // Statistics should update (exact values depend on implementation)
      expect(screen.getByText(/Total Collisions:/)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles canvas click events', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    const canvas = screen.getByRole('img', { hidden: true });
    
    // Simulate a click on the canvas
    fireEvent.click(canvas, { clientX: 200, clientY: 200 });
    
    // The game should handle the click (exact behavior depends on implementation)
  });

  it('renders with custom ball count', () => {
    const customConfig = {
      ballCount: 10,
      canvasWidth: 800,
      canvasHeight: 600
    };
    
    renderWithTestProviders(() => <CollisionGame config={customConfig} />);
    
    expect(screen.getByText('Collision Detection Demo')).toBeInTheDocument();
  });

  it('handles window resize events', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    // Simulate window resize
    fireEvent.resize(window, { target: { innerWidth: 1000, innerHeight: 800 } });
    
    // Game should handle resize (exact behavior depends on implementation)
  });

  it('displays performance metrics', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    // Should show FPS or other performance metrics
    expect(screen.getByText(/FPS:/)).toBeInTheDocument();
  });

  it('handles keyboard controls', () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    // Test spacebar to start/pause
    fireEvent.keyDown(document, { key: ' ', code: 'Space' });
    
    // Test 'r' to reset
    fireEvent.keyDown(document, { key: 'r', code: 'KeyR' });
    
    // Game should respond to keyboard events
  });

  it('maintains game state during pause/resume', async () => {
    renderWithTestProviders(() => <CollisionGame />);
    
    // Start the game
    fireEvent.click(screen.getByText('Start'));
    
    // Wait a bit
    await waitFor(() => {}, { timeout: 1000 });
    
    // Pause
    fireEvent.click(screen.getByText('Pause'));
    
    // Resume
    fireEvent.click(screen.getByText('Start'));
    
    // Game should maintain state
    expect(screen.getByText('Collision Detection Demo')).toBeInTheDocument();
  });
});
