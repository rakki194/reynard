/**
 * Label Management Composable
 *
 * Handles label selection and management
 */
import { createSignal } from "solid-js";
export const useLabelManagement = (options = {}) => {
    const { labelClasses = ["person", "vehicle", "animal", "object"], defaultLabelClass = "person", } = options;
    const [selectedLabelClass, setSelectedLabelClass] = createSignal(defaultLabelClass);
    const [availableLabels, setAvailableLabels] = createSignal(labelClasses);
    const handleLabelChange = (label) => {
        setSelectedLabelClass(label);
    };
    const handleAddLabel = (label) => {
        setAvailableLabels((prev) => [...prev, label]);
    };
    return {
        selectedLabelClass,
        setSelectedLabelClass,
        availableLabels,
        setAvailableLabels,
        handleLabelChange,
        handleAddLabel,
    };
};
