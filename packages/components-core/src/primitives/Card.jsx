/**
 * Card Component
 * A flexible container component with consistent styling
 */
import { splitProps, mergeProps } from "solid-js";
const defaultProps = {
    variant: "default",
    padding: "md",
    interactive: false,
    selected: false,
};
export const Card = (props) => {
    const merged = mergeProps(defaultProps, props);
    const [local, others] = splitProps(merged, [
        "variant",
        "padding",
        "interactive",
        "selected",
        "header",
        "footer",
        "children",
        "class",
    ]);
    const getClasses = () => {
        const classes = [
            "reynard-card",
            `reynard-card--${local.variant}`,
            `reynard-card--padding-${local.padding}`,
        ];
        if (local.interactive)
            classes.push("reynard-card--interactive");
        if (local.selected)
            classes.push("reynard-card--selected");
        if (local.class)
            classes.push(local.class);
        return classes.join(" ");
    };
    return (<div class={getClasses()} {...others}>
      {local.header && <div class="reynard-card__header">{local.header}</div>}

      {local.children && (<div class="reynard-card__content">{local.children}</div>)}

      {local.footer && <div class="reynard-card__footer">{local.footer}</div>}
    </div>);
};
