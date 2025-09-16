/**
 * FeatureAvailabilityPanel Component
 * Feature availability monitoring with categories and priorities
 */

import { Component, For, Show, createSignal } from "solid-js";
import { Button } from "../primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface FeatureAvailabilityPanelProps {
  /** Whether to show feature categories */
  showCategories?: boolean;
  /** Whether to show feature priorities */
  showPriorities?: boolean;
  /** Whether to show feature dependencies */
  showDependencies?: boolean;
}

export interface FeatureInfo {
  name: string;
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  status: "available" | "degraded" | "unavailable";
  dependencies: string[];
  description: string;
  lastCheck: Date;
  healthScore: number;
}

export const FeatureAvailabilityPanel: Component<
  FeatureAvailabilityPanelProps
> = (props) => {
  const [selectedCategory, setSelectedCategory] = createSignal<string | null>(
    null,
  );
  const [selectedPriority, setSelectedPriority] = createSignal<string | null>(
    null,
  );

  // Mock feature data
  const [features] = createSignal<FeatureInfo[]>([
    {
      name: "caption-generation",
      category: "AI Services",
      priority: "high",
      status: "available",
      dependencies: ["caption-service"],
      description: "Generate captions for images and videos",
      lastCheck: new Date(),
      healthScore: 95,
    },
    {
      name: "nlweb-integration",
      category: "AI Services",
      priority: "critical",
      status: "available",
      dependencies: ["nlweb-service"],
      description: "Natural language web integration",
      lastCheck: new Date(),
      healthScore: 98,
    },
    {
      name: "summarization",
      category: "AI Services",
      priority: "medium",
      status: "degraded",
      dependencies: ["summarization-service"],
      description: "Document and text summarization",
      lastCheck: new Date(),
      healthScore: 75,
    },
    {
      name: "ollama-assistant",
      category: "AI Services",
      priority: "high",
      status: "available",
      dependencies: ["ollama-service"],
      description: "Local LLM assistant integration",
      lastCheck: new Date(),
      healthScore: 92,
    },
    {
      name: "diffusion-generation",
      category: "AI Services",
      priority: "medium",
      status: "available",
      dependencies: ["diffusion-service"],
      description: "AI image generation",
      lastCheck: new Date(),
      healthScore: 88,
    },
    {
      name: "text-to-speech",
      category: "AI Services",
      priority: "low",
      status: "available",
      dependencies: ["tts-service"],
      description: "Convert text to speech",
      lastCheck: new Date(),
      healthScore: 90,
    },
    {
      name: "embedding-visualization",
      category: "Analytics",
      priority: "medium",
      status: "available",
      dependencies: ["embedding-visualization"],
      description: "Visualize embedding data in 3D",
      lastCheck: new Date(),
      healthScore: 85,
    },
    {
      name: "comfyui-workflows",
      category: "AI Services",
      priority: "low",
      status: "unavailable",
      dependencies: ["comfy-service"],
      description: "ComfyUI workflow automation",
      lastCheck: new Date(),
      healthScore: 0,
    },
    {
      name: "rag-search",
      category: "Search",
      priority: "high",
      status: "available",
      dependencies: ["caption-service", "embedding-visualization"],
      description: "Retrieval-augmented generation search",
      lastCheck: new Date(),
      healthScore: 93,
    },
    {
      name: "model-management",
      category: "Management",
      priority: "medium",
      status: "available",
      dependencies: ["ollama-service"],
      description: "AI model management and monitoring",
      lastCheck: new Date(),
      healthScore: 87,
    },
  ]);

  const categories = () => {
    const featureList = features();
    const categorySet = new Set(featureList.map((f) => f.category));
    return Array.from(categorySet);
  };

  const priorities = () => {
    return ["critical", "high", "medium", "low"];
  };

  const filteredFeatures = () => {
    const featureList = features();
    let filtered = featureList;

    if (selectedCategory()) {
      filtered = filtered.filter((f) => f.category === selectedCategory());
    }

    if (selectedPriority()) {
      filtered = filtered.filter((f) => f.priority === selectedPriority());
    }

    return filtered;
  };

  const getStatusIcon = (feature: FeatureInfo) => {
    switch (feature.status) {
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

  const getStatusColor = (feature: FeatureInfo) => {
    switch (feature.status) {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return "success";
    if (score >= 70) return "warning";
    return "error";
  };

  return (
    <div class="feature-availability-panel">
      {/* Header */}
      <div class="feature-panel-header">
        <div class="feature-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("layers")?.outerHTML || ""}
            />
          </span>
          <h3>Feature Availability</h3>
        </div>
      </div>

      {/* Filters */}
      <div class="feature-filters">
        <Show when={props.showCategories}>
          <div class="filter-group">
            <label>Category:</label>
            <select
              value={selectedCategory() || ""}
              onChange={(e) =>
                setSelectedCategory(e.currentTarget.value || null)
              }
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <For each={categories()}>
                {(category) => <option value={category}>{category}</option>}
              </For>
            </select>
          </div>
        </Show>

        <Show when={props.showPriorities}>
          <div class="filter-group">
            <label>Priority:</label>
            <select
              value={selectedPriority() || ""}
              onChange={(e) =>
                setSelectedPriority(e.currentTarget.value || null)
              }
              aria-label="Filter by priority"
            >
              <option value="">All Priorities</option>
              <For each={priorities()}>
                {(priority) => <option value={priority}>{priority}</option>}
              </For>
            </select>
          </div>
        </Show>
      </div>

      {/* Features List */}
      <div class="features-list">
        <For each={filteredFeatures()}>
          {(feature) => (
            <div class="feature-item">
              <div class="feature-header">
                <div class="feature-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon(getStatusIcon(feature))
                          ?.outerHTML || ""
                      }
                    />
                  </span>

                  <div class="feature-details">
                    <span class="feature-name">{feature.name}</span>
                    <span class="feature-description">
                      {feature.description}
                    </span>
                  </div>
                </div>

                <div class="feature-status">
                  <span
                    class="status-badge"
                    classList={{ [getStatusColor(feature)]: true }}
                  >
                    {feature.status}
                  </span>

                  <span
                    class="priority-badge"
                    classList={{ [getPriorityColor(feature.priority)]: true }}
                  >
                    {feature.priority}
                  </span>

                  <span
                    class="health-score"
                    classList={{
                      [getHealthScoreColor(feature.healthScore)]: true,
                    }}
                  >
                    {feature.healthScore}%
                  </span>
                </div>
              </div>

              {/* Feature Details */}
              <div class="feature-details-expanded">
                <div class="detail-row">
                  <span class="label">Category:</span>
                  <span class="value">{feature.category}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Last Check:</span>
                  <span class="value">
                    {feature.lastCheck.toLocaleString()}
                  </span>
                </div>

                <Show
                  when={
                    props.showDependencies && feature.dependencies.length > 0
                  }
                >
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{feature.dependencies.join(", ")}</span>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Summary */}
      <div class="feature-summary">
        <div class="summary-item">
          <span class="label">Total Features:</span>
          <span class="value">{filteredFeatures().length}</span>
        </div>
        <div class="summary-item">
          <span class="label">Available:</span>
          <span class="value success">
            {filteredFeatures().filter((f) => f.status === "available").length}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Degraded:</span>
          <span class="value warning">
            {filteredFeatures().filter((f) => f.status === "degraded").length}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Unavailable:</span>
          <span class="value error">
            {
              filteredFeatures().filter((f) => f.status === "unavailable")
                .length
            }
          </span>
        </div>
      </div>
    </div>
  );
};
