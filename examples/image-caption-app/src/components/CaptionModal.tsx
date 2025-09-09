/**
 * Caption editing modal component
 */

import { Component, For, Show } from "solid-js";
import { Button, Modal } from "reynard-components";
import { CaptionType } from "reynard-annotating";
import { TagBubble, CaptionInput } from "reynard-caption";
import type { CaptionWorkflow } from "../types";

interface CaptionModalProps {
  open: boolean;
  workflow: CaptionWorkflow | null;
  onClose: () => void;
  onSave: () => void;
  onCaptionChange: (caption: string) => void;
  onTagEdit: (index: number, newTag: string) => void;
  onTagRemove: (index: number) => void;
}

export const CaptionModal: Component<CaptionModalProps> = (props) => {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      title="Edit Caption"
      size="lg"
    >
      <Show when={props.workflow}>
        <div class="caption-editor-modal">
          <div class="image-preview">
            <img
              src={props.workflow!.image.url}
              alt={props.workflow!.image.name}
            />
            <h3>{props.workflow!.image.name}</h3>
          </div>

          <div class="caption-editor">
            <CaptionInput
              caption={{
                type: CaptionType.CAPTION,
                content: props.workflow!.editedCaption,
              }}
              state="expanded"
              onClick={() => {}}
              onCaptionChange={(caption) =>
                props.onCaptionChange(caption.content)
              }
              onSave={props.onSave}
              placeholder="Enter your caption..."
            />

            <div class="tag-editor">
              <h4>Tags</h4>
              <div class="tag-bubbles">
                <For each={props.workflow!.tags}>
                  {(tag, index) => (
                    <TagBubble
                      tag={tag}
                      index={index()}
                      onEdit={(newTag) => props.onTagEdit(index(), newTag)}
                      onRemove={() => props.onTagRemove(index())}
                      editable={true}
                      removable={true}
                    />
                  )}
                </For>
              </div>
            </div>

            <div class="modal-actions">
              <Button onClick={props.onClose} variant="secondary">
                Cancel
              </Button>
              <Button onClick={props.onSave} variant="primary">
                Save Caption
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </Modal>
  );
};
