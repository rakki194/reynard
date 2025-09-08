/**
 * Notification Icon Component
 * Renders appropriate icon for notification type
 */

import { Component } from "solid-js";
import { fluentIconsPackage } from "reynard-fluent-icons";

interface NotificationIconProps {
  type: "success" | "error" | "warning" | "info";
}

export const NotificationIcon: Component<NotificationIconProps> = (props) => {
  const getIconName = () => {
    switch (props.type) {
      case "success": return "checkmark";
      case "error": return "error";
      case "warning": return "warning";
      case "info": return "info";
      default: return "info";
    }
  };

  const icon = () => fluentIconsPackage.getIcon(getIconName());

  return (
    <div class="notification-toast__icon">
      {icon() && (
        <span
          // eslint-disable-next-line solid/no-innerhtml
          innerHTML={icon()?.outerHTML}
        />
      )}
    </div>
  );
};
