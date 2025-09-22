/**
 * Error Demo Component
 * Demonstrates various error scenarios and error boundary behavior
 */

import { Component, createSignal, Show } from "solid-js";
import { ErrorBoundary } from "reynard-error-boundaries";

// Icon props interface
interface IconProps {
  size?: number;
  class?: string;
  style?: string;
  [key: string]: unknown;
}

// Simple icon components for demo
const Bug = (props: IconProps) => <span {...props}>🐛</span>;
const Globe = (props: IconProps) => <span {...props}>🌐</span>;
const Clock = (props: IconProps) => <span {...props}>⏰</span>;
const Shield = (props: IconProps) => <span {...props}>🛡️</span>;
const Lock = (props: IconProps) => <span {...props}>🔒</span>;
const FileText = (props: IconProps) => <span {...props}>📄</span>;
const Database = (props: IconProps) => <span {...props}>🗄️</span>;
const Zap = (props: IconProps) => <span {...props}>⚡</span>;
const AlertTriangle = (props: IconProps) => <span {...props}>⚠️</span>;
const CheckmarkCircle = (props: IconProps) => <span {...props}>✅</span>;
const XCircle = (props: IconProps) => <span {...props}>❌</span>;
const Info = (props: IconProps) => <span {...props}>ℹ️</span>;

// Error simulation components
const NetworkErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateNetworkError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/network");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Network error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Globe size={20} />
        Network Error Simulation
      </h3>
      <p>Simulates network connectivity issues and API failures.</p>

      <button class="btn btn-primary" onClick={simulateNetworkError} disabled={loading()}>
        {loading() ? "Testing..." : "Simulate Network Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <XCircle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const TimeoutErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateTimeoutError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/timeout");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Timeout error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Clock size={20} />
        Timeout Error Simulation
      </h3>
      <p>Simulates request timeouts and slow server responses.</p>

      <button class="btn btn-warning" onClick={simulateTimeoutError} disabled={loading()}>
        {loading() ? "Waiting..." : "Simulate Timeout"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-warning"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const ValidationErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateValidationError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/validation");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Validation error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <FileText size={20} />
        Validation Error Simulation
      </h3>
      <p>Simulates data validation failures and input errors.</p>

      <button class="btn btn-info" onClick={simulateValidationError} disabled={loading()}>
        {loading() ? "Validating..." : "Simulate Validation Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-warning"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const AuthErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateAuthError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/authentication");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Auth error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Shield size={20} />
        Authentication Error Simulation
      </h3>
      <p>Simulates authentication failures and session issues.</p>

      <button class="btn btn-danger" onClick={simulateAuthError} disabled={loading()}>
        {loading() ? "Authenticating..." : "Simulate Auth Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <XCircle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const PermissionErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulatePermissionError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/permission");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Permission error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Lock size={20} />
        Permission Error Simulation
      </h3>
      <p>Simulates access control violations and permission denials.</p>

      <button class="btn btn-danger" onClick={simulatePermissionError} disabled={loading()}>
        {loading() ? "Checking..." : "Simulate Permission Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <XCircle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const ResourceErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateResourceError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/resource");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Resource error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Database size={20} />
        Resource Error Simulation
      </h3>
      <p>Simulates missing resources and data not found errors.</p>

      <button class="btn btn-warning" onClick={simulateResourceError} disabled={loading()}>
        {loading() ? "Searching..." : "Simulate Resource Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-warning"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <AlertTriangle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const CriticalErrorComponent: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const simulateCriticalError = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/errors/critical");
      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        const error = await response.json();
        setResult(`❌ ${error.detail}`);
      }
    } catch (error) {
      setResult(`❌ Critical error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Zap size={20} />
        Critical Error Simulation
      </h3>
      <p>Simulates critical system failures and unexpected errors.</p>

      <button class="btn btn-danger" onClick={simulateCriticalError} disabled={loading()}>
        {loading() ? "Testing..." : "Simulate Critical Error"}
      </button>

      <Show when={result()}>
        <div class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}>
          {result().startsWith("✅") ? <CheckmarkCircle size={16} /> : <XCircle size={16} />}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const RenderingErrorComponent: Component = () => {
  const [shouldError, setShouldError] = createSignal(false);

  return (
    <div class="error-demo-main">
      <h3>
        <Bug size={20} />
        Rendering Error Simulation
      </h3>
      <p>Simulates component rendering failures and React errors.</p>

      <button class="btn btn-danger" onClick={() => setShouldError(true)}>
        Trigger Rendering Error
      </button>

      <div class="status-message status-info">
        <Info size={16} />
        <span>This will trigger a component rendering error that will be caught by the error boundary.</span>
      </div>

      {/* This will throw an error when shouldError is true - now properly within JSX */}
      {shouldError() &&
        (() => {
          throw new Error("Simulated rendering error - component failed to render");
        })()}
    </div>
  );
};

const ErrorDemo: Component = () => {
  return (
    <div class="error-demo-container">
      <div class="error-demo-header">
        <Bug size={32} />
        <div>
          <h2>Error Boundary Demonstrations</h2>
          <p>Test various error scenarios and see how the error boundary system handles them</p>
        </div>
      </div>

      <div class="error-demo-content">
        <div class="error-demo-sidebar">
          <h3>Error Categories</h3>
          <div class="error-demo-categories">
            <div class="error-demo-category-item">
              <Globe size={16} />
              <span>Network Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Clock size={16} />
              <span>Timeout Errors</span>
            </div>
            <div class="error-demo-category-item">
              <FileText size={16} />
              <span>Validation Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Shield size={16} />
              <span>Authentication Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Lock size={16} />
              <span>Permission Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Database size={16} />
              <span>Resource Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Zap size={16} />
              <span>Critical Errors</span>
            </div>
            <div class="error-demo-category-item">
              <Bug size={16} />
              <span>Rendering Errors</span>
            </div>
          </div>
        </div>

        <div class="error-demo-content-grid">
          <ErrorBoundary>
            {() => <NetworkErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <TimeoutErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <ValidationErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <AuthErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <PermissionErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <ResourceErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <CriticalErrorComponent />}
          </ErrorBoundary>

          <ErrorBoundary>
            {() => <RenderingErrorComponent />}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default ErrorDemo;
