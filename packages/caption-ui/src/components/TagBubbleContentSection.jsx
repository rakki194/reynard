/**
 * TagBubbleContentSection Component
 *
 * Combines content and remove components for cleaner structure.
 */
import { TagBubbleContent } from "./TagBubbleContent";
import { TagBubbleRemove } from "./TagBubbleRemove";
export const TagBubbleContentSection = props => {
    return (<>
      <TagBubbleContent isEditing={props.isEditing()} tag={props.tag} query={props.query()} onInput={props.onInput} onKeyDown={props.onKeyDown} onBlur={props.onBlur} onFocus={props.onFocus} inputRef={props.inputRef}/>
      <TagBubbleRemove tag={props.tag} onRemove={props.onRemove} removable={props.removable}/>
    </>);
};
