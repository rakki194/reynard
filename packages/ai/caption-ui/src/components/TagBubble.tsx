/**
 * TagBubble Component
 *
 * A component that renders an individual tag with editing and navigation capabilities.
 */
import { createSignal } from "solid-js";
import "./TagBubble.css";
import { createTagBubbleComposables } from "./TagBubbleComposables";
import { TagBubbleView } from "./TagBubbleView";
export function TagBubble(props) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);
  let inputRef;
  let suggestionsList;
  let tagBubbleRef;
  // Create all composables
  const { autocomplete, handlers, keyboard } = createTagBubbleComposables({
    props,
    isEditing,
    setIsEditing,
    isHovered,
    setIsHovered,
    isFocused,
    setIsFocused,
    inputRef,
    suggestionsList,
    tagBubbleRef,
  });
  return (
    <TagBubbleView
      props={props}
      isEditing={isEditing}
      isHovered={isHovered}
      isFocused={isFocused}
      tagBubbleRef={tagBubbleRef}
      inputRef={inputRef}
      suggestionsList={suggestionsList}
      autocomplete={autocomplete}
      handlers={{
        ...handlers,
        handleKeyDown: keyboard.handleKeyDown,
      }}
    />
  );
}
