/**
 * Tag Display Component
 * Shows a single tag with dynamic styling
 */
import { createMemo } from "solid-js";
import { useTagColors } from "reynard-themes";
import "./TagComponents.css";
export const TagDisplay = props => {
    const tagColors = useTagColors();
    const tagStyle = createMemo(() => {
        return tagColors.getTagStyle(props.tagName(), props.intensity());
    });
    return (<div class="tag-display">
      <div class="tag" ref={el => {
            if (el) {
                const style = tagStyle();
                el.style.setProperty("--tag-bg", style["--tag-bg"]);
                el.style.setProperty("--tag-color", style["--tag-color"]);
            }
        }}>
        {props.tagName()}
      </div>
    </div>);
};
