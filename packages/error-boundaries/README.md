# reynard-error-boundaries

> **Comprehensive Error Boundary System for Reynard Framework** 🦊

A sophisticated error boundary system that provides graceful error handling, recovery mechanisms, and
comprehensive error reporting for SolidJS applications built with Reynard.

## ✨ Features

### 🛡️ **Error Boundary System**

- **Hierarchical Error Boundaries**: Multiple levels of error isolation
- **Automatic Error Classification**: Smart categorization of errors by type and severity
- **Recovery Strategies**: Built-in and custom recovery mechanisms
- **Error Isolation**: Prevent error propagation with configurable isolation
- **Global Error Handling**: Catch unhandled errors and promise rejections

### 🔄 **Recovery System**

- **Built-in Recovery Strategies**: Retry, reset, fallback UI, redirect, reload
- **Custom Recovery Strategies**: Create your own recovery logic
- **Recovery Priority System**: Intelligent strategy selection based on error type
- **Recovery Timeout**: Prevent hanging recovery operations
- **Recovery Analytics**: Track recovery success rates

### 📊 **Error Reporting & Analytics**

- **Automatic Error Reporting**: Send errors to external services
- **Error Filtering**: Include/exclude errors based on criteria
- **Batch Reporting**: Efficient error transmission
- **Error Metrics**: Comprehensive error analytics
- **User Reports**: Allow users to provide additional context

### 🎨 **UI Components**

- **Default Error Fallback**: Beautiful, accessible error UI
- **Custom Error Fallbacks**: Use your own error display components
- **Recovery Actions**: Interactive recovery options
- **Technical Details**: Expandable error information
- **Responsive Design**: Works on all device sizes

## 📦 Installation

```bash
npm install reynard-error-boundaries reynard-core reynard-components
```

## 🚀 Quick Start

### Basic Error Boundary

```tsx
import { ErrorBoundary } from "reynard-error-boundaries";
import { ErrorFallback } from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      fallback={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error("Error caught:", error, errorInfo);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Recovery

```tsx
import {
  ErrorBoundary,
  builtInRecoveryStrategies,
} from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      recoveryStrategies={builtInRecoveryStrategies}
      onRecovery={(action) => {
        console.log("Recovery action executed:", action);
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

### Error Boundary with Reporting

```tsx
import { ErrorBoundary } from "reynard-error-boundaries";

function App() {
  return (
    <ErrorBoundary
      reportErrors={true}
      errorReporting={{
        enabled: true,
        endpoint: "/api/errors",
        apiKey: "your-api-key",
        batchSize: 10,
        flushInterval: 30000,
      }}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## 📚 API Reference

### ErrorBoundary Component

```tsx
interface ErrorBoundaryConfig {
  children: JSX.Element;
  fallback?: Component<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRecovery?: (recoveryAction: RecoveryAction) => void;
  recoveryStrategies?: RecoveryStrategy[];
  isolate?: boolean;
  reportErrors?: boolean;
  errorReporting?: ErrorReportingConfig;
}
```

### Recovery Strategies

```tsx
interface RecoveryStrategy {
  id: string;
  name: string;
  description: string;
  canRecover: (error: Error, context: ErrorContext) => boolean;
  recover: (error: Error, context: ErrorContext) => Promise<RecoveryResult>;
  priority: number;
  timeout?: number;
}
```

### Error Reporting

```tsx
interface ErrorReportingConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number;
  includeStackTrace?: boolean;
  includeUserContext?: boolean;
  filters?: ErrorFilter[];
}
```

## 🎯 Advanced Usage

### Custom Recovery Strategy

```tsx
import { createRecoveryStrategy } from "reynard-error-boundaries";

const customStrategy = createRecoveryStrategy(
  "custom-retry",
  "Custom Retry",
  "Retry with custom logic",
  (error, context) => context.category === "network",
  async (error, context) => {
    // Custom recovery logic
    await customRetryLogic();
    return {
      success: true,
      action: "retry",
      message: "Custom retry successful",
    };
  },
  1, // Priority
);

<ErrorBoundary recoveryStrategies={[customStrategy]}>
  <YourApp />
</ErrorBoundary>;
```

### Error Reporting with Filters

```tsx
<ErrorBoundary
  reportErrors={true}
  errorReporting={{
    enabled: true,
    endpoint: "/api/errors",
    filters: [
      { type: "severity", value: "critical", action: "include" },
      { type: "category", value: "network", action: "exclude" },
    ],
  }}
>
  <YourApp />
</ErrorBoundary>
```

### Using Error Boundary Hook

```tsx
import { useErrorBoundary } from "reynard-error-boundaries";

function MyComponent() {
  const { error, handleError, retry, executeRecovery } = useErrorBoundary({
    onError: (error, context) => {
      console.log("Error occurred:", error, context);
    },
  });

  const handleAsyncOperation = async () => {
    try {
      await riskyOperation();
    } catch (error) {
      handleError(error, { componentStack: "MyComponent" });
    }
  };

  return (
    <div>
      {error() && (
        <div>
          <p>Error: {error()?.message}</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}
      <button onClick={handleAsyncOperation}>Risky Operation</button>
    </div>
  );
}
```

## 🧪 Testing

```tsx
import { render, screen } from "reynard-testing";
import { ErrorBoundary } from "reynard-error-boundaries";

const ThrowError = () => {
  throw new Error("Test error");
};

test("should catch and display errors", () => {
  render(() => (
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  ));

  expect(screen.getByText("Something went wrong")).toBeInTheDocument();
});
```

## 🎨 Theming

The error boundary components integrate seamlessly with Reynard's theming system:

```css
/* Custom error fallback styles */
.reynard-error-fallback {
  --error-bg: var(--bg-color);
  --error-text: var(--text-primary);
  --error-accent: var(--accent);
}
```

## 📊 Error Analytics

```tsx
import { useErrorReporting } from "reynard-error-boundaries";

function ErrorDashboard() {
  const { getMetrics } = useErrorReporting({
    enabled: true,
    endpoint: "/api/errors",
  });

  const metrics = getMetrics();

  return (
    <div>
      <h2>Error Metrics</h2>
      <p>Total Errors: {metrics.totalReports}</p>
      <p>Average per Hour: {metrics.averageReportsPerHour}</p>
    </div>
  );
}
```

## 🔧 Configuration

### Error Classification

Errors are automatically classified by:

- **Category**: rendering, network, validation, authentication, permission, resource, timeout, unknown
- **Severity**: low, medium, high, critical
- **Recoverability**: whether the error can be automatically recovered

### Recovery Strategies

Built-in recovery strategies:

- **Retry**: For network and resource errors
- **Fallback UI**: For rendering errors
- **Reset**: For component state errors
- **Redirect**: For critical errors
- **Reload**: For application-level errors

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and the Reynard framework** 🦊
