import { createSignal, createEffect, For, Show } from "solid-js";
import { MCPServer } from "../composables/mcpServer";

interface ToolConfig {
  name: string;
  category: string;
  enabled: boolean;
  description: string;
  dependencies: string[];
  config: Record<string, any>;
}

interface ToolConfigList {
  tools: Record<string, ToolConfig>;
  total_tools: number;
  enabled_tools: number;
  disabled_tools: number;
}

const CATEGORIES = [
  "agent",
  "ecs",
  "linting",
  "formatting",
  "search",
  "visualization",
  "security",
  "utility",
  "version",
  "vscode",
  "playwright",
  "monolith",
] as const;

const CATEGORY_EMOJIS: Record<string, string> = {
  agent: "🦊",
  ecs: "🌍",
  linting: "🔍",
  formatting: "✨",
  search: "🔎",
  visualization: "📊",
  security: "🔒",
  utility: "🛠️",
  version: "📋",
  vscode: "💻",
  playwright: "🎭",
  monolith: "🏗️",
};

const CATEGORY_NAMES: Record<string, string> = {
  agent: "Agent Tools",
  ecs: "ECS World Simulation",
  linting: "Linting & Quality",
  formatting: "Code Formatting",
  search: "Search & Discovery",
  visualization: "Visualization",
  security: "Security Analysis",
  utility: "Utilities",
  version: "Version Info",
  vscode: "VS Code Integration",
  playwright: "Browser Automation",
  monolith: "Monolith Detection",
};

export default function ToolConfigPage() {
  const mcpServer = new MCPServer();

  const [configs, setConfigs] = createSignal<ToolConfigList | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [selectedCategory, setSelectedCategory] = createSignal<string | null>(null);
  const [searchTerm, setSearchTerm] = createSignal("");

  // Load tool configurations
  const loadConfigs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/mcp/tool-config/");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ToolConfigList = await response.json();
      setConfigs(data);
    } catch (err) {
      console.error("Failed to load tool configurations:", err);
      setError(err instanceof Error ? err.message : "Failed to load configurations");
    } finally {
      setLoading(false);
    }
  };

  // Toggle tool state
  const toggleTool = async (toolName: string) => {
    try {
      const response = await fetch(`/api/mcp/tool-config/${toolName}/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Reload configurations to get updated state
      await loadConfigs();
    } catch (err) {
      console.error(`Failed to toggle tool ${toolName}:`, err);
      setError(err instanceof Error ? err.message : "Failed to toggle tool");
    }
  };

  // Enable tool
  const enableTool = async (toolName: string) => {
    try {
      const response = await fetch(`/api/mcp/tool-config/${toolName}/enable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await loadConfigs();
    } catch (err) {
      console.error(`Failed to enable tool ${toolName}:`, err);
      setError(err instanceof Error ? err.message : "Failed to enable tool");
    }
  };

  // Disable tool
  const disableTool = async (toolName: string) => {
    try {
      const response = await fetch(`/api/mcp/tool-config/${toolName}/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      await loadConfigs();
    } catch (err) {
      console.error(`Failed to disable tool ${toolName}:`, err);
      setError(err instanceof Error ? err.message : "Failed to disable tool");
    }
  };

  // Load configurations on mount
  createEffect(() => {
    loadConfigs();
  });

  // Filter tools based on category and search term
  const filteredTools = () => {
    const configData = configs();
    if (!configData) return [];

    let tools = Object.entries(configData.tools);

    // Filter by category
    if (selectedCategory()) {
      tools = tools.filter(([_, tool]) => tool.category === selectedCategory());
    }

    // Filter by search term
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      tools = tools.filter(
        ([name, tool]) => name.toLowerCase().includes(term) || tool.description.toLowerCase().includes(term)
      );
    }

    return tools;
  };

  // Group tools by category
  const toolsByCategory = () => {
    const tools = filteredTools();
    const grouped: Record<string, Array<[string, ToolConfig]>> = {};

    tools.forEach(([name, tool]) => {
      if (!grouped[tool.category]) {
        grouped[tool.category] = [];
      }
      grouped[tool.category].push([name, tool]);
    });

    return grouped;
  };

  return (
    <div class="tool-config-page">
      <div class="header">
        <h1>🛠️ MCP Tool Configuration</h1>
        <p>Manage and configure MCP server tools</p>
      </div>

      {/* Statistics */}
      <Show when={configs()}>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-number">{configs()!.total_tools}</div>
            <div class="stat-label">Total Tools</div>
          </div>
          <div class="stat-card enabled">
            <div class="stat-number">{configs()!.enabled_tools}</div>
            <div class="stat-label">Enabled</div>
          </div>
          <div class="stat-card disabled">
            <div class="stat-number">{configs()!.disabled_tools}</div>
            <div class="stat-label">Disabled</div>
          </div>
        </div>
      </Show>

      {/* Controls */}
      <div class="controls">
        <div class="search-box">
          <input
            type="text"
            placeholder="Search tools..."
            value={searchTerm()}
            onInput={e => setSearchTerm(e.currentTarget.value)}
            class="search-input"
          />
        </div>

        <div class="category-filter">
          <select
            value={selectedCategory() || ""}
            onChange={e => setSelectedCategory(e.currentTarget.value || null)}
            class="category-select"
          >
            <option value="">All Categories</option>
            <For each={CATEGORIES}>
              {category => (
                <option value={category}>
                  {CATEGORY_EMOJIS[category]} {CATEGORY_NAMES[category]}
                </option>
              )}
            </For>
          </select>
        </div>

        <button onClick={loadConfigs} class="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Error Display */}
      <Show when={error()}>
        <div class="error-message">❌ {error()}</div>
      </Show>

      {/* Loading State */}
      <Show when={loading()}>
        <div class="loading">
          <div class="spinner" />
          Loading tool configurations...
        </div>
      </Show>

      {/* Tools List */}
      <Show when={!loading() && configs()}>
        <div class="tools-container">
          <Show when={selectedCategory()}>
            {/* Single category view */}
            <div class="category-section">
              <h2>
                {CATEGORY_EMOJIS[selectedCategory()!]} {CATEGORY_NAMES[selectedCategory()!]}
              </h2>
              <div class="tools-grid">
                <For each={filteredTools()}>
                  {([name, tool]) => (
                    <ToolCard
                      name={name}
                      tool={tool}
                      onToggle={() => toggleTool(name)}
                      onEnable={() => enableTool(name)}
                      onDisable={() => disableTool(name)}
                    />
                  )}
                </For>
              </div>
            </div>
          </Show>

          <Show when={!selectedCategory()}>
            {/* All categories view */}
            <For each={Object.entries(toolsByCategory())}>
              {([category, tools]) => (
                <div class="category-section">
                  <h2>
                    {CATEGORY_EMOJIS[category]} {CATEGORY_NAMES[category]}
                    <span class="tool-count">({tools.length})</span>
                  </h2>
                  <div class="tools-grid">
                    <For each={tools}>
                      {([name, tool]) => (
                        <ToolCard
                          name={name}
                          tool={tool}
                          onToggle={() => toggleTool(name)}
                          onEnable={() => enableTool(name)}
                          onDisable={() => disableTool(name)}
                        />
                      )}
                    </For>
                  </div>
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
}

interface ToolCardProps {
  name: string;
  tool: ToolConfig;
  onToggle: () => void;
  onEnable: () => void;
  onDisable: () => void;
}

function ToolCard(props: ToolCardProps) {
  return (
    <div class={`tool-card ${props.tool.enabled ? "enabled" : "disabled"}`}>
      <div class="tool-header">
        <h3 class="tool-name">{props.name}</h3>
        <div class={`tool-status ${props.tool.enabled ? "enabled" : "disabled"}`}>
          {props.tool.enabled ? "✅" : "❌"}
        </div>
      </div>

      <p class="tool-description">{props.tool.description}</p>

      <div class="tool-meta">
        <span class="tool-category">
          {CATEGORY_EMOJIS[props.tool.category]} {CATEGORY_NAMES[props.tool.category]}
        </span>
        <Show when={props.tool.dependencies.length > 0}>
          <span class="tool-dependencies">Dependencies: {props.tool.dependencies.join(", ")}</span>
        </Show>
      </div>

      <div class="tool-actions">
        <button onClick={props.onToggle} class={`toggle-btn ${props.tool.enabled ? "disable" : "enable"}`}>
          {props.tool.enabled ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
}
