/**
 * TagBubbleContainer Component
 *
 * Container component that handles the main div structure and event handlers.
 */
import { createTagBubbleClasses } from "./tag-bubble-classes";
export const TagBubbleContainer = containerProps => {
    const classList = () => createTagBubbleClasses({
        isEditing: containerProps.isEditing(),
        isHovered: containerProps.isHovered(),
        isFocused: containerProps.isFocused(),
        props: containerProps.props,
    });
    return (<div ref={containerProps.tagBubbleRef} classList={classList()} onMouseEnter={containerProps.handlers.handleMouseEnter} onMouseLeave={containerProps.handlers.handleMouseLeave} onDblClick={containerProps.handlers.handleDoubleClick} onFocus={containerProps.handlers.handleFocus} onBlur={containerProps.handlers.handleBlur} aria-label={`Tag: ${containerProps.props.tag}`}>
      {containerProps.children}
    </div>);
};
