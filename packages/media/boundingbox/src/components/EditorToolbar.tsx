/**
 * Editor Toolbar Component
 *
 * Handles toolbar UI and actions
 */
import { LabelSelector } from "./LabelSelector";
export const EditorToolbar = props => {
  const { config, selectedLabelClass, onLabelClassChange, className = "" } = props;
  return (
    <div class={`editor-toolbar ${className}`}>
      <div class="toolbar-section">
        <label for="label-selector">Label Class:</label>
        <LabelSelector
          availableLabels={config.labelClasses || ["person", "vehicle", "animal", "object"]}
          selectedLabel={selectedLabelClass}
          onLabelChange={onLabelClassChange}
          className="label-selector"
        />
      </div>
    </div>
  );
};
