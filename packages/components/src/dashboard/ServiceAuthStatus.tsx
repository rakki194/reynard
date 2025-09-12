/**
 * ServiceAuthStatus Component
 * Authentication service status monitoring
 */

import { Component, Show, createSignal, onMount } from "solid-js";
import { Button } from "reynard-components";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface ServiceAuthStatusProps {
  /** Whether to show only critical services */
  showCriticalOnly?: boolean;
  /** Whether to show progress */
  showProgress?: boolean;
  /** Whether to show retry button */
  showRetryButton?: boolean;
  /** Whether to show compact version */
  compact?: boolean;
}

export interface AuthServiceInfo {
  name: string;
  status: "available" | "unavailable" | "degraded";
  isCritical: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

export const ServiceAuthStatus: Component<ServiceAuthStatusProps> = (props) => {
  const [authServices, setAuthServices] = createSignal<AuthServiceInfo[]>([]);
  const [isChecking, setIsChecking] = createSignal(false);
  const [lastCheck, setLastCheck] = createSignal<Date | null>(null);

  onMount(() => {
    // Initial data load
    checkAuthServices();
  });

  const checkAuthServices = async () => {
    setIsChecking(true);

    try {
      // Simulate API calls to auth service health endpoints
      const mockServices: AuthServiceInfo[] = [
        {
          name: "auth-service",
          status: "available",
          isCritical: true,
          lastCheck: new Date(),
          responseTime: 45,
        },
        {
          name: "user-management",
          status: "available",
          isCritical: true,
          lastCheck: new Date(),
          responseTime: 32,
        },
        {
          name: "session-manager",
          status: "available",
          isCritical: true,
          lastCheck: new Date(),
          responseTime: 28,
        },
        {
          name: "oauth-provider",
          status: "degraded",
          isCritical: false,
          lastCheck: new Date(),
          responseTime: 150,
          error: "High response time",
        },
      ];

      setAuthServices(mockServices);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Failed to check auth services:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const filteredServices = () => {
    const services = authServices();
    if (props.showCriticalOnly) {
      return services.filter((s) => s.isCritical);
    }
    return services;
  };

  const getStatusIcon = (service: AuthServiceInfo) => {
    switch (service.status) {
      case "available":
        return "checkmark-circle";
      case "degraded":
        return "warning";
      case "unavailable":
        return "dismiss-circle";
      default:
        return "info";
    }
  };

  const getStatusColor = (service: AuthServiceInfo) => {
    switch (service.status) {
      case "available":
        return "success";
      case "degraded":
        return "warning";
      case "unavailable":
        return "error";
      default:
        return "neutral";
    }
  };

  const getOverallStatus = () => {
    const services = filteredServices();
    const criticalServices = services.filter((s) => s.isCritical);

    if (criticalServices.some((s) => s.status === "unavailable")) {
      return "critical";
    }

    if (criticalServices.some((s) => s.status === "degraded")) {
      return "warning";
    }

    return "healthy";
  };

  const getOverallStatusIcon = () => {
    const status = getOverallStatus();
    switch (status) {
      case "healthy":
        return "checkmark-circle";
      case "warning":
        return "warning";
      case "critical":
        return "dismiss-circle";
      default:
        return "info";
    }
  };

  const getOverallStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case "healthy":
        return "success";
      case "warning":
        return "warning";
      case "critical":
        return "error";
      default:
        return "neutral";
    }
  };

  const getOverallStatusMessage = () => {
    const status = getOverallStatus();
    const services = filteredServices();
    const criticalServices = services.filter((s) => s.isCritical);

    switch (status) {
      case "healthy":
        return "All authentication services are operational";
      case "warning":
        return `${criticalServices.filter((s) => s.status === "degraded").length} critical services degraded`;
      case "critical":
        return `${criticalServices.filter((s) => s.status === "unavailable").length} critical services unavailable`;
      default:
        return "Authentication service status unknown";
    }
  };

  if (props.compact) {
    return (
      <div class="service-auth-status compact">
        <div class="auth-status-summary">
          <span
            class="status-icon"
            classList={{ [getOverallStatusColor()]: true }}
          >
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={
                fluentIconsPackage.getIcon(getOverallStatusIcon())?.outerHTML ||
                ""
              }
            />
          </span>
          <span class="status-message">{getOverallStatusMessage()}</span>
        </div>
      </div>
    );
  }

  return (
    <div class="service-auth-status">
      {/* Header */}
      <div class="auth-status-header">
        <div class="auth-status-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("shield")?.outerHTML || ""}
            />
          </span>
          <h3>Authentication Services</h3>
        </div>

        <div class="auth-status-actions">
          <Show when={props.showRetryButton}>
            <Button
              variant="secondary"
              size="sm"
              onClick={checkAuthServices}
              disabled={isChecking()}
            >
              <Show when={isChecking()} fallback="Check Status">
                Checking...
              </Show>
            </Button>
          </Show>
        </div>
      </div>

      {/* Overall Status */}
      <div class="overall-status">
        <div
          class="status-summary"
          classList={{ [getOverallStatusColor()]: true }}
        >
          <span class="status-icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={
                fluentIconsPackage.getIcon(getOverallStatusIcon())?.outerHTML ||
                ""
              }
            />
          </span>
          <span class="status-message">{getOverallStatusMessage()}</span>
        </div>
      </div>

      {/* Services List */}
      <div class="auth-services-list">
        <For each={filteredServices()}>
          {(service) => (
            <div class="auth-service-item">
              <div class="service-header">
                <div class="service-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon(getStatusIcon(service))
                          ?.outerHTML || ""
                      }
                    />
                  </span>

                  <div class="service-details">
                    <span class="service-name">{service.name}</span>
                    <Show when={service.isCritical}>
                      <span class="critical-badge">Critical</span>
                    </Show>
                  </div>
                </div>

                <div class="service-status">
                  <span
                    class="status-badge"
                    classList={{ [getStatusColor(service)]: true }}
                  >
                    {service.status}
                  </span>

                  <Show when={service.responseTime}>
                    <span class="response-time">{service.responseTime}ms</span>
                  </Show>
                </div>
              </div>

              {/* Service Details */}
              <div class="service-details-expanded">
                <div class="detail-row">
                  <span class="label">Last Check:</span>
                  <span class="value">
                    {service.lastCheck.toLocaleString()}
                  </span>
                </div>

                <Show when={service.error}>
                  <div class="detail-row error">
                    <span class="label">Error:</span>
                    <span class="value">{service.error}</span>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Progress Indicator */}
      <Show when={props.showProgress && isChecking()}>
        <div class="auth-check-progress">
          <span class="spinner">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("spinner")?.outerHTML || ""}
            />
          </span>
          <span>Checking authentication services...</span>
        </div>
      </Show>

      {/* Last Check */}
      <Show when={lastCheck()}>
        <div class="last-check">
          Last checked: {lastCheck()!.toLocaleString()}
        </div>
      </Show>
    </div>
  );
};
