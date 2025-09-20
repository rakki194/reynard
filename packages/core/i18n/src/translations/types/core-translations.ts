/**
 * Core package translations
 * Essential translations for core functionality
 */

export interface CoreTranslations {
  notifications: {
    title: string;
    dismiss: string;
    dismissAll: string;
    markAsRead: string;
    markAllAsRead: string;
    noNotifications: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  validation: {
    required: string;
    invalid: string;
    tooShort: string;
    tooLong: string;
    invalidEmail: string;
    invalidUrl: string;
    invalidNumber: string;
    minValue: string;
    maxValue: string;
  };
  dateTime: {
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    format: string;
    timezone: string;
  };
}
