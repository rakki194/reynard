/**
 * Label Management Composable
 *
 * Handles label selection and management
 */
export interface LabelManagementOptions {
    labelClasses?: string[];
    defaultLabelClass?: string;
}
export interface LabelManagement {
    selectedLabelClass: () => string;
    setSelectedLabelClass: (label: string) => void;
    availableLabels: () => string[];
    setAvailableLabels: (labels: string[]) => void;
    handleLabelChange: (label: string) => void;
    handleAddLabel: (label: string) => void;
}
export declare const useLabelManagement: (options?: LabelManagementOptions) => LabelManagement;
