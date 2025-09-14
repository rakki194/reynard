/**
 * Image Metadata Component
 * 
 * Displays image metadata in a collapsible card
 */

import { Component, For, Show } from "solid-js";
import { Card, Button } from "reynard-components";
import { getIcon as getIconFromRegistry } from "reynard-fluent-icons";

// Helper function to get icon as JSX element
const getIcon = (name: string) => {
  const icon = getIconFromRegistry(name);
  if (icon) {
    // eslint-disable-next-line solid/no-innerhtml
    return <div class="icon-wrapper" innerHTML={icon.outerHTML} />;
  }
  return null;
};

export interface ImageMetadataProps {
  metadata?: Record<string, unknown>;
  isVisible: boolean;
  onToggle: () => void;
}

export const ImageMetadata: Component<ImageMetadataProps> = (props) => {
  return (
    <Show when={props.isVisible && props.metadata}>
      <Card className="metadata-card">
        <div class="card-header">
          <h4>Image Metadata</h4>
          <Button
            variant="ghost"
            size="small"
            onClick={props.onToggle}
            icon={getIcon("close")}
          />
        </div>
        <div class="metadata-content">
          <For each={Object.entries(props.metadata || {})}>
            {([key, value]) => (
              <div class="metadata-item">
                <span class="metadata-key">{key}:</span>
                <span class="metadata-value">
                  {typeof value === "object"
                    ? JSON.stringify(value)
                    : String(value)}
                </span>
              </div>
            )}
          </For>
        </div>
      </Card>
    </Show>
  );
};
