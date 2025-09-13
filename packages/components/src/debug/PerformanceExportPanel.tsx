/**
 * Performance Export Panel Component
 * Main component for performance data export functionality
 * Refactored to be modular and under 140 lines
 */

import { Component, Show, For } from "solid-js";
import { Button, Select } from "../primitives";
import { Toggle } from "../primitives";
import { Icon } from "../icons";
import { usePerformanceExport } from "./composables/usePerformanceExport";
import type { PerformanceExportPanelProps } from "./types/PerformanceExportTypes";

export const PerformanceExportPanel: Component<PerformanceExportPanelProps> = (
  props,
) => {
  const {
    state,
    filteredData,
    availableMetrics,
    exportFormats,
    updateExportOptions,
    selectRow,
    selectAllRows,
    clearSelection,
    exportData,
  } = usePerformanceExport(props.performanceHistory);

  const handleExport = async () => {
    await exportData();
    props.onExport?.(filteredData(), state().exportOptions.format);
  };

  const handleClearHistory = () => {
    props.onClearHistory?.();
  };

  return (
    <div class="reynard-performance-export-panel">
      <div class="reynard-performance-export-panel__header">
        <div class="reynard-performance-export-panel__title">
          <Icon name="download" size="lg" />
          <h2>Performance Data Export</h2>
        </div>
        <div class="reynard-performance-export-panel__actions">
          <Button
            variant="secondary"
            size="sm"
            leftIcon="delete"
            onClick={handleClearHistory}
          >
            Clear History
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon="download"
            onClick={handleExport}
            loading={state().isExporting}
            disabled={filteredData().length === 0}
          >
            Export Data
          </Button>
        </div>
      </div>

      <div class="reynard-performance-export-panel__content">
        <div class="reynard-performance-export-panel__summary">
          <div class="reynard-export-summary">
            <div class="reynard-export-summary__item">
              <Icon name="chart" variant="primary" />
              <span>{filteredData().length} data points</span>
            </div>
            <div class="reynard-export-summary__item">
              <Icon name="checkmark-circle" variant="success" />
              <span>{state().selectedRows.length} selected</span>
            </div>
            <Show when={state().lastExport}>
              <div class="reynard-export-summary__item">
                <Icon name="clock" variant="info" />
                <span>Last export: {state().lastExport?.toLocaleString()}</span>
              </div>
            </Show>
          </div>
        </div>

        <div class="reynard-performance-export-panel__options">
          <div class="reynard-export-options">
            <div class="reynard-export-options__section">
              <h4>Export Format</h4>
              <Select
                value={state().exportOptions.format}
                onChange={(e) => updateExportOptions({ format: e.target.value })}
                options={exportFormats.map((f) => ({
                  value: f.value,
                  label: f.label,
                }))}
                size="sm"
              />
            </div>

            <div class="reynard-export-options__section">
              <h4>Include Metrics</h4>
              <div class="reynard-metrics-selection">
                <For each={availableMetrics}>
                  {(metric) => (
                    <label class="reynard-metric-option">
                      <Toggle
                        checked={state().exportOptions.includeMetrics.includes(metric)}
                        onChange={(checked) => {
                          const metrics = state().exportOptions.includeMetrics;
                          const newMetrics = checked
                            ? [...metrics, metric]
                            : metrics.filter((m) => m !== metric);
                          updateExportOptions({ includeMetrics: newMetrics });
                        }}
                        size="sm"
                      />
                      {metric}
                    </label>
                  )}
                </For>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
