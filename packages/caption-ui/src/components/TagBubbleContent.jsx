/**
 * TagBubbleContent Component
 *
 * Renders the main content area of the tag bubble.
 */
import { Show } from "solid-js";
import { TagBubbleInput } from "./TagBubbleInput";
export const TagBubbleContent = props => {
    return (<div class="tag-content">
      <Show when={!props.isEditing} fallback={<TagBubbleInput value={props.query} onInput={props.onInput} onKeyDown={props.onKeyDown} onBlur={props.onBlur} onFocus={props.onFocus} inputRef={props.inputRef}/>}>
        <span class="tag-text">{props.tag}</span>
      </Show>
    </div>);
};
