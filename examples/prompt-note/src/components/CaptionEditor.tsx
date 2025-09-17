/**
 * CaptionEditor Component
 * Provides caption editing interface for selected images
 */

import { Component, Show, For } from "solid-js";
import { Button, Card } from "reynard-components";
import { TagBubble, CaptionInput } from "reynard-caption";
import { CaptionType } from "reynard-annotating";
// Define ImageItem interface locally
interface ImageItem {
  id: string;
  name: string;
  url: string;
  caption?: string;
  tags?: string[];
  generatedAt?: Date;
  model?: string;
}

interface CaptionEditorProps {
  image: ImageItem;
  onEdit: () => void;
  onGenerate: () => void;
}

export const CaptionEditor: Component<CaptionEditorProps> = props => {
  return (
    <Card class="caption-editor" padding="lg">
      <div class="editor-header">
        <h3>Caption Editor</h3>
        <div class="editor-actions">
          <Button variant="primary" onClick={props.onGenerate}>
            🤖 Generate Caption
          </Button>
          <Button variant="secondary" onClick={props.onEdit} disabled={!props.image.caption}>
            ✏️ Edit Caption
          </Button>
        </div>
      </div>

      <div class="editor-content">
        <div class="image-preview">
          <img src={props.image.url} alt={props.image.name} />
          <h4>{props.image.name}</h4>
        </div>

        <div class="caption-display">
          <Show
            when={props.image.caption}
            fallback={
              <div class="no-caption">
                <p>No caption generated yet. Click "Generate Caption" to create one with AI!</p>
              </div>
            }
          >
            <div class="caption-content">
              <h4>Current Caption:</h4>
              <div class="caption-text">{props.image.caption}</div>

              <Show when={props.image.tags && props.image.tags.length > 0}>
                <div class="tags-display">
                  <h4>Tags:</h4>
                  <div class="tag-bubbles">
                    <For each={props.image.tags}>
                      {(tag, index) => (
                        <TagBubble
                          tag={tag}
                          index={index()}
                          editable={false}
                          removable={false}
                          onRemove={() => {}}
                          onEdit={() => {}}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </Show>

              <Show when={props.image.generatedAt}>
                <div class="generation-meta">
                  <small>
                    Generated with <strong>{props.image.model}</strong> on{" "}
                    {props.image.generatedAt?.toLocaleDateString()} at {props.image.generatedAt?.toLocaleTimeString()}
                  </small>
                </div>
              </Show>
            </div>
          </Show>
        </div>
      </div>
    </Card>
  );
};
