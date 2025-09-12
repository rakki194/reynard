/**
 * Performance Export Hook
 * Manages state and operations for performance data export
 */

import { createSignal, createMemo } from "solid-js";
import type { 
  PerformanceDataPoint, 
  ExportOptions, 
  PerformanceExportState 
} from "../types/PerformanceExportTypes";

export function usePerformanceExport(performanceHistory: PerformanceDataPoint[]) {
  const [state, setState] = createSignal<PerformanceExportState>({
    exportOptions: {
      format: "json",
      dateRange: { start: null, end: null },
      includeMetrics: ["memoryUsage", "frameRate", "browserResponsiveness"],
      compression: false,
      includeMetadata: true,
    },
    isExporting: false,
    selectedRows: [],
    filteredData: performanceHistory,
    lastExport: null,
  });

  const availableMetrics = [
    "memoryUsage",
    "frameRate", 
    "browserResponsiveness",
    "selectionDuration",
    "itemsPerSecond",
    "domUpdateCount",
    "styleApplicationCount",
    "frameDropCount"
  ];

  const exportFormats = [
    { value: "json", label: "JSON", description: "JavaScript Object Notation", extension: "json" },
    { value: "csv", label: "CSV", description: "Comma Separated Values", extension: "csv" },
    { value: "xlsx", label: "Excel", description: "Microsoft Excel Format", extension: "xlsx" },
    { value: "xml", label: "XML", description: "Extensible Markup Language", extension: "xml" }
  ];

  const filteredData = createMemo(() => {
    let filtered = performanceHistory;
    const options = state().exportOptions;
    
    // Filter by date range
    if (options.dateRange.start) {
      filtered = filtered.filter(point => 
        new Date(point.timestamp) >= options.dateRange.start!
      );
    }
    if (options.dateRange.end) {
      filtered = filtered.filter(point => 
        new Date(point.timestamp) <= options.dateRange.end!
      );
    }
    
    return filtered;
  });

  const updateExportOptions = (options: Partial<ExportOptions>) => {
    setState(prev => ({
      ...prev,
      exportOptions: { ...prev.exportOptions, ...options }
    }));
  };

  const selectRow = (index: number) => {
    setState(prev => {
      const selected = prev.selectedRows.includes(index)
        ? prev.selectedRows.filter(i => i !== index)
        : [...prev.selectedRows, index];
      return { ...prev, selectedRows: selected };
    });
  };

  const selectAllRows = () => {
    setState(prev => ({
      ...prev,
      selectedRows: Array.from({ length: filteredData().length }, (_, i) => i)
    }));
  };

  const clearSelection = () => {
    setState(prev => ({ ...prev, selectedRows: [] }));
  };

  const exportData = async () => {
    setState(prev => ({ ...prev, isExporting: true }));
    
    try {
      const options = state().exportOptions;
      const dataToExport = state().selectedRows.length > 0
        ? state().selectedRows.map(i => filteredData()[i])
        : filteredData();
      
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create downloadable file
      const blob = createExportBlob(dataToExport, options);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-data-${Date.now()}.${options.format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      setState(prev => ({ 
        ...prev, 
        isExporting: false,
        lastExport: new Date(),
        selectedRows: []
      }));
    } catch (error) {
      console.error("Export failed:", error);
      setState(prev => ({ ...prev, isExporting: false }));
    }
  };

  const createExportBlob = (data: PerformanceDataPoint[], options: ExportOptions) => {
    const format = options.format;
    
    switch (format) {
      case "json":
        return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      case "csv":
        const csv = convertToCSV(data, options.includeMetrics);
        return new Blob([csv], { type: "text/csv" });
      case "xml":
        const xml = convertToXML(data, options.includeMetrics);
        return new Blob([xml], { type: "application/xml" });
      default:
        return new Blob([JSON.stringify(data)], { type: "application/json" });
    }
  };

  const convertToCSV = (data: PerformanceDataPoint[], metrics: string[]) => {
    const headers = ["timestamp", ...metrics];
    const rows = data.map(point => 
      headers.map(header => point[header as keyof PerformanceDataPoint] || "")
    );
    return [headers, ...rows].map(row => row.join(",")).join("\n");
  };

  const convertToXML = (data: PerformanceDataPoint[], metrics: string[]) => {
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<performance-data>',
      ...data.map(point => [
        '  <data-point>',
        `    <timestamp>${point.timestamp}</timestamp>`,
        ...metrics.map(metric => 
          `    <${metric}>${point[metric as keyof PerformanceDataPoint] || ""}</${metric}>`
        ),
        '  </data-point>'
      ].join('\n')),
      '</performance-data>'
    ].join('\n');
    return xml;
  };

  return {
    state,
    filteredData,
    availableMetrics,
    exportFormats,
    updateExportOptions,
    selectRow,
    selectAllRows,
    clearSelection,
    exportData,
  };
}

