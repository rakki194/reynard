/**
 * Tag Management Keyboard Shortcuts Component
 *
 * Displays keyboard shortcuts help for tag management.
 * Shows available shortcuts when selection is enabled.
 */
import { Show } from "solid-js";
export const TagManagementShortcuts = props => {
  return (
    <Show when={props.showSelection}>
      <div class="keyboard-shortcuts">
        <div class="shortcuts-title">Keyboard Shortcuts:</div>
        <div class="shortcuts-list">
          <span>← → Navigate</span>
          <span>Shift+Click Range select</span>
          <span>Ctrl+Click Multi-select</span>
          <span>Ctrl+A Select all</span>
          <span>Delete Remove selected</span>
          <span>Escape Clear selection</span>
        </div>
      </div>
    </Show>
  );
};
