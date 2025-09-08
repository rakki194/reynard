/**
 * FeatureCard Component
 * Displays individual framework features with icons and descriptions
 */

import { Component, JSX } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  children?: JSX.Element;
}

export const FeatureCard: Component<FeatureCardProps> = (props) => {
  return (
    <div class="feature-card">
      <h3>
        <span class="feature-icon">
          {fluentIconsPackage.getIcon(props.icon) && (
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon(props.icon)?.outerHTML}
            />
          )}
        </span>
        {props.title}
      </h3>
      <p>{props.description}</p>
      {props.children}
    </div>
  );
};
