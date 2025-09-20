/**
 * ServiceHealthIndicator Component
 * Visual health indicator for service status
 */
import { Show } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const ServiceHealthIndicator = props => {
    const getHealthIcon = () => {
        switch (props.health) {
            case "healthy":
                return fluentIconsPackage.getIcon("checkmark-circle");
            case "degraded":
                return fluentIconsPackage.getIcon("warning");
            case "unhealthy":
                return fluentIconsPackage.getIcon("dismiss-circle");
            case "unknown":
                return fluentIconsPackage.getIcon("question-circle");
            default:
                return fluentIconsPackage.getIcon("info");
        }
    };
    const getHealthClass = () => {
        switch (props.health) {
            case "healthy":
                return "health-healthy";
            case "degraded":
                return "health-degraded";
            case "unhealthy":
                return "health-unhealthy";
            case "unknown":
                return "health-unknown";
            default:
                return "health-unknown";
        }
    };
    const getHealthLabel = () => {
        switch (props.health) {
            case "healthy":
                return "Healthy";
            case "degraded":
                return "Degraded";
            case "unhealthy":
                return "Unhealthy";
            case "unknown":
                return "Unknown";
            default:
                return "Unknown";
        }
    };
    const getSizeClass = () => {
        switch (props.size) {
            case "sm":
                return "size-sm";
            case "md":
                return "size-md";
            case "lg":
                return "size-lg";
            default:
                return "size-md";
        }
    };
    return (<div class={`service-health-indicator ${getHealthClass()} ${getSizeClass()}`}>
      <span class="health-icon">
        <div 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={getHealthIcon()?.outerHTML || ""}/>
      </span>
      <Show when={!props.compact}>
        <span class="health-label">{getHealthLabel()}</span>
      </Show>
    </div>);
};
