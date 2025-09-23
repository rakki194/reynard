/**
 * Image Metadata Component
 *
 * Displays image metadata in a collapsible card
 */
import { For, Show } from "solid-js";
import { Card, Button } from "reynard-components-core";
import { Icon } from "reynard-components-core";
export const ImageMetadata = (props: any) => {
  return (
    <Show when={props.isVisible && props.metadata}>
      <Card class="metadata-card">
        <div class="card-header">
          <h4>Image Metadata</h4>
          <Button variant="ghost" size="sm" onClick={props.onToggle} leftIcon={<Icon name="close" />} />
        </div>
        <div class="metadata-content">
          <For each={Object.entries(props.metadata || {})}>
            {([key, value]) => (
              <div class="metadata-item">
                <span class="metadata-key">{key}:</span>
                <span class="metadata-value">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
              </div>
            )}
          </For>
        </div>
      </Card>
    </Show>
  );
};
