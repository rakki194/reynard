/**
 * Tabs Component
 * A flexible tab navigation component with keyboard support
 */
import { splitProps, mergeProps, For } from "solid-js";
const defaultProps = {
    variant: "default",
    size: "md",
    fullWidth: false,
};
export const Tabs = (props) => {
    const merged = mergeProps(defaultProps, props);
    const [local] = splitProps(merged, [
        "items",
        "activeTab",
        "onTabChange",
        "variant",
        "size",
        "fullWidth",
        "children",
        "class",
    ]);
    let tabsRef;
    // Handle keyboard navigation
    const handleKeyDown = (e, tabId) => {
        const currentIndex = local.items.findIndex((item) => item.id === tabId);
        let nextIndex = currentIndex;
        switch (e.key) {
            case "ArrowLeft":
                e.preventDefault();
                nextIndex =
                    currentIndex > 0 ? currentIndex - 1 : local.items.length - 1;
                break;
            case "ArrowRight":
                e.preventDefault();
                nextIndex =
                    currentIndex < local.items.length - 1 ? currentIndex + 1 : 0;
                break;
            case "Home":
                e.preventDefault();
                nextIndex = 0;
                break;
            case "End":
                e.preventDefault();
                nextIndex = local.items.length - 1;
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                local.onTabChange(tabId);
                return;
            default:
                return;
        }
        // Find next non-disabled tab
        while (local.items[nextIndex]?.disabled && nextIndex !== currentIndex) {
            if (e.key === "ArrowLeft" || e.key === "End") {
                nextIndex = nextIndex > 0 ? nextIndex - 1 : local.items.length - 1;
            }
            else {
                nextIndex = nextIndex < local.items.length - 1 ? nextIndex + 1 : 0;
            }
        }
        if (!local.items[nextIndex]?.disabled) {
            // Focus the tab button
            const tabButton = tabsRef?.querySelector(`[data-tab-id="${local.items[nextIndex].id}"]`);
            tabButton?.focus();
        }
    };
    const getTabsClasses = () => {
        const classes = [
            "reynard-tabs",
            `reynard-tabs--${local.variant}`,
            `reynard-tabs--${local.size}`,
        ];
        if (local.fullWidth)
            classes.push("reynard-tabs--full-width");
        if (local.class)
            classes.push(local.class);
        return classes.join(" ");
    };
    const getTabClasses = (item) => {
        const classes = ["reynard-tabs__tab"];
        if (item.id === local.activeTab)
            classes.push("reynard-tabs__tab--active");
        if (item.disabled)
            classes.push("reynard-tabs__tab--disabled");
        return classes.join(" ");
    };
    const getAriaSelected = (item) => {
        return item.id === local.activeTab;
    };
    return (<div class={getTabsClasses()}>
      <div class="reynard-tabs__list" role="tablist" ref={tabsRef}>
        <For each={local.items}>
          {(item) => (<button type="button" role="tab" data-tab-id={item.id} class={getTabClasses(item)} attr:aria-selected={getAriaSelected(item) ? "true" : "false"} disabled={item.disabled} tabindex={item.id === local.activeTab ? 0 : -1} onClick={() => !item.disabled && local.onTabChange(item.id)} onKeyDown={(e) => handleKeyDown(e, item.id)}>
              {item.icon && (<span class="reynard-tabs__tab-icon">{item.icon}</span>)}

              <span class="reynard-tabs__tab-label">{item.label}</span>

              {item.badge && (<span class="reynard-tabs__tab-badge">{item.badge}</span>)}
            </button>)}
        </For>
      </div>

      {local.children && (<div class="reynard-tabs__content">{local.children}</div>)}

      {/* Handle content property for backward compatibility */}
      {!local.children && local.items.length > 0 && (<div class="reynard-tabs__content">
          {local.items.map((item) => (<div class={`reynard-tab-panel ${item.id === local.activeTab ? "reynard-tab-panel--active" : "reynard-tab-panel--hidden"}`} role="tabpanel" aria-hidden={item.id !== local.activeTab}>
              {item.content}
            </div>))}
        </div>)}
    </div>);
};
export const TabPanel = (props) => {
    const [local] = splitProps(props, [
        "tabId",
        "activeTab",
        "children",
        "class",
    ]);
    const isActive = () => local.tabId === local.activeTab;
    const getAriaHidden = () => {
        return !isActive();
    };
    const getClasses = () => {
        const classes = ["reynard-tab-panel"];
        if (!isActive())
            classes.push("reynard-tab-panel--hidden");
        if (local.class)
            classes.push(local.class);
        return classes.join(" ");
    };
    return (<div role="tabpanel" class={getClasses()} attr:aria-hidden={getAriaHidden() ? "true" : "false"} tabindex={isActive() ? 0 : -1}>
      {isActive() && local.children}
    </div>);
};
