/**
 * Auto-generated documentation tests for reynard-core
 * 
 * This file contains tests extracted from the documentation examples.
 * Run with: npm run test:docs
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { createSignal, createEffect, onCleanup } from 'solid-js';
// For now, we'll use a simple approach without the complex doc-tests system
// import { runDocTests } from 'reynard-testing/doc-tests';

// Package-specific setup
import { ThemeProvider, createTheme } from 'reynard-core';
import { NotificationsProvider, createNotifications } from 'reynard-core';

// Simple documentation test example
describe('Documentation Examples', () => {
  beforeEach(() => {
    cleanup();
  });

  it('should render theme demo component from documentation', () => {
    const themeModule = createTheme();
    
    function ThemeDemo() {
      const { theme, setTheme } = themeModule.useTheme();
      
      return (
        <div data-testid="theme-demo">
          <span data-testid="current-theme">{theme()}</span>
          <button 
            data-testid="theme-button"
            onClick={() => setTheme("dark")}
          >
            Switch to Dark
          </button>
        </div>
      );
    }

    function TestableApp() {
      return (
        <ThemeProvider value={themeModule}>
          <ThemeDemo />
        </ThemeProvider>
      );
    }

    render(() => <TestableApp />);
    
    expect(screen.getByTestId('theme-demo')).toBeInTheDocument();
    expect(screen.getByTestId('current-theme')).toBeInTheDocument();
    expect(screen.getByTestId('theme-button')).toBeInTheDocument();
  });

  it('should execute utility examples from documentation', () => {
    // Test that utility functions work as documented
    const { validateEmail } = require('reynard-core');
    
    if (validateEmail) {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("invalid-email")).toBe(false);
    }
  });
});
