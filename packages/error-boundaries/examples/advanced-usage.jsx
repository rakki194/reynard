/**
 * Advanced Error Boundary Usage Example
 * Demonstrates custom recovery strategies and error reporting
 */
import { ErrorBoundary, ErrorFallback, createRecoveryStrategy, useErrorBoundary, useErrorReporting, } from "reynard-error-boundaries";
import { ReynardProvider } from "reynard-themes";
import "reynard-themes/themes.css";
import { Button, Card } from "reynard-components";
// Custom recovery strategy for network errors
const networkRetryStrategy = createRecoveryStrategy("network-retry", "Retry Network Request", "Retry the failed network request with exponential backoff", (error, context) => context.category === "network", async (error, context) => {
    // Simulate network retry logic
    console.log("Retrying network request...", error.message);
    // In a real app, this would retry the actual network request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
        success: true,
        action: "retry",
        message: "Network request retried successfully",
    };
}, 1, // High priority
5000);
// Custom recovery strategy for authentication errors
const authRedirectStrategy = createRecoveryStrategy("auth-redirect", "Redirect to Login", "Redirect to login page for authentication errors", (error, context) => context.category === "authentication", async (error, context) => {
    console.log("Redirecting to login...", error.message);
    // In a real app, this would use a router
    if (typeof window !== "undefined") {
        window.location.href = "/login";
    }
    return {
        success: true,
        action: "redirect",
        message: "Redirected to login page",
    };
}, 2);
// Component that demonstrates different error types
const ErrorDemoComponent = () => {
    const { handleError } = useErrorBoundary({
        recoveryStrategies: [networkRetryStrategy, authRedirectStrategy],
        onError: (error, context) => {
            console.log("Error handled:", error.name, context.category);
        },
    });
    const throwNetworkError = () => {
        const error = new Error("Network request failed");
        error.name = "NetworkError";
        handleError(error, { componentStack: "ErrorDemoComponent" });
    };
    const throwAuthError = () => {
        const error = new Error("Authentication required");
        error.name = "AuthError";
        handleError(error, { componentStack: "ErrorDemoComponent" });
    };
    const throwRenderError = () => {
        const error = new Error("Component render failed");
        error.name = "RenderError";
        handleError(error, { componentStack: "ErrorDemoComponent" });
    };
    return (<Card padding="lg">
      <h3>Error Demo Component</h3>
      <p>Click the buttons below to trigger different types of errors:</p>

      <div style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            marginTop: "1rem",
        }}>
        <Button variant="outline" onClick={throwNetworkError}>
          Network Error
        </Button>
        <Button variant="outline" onClick={throwAuthError}>
          Auth Error
        </Button>
        <Button variant="outline" onClick={throwRenderError}>
          Render Error
        </Button>
      </div>
    </Card>);
};
// Error reporting dashboard
const ErrorDashboard = () => {
    const { reports, getMetrics, clearReports } = useErrorReporting({
        enabled: true,
        endpoint: "/api/errors",
        batchSize: 10,
        flushInterval: 30000,
    });
    const metrics = getMetrics();
    return (<Card padding="lg">
      <h3>Error Dashboard</h3>
      <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
        }}>
        <div>
          <h4>Total Reports</h4>
          <p style={{ fontSize: "2rem", margin: 0, color: "var(--accent)" }}>
            {metrics.totalReports}
          </p>
        </div>
        <div>
          <h4>Average per Hour</h4>
          <p style={{ fontSize: "2rem", margin: 0, color: "var(--accent)" }}>
            {metrics.averageReportsPerHour}
          </p>
        </div>
        <div>
          <h4>Last Report</h4>
          <p style={{ fontSize: "1rem", margin: 0 }}>
            {metrics.lastReportTime
            ? new Date(metrics.lastReportTime).toLocaleTimeString()
            : "None"}
          </p>
        </div>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Button variant="secondary" onClick={clearReports}>
          Clear Reports
        </Button>
      </div>
    </Card>);
};
// Main demo component
const AdvancedErrorBoundaryDemo = () => {
    return (<div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <h1>🦊 Advanced Error Boundary Demo</h1>
      <p>
        This demonstrates advanced error boundary features including custom
        recovery strategies and error reporting.
      </p>

      <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2rem",
            marginTop: "2rem",
        }}>
        <ErrorBoundary fallback={ErrorFallback} recoveryStrategies={[networkRetryStrategy, authRedirectStrategy]} reportErrors={true} errorReporting={{
            enabled: true,
            endpoint: "/api/errors",
            batchSize: 5,
            flushInterval: 30000,
            filters: [
                { type: "severity", value: "high", action: "include" },
                { type: "category", value: "network", action: "exclude" },
            ],
        }}>
          <ErrorDemoComponent />
        </ErrorBoundary>

        <ErrorDashboard />
      </div>
    </div>);
};
// App with theme provider
const App = () => {
    return (<ReynardProvider>
      <AdvancedErrorBoundaryDemo />
    </ReynardProvider>);
};
export default App;
