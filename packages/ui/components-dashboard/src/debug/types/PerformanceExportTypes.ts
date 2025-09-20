/**
 * Type definitions for Performance Export System
 * Centralized types for performance export components
 */

export interface PerformanceDataPoint {
  timestamp: number;
  memoryUsage: number;
  browserResponsiveness: number;
  frameRate: number;
  selectionDuration?: number;
  itemsPerSecond?: number;
  domUpdateCount?: number;
  styleApplicationCount?: number;
  frameDropCount?: number;
}

export interface PerformanceExportPanelProps {
  performanceHistory: PerformanceDataPoint[];
  onExport?: (data: PerformanceDataPoint[], format: string) => void;
  onClearHistory?: () => void;
  maxHistorySize?: number;
}

export interface ExportFormat {
  value: string;
  label: string;
  description: string;
  extension: string;
}

export interface ExportOptions {
  format: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  includeMetrics: string[];
  compression: boolean;
  includeMetadata: boolean;
}

export interface PerformanceExportFormProps {
  options: ExportOptions;
  onOptionsChange: (options: ExportOptions) => void;
  onExport: () => void;
  isExporting: boolean;
  availableMetrics: string[];
}

export interface PerformanceDataTableProps {
  data: PerformanceDataPoint[];
  selectedRows: number[];
  onRowSelect: (index: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  maxRows?: number;
}

export interface PerformanceExportState {
  exportOptions: ExportOptions;
  isExporting: boolean;
  selectedRows: number[];
  filteredData: PerformanceDataPoint[];
  lastExport: Date | null;
}
