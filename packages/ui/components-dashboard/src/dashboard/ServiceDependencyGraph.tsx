/**
 * ServiceDependencyGraph Component
 * Service dependency graph visualization
 */
import { Show, For } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const ServiceDependencyGraph = props => {
  // Mock dependency data
  const getDependencies = serviceName => {
    const dependencyMap = {
      "caption-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "redis",
          status: "running",
          health: "healthy",
          isRequired: false,
        },
      ],
      "nlweb-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "redis",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
      ],
      "summarization-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "ollama-service",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
      ],
      "ollama-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: false,
        },
      ],
      "diffusion-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "redis",
          status: "running",
          health: "healthy",
          isRequired: false,
        },
      ],
      "tts-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
      ],
      "embedding-visualization": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "caption-service",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
      ],
      "comfy-service": [
        {
          name: "database",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
        {
          name: "redis",
          status: "running",
          health: "healthy",
          isRequired: true,
        },
      ],
    };
    return dependencyMap[serviceName] || [];
  };
  const dependencies = () => getDependencies(props.serviceName);
  const getStatusIcon = dependency => {
    switch (dependency.status) {
      case "running":
        return dependency.health === "healthy" ? "checkmark-circle" : "warning";
      case "failed":
        return "dismiss-circle";
      case "starting":
        return "spinner";
      case "stopping":
        return "warning";
      default:
        return "info";
    }
  };
  const getStatusColor = dependency => {
    switch (dependency.status) {
      case "running":
        return dependency.health === "healthy" ? "success" : "warning";
      case "failed":
        return "error";
      case "starting":
        return "info";
      case "stopping":
        return "warning";
      default:
        return "neutral";
    }
  };
  if (props.compact) {
    return (
      <div class="service-dependency-graph compact">
        <div class="dependency-summary">
          <span class="label">Dependencies:</span>
          <span class="value">{dependencies().length}</span>
        </div>
      </div>
    );
  }
  return (
    <div class="service-dependency-graph">
      <div class="dependency-header">
        <h4>Dependencies for {props.serviceName}</h4>
      </div>

      <Show when={dependencies().length > 0}>
        <div class="dependencies-list">
          <For each={dependencies()}>
            {dependency => (
              <div class="dependency-item">
                <div class="dependency-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon(getStatusIcon(dependency))?.outerHTML || ""}
                    />
                  </span>

                  <span class="dependency-name">{dependency.name}</span>

                  <Show when={dependency.isRequired}>
                    <span class="required-badge">Required</span>
                  </Show>
                </div>

                <div class="dependency-status">
                  <span class="status-badge" classList={{ [getStatusColor(dependency)]: true }}>
                    {dependency.status}
                  </span>

                  <span class="health-badge" classList={{ [getStatusColor(dependency)]: true }}>
                    {dependency.health}
                  </span>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>

      <Show when={dependencies().length === 0}>
        <div class="no-dependencies">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("info")?.outerHTML || ""}
            />
          </span>
          <span>No dependencies found for this service</span>
        </div>
      </Show>
    </div>
  );
};
