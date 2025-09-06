/**
 * Icon Grid Component
 * Displays icons in a responsive grid layout
 */

import { Component, For } from "solid-js";
import { getIcon } from "reynard-fluent-icons";

interface IconGridProps {
  icons: [string, any][];
  onIconClick: (iconName: string) => void;
}

export const IconGrid: Component<IconGridProps> = (props) => {
  return (
    <div class="icon-grid">
      <For each={props.icons}>
        {([iconName, iconData]) => {
          const iconElement = getIcon(iconName);
          const metadata = iconData.metadata;
          
          return (
            <div 
              class="icon-card"
              onClick={() => props.onIconClick(iconName)}
            >
              <div class="icon-display">
                {iconElement && (
                  <div innerHTML={iconElement} />
                )}
              </div>
              <div class="icon-name">{metadata.name}</div>
              <div class="icon-description">{metadata.description}</div>
              <div class="icon-tags">
                <For each={metadata.tags?.slice(0, 3) || []}>
                  {(tag) => (
                    <span class="icon-tag">{tag}</span>
                  )}
                </For>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
};
