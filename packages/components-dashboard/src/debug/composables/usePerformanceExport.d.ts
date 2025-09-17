/**
 * Performance Export Hook
 * Manages state and operations for performance data export
 */
import type { PerformanceDataPoint, ExportOptions, PerformanceExportState } from "../types/PerformanceExportTypes";
export declare function usePerformanceExport(performanceHistory: PerformanceDataPoint[]): {
    state: import("solid-js").Accessor<PerformanceExportState>;
    filteredData: import("solid-js").Accessor<PerformanceDataPoint[]>;
    availableMetrics: string[];
    exportFormats: {
        value: string;
        label: string;
        description: string;
        extension: string;
    }[];
    updateExportOptions: (options: Partial<ExportOptions>) => void;
    selectRow: (index: number) => void;
    selectAllRows: () => void;
    clearSelection: () => void;
    exportData: () => Promise<void>;
};
