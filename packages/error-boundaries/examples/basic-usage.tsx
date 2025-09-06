/**
 * Basic Error Boundary Usage Example
 * Demonstrates how to use the error boundary system with Reynard
 */

import { Component, createSignal } from 'solid-js';
import { ErrorBoundary, ErrorFallback, builtInRecoveryStrategies } from '@reynard/error-boundaries';
import { ThemeProvider, createTheme, useTheme } from '@reynard/core';
import { Button, Card } from '@reynard/components';

// Component that can throw an error
const RiskyComponent: Component<{ shouldThrow?: boolean }> = (props) => {
  if (props.shouldThrow) {
    throw new Error('This is a test error!');
  }
  
  return (
    <Card padding="lg">
      <h3>Risky Component</h3>
      <p>This component is working correctly!</p>
    </Card>
  );
};

// Main app component
const ErrorBoundaryDemo: Component = () => {
  const [shouldThrow, setShouldThrow] = createSignal(false);
  const { theme } = useTheme();

  const handleToggleError = () => {
    setShouldThrow(!shouldThrow());
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🦊 Reynard Error Boundary Demo</h1>
      <p>This demonstrates the error boundary system in action.</p>
      
      <div style={{ marginBottom: '2rem' }}>
        <Button 
          variant="primary" 
          onClick={handleToggleError}
        >
          {shouldThrow() ? 'Fix Component' : 'Break Component'}
        </Button>
      </div>

      <ErrorBoundary
        fallback={ErrorFallback}
        recoveryStrategies={builtInRecoveryStrategies}
        onError={(error, errorInfo) => {
          console.log('Error caught:', error, errorInfo);
        }}
        onRecovery={(action) => {
          console.log('Recovery action executed:', action);
        }}
        reportErrors={true}
        errorReporting={{
          enabled: true,
          endpoint: '/api/errors',
          batchSize: 5,
          flushInterval: 30000
        }}
      >
        <RiskyComponent shouldThrow={shouldThrow()} />
      </ErrorBoundary>
    </div>
  );
};

// App with theme provider
const App: Component = () => {
  const themeModule = createTheme();

  return (
    <ThemeProvider value={themeModule}>
      <ErrorBoundaryDemo />
    </ThemeProvider>
  );
};

export default App;
