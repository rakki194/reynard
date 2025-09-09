/**
 * Label Management Composable
 *
 * Handles label selection and management
 */

import { createSignal } from "solid-js";
import type { EditorConfig } from "../types";

export interface LabelManagement {
  selectedLabelClass: () => string;
  setSelectedLabelClass: (label: string) => void;
  availableLabels: () => string[];
  setAvailableLabels: (labels: string[]) => void;
  handleLabelChange: (label: string) => void;
  handleAddLabel: (label: string) => void;
}

export const useLabelManagement = (config: EditorConfig): LabelManagement => {
  const [selectedLabelClass, setSelectedLabelClass] = createSignal(
    config.defaultLabel || "default",
  );
  const [availableLabels, setAvailableLabels] = createSignal(
    config.availableLabels || ["default", "person", "object", "vehicle"],
  );

  const handleLabelChange = (label: string) => {
    setSelectedLabelClass(label);
  };

  const handleAddLabel = (label: string) => {
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
