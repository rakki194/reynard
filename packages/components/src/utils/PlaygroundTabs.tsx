/**
 * Playground Tabs Component
 * Tab navigation for the component playground
 */

import { Component, For } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface Tab {
  id: string;
  name: string;
  icon: string;
}

export interface PlaygroundTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const PlaygroundTabs: Component<PlaygroundTabsProps> = (props) => {
  return (
    <div class="playground-tabs">
      <For each={props.tabs}>
        {(tab) => (
          <button
            class={`playground-tab ${props.activeTab === tab.id ? "active" : ""}`}
            onClick={() => props.onTabChange(tab.id)}
          >
            {fluentIconsPackage.getIcon(tab.icon) && (
              <span class="tab-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon(tab.icon)?.outerHTML}
                />
              </span>
            )}
            {tab.name}
          </button>
        )}
      </For>
    </div>
  );
};
