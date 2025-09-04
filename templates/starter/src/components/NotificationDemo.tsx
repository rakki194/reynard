/**
 * Notification Demo Component
 * Demonstrates notification system functionality
 */

import { Component } from 'solid-js';
import { useNotifications } from '../../../packages/core/src';

export const NotificationDemo: Component = () => {
  const { notify } = useNotifications();

  const showSuccess = () => {
    notify('Operation completed successfully!', 'success');
  };

  const showError = () => {
    notify('Something went wrong. Please try again.', 'error');
  };

  const showInfo = () => {
    notify('Here is some helpful information.', 'info');
  };

  const showWarning = () => {
    notify('Please review this important notice.', 'warning');
  };

  return (
    <div class="notification-demo">
      <div class="button-group">
        <button class="button button--success" onClick={showSuccess}>
          Success
        </button>
        <button class="button button--error" onClick={showError}>
          Error
        </button>
        <button class="button button--info" onClick={showInfo}>
          Info
        </button>
        <button class="button button--warning" onClick={showWarning}>
          Warning
        </button>
      </div>
    </div>
  );
};
