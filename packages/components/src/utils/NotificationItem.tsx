/**
 * Notification Item Component
 * Renders individual notification toast item
 */

import { Component } from "solid-js";
import { NotificationIcon } from "./NotificationIcon";

interface NotificationItemProps {
  notification: {
    id: string;
    message: string;
    type: "success" | "error" | "warning" | "info";
  };
  onRemove: (id: string) => void;
}

export const NotificationItem: Component<NotificationItemProps> = props => {
  const handleClick = () => {
    props.onRemove(props.notification.id);
  };

  const handleCloseClick = (e: MouseEvent) => {
    e.stopPropagation();
    props.onRemove(props.notification.id);
  };

  return (
    <div class={`notification-toast notification-toast--${props.notification.type}`} onClick={handleClick}>
      <NotificationIcon type={props.notification.type} />
      <div class="notification-toast__content">
        <div class="notification-toast__message">{props.notification.message}</div>
      </div>
      <button class="notification-toast__close" onClick={handleCloseClick}>
        ×
      </button>
    </div>
  );
};
