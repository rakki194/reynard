/**
 * Tag Management Container Component
 *
 * Container for tag items with drag and drop support.
 * Handles tag rendering and interaction events.
 */

import { Component, For } from "solid-js";
import { TagBubble } from "./TagBubble";

export interface Tag {
  id: string;
  text: string;
  metadata?: Record<string, any>;
}

export interface TagManagementContainerProps {
  /** Array of tags to display */
  tags: Tag[];
  /** Selected tag IDs */
  selectedTags: Set<string>;
  /** Currently focused tag ID */
  focusedTagId: string | null;
  /** Whether dragging is active */
  isDragging: boolean;
  /** Tag ID being dragged over */
  dragOverTagId: string | null;
  /** Whether drag and drop is enabled */
  enableDragDrop: boolean;
  /** Whether tags are editable */
  editable?: boolean;
  /** Whether tags are removable */
  removable?: boolean;
  /** Callback for tag selection */
  onTagSelect: (tagId: string, event?: MouseEvent) => void;
  /** Callback for tag editing */
  onTagEdit: (tagId: string, newText: string) => void;
  /** Callback for tag removal */
  onTagRemove: (tagId: string) => void;
  /** Callback for tag navigation */
  onTagNavigate: (direction: "left" | "right" | "start" | "end") => void;
  /** Callback for setting focused tag */
  onSetFocusedTag: (tagId: string) => void;
  /** Drag and drop handlers */
  onDragStart: (e: DragEvent, tagId: string) => void;
  onDragOver: (e: DragEvent, tagId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent, tagId: string) => void;
}

export const TagManagementContainer: Component<TagManagementContainerProps> = props => {
  return (
    <div
      class="tags-container"
      classList={{
        dragging: props.isDragging,
        "has-selection": props.selectedTags.size > 0,
      }}
    >
      <For each={props.tags}>
        {(tag, index) => (
          <div
            class="tag-wrapper"
            classList={{
              selected: props.selectedTags.has(tag.id),
              focused: props.focusedTagId === tag.id,
              "drag-over": props.dragOverTagId === tag.id,
            }}
            draggable={props.enableDragDrop}
            onDragStart={e => props.onDragStart(e, tag.id)}
            onDragOver={e => props.onDragOver(e, tag.id)}
            onDragLeave={props.onDragLeave}
            onDrop={e => props.onDrop(e, tag.id)}
            onClick={e => props.onTagSelect(tag.id, e)}
            onFocus={() => props.onSetFocusedTag(tag.id)}
            tabIndex={0}
          >
            <TagBubble
              tag={tag.text}
              index={index()}
              onEdit={newText => props.onTagEdit(tag.id, newText)}
              onRemove={() => props.onTagRemove(tag.id)}
              onNavigate={props.onTagNavigate}
              editable={props.editable}
              removable={props.removable}
            />
          </div>
        )}
      </For>
    </div>
  );
};
