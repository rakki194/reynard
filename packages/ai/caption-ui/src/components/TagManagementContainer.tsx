/**
 * Tag Management Container Component
 *
 * Container for tag items with drag and drop support.
 * Handles tag rendering and interaction events.
 */
import { For } from "solid-js";
import { TagBubble } from "./TagBubble";
export const TagManagementContainer = props => {
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
