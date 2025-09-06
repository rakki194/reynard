/**
 * MultiSelect Component
 * Advanced multi-selection system with keyboard shortcuts and visual feedback
 */

import {
  Component,
  createSignal,
  createEffect,
  onCleanup,
  splitProps,
  For,
  Show,
} from "solid-js";
import { Button } from "reynard-components";
import "./MultiSelect.css";

export interface SelectableItem {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string;
  selected?: boolean;
}

export interface MultiSelectProps {
  /** Array of selectable items */
  items: SelectableItem[];
  /** Whether multi-selection is enabled */
  enabled?: boolean;
  /** Selection mode: 'single', 'multiple', 'range' */
  mode?: "single" | "multiple" | "range";
  /** Whether to show selection controls */
  showControls?: boolean;
  /** Whether to show selection count */
  showCount?: boolean;
  /** Whether to enable keyboard shortcuts */
  enableKeyboard?: boolean;
  /** Callback when selection changes */
  onSelectionChange?: (selectedItems: SelectableItem[]) => void;
  /** Callback when selection mode changes */
  onModeChange?: (mode: "single" | "multiple" | "range") => void;
  /** Custom class name */
  class?: string;
}

export interface MultiSelectState {
  selectedItems: Set<string>;
  lastSelectedIndex: number;
  mode: "single" | "multiple" | "range";
  isSelecting: boolean;
}

const defaultProps = {
  enabled: true,
  mode: "multiple",
  showControls: true,
  showCount: true,
  enableKeyboard: true,
};

export const MultiSelect: Component<MultiSelectProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "items",
    "enabled",
    "mode",
    "showControls",
    "showCount",
    "enableKeyboard",
    "onSelectionChange",
    "onModeChange",
    "class",
  ]);

  // State
  const [state, setState] = createSignal<MultiSelectState>({
    selectedItems: new Set(),
    lastSelectedIndex: -1,
    mode: "multiple", // Default value, will be updated by effect
    isSelecting: false,
  });

  // Computed values
  const selectedCount = () => state().selectedItems.size;
  const hasSelection = () => selectedCount() > 0;
  const isAllSelected = () =>
    local.items.length > 0 && selectedCount() === local.items.length;

  // Effects
  createEffect(() => {
    const currentState = state();
    const selectedItems = local.items.filter((item) =>
      currentState.selectedItems.has(item.id),
    );
    local.onSelectionChange?.(selectedItems);
  });

  createEffect(() => {
    const currentState = state();
    const newMode = local.mode || "multiple";
    if (currentState.mode !== newMode) {
      setState((prev) => ({
        ...prev,
        mode: newMode as "single" | "multiple" | "range",
      }));
    }
  });

  // Event handlers
  const handleItemClick = (
    item: SelectableItem,
    index: number,
    event: MouseEvent,
  ) => {
    if (!local.enabled) return;

    const currentState = state();
    const isCtrlPressed = event.ctrlKey || event.metaKey;
    const isShiftPressed = event.shiftKey;

    if (local.mode === "single") {
      // Single selection mode
      setState((prev) => ({
        ...prev,
        selectedItems: new Set([item.id]),
        lastSelectedIndex: index,
      }));
    } else if (local.mode === "multiple") {
      if (isCtrlPressed) {
        // Toggle selection with Ctrl/Cmd
        const newSelection = new Set(currentState.selectedItems);
        if (newSelection.has(item.id)) {
          newSelection.delete(item.id);
        } else {
          newSelection.add(item.id);
        }
        setState((prev) => ({
          ...prev,
          selectedItems: newSelection,
          lastSelectedIndex: index,
        }));
      } else if (isShiftPressed && currentState.lastSelectedIndex !== -1) {
        // Range selection with Shift
        const start = Math.min(currentState.lastSelectedIndex, index);
        const end = Math.max(currentState.lastSelectedIndex, index);
        const newSelection = new Set(currentState.selectedItems);

        for (let i = start; i <= end; i++) {
          newSelection.add(local.items[i].id);
        }

        setState((prev) => ({
          ...prev,
          selectedItems: newSelection,
          lastSelectedIndex: index,
        }));
      } else {
        // Single click - replace selection
        setState((prev) => ({
          ...prev,
          selectedItems: new Set([item.id]),
          lastSelectedIndex: index,
        }));
      }
    } else if (local.mode === "range") {
      // Range selection mode
      if (currentState.lastSelectedIndex !== -1) {
        const start = Math.min(currentState.lastSelectedIndex, index);
        const end = Math.max(currentState.lastSelectedIndex, index);
        const newSelection = new Set<string>();

        for (let i = start; i <= end; i++) {
          newSelection.add(local.items[i].id);
        }

        setState((prev) => ({
          ...prev,
          selectedItems: newSelection,
          lastSelectedIndex: index,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          selectedItems: new Set([item.id]),
          lastSelectedIndex: index,
        }));
      }
    }
  };

  const handleSelectAll = () => {
    const allIds = local.items.map((item) => item.id);
    setState((prev) => ({
      ...prev,
      selectedItems: new Set(allIds),
    }));
  };

  const handleDeselectAll = () => {
    setState((prev) => ({
      ...prev,
      selectedItems: new Set(),
      lastSelectedIndex: -1,
    }));
  };

  const handleModeChange = (newMode: "single" | "multiple" | "range") => {
    setState((prev) => ({
      ...prev,
      mode: newMode,
      selectedItems: new Set(), // Clear selection when mode changes
      lastSelectedIndex: -1,
    }));
    local.onModeChange?.(newMode);
  };

  // Keyboard event listener
  createEffect(() => {
    if (local.enableKeyboard) {
      const handleKeyboardShortcuts = (event: KeyboardEvent) => {
        if (!local.enableKeyboard || !local.enabled) return;

        if (event.key === "a" && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          if (isAllSelected()) {
            handleDeselectAll();
          } else {
            handleSelectAll();
          }
        } else if (event.key === "Escape") {
          handleDeselectAll();
        }
      };

      document.addEventListener("keydown", handleKeyboardShortcuts);

      onCleanup(() => {
        document.removeEventListener("keydown", handleKeyboardShortcuts);
      });
    }
  });

  return (
    <div class={`reynard-multi-select ${local.class || ""}`}>
      {/* Selection Controls */}
      <Show when={local.showControls}>
        <div class="reynard-multi-select__controls">
          <div class="reynard-multi-select__mode-controls">
            <Button
              size="sm"
              variant={state().mode === "single" ? "primary" : "ghost"}
              onClick={() => handleModeChange("single")}
            >
              Single
            </Button>
            <Button
              size="sm"
              variant={state().mode === "multiple" ? "primary" : "ghost"}
              onClick={() => handleModeChange("multiple")}
            >
              Multiple
            </Button>
            <Button
              size="sm"
              variant={state().mode === "range" ? "primary" : "ghost"}
              onClick={() => handleModeChange("range")}
            >
              Range
            </Button>
          </div>

          <div class="reynard-multi-select__action-controls">
            <Show when={hasSelection()}>
              <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
                Clear
              </Button>
            </Show>
            <Show when={!isAllSelected()}>
              <Button size="sm" variant="ghost" onClick={handleSelectAll}>
                Select All
              </Button>
            </Show>
            <Show when={isAllSelected()}>
              <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </Show>
          </div>
        </div>
      </Show>

      {/* Selection Count */}
      <Show when={local.showCount && hasSelection()}>
        <div class="reynard-multi-select__count">
          {selectedCount()} item{selectedCount() !== 1 ? "s" : ""} selected
        </div>
      </Show>

      {/* Items */}
      <div class="reynard-multi-select__items">
        <For each={local.items}>
          {(item, index) => (
            <div
              class={`reynard-multi-select__item ${
                state().selectedItems.has(item.id)
                  ? "reynard-multi-select__item--selected"
                  : ""
              }`}
              onClick={(event) => handleItemClick(item, index(), event)}
              data-testid={`multi-select-item-${item.id}`}
            >
              <div class="reynard-multi-select__item-checkbox">
                <Show when={state().selectedItems.has(item.id)}>
                  <span class="reynard-multi-select__item-checkbox-icon">
                    ✓
                  </span>
                </Show>
              </div>
              <div class="reynard-multi-select__item-content">
                <span class="reynard-multi-select__item-name">{item.name}</span>
                <span class="reynard-multi-select__item-type">{item.type}</span>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Instructions */}
      <Show when={local.enabled && local.mode === "multiple"}>
        <div class="reynard-multi-select__instructions">
          <span>Ctrl/Cmd + Click: Toggle selection</span>
          <span>Shift + Click: Range selection</span>
          <span>Ctrl/Cmd + A: Select all</span>
          <span>Escape: Clear selection</span>
        </div>
      </Show>
    </div>
  );
};
