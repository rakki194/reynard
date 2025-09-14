/**
 * PerformanceExportTab Component
 * Performance export tab for performance dashboard
 */

import { Component, Show, createEffect, createSignal, onMount } from "solid-js";
import { Button } from "../primitives/Button";
import { Select } from "../primitives/Select";
import { TextField } from "../primitives/TextField";
import { Toggle } from "../primitives";

export interface PerformanceExportTabProps {
  performanceHistory: Array<{
    timestamp: number;
    memoryUsage: number;
    browserResponsiveness: number;
    frameRate: number;
    selectionDuration?: number;
    itemsPerSecond?: number;
    domUpdateCount?: number;
    styleApplicationCount?: number;
    frameDropCount?: number;
  }>;
  warnings: Array<{
    type: "critical" | "high" | "medium" | "low";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  onExport: () => void;
}

export const PerformanceExportTab: Component<PerformanceExportTabProps> = (
  props,
) => {
  const [exportOptions, setExportOptions] = createSignal({
    format: "json" as "json" | "csv" | "html",
    includeHistory: true,
    includeWarnings: true,
    includeSummary: true,
    timeRange: "24h" as "1h" | "6h" | "24h" | "7d" | "all",
    filename: `performance-report-${new Date().toISOString().split("T")[0]}`,
  });
  const [exportSummary, setExportSummary] = createSignal({
    totalDataPoints: 0,
    timeRange: "",
    totalWarnings: 0,
    criticalWarnings: 0,
    highWarnings: 0,
    mediumWarnings: 0,
    lowWarnings: 0,
  });
  const [isExporting, setIsExporting] = createSignal(false);
  const [exportProgress, setExportProgress] = createSignal(0);
  const [lastExport, setLastExport] = createSignal<Date | null>(null);

  onMount(() => {
    updateExportSummary();
  });

  // Update export summary
  const updateExportSummary = () => {
    const history = props.performanceHistory;
    const warnings = props.warnings;
    const timeRange = exportOptions().timeRange;

    // Filter data by time range
    const filteredHistory = filterDataByTimeRange(history, timeRange);
    const filteredWarnings = filterDataByTimeRange(warnings, timeRange);

    // Calculate summary statistics
    const totalDataPoints = filteredHistory.length;
    const totalWarnings = filteredWarnings.length;
    const criticalWarnings = filteredWarnings.filter(
      (w) => w.severity === "critical",
    ).length;
    const highWarnings = filteredWarnings.filter(
      (w) => w.severity === "high",
    ).length;
    const mediumWarnings = filteredWarnings.filter(
      (w) => w.severity === "medium",
    ).length;
    const lowWarnings = filteredWarnings.filter(
      (w) => w.severity === "low",
    ).length;

    const summary = {
      totalDataPoints,
      timeRange: getTimeRangeLabel(timeRange),
      totalWarnings,
      criticalWarnings,
      highWarnings,
      mediumWarnings,
      lowWarnings,
    };

    setExportSummary(summary);
  };

  // Filter data by time range
  const filterDataByTimeRange = (data: any[], timeRange: string) => {
    if (timeRange === "all") {
      return data;
    }

    const now = Date.now();
    const timeRangeMs = getTimeRangeMs(timeRange);
    const cutoffTime = now - timeRangeMs;

    return data.filter((entry) => entry.timestamp >= cutoffTime);
  };

  // Get time range in milliseconds
  const getTimeRangeMs = (timeRange: string): number => {
    switch (timeRange) {
      case "1h":
        return 60 * 60 * 1000;
      case "6h":
        return 6 * 60 * 60 * 1000;
      case "24h":
        return 24 * 60 * 60 * 1000;
      case "7d":
        return 7 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  };

  // Get time range label
  const getTimeRangeLabel = (timeRange: string): string => {
    switch (timeRange) {
      case "1h":
        return "Last 1 hour";
      case "6h":
        return "Last 6 hours";
      case "24h":
        return "Last 24 hours";
      case "7d":
        return "Last 7 days";
      case "all":
        return "All time";
      default:
        return "Last 24 hours";
    }
  };

  // Export performance data
  const exportPerformanceData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const options = exportOptions();
      const history = props.performanceHistory;
      const warnings = props.warnings;

      // Filter data by time range
      const filteredHistory = filterDataByTimeRange(history, options.timeRange);
      const filteredWarnings = filterDataByTimeRange(
        warnings,
        options.timeRange,
      );

      setExportProgress(25);

      // Prepare export data
      const exportData: any = {
        metadata: {
          exportDate: new Date().toISOString(),
          timeRange: options.timeRange,
          totalDataPoints: filteredHistory.length,
          totalWarnings: filteredWarnings.length,
        },
      };

      if (options.includeSummary) {
        exportData.summary = exportSummary();
        setExportProgress(50);
      }

      if (options.includeHistory) {
        exportData.performanceHistory = filteredHistory;
        setExportProgress(75);
      }

      if (options.includeWarnings) {
        exportData.warnings = filteredWarnings;
        setExportProgress(90);
      }

      // Generate export file
      let content: string;
      let mimeType: string;
      let fileExtension: string;

      switch (options.format) {
        case "json":
          content = JSON.stringify(exportData, null, 2);
          mimeType = "application/json";
          fileExtension = "json";
          break;
        case "csv":
          content = generateCSV(exportData);
          mimeType = "text/csv";
          fileExtension = "csv";
          break;
        case "html":
          content = generateHTML(exportData);
          mimeType = "text/html";
          fileExtension = "html";
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
          mimeType = "application/json";
          fileExtension = "json";
      }

      setExportProgress(95);

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.filename}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportProgress(100);
      setLastExport(new Date());

      // Call the parent export callback
      props.onExport();
    } catch (error) {
      console.error("Failed to export performance data:", error);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Generate CSV content
  const generateCSV = (data: any): string => {
    const lines: string[] = [];

    // Header
    lines.push(
      "Timestamp,Frame Rate,Memory Usage,Browser Responsiveness,Selection Duration,Items Per Second,DOM Updates,Style Applications,Frame Drops",
    );

    // Data rows
    if (data.performanceHistory) {
      data.performanceHistory.forEach((entry: any) => {
        lines.push(
          [
            new Date(entry.timestamp).toISOString(),
            entry.frameRate,
            entry.memoryUsage,
            entry.browserResponsiveness,
            entry.selectionDuration || 0,
            entry.itemsPerSecond || 0,
            entry.domUpdateCount || 0,
            entry.styleApplicationCount || 0,
            entry.frameDropCount || 0,
          ].join(","),
        );
      });
    }

    return lines.join("\n");
  };

  // Generate HTML content
  const generateHTML = (data: any): string => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { background: #e8f4f8; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .metric { background: white; padding: 15px; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .warnings { background: #fff3cd; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .warning { background: white; padding: 10px; margin: 5px 0; border-radius: 3px; border-left: 4px solid #ffc107; }
        .critical { border-left-color: #dc3545; }
        .high { border-left-color: #fd7e14; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Performance Report</h1>
        <p>Generated on: ${new Date().toISOString()}</p>
        <p>Time Range: ${data.metadata.timeRange}</p>
        <p>Total Data Points: ${data.metadata.totalDataPoints}</p>
    </div>
    
    ${
      data.summary
        ? `
    <div class="summary">
        <h2>Summary</h2>
        <div class="metrics">
            <div class="metric">
                <h3>Total Warnings</h3>
                <p>${data.summary.totalWarnings}</p>
            </div>
            <div class="metric">
                <h3>Critical Warnings</h3>
                <p>${data.summary.criticalWarnings}</p>
            </div>
            <div class="metric">
                <h3>High Warnings</h3>
                <p>${data.summary.highWarnings}</p>
            </div>
            <div class="metric">
                <h3>Medium Warnings</h3>
                <p>${data.summary.mediumWarnings}</p>
            </div>
        </div>
    </div>
    `
        : ""
    }
    
    ${
      data.warnings && data.warnings.length > 0
        ? `
    <div class="warnings">
        <h2>Performance Warnings</h2>
        ${data.warnings
          .map(
            (warning: any) => `
        <div class="warning ${warning.severity}">
            <strong>${warning.severity.toUpperCase()}</strong>: ${warning.message}
            <br>Value: ${warning.value}ms, Threshold: ${warning.threshold}ms
            <br>Time: ${new Date(warning.timestamp).toLocaleString()}
        </div>
        `,
          )
          .join("")}
    </div>
    `
        : ""
    }
</body>
</html>`;
  };

  // Update export summary when options change
  createEffect(() => {
    updateExportSummary();
  });

  const formats = [
    { value: "json", label: "JSON" },
    { value: "csv", label: "CSV" },
    { value: "html", label: "HTML" },
  ];

  const timeRanges = [
    { value: "1h", label: "Last 1 hour" },
    { value: "6h", label: "Last 6 hours" },
    { value: "24h", label: "Last 24 hours" },
    { value: "7d", label: "Last 7 days" },
    { value: "all", label: "All time" },
  ];

  return (
    <div class="performance-export-panel">
      {/* Header */}
      <div class="export-panel-header">
        <div class="export-panel-title">
          <h3>Export Performance Data</h3>
        </div>
      </div>

      {/* Export Options */}
      <div class="export-options">
        <h4>Export Options</h4>
        <div class="options-grid">
          <div class="option-group">
            <label>Format:</label>
            <Select
              value={exportOptions().format}
              onChange={(value) =>
                setExportOptions((prev) => ({ ...prev, format: value as any }))
              }
              options={formats}
            />
          </div>

          <div class="option-group">
            <label>Time Range:</label>
            <Select
              value={exportOptions().timeRange}
              onChange={(value) =>
                setExportOptions((prev) => ({
                  ...prev,
                  timeRange: value as any,
                }))
              }
              options={timeRanges}
            />
          </div>

          <div class="option-group">
            <label>Filename:</label>
            <TextField
              value={exportOptions().filename}
              onInput={(e) =>
                setExportOptions((prev) => ({
                  ...prev,
                  filename: e.target.value,
                }))
              }
              placeholder="Enter filename"
            />
          </div>
        </div>

        <div class="include-options">
          <h5>Include in Export:</h5>
          <div class="checkbox-group">
            <label>
              <Toggle
                checked={exportOptions().includeSummary}
                onChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeSummary: checked,
                  }))
                }
                size="sm"
              />
              Summary Statistics
            </label>
            <label>
              <Toggle
                checked={exportOptions().includeHistory}
                onChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeHistory: checked,
                  }))
                }
                size="sm"
              />
              Performance History
            </label>
            <label>
              <Toggle
                checked={exportOptions().includeWarnings}
                onChange={(checked) =>
                  setExportOptions((prev) => ({
                    ...prev,
                    includeWarnings: checked,
                  }))
                }
                size="sm"
              />
              Performance Warnings
            </label>
          </div>
        </div>
      </div>

      {/* Export Summary */}
      <div class="export-summary">
        <h4>Export Summary</h4>
        <div class="summary-grid">
          <div class="summary-item">
            <label>Data Points:</label>
            <span class="value">{exportSummary().totalDataPoints}</span>
          </div>
          <div class="summary-item">
            <label>Time Range:</label>
            <span class="value">{exportSummary().timeRange}</span>
          </div>
          <div class="summary-item">
            <label>Total Warnings:</label>
            <span class="value">{exportSummary().totalWarnings}</span>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div class="export-actions">
        <Button
          variant="primary"
          onClick={exportPerformanceData}
          disabled={isExporting()}
        >
          <Show when={isExporting()} fallback="Export Data">
            <span class="spinner"></span>
            Exporting... {exportProgress()}%
          </Show>
        </Button>
      </div>

      {/* Last Export */}
      <Show when={lastExport()}>
        <div class="last-export">
          Last exported: {lastExport()!.toLocaleString()}
        </div>
      </Show>
    </div>
  );
};
