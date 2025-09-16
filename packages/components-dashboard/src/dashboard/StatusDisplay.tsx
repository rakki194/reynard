/**
 * Status Display Component
 * Renders individual status items with consistent styling
 */

import { Component } from "solid-js";

interface StatusItemProps {
  label: string;
  value: string;
  statusClass?: string;
}

export const StatusItem: Component<StatusItemProps> = (props) => {
  return (
    <div class="status-item">
      <span class="status-label">{props.label}:</span>
      <span class={`status-value ${props.statusClass || ""}`}>
        {props.value}
      </span>
    </div>
  );
};

export { StatusItem as StatusDisplay };
