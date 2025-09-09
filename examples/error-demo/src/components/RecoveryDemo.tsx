/**
 * Recovery Demo Component
 * Demonstrates various recovery strategies and their execution
 */

import { Component, createSignal, Show } from "solid-js";
import { ErrorBoundary } from "reynard-error-boundaries";
// Simple icon components for demo
const ArrowClockwise = (props: any) => <span {...props}>🔄</span>;
const Refresh = (props: any) => <span {...props}>🔄</span>;
const Shield = (props: any) => <span {...props}>🛡️</span>;
const Globe = (props: any) => <span {...props}>🌐</span>;
// Unused icon removed
const CheckmarkCircle = (props: any) => <span {...props}>✅</span>;
const XCircle = (props: any) => <span {...props}>❌</span>;
const AlertTriangle = (props: any) => <span {...props}>⚠️</span>;
// Unused icon removed

// Recovery strategy components
const RetryStrategyDemo: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");
  const [attempts, setAttempts] = createSignal(0);

  const executeRetryStrategy = async () => {
    setLoading(true);
    setResult("");
    setAttempts(0);

    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      attempt++;
      setAttempts(attempt);

      try {
        const response = await fetch("/api/recovery/retry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ strategy: "retry", context: { attempt } }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setResult(
              `✅ Retry successful after ${attempt} attempts: ${data.message}`,
            );
            break;
          } else {
            setResult(
              `❌ Retry failed after ${attempt} attempts: ${data.message}`,
            );
          }
        } else {
          setResult(`❌ Retry request failed: ${response.statusText}`);
        }
      } catch (error) {
        setResult(`❌ Retry error: ${(error as Error).message}`);
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second between attempts
      }
    }

    setLoading(false);
  };

  return (
    <div class="error-demo-main">
      <h3>
        <ArrowClockwise size={20} />
        Retry Strategy Demo
      </h3>
      <p>Demonstrates automatic retry logic with exponential backoff.</p>

      <div style="margin: 1rem 0;">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <span>Attempts: {attempts()}</span>
          <div style="display: flex; gap: 0.25rem;">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                style={`width: 20px; height: 4px; background: ${i < attempts() ? "#10b981" : "#e5e7eb"}; border-radius: 2px;`}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        class="btn btn-primary"
        onClick={executeRetryStrategy}
        disabled={loading()}
      >
        {loading() ? "Retrying..." : "Execute Retry Strategy"}
      </button>

      <Show when={result()}>
        <div
          class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}
        >
          {result().startsWith("✅") ? (
            <CheckmarkCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const ResetStrategyDemo: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const executeResetStrategy = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/recovery/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: "reset",
          context: { component: "demo" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
      } else {
        setResult(`❌ Reset failed: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Reset error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Refresh size={20} />
        Reset Strategy Demo
      </h3>
      <p>Demonstrates component reset to initial state.</p>

      <button
        class="btn btn-secondary"
        onClick={executeResetStrategy}
        disabled={loading()}
      >
        {loading() ? "Resetting..." : "Execute Reset Strategy"}
      </button>

      <Show when={result()}>
        <div
          class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}
        >
          {result().startsWith("✅") ? (
            <CheckmarkCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const FallbackStrategyDemo: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");
  const [fallbackActive, setFallbackActive] = createSignal(false);

  const executeFallbackStrategy = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/recovery/fallback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: "fallback", context: { ui: "demo" } }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(`✅ ${data.message}`);
        setFallbackActive(true);
      } else {
        setResult(`❌ Fallback failed: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Fallback error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const exitFallback = () => {
    setFallbackActive(false);
    setResult("");
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Shield size={20} />
        Fallback UI Strategy Demo
      </h3>
      <p>Demonstrates switching to fallback UI when primary UI fails.</p>

      <Show when={!fallbackActive()}>
        <button
          class="btn btn-warning"
          onClick={executeFallbackStrategy}
          disabled={loading()}
        >
          {loading() ? "Activating..." : "Execute Fallback Strategy"}
        </button>
      </Show>

      <Show when={fallbackActive()}>
        <div class="status-message status-warning">
          <AlertTriangle size={16} />
          <span>
            Fallback UI is now active. This is a simplified version of the
            interface.
          </span>
        </div>
        <button class="btn btn-primary" onClick={exitFallback}>
          Exit Fallback Mode
        </button>
      </Show>

      <Show when={result() && !fallbackActive()}>
        <div
          class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}
        >
          {result().startsWith("✅") ? (
            <CheckmarkCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const RedirectStrategyDemo: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const executeRedirectStrategy = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/recovery/redirect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          strategy: "redirect",
          context: { target: "/safe-page" },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(
          `✅ ${data.message} - Would redirect to: ${data.data.redirect_url}`,
        );
      } else {
        setResult(`❌ Redirect failed: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Redirect error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Globe size={20} />
        Redirect Strategy Demo
      </h3>
      <p>Demonstrates redirecting users to a safe page when errors occur.</p>

      <button
        class="btn btn-info"
        onClick={executeRedirectStrategy}
        disabled={loading()}
      >
        {loading() ? "Redirecting..." : "Execute Redirect Strategy"}
      </button>

      <Show when={result()}>
        <div
          class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}
        >
          {result().startsWith("✅") ? (
            <CheckmarkCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const ReloadStrategyDemo: Component = () => {
  const [loading, setLoading] = createSignal(false);
  const [result, setResult] = createSignal<string>("");

  const executeReloadStrategy = async () => {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/recovery/reload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategy: "reload", context: { app: "demo" } }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(
          `✅ ${data.message} - Application would reload at: ${new Date(data.data.reload_time).toLocaleTimeString()}`,
        );
      } else {
        setResult(`❌ Reload failed: ${response.statusText}`);
      }
    } catch (error) {
      setResult(`❌ Reload error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="error-demo-main">
      <h3>
        <Refresh size={20} />
        Reload Strategy Demo
      </h3>
      <p>
        Demonstrates reloading the entire application when critical errors
        occur.
      </p>

      <button
        class="btn btn-danger"
        onClick={executeReloadStrategy}
        disabled={loading()}
      >
        {loading() ? "Reloading..." : "Execute Reload Strategy"}
      </button>

      <Show when={result()}>
        <div
          class={`status-message ${result().startsWith("✅") ? "status-success" : "status-error"}`}
        >
          {result().startsWith("✅") ? (
            <CheckmarkCircle size={16} />
          ) : (
            <XCircle size={16} />
          )}
          <span>{result()}</span>
        </div>
      </Show>
    </div>
  );
};

const RecoveryDemo: Component = () => {
  return (
    <div class="error-demo-container">
      <div class="error-demo-header">
        <ArrowClockwise size={32} />
        <div>
          <h2>Recovery Strategy Demonstrations</h2>
          <p>
            Test various recovery strategies and see how they handle different
            error scenarios
          </p>
        </div>
      </div>

      <div class="error-demo-content">
        <div class="error-demo-sidebar">
          <h3>Recovery Strategies</h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <ArrowClockwise size={16} />
              <span>Retry Strategy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Refresh size={16} />
              <span>Reset Strategy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Shield size={16} />
              <span>Fallback UI Strategy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Globe size={16} />
              <span>Redirect Strategy</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <Refresh size={16} />
              <span>Reload Strategy</span>
            </div>
          </div>

          <div style="margin-top: 2rem; padding: 1rem; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 0.5rem 0; color: #667eea;">
              Strategy Priority
            </h4>
            <div style="font-size: 0.9rem; color: #64748b;">
              <div>1. Retry (highest priority)</div>
              <div>2. Fallback UI</div>
              <div>3. Reset</div>
              <div>4. Redirect</div>
              <div>5. Reload (lowest priority)</div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 2rem;">
          <ErrorBoundary>
            <RetryStrategyDemo />
          </ErrorBoundary>

          <ErrorBoundary>
            <ResetStrategyDemo />
          </ErrorBoundary>

          <ErrorBoundary>
            <FallbackStrategyDemo />
          </ErrorBoundary>

          <ErrorBoundary>
            <RedirectStrategyDemo />
          </ErrorBoundary>

          <ErrorBoundary>
            <ReloadStrategyDemo />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default RecoveryDemo;
