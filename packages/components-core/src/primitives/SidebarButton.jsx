/**
 * SidebarButton Component
 * A specialized button component for sidebar navigation with support for secondary actions,
 * content areas, and various layout styles.
 */
import { For, Show, mergeProps, splitProps } from "solid-js";
import { Icon } from "../icons/Icon";
const defaultProps = {
    iconSize: "md",
    iconVariant: "default",
    active: false,
    disabled: false,
    show: true,
    showLabel: true,
    showSecondaryActions: false,
    showContent: false,
    layout: "default",
    loading: false,
};
export const SidebarButton = props => {
    const merged = mergeProps(defaultProps, props);
    const [local, others] = splitProps(merged, [
        "icon",
        "iconPackageId",
        "iconSize",
        "iconVariant",
        "active",
        "disabled",
        "show",
        "class",
        "label",
        "showLabel",
        "secondaryIcon",
        "secondaryIconVariant",
        "showSecondaryActions",
        "secondaryActions",
        "showContent",
        "content",
        "layout",
        "loading",
        "progress",
        "glow",
        "glowColor",
        "tooltip",
        "aria-label",
        "title",
    ]);
    const getButtonClasses = () => {
        const classes = ["reynard-sidebar-button"];
        // Add layout class
        classes.push(`reynard-sidebar-button--${local.layout}`);
        // Add state classes
        if (local.active) {
            classes.push("reynard-sidebar-button--active");
        }
        if (local.disabled || local.loading) {
            classes.push("reynard-sidebar-button--disabled");
        }
        if (local.loading) {
            classes.push("reynard-sidebar-button--loading");
        }
        if (local.glow) {
            classes.push("reynard-sidebar-button--glow");
        }
        if (typeof local.progress === "number" && local.progress > 0) {
            classes.push("reynard-sidebar-button--with-progress");
        }
        // Add custom class
        if (local.class) {
            classes.push(local.class);
        }
        return classes.join(" ");
    };
    const getMainButtonClasses = () => {
        const classes = ["reynard-sidebar-button__main"];
        if (local.active) {
            classes.push("reynard-sidebar-button__main--active");
        }
        if (local.disabled || local.loading) {
            classes.push("reynard-sidebar-button__main--disabled");
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
    const getSecondaryIconProps = () => ({
        name: local.secondaryIcon,
        packageId: local.iconPackageId,
        size: local.iconSize,
        variant: local.secondaryIconVariant || local.iconVariant,
        active: local.active,
    });
    const getTooltip = () => {
        return local.tooltip || local["aria-label"] || local.title;
    };
    const getAriaLabel = () => {
        return local["aria-label"] || local.tooltip || local.title || local.label;
    };
    return (<Show when={local.show !== false}>
      <div class={getButtonClasses()}>
        {/* Main button */}
        <button class={getMainButtonClasses()} disabled={local.disabled || local.loading} title={getTooltip()} aria-label={getAriaLabel()} {...others}>
          <Icon {...getIconProps()}/>

          <Show when={local.showLabel && local.label}>
            <span class="reynard-sidebar-button__label">{local.label}</span>
          </Show>

          <Show when={local.secondaryIcon}>
            <Icon {...getSecondaryIconProps()}/>
          </Show>
        </button>

        {/* Secondary actions */}
        <Show when={local.showSecondaryActions && local.secondaryActions}>
          <div class="reynard-sidebar-button__secondary-actions">
            <For each={local.secondaryActions}>
              {action => (<button class="reynard-sidebar-button__secondary-action" aria-label={action.ariaLabel} title={action.tooltip} onClick={action.onClick} disabled={action.disabled}>
                  <Icon name={action.icon} size={action.size === "xs" ? "sm" : action.size || "sm"} variant={action.variant || "default"}/>
                </button>)}
            </For>
          </div>
        </Show>

        {/* Content area */}
        <Show when={local.showContent && local.active && local.content}>
          <div class="reynard-sidebar-button__content">{local.content}</div>
        </Show>

        {/* Progress bar */}
        <Show when={typeof local.progress === "number" && local.progress > 0}>
          <div class="reynard-sidebar-button__progress">
            <div class="reynard-sidebar-button__progress-bar" style={{
            "--progress-width": `${Math.max(0, Math.min(100, local.progress || 0))}%`,
        }}/>
          </div>
        </Show>
      </div>
    </Show>);
};
