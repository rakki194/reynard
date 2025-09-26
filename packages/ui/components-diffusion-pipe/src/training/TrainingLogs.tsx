/**
 * 🦊 Training Logs Component
 *
 * Real-time log streaming with filtering and search
 * following Reynard's log viewer patterns.
 */

import { Show, createSignal, createEffect, onMount, onCleanup, Component } from "solid-js";
import { Card } from "reynard-primitives";
import { Button } from "reynard-primitives";
import { TextField } from "reynard-primitives";
import { Select } from "reynard-primitives";
import { Badge } from "reynard-primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { useTrainingWebSocket } from "../hooks/useTrainingWebSocket";

export interface LogEntry {
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  source?: string;
  metadata?: any;
}

export interface TrainingLogsProps {
  logs?: LogEntry[];
  trainingId?: string;
  websocketUrl?: string;
  isStreaming?: boolean;
  onClear?: () => void;
  onExport?: () => void;
  onFilter?: (filter: LogFilter) => void;
  compact?: boolean;
  maxLines?: number;
  autoScroll?: boolean;
}

export interface LogFilter {
  level?: "info" | "warning" | "error" | "debug";
  search?: string;
  source?: string;
}

export const TrainingLogs: Component<TrainingLogsProps> = props => {
  const [filteredLogs, setFilteredLogs] = createSignal<LogEntry[]>([]);
  const [allLogs, setAllLogs] = createSignal<LogEntry[]>(props.logs || []);
  const [filter, setFilter] = createSignal<LogFilter>({});
  const [searchTerm, setSearchTerm] = createSignal("");
  const [selectedLevel, setSelectedLevel] = createSignal<string>("all");
  const [selectedSource, setSelectedSource] = createSignal<string>("all");
  const [isAutoScroll, setIsAutoScroll] = createSignal(props.autoScroll ?? true);
  const [isExpanded, setIsExpanded] = createSignal(!props.compact);

  // WebSocket integration for real-time log streaming
  const websocket =
    props.websocketUrl && props.trainingId
      ? useTrainingWebSocket({
          url: props.websocketUrl,
          reconnectInterval: 5000,
          maxReconnectAttempts: 5,
          heartbeatInterval: 30000,
        })
      : null;

  let logContainer: HTMLDivElement | undefined;
  let scrollTimeout: NodeJS.Timeout | undefined;

  // Handle WebSocket events for real-time log streaming
  createEffect(() => {
    if (websocket) {
      const events = websocket.events();
      events.forEach(event => {
        if (event.type === "log" && event.trainingId === props.trainingId) {
          const logEntry: LogEntry = {
            timestamp: event.timestamp.toISOString(),
            level: event.data.level || "info",
            message: event.data.message || "",
            source: event.data.source,
            metadata: event.data.metadata,
          };
          setAllLogs(prev => [...prev, logEntry]);
        }
      });
    }
  });

  // Filter logs based on current filter
  createEffect(() => {
    let filtered = [...allLogs()];

    // Apply level filter
    if (selectedLevel() !== "all") {
      filtered = filtered.filter(log => log.level === selectedLevel());
    }

    // Apply source filter
    if (selectedSource() !== "all") {
      filtered = filtered.filter(log => log.source === selectedSource());
    }

    // Apply search filter
    if (searchTerm()) {
      const term = searchTerm().toLowerCase();
      filtered = filtered.filter(
        log => log.message.toLowerCase().includes(term) || log.source?.toLowerCase().includes(term)
      );
    }

    // Limit number of lines
    if (props.maxLines) {
      filtered = filtered.slice(-props.maxLines);
    }

    setFilteredLogs(filtered);
  });

  // Subscribe to training logs via WebSocket
  onMount(() => {
    if (websocket && props.trainingId) {
      websocket.subscribe(props.trainingId);
    }
  });

  onCleanup(() => {
    if (websocket && props.trainingId) {
      websocket.unsubscribe(props.trainingId);
    }
  });

  // Auto-scroll to bottom when new logs arrive
  createEffect(() => {
    if (isAutoScroll() && logContainer) {
      scrollTimeout = setTimeout(() => {
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      }, 100);
    }
  });

  onCleanup(() => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });

  // Get unique sources from logs
  const getUniqueSources = () => {
    const sources = new Set(
      allLogs()
        .map(log => log.source)
        .filter(Boolean)
    );
    return Array.from(sources);
  };

  // Get log level color
  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warning":
        return "outline";
      case "info":
        return "default";
      case "debug":
        return "secondary";
      default:
        return "secondary";
    }
  };

  // Get log level icon
  const getLogLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "warning":
        return fluentIconsPackage.getIcon("warning");
      case "info":
        return fluentIconsPackage.getIcon("info");
      case "debug":
        return fluentIconsPackage.getIcon("bug");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Handle filter changes
  const handleFilterChange = () => {
    const newFilter: LogFilter = {
      level: selectedLevel() !== "all" ? (selectedLevel() as any) : undefined,
      search: searchTerm() || undefined,
      source: selectedSource() !== "all" ? selectedSource() : undefined,
    };

    setFilter(newFilter);
    props.onFilter?.(newFilter);
  };

  // Handle clear logs
  const handleClear = () => {
    props.onClear?.();
  };

  // Handle export logs
  const handleExport = () => {
    props.onExport?.();
  };

  // Handle scroll to bottom
  const handleScrollToBottom = () => {
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight;
    }
  };

  return (
    <Card class={`training-logs ${props.compact ? "compact" : ""}`}>
      <div class="logs-header">
        <div class="logs-title">
          <h3>Training Logs</h3>
          <div class="status-badges">
            <Show when={websocket && websocket.isConnected()}>
              <Badge variant="secondary">
                <span class="streaming-indicator" />
                Live
              </Badge>
            </Show>
            <Show when={websocket && websocket.isConnecting()}>
              <Badge variant="outline">
                <span class="connecting-indicator" />
                Connecting...
              </Badge>
            </Show>
            <Show when={websocket && websocket.error()}>
              <Badge variant="destructive">
                <span class="error-indicator" />
                Connection Error
              </Badge>
            </Show>
            <Show when={!websocket && props.isStreaming}>
              <Badge variant="secondary">
                <span class="streaming-indicator" />
                Live
              </Badge>
            </Show>
          </div>
        </div>

        <div class="logs-actions">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExport}>
            Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded())}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(isExpanded() ? "chevron-up" : "chevron-down")?.outerHTML || ""}
            />
          </Button>
        </div>
      </div>

      <Show when={isExpanded()}>
        <div class="logs-filters">
          <div class="filter-group">
            <TextField
              placeholder="Search logs..."
              value={searchTerm()}
              onInput={e => {
                setSearchTerm(e.currentTarget.value);
                handleFilterChange();
              }}
              size="sm"
            />
          </div>

          <div class="filter-group">
            <Select
              value={selectedLevel()}
              onChange={e => {
                setSelectedLevel(e.currentTarget.value);
                handleFilterChange();
              }}
              options={[
                { value: "all", label: "All Levels" },
                { value: "error", label: "Error" },
                { value: "warning", label: "Warning" },
                { value: "info", label: "Info" },
                { value: "debug", label: "Debug" },
              ]}
              size="sm"
            />
          </div>

          <Show when={getUniqueSources().length > 0}>
            <div class="filter-group">
              <Select
                value={selectedSource()}
                onChange={e => {
                  setSelectedSource(e.currentTarget.value);
                  handleFilterChange();
                }}
                options={[
                  { value: "all", label: "All Sources" },
                  ...getUniqueSources()
                    .filter((source): source is string => source !== undefined)
                    .map((source: string) => ({
                      value: source,
                      label: source,
                    })),
                ]}
                size="sm"
              />
            </div>
          </Show>

          <div class="filter-group">
            <Button
              variant={isAutoScroll() ? "primary" : "ghost"}
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll())}
            >
              Auto-scroll
            </Button>
          </div>
        </div>
      </Show>

      <div class="logs-container" ref={logContainer}>
        <div class="logs-content">
          {filteredLogs().map((log, index) => (
            <div class={`log-entry log-${log.level}`}>
              <div class="log-timestamp">{formatTimestamp(log.timestamp)}</div>
              <div class="log-level">
                <Badge variant={getLogLevelColor(log.level)}>
                  <span class="level-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={getLogLevelIcon(log.level)?.outerHTML || ""}
                    />
                  </span>
                  {log.level.toUpperCase()}
                </Badge>
              </div>
              <Show when={log.source}>
                <div class="log-source">{log.source}</div>
              </Show>
              <div class="log-message">{log.message}</div>
            </div>
          ))}

          <Show when={filteredLogs().length === 0}>
            <div class="logs-empty">
              <div class="empty-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("document-text")?.outerHTML || ""}
                />
              </div>
              <p>No logs to display</p>
              <Show when={searchTerm() || selectedLevel() !== "all" || selectedSource() !== "all"}>
                <p>Try adjusting your filters</p>
              </Show>
            </div>
          </Show>
        </div>
      </div>

      <div class="logs-footer">
        <div class="logs-stats">
          <span>
            {filteredLogs().length} of {allLogs().length} logs
          </span>
        </div>
        <div class="logs-controls">
          <Button variant="ghost" size="sm" onClick={handleScrollToBottom}>
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("arrow-down")?.outerHTML || ""}
            />
            Bottom
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TrainingLogs;
