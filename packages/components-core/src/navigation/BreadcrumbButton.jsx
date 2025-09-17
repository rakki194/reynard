/**
 * BreadcrumbButton Component
 * Specialized button components for breadcrumb navigation with consistent styling
 * and behavior patterns used in breadcrumb interfaces.
 */
import { splitProps, mergeProps } from "solid-js";
import { Icon } from "../icons/Icon";
const defaultProps = {
    iconSize: "md",
    iconVariant: "default",
    variant: "default",
    size: "md",
    iconOnly: true,
    loading: false,
    disabled: false,
    active: false,
    isNavigation: false,
    isDestructive: false,
    isPrimary: false,
};
export const BreadcrumbButton = props => {
    const merged = mergeProps(defaultProps, props);
    const [local, others] = splitProps(merged, [
        "icon",
        "iconPackageId",
        "iconSize",
        "iconVariant",
        "variant",
        "size",
        "iconOnly",
        "loading",
        "disabled",
        "active",
        "progress",
        "glow",
        "glowColor",
        "tooltip",
        "isNavigation",
        "isDestructive",
        "isPrimary",
        "children",
        "class",
        "aria-label",
        "title",
    ]);
    const getButtonClasses = () => {
        const classes = ["reynard-breadcrumb-button"];
        // Add variant class
        classes.push(`reynard-breadcrumb-button--${local.variant}`);
        // Add size class
        classes.push(`reynard-breadcrumb-button--${local.size}`);
        // Add state classes
        if (local.disabled || local.loading) {
            classes.push("reynard-breadcrumb-button--disabled");
        }
        if (local.loading) {
            classes.push("reynard-breadcrumb-button--loading");
        }
        if (local.iconOnly) {
            classes.push("reynard-breadcrumb-button--icon-only");
        }
        if (local.active) {
            classes.push("reynard-breadcrumb-button--active");
        }
        if (local.glow) {
            classes.push("reynard-breadcrumb-button--glow");
        }
        if (typeof local.progress === "number" && local.progress > 0) {
            classes.push("reynard-breadcrumb-button--with-progress");
        }
        // Add semantic classes
        if (local.isNavigation) {
            classes.push("reynard-breadcrumb-button--navigation");
        }
        if (local.isDestructive) {
            classes.push("reynard-breadcrumb-button--destructive");
        }
        if (local.isPrimary) {
            classes.push("reynard-breadcrumb-button--primary");
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
    const getTooltip = () => {
        return local.tooltip || local["aria-label"] || local.title;
    };
    const getAriaLabel = () => {
        return local["aria-label"] || local.tooltip || local.title;
    };
    return (<button class={getButtonClasses()} disabled={local.disabled || local.loading} title={getTooltip()} aria-label={getAriaLabel()} {...others}>
      <span class="reynard-breadcrumb-button__icon">
        <Icon {...getIconProps()}/>
      </span>

      {!local.iconOnly && local.children && <span class="reynard-breadcrumb-button__content">{local.children}</span>}

      {local.iconOnly && local.children}

      {typeof local.progress === "number" && local.progress > 0 && (<div class="reynard-breadcrumb-button__progress">
          <div class="reynard-breadcrumb-button__progress-bar" style={{
                "--progress-width": `${Math.max(0, Math.min(100, local.progress))}%`,
            }}/>
        </div>)}
    </button>);
};
const actionIcons = {
    create: "add",
    delete: "delete",
    edit: "edit",
    settings: "settings",
    refresh: "refresh",
    upload: "upload",
    download: "download",
    search: "search",
    filter: "filter",
    sort: "sort",
};
const actionVariants = {
    create: "primary",
    delete: "danger",
    edit: "secondary",
    settings: "default",
    refresh: "default",
    upload: "primary",
    download: "secondary",
    search: "default",
    filter: "default",
    sort: "default",
};
export const BreadcrumbActionButton = props => {
    const merged = mergeProps(defaultProps, props);
    const [local, others] = splitProps(merged, [
        "action",
        "icon",
        "iconPackageId",
        "iconSize",
        "iconVariant",
        "variant",
        "size",
        "iconOnly",
        "loading",
        "disabled",
        "active",
        "progress",
        "glow",
        "glowColor",
        "tooltip",
        "isNavigation",
        "isDestructive",
        "isPrimary",
        "children",
        "class",
        "aria-label",
        "title",
    ]);
    const getIconName = () => {
        if (local.icon)
            return local.icon;
        if (local.action && actionIcons[local.action])
            return actionIcons[local.action];
        return "settings"; // fallback
    };
    const getVariant = () => {
        if (local.variant && local.variant !== "default")
            return local.variant;
        if (local.action && actionVariants[local.action])
            return actionVariants[local.action];
        return "default";
    };
    const getSemanticProps = () => {
        const props = {};
        if (local.action === "delete") {
            props.isDestructive = true;
        }
        else if (local.action === "create" || local.action === "upload") {
            props.isPrimary = true;
        }
        else if (local.action === "refresh" ||
            local.action === "search" ||
            local.action === "filter" ||
            local.action === "sort") {
            props.isNavigation = true;
        }
        return props;
    };
    return (<BreadcrumbButton {...others} icon={getIconName()} variant={getVariant()} {...getSemanticProps()} iconPackageId={local.iconPackageId} iconSize={local.iconSize} iconVariant={local.iconVariant} size={local.size} iconOnly={local.iconOnly} loading={local.loading} disabled={local.disabled} active={local.active} progress={local.progress} glow={local.glow} glowColor={local.glowColor} tooltip={local.tooltip} class={local.class}>
      {local.children}
    </BreadcrumbButton>);
};
