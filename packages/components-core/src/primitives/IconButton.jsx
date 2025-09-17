/**
 * IconButton Component
 * A specialized button component that combines icons with text or displays icon-only buttons.
 * Provides consistent styling and behavior for icon-based interactions.
 */
import { splitProps, mergeProps } from "solid-js";
import { Icon } from "../icons/Icon";
const defaultProps = {
    iconPosition: "left",
    iconSize: "md",
    iconVariant: "default",
    variant: "primary",
    size: "md",
    iconOnly: false,
    loading: false,
    disabled: false,
    fullWidth: false,
    active: false,
};
export const IconButton = props => {
    const merged = mergeProps(defaultProps, props);
    const [local, others] = splitProps(merged, [
        "icon",
        "iconPackageId",
        "iconPosition",
        "iconSize",
        "iconVariant",
        "variant",
        "size",
        "iconOnly",
        "loading",
        "disabled",
        "fullWidth",
        "active",
        "progress",
        "glow",
        "glowColor",
        "tooltip",
        "children",
        "class",
        "aria-label",
        "title",
    ]);
    const getButtonClasses = () => {
        const classes = ["reynard-icon-button"];
        // Add variant class
        classes.push(`reynard-icon-button--${local.variant}`);
        // Add size class
        classes.push(`reynard-icon-button--${local.size}`);
        // Add state classes
        if (local.disabled || local.loading) {
            classes.push("reynard-icon-button--disabled");
        }
        if (local.loading) {
            classes.push("reynard-icon-button--loading");
        }
        if (local.fullWidth) {
            classes.push("reynard-icon-button--full-width");
        }
        if (local.iconOnly) {
            classes.push("reynard-icon-button--icon-only");
        }
        if (local.active) {
            classes.push("reynard-icon-button--active");
        }
        if (local.glow) {
            classes.push("reynard-icon-button--glow");
        }
        if (typeof local.progress === "number" && local.progress > 0) {
            classes.push("reynard-icon-button--with-progress");
        }
        // Add custom class
        if (local.class) {
            classes.push(local.class);
        }
        return classes.join(" ");
    };
    const getIconProps = () => ({
        name: local.icon,
        packageId: local.iconPackageId,
        size: local.iconSize,
        variant: local.iconVariant,
        loading: local.loading,
        progress: local.progress,
        glow: local.glow,
        glowColor: local.glowColor,
        active: local.active,
    });
    const renderIcon = (position) => {
        if (local.iconPosition === position) {
            return (<span class={`reynard-icon-button__icon reynard-icon-button__icon--${position}`}>
          <Icon {...getIconProps()}/>
        </span>);
        }
        return null;
    };
    const getTooltip = () => {
        return local.tooltip || local["aria-label"] || local.title;
    };
    const getAriaLabel = () => {
        return local["aria-label"] || local.tooltip || local.title;
    };
    return (<button class={getButtonClasses()} disabled={local.disabled || local.loading} title={getTooltip()} aria-label={getAriaLabel()} {...others}>
      {renderIcon("left")}

      {!local.iconOnly && local.children && <span class="reynard-icon-button__content">{local.children}</span>}

      {local.iconOnly && local.children}

      {renderIcon("right")}

      {typeof local.progress === "number" && local.progress > 0 && (<div class="reynard-icon-button__progress">
          <div class="reynard-icon-button__progress-bar" style={{
                "--progress-width": `${Math.max(0, Math.min(100, local.progress))}%`,
            }}/>
        </div>)}
    </button>);
};
