/**
 * TagBubble Component
 *
 * A component that renders an individual tag with editing and navigation capabilities.
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
  Show,
  For,
} from "solid-js";
import { TagBubbleProps } from "../types/index.js";
import { useTagAutocomplete } from "../utils/tagAutocomplete.js";
import { createTagColorGenerator } from "../utils/tagColors.js";
import "./TagBubble.css";

export const TagBubble: Component<TagBubbleProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);

  let inputRef: HTMLInputElement | undefined;
  let contentRef: HTMLDivElement | undefined;
  let suggestionsList: HTMLDivElement | undefined;
  let tagBubbleRef: HTMLDivElement | undefined;

  const tagColorGenerator = createTagColorGenerator();
  const tagColor = tagColorGenerator.getColor(props.tag);

  // Set CSS custom properties for dynamic styling
  createEffect(() => {
    if (tagBubbleRef) {
      tagBubbleRef.style.setProperty(
        "--tag-background-color",
        tagColor.background,
      );
      tagBubbleRef.style.setProperty("--tag-text-color", tagColor.text);
      tagBubbleRef.style.setProperty("--tag-border-color", tagColor.border);
    }
  });

  // Tag autocomplete
  const {
    query,
    setQuery,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    isOpen,
    setIsOpen,
    selectNextSuggestion,
    selectPreviousSuggestion,
    getSelectedSuggestion,
    clearSuggestions,
  } = useTagAutocomplete();

  // Double-tap detection removed as it's not used

  const closeAllSuggestions = () => {
    clearSuggestions();
    setIsOpen(false);
    if (suggestionsList) {
      suggestionsList.classList.remove("visible");
    }
  };

  const startEditing = () => {
    if (props.editable === false) return;

    setIsEditing(true);
    setQuery(props.tag);

    // Focus input after DOM update
    setTimeout(() => {
      if (inputRef) {
        inputRef.focus();
        inputRef.select();
      }
    }, 0);
  };

  const finishEditing = () => {
    if (!isEditing()) return;

    const newTag = query().trim();
    if (newTag && newTag !== props.tag) {
      props.onEdit(newTag);
    }

    setIsEditing(false);
    closeAllSuggestions();
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setQuery(props.tag);
    closeAllSuggestions();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isEditing()) return;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        if (isOpen() && selectedIndex() >= 0) {
          const suggestion = getSelectedSuggestion();
          if (suggestion) {
            setQuery(suggestion);
            finishEditing();
          }
        } else {
          finishEditing();
        }
        break;

      case "Escape":
        e.preventDefault();
        cancelEditing();
        break;

      case "ArrowDown":
        if (isOpen()) {
          e.preventDefault();
          selectNextSuggestion();
        }
        break;

      case "ArrowUp":
        if (isOpen()) {
          e.preventDefault();
          selectPreviousSuggestion();
        }
        break;

      case "Tab":
        e.preventDefault();
        if (isOpen() && selectedIndex() >= 0) {
          const suggestion = getSelectedSuggestion();
          if (suggestion) {
            setQuery(suggestion);
            finishEditing();
          }
        } else {
          finishEditing();
        }
        break;

      case "Backspace":
        if (query().length === 0) {
          e.preventDefault();
          props.onRemove();
        }
        break;

      case "Delete":
        if (query().length === 0) {
          e.preventDefault();
          props.onRemove();
        }
        break;
    }
  };

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Delay to allow click events on suggestions
    setTimeout(() => {
      if (!isHovered()) {
        finishEditing();
      }
    }, 150);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleRemove = () => {
    if (props.removable !== false) {
      props.onRemove();
    }
  };

  const handleDoubleClick = () => {
    startEditing();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    finishEditing();
  };

  // Keyboard navigation removed as it's not used

  // Global keyboard shortcuts
  onMount(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFocused() && !isEditing()) {
        switch (e.key) {
          case "Enter":
          case " ":
            e.preventDefault();
            startEditing();
            break;
          case "Delete":
          case "Backspace":
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              handleRemove();
            }
            break;
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    onCleanup(() => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    });
  });

  return (
    <div
      ref={tagBubbleRef}
      class="tag-bubble"
      classList={{
        "tag-bubble--editing": isEditing(),
        "tag-bubble--hovered": isHovered(),
        "tag-bubble--focused": isFocused(),
        "tag-bubble--editable": props.editable !== false,
        "tag-bubble--removable": props.removable !== false,
        [`tag-bubble--${props.size || "medium"}`]: true,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onDblClick={handleDoubleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      aria-label={`Tag: ${props.tag}`}
    >
      <div class="tag-content" ref={contentRef}>
        <Show
          when={!isEditing()}
          fallback={
            <input
              ref={inputRef}
              type="text"
              value={query()}
              class="tag-input"
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onFocus={handleFocus}
              aria-label="Edit tag"
            />
          }
        >
          <span class="tag-text">{props.tag}</span>
        </Show>
      </div>

      <Show when={props.removable !== false}>
        <button
          class="tag-remove"
          onClick={handleRemove}
          aria-label={`Remove tag: ${props.tag}`}
          title={`Remove tag: ${props.tag}`}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M9.5 3.5L8.5 2.5L6 5L3.5 2.5L2.5 3.5L5 6L2.5 8.5L3.5 9.5L6 7L8.5 9.5L9.5 8.5L7 6L9.5 3.5Z" />
          </svg>
        </button>
      </Show>

      <Show when={isOpen() && suggestions().length > 0}>
        <div
          ref={suggestionsList}
          class="tag-suggestions"
          role="listbox"
          aria-label="Tag suggestions"
        >
          <For each={suggestions()}>
            {(suggestion, index) => (
              <div
                class="tag-suggestion"
                classList={{
                  "tag-suggestion--selected": index() === selectedIndex(),
                }}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                attr:aria-selected={
                  index() === selectedIndex() ? "true" : "false"
                }
              >
                {suggestion}
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
