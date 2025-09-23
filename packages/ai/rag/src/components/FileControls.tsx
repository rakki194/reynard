/**
 * File Controls Component
 *
 * Controls for file display options like line numbers, wrapping, font size, etc.
 */
import { Button, Select, Icon } from "reynard-components-core";
export const FileControls = (props: any) => {
  return (
    <div class="file-controls">
      <Button variant="secondary" size="sm" onClick={props.onToggleLineNumbers} leftIcon={<Icon name="list" />}>
        {props.showLineNumbers ? "Hide" : "Show"} Line Numbers
      </Button>

      <Button variant="secondary" size="sm" onClick={props.onToggleWrapLines} leftIcon={<Icon name="text-wrap" />}>
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
        size="sm"
      />

      <Button variant="secondary" size="sm" onClick={props.onCopy} leftIcon={<Icon name="copy" />}>
        Copy
      </Button>

      <Button variant="secondary" size="sm" onClick={props.onDownload} leftIcon={<Icon name="download" />}>
        Download
      </Button>
    </div>
  );
};
