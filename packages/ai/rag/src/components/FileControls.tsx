/**
 * File Controls Component
 *
 * Controls for file display options like line numbers, wrapping, font size, etc.
 */
import { Button, Select } from "reynard-components-core";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";
// Helper function to get icon as JSX element
const getIcon = name => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    const clonedIcon = icon.cloneNode(true);
    return <div>{clonedIcon}</div>;
  }
  return null;
};
export const FileControls = props => {
  return (
    <div class="file-controls">
      <Button variant="secondary" size="small" onClick={props.onToggleLineNumbers} icon={getIcon("list")}>
        {props.showLineNumbers ? "Hide" : "Show"} Line Numbers
      </Button>

      <Button variant="secondary" size="small" onClick={props.onToggleWrapLines} icon={getIcon("text-wrap")}>
        {props.wrapLines ? "Unwrap" : "Wrap"} Lines
      </Button>

      <Select
        value={props.fontSize}
        onChange={value => props.onFontSizeChange(Number(value))}
        options={[
          { value: 12, label: "12px" },
          { value: 14, label: "14px" },
          { value: 16, label: "16px" },
          { value: 18, label: "18px" },
          { value: 20, label: "20px" },
        ]}
        size="small"
      />

      <Button variant="secondary" size="small" onClick={props.onCopy} icon={getIcon("copy")}>
        Copy
      </Button>

      <Button variant="secondary" size="small" onClick={props.onDownload} icon={getIcon("download")}>
        Download
      </Button>
    </div>
  );
};
