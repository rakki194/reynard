import { Component } from "solid-js";
import { allIcons } from "reynard-fluent-icons";

type DrawingTool = 'pencil' | 'eraser' | 'fill';

interface ToolControlsProps {
  selectedTool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
}

export const ToolControls: Component<ToolControlsProps> = (props) => {
  return (
    <section class="control-section">
      <h3>Tools</h3>
      <div class="tool-buttons">
        <button
          class={`tool-button ${props.selectedTool === 'pencil' ? 'selected' : ''}`}
          onClick={() => props.onToolChange('pencil')}
        >
          <span innerHTML={allIcons.edit.svg}></span> Pencil
        </button>
        <button
          class={`tool-button ${props.selectedTool === 'eraser' ? 'selected' : ''}`}
          onClick={() => props.onToolChange('eraser')}
        >
          <span innerHTML={allIcons.clean.svg}></span> Eraser
        </button>
        <button
          class={`tool-button ${props.selectedTool === 'fill' ? 'selected' : ''}`}
          onClick={() => props.onToolChange('fill')}
        >
          <span innerHTML={allIcons.box.svg}></span> Fill
        </button>
      </div>
    </section>
  );
};
