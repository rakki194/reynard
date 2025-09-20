/**
 * Tag Keyboard Navigation Composable
 *
 * Handles keyboard navigation between tags and keyboard shortcuts.
 * Provides focus management and navigation actions.
 */

import { createSignal, onCleanup, onMount } from "solid-js";

export interface TagNavigationState {
  focusedTagId: string | null;
}

export interface TagNavigationActions {
  setFocusedTagId: (id: string | null) => void;
  navigateToTag: (direction: "left" | "right" | "start" | "end") => void;
  handleKeyDown: (e: KeyboardEvent) => void;
}

export function useTagKeyboardNavigation(
  tags: () => Array<{ id: string }>,
  hasSelection: () => boolean,
  onBulkDelete: () => void,
  onTagRemove: (tagId: string) => void,
  onSelectAll: () => void,
  onClearSelection: () => void
): [TagNavigationState, TagNavigationActions] {
  const [focusedTagId, setFocusedTagId] = createSignal<string | null>(null);

  const navigateToTag = (direction: "left" | "right" | "start" | "end") => {
    const currentIndex = tags().findIndex(tag => tag.id === focusedTagId());
    if (currentIndex === -1) return;

    let newIndex = currentIndex;

    switch (direction) {
      case "left":
        newIndex = Math.max(0, currentIndex - 1);
        break;
      case "right":
        newIndex = Math.min(tags().length - 1, currentIndex + 1);
        break;
      case "start":
        newIndex = 0;
        break;
      case "end":
        newIndex = tags().length - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      setFocusedTagId(tags()[newIndex].id);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!focusedTagId()) return;

    const currentIndex = tags().findIndex(tag => tag.id === focusedTagId());
    if (currentIndex === -1) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        if (currentIndex > 0) {
          setFocusedTagId(tags()[currentIndex - 1].id);
        }
        break;

      case "ArrowRight":
        e.preventDefault();
        if (currentIndex < tags().length - 1) {
          setFocusedTagId(tags()[currentIndex + 1].id);
        }
        break;

      case "Home":
        e.preventDefault();
        setFocusedTagId(tags()[0]?.id || null);
        break;

      case "End":
        e.preventDefault();
        setFocusedTagId(tags()[tags().length - 1]?.id || null);
        break;

      case "Delete":
        if (hasSelection()) {
          e.preventDefault();
          onBulkDelete();
        } else if (focusedTagId()) {
          e.preventDefault();
          onTagRemove(focusedTagId()!);
        }
        break;

      case "a":
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          onSelectAll();
        }
        break;

      case "Escape":
        e.preventDefault();
        onClearSelection();
        setFocusedTagId(null);
        break;
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  return [
    {
      focusedTagId: focusedTagId(),
    },
    {
      setFocusedTagId,
      navigateToTag,
      handleKeyDown,
    },
  ];
}
