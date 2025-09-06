import { Component, createSignal, createEffect, createMemo, Show } from "solid-js";
import { getIcon } from "@reynard/fluent-icons";
import "./Notification.css";

export interface NotificationProps {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
  group?: string;
  icon?: "spinner" | "success" | "error" | "info" | "warning";
  progress?: number;
  duration?: number;
  onClose?: () => void;
}

export const Notification: Component<NotificationProps> = props => {
  const [isVisible, setIsVisible] = createSignal(true);
  const [isExiting, setIsExiting] = createSignal(false);
  const [isHovered, setIsHovered] = createSignal(false);
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let progressBarRef: HTMLDivElement | undefined;

  const getIconContent = createMemo(() => {
    if (props.icon) {
      switch (props.icon) {
        case 'spinner':
          return getIcon("spinner");
        case 'success':
          return getIcon("checkmark");
        case 'error':
          return getIcon("error");
        case 'warning':
          return getIcon("warning");
        case 'info':
          return getIcon("info");
        default:
          return getIcon("info");
      }
    }
    
    switch (props.type) {
      case 'error':
        return getIcon("error");
      case 'success':
        return getIcon("checkmark");
      case 'info':
        return getIcon("info");
      case 'warning':
        return getIcon("warning");
      default:
        return getIcon("info");
    }
  });

  // Truncate very long messages to prevent unmanageable notifications
  const truncatedMessage = createMemo(() => {
    const message = props.message;
    const maxLength = 200; // Maximum characters for notification messages
    if (message.length > maxLength) {
      return message.substring(0, maxLength) + '...';
    }
    return message;
  });

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      props.onClose?.();
    }, 300); // Match CSS animation duration
  };

  const startTimer = () => {
    // Clear any existing timer
    if (timeout) {
      clearTimeout(timeout);
    }

    console.log('[Notification] startTimer called. props.type:', props.type, 'props.icon:', props.icon, 'props.duration:', props.duration);

    // Use custom duration if provided, otherwise use default behavior
    const duration = props.duration || (props.type === 'error' ? 0 : 5000);
    
    // Auto-dismiss after duration for notifications that should auto-dismiss
    // Only start timer if not hovering and duration > 0
    if (duration > 0 && !isHovered()) {
      console.log('[Notification] Setting auto-dismiss timer for', duration, 'ms');
      timeout = setTimeout(handleClose, duration);
    } else {
      console.log('[Notification] Not setting auto-dismiss timer (duration:', duration, ', hovering:', isHovered(), ')');
    }
  };

  // Reset timer when message, icon, type, or duration changes
  createEffect(() => {
    startTimer();
  });

  // Clean up timer on unmount
  createEffect(() => {
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  });

  // Set progress bar width
  createEffect(() => {
    if (progressBarRef && props.progress !== undefined) {
      progressBarRef.style.setProperty('--progress-width', `${props.progress}%`);
    }
  });

  return (
    <Show when={isVisible()}>
      <div
        class={`notification notification--${props.type} ${isExiting() ? 'notification--exiting' : ''}`}
        onMouseEnter={() => {
          setIsHovered(true);
          if (timeout) {
            clearTimeout(timeout);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          startTimer();
        }}
      >
        <div class="notification__icon">
          {getIconContent()}
        </div>
        
        <div class="notification__content">
          <div class="notification__message">
            {truncatedMessage()}
          </div>
          
          <Show when={props.progress !== undefined}>
            <div class="notification__progress">
              <div 
                ref={progressBarRef}
                class="notification__progress-bar"
              />
            </div>
          </Show>
        </div>
        
        <button
          class="notification__close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </Show>
  );
};
