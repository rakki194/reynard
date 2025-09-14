/**
 * Label Management Composable
 *
 * Handles label selection and management
 */

import { createSignal } from "solid-js";
import type { EditorConfig } from "../types";

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

export const useLabelManagement = (
  options: LabelManagementOptions = {},
): LabelManagement => {
  const {
    labelClasses = ["person", "vehicle", "animal", "object"],
    defaultLabelClass = "person",
  } = options;

  const [selectedLabelClass, setSelectedLabelClass] =
    createSignal(defaultLabelClass);
  const [availableLabels, setAvailableLabels] = createSignal(labelClasses);

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
