import { SettingsSchema } from '@reynard/settings';

export const appSettingsSchema: SettingsSchema = {
  version: "1.0.0",
  metadata: {
    name: "Reynard Dashboard Settings",
    description: "Comprehensive dashboard application settings",
    author: "Reynard Team"
  },
  settings: {
    // General settings
    'general.language': {
      key: 'general.language',
      type: 'select',
      label: 'Language',
      description: 'Interface language',
      category: 'general',
      defaultValue: 'en',
      options: [
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'ja', label: '日本語' },
        { value: 'zh', label: '中文' },
      ],
    },
    'general.timezone': {
      key: 'general.timezone',
      type: 'select',
      label: 'Timezone',
      description: 'Your timezone for date/time display',
      category: 'general',
      defaultValue: 'UTC',
      options: [
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'Eastern Time' },
        { value: 'America/Chicago', label: 'Central Time' },
        { value: 'America/Denver', label: 'Mountain Time' },
        { value: 'America/Los_Angeles', label: 'Pacific Time' },
        { value: 'Europe/London', label: 'London' },
        { value: 'Europe/Paris', label: 'Paris' },
        { value: 'Asia/Tokyo', label: 'Tokyo' },
      ],
    },
    'general.autoSave': {
      key: 'general.autoSave',
      type: 'boolean',
      label: 'Auto Save',
      description: 'Automatically save changes',
      category: 'general',
      defaultValue: true,
    },
    
    // Appearance settings
    'appearance.theme': {
      key: 'appearance.theme',
      type: 'select',
      label: 'Theme',
      description: 'Color theme for the interface',
      category: 'appearance',
      defaultValue: 'light',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'gray', label: 'Gray' },
        { value: 'banana', label: 'Banana' },
        { value: 'strawberry', label: 'Strawberry' },
        { value: 'peanut', label: 'Peanut' },
        { value: 'high-contrast-black', label: 'High Contrast Black' },
        { value: 'high-contrast-inverse', label: 'High Contrast Inverse' },
      ],
    },
    'appearance.fontSize': {
      key: 'appearance.fontSize',
      type: 'range',
      label: 'Font Size',
      description: 'Base font size in pixels',
      category: 'appearance',
      defaultValue: 14,
      validation: { min: 12, max: 20 },
    },
    'appearance.sidebarCollapsed': {
      key: 'appearance.sidebarCollapsed',
      type: 'boolean',
      label: 'Collapse Sidebar',
      description: 'Start with sidebar collapsed',
      category: 'appearance',
      defaultValue: false,
    },
    'appearance.animations': {
      key: 'appearance.animations',
      type: 'boolean',
      label: 'Enable Animations',
      description: 'Enable UI animations and transitions',
      category: 'appearance',
      defaultValue: true,
    },
    
    // Notification settings
    'notifications.enableNotifications': {
      key: 'notifications.enableNotifications',
      type: 'boolean',
      label: 'Enable Notifications',
      description: 'Show desktop notifications',
      category: 'general',
      defaultValue: true,
    },
    'notifications.sound': {
      key: 'notifications.sound',
      type: 'boolean',
      label: 'Sound Notifications',
      description: 'Play sound for notifications',
      category: 'general',
      defaultValue: false,
    },
    'notifications.duration': {
      key: 'notifications.duration',
      type: 'range',
      label: 'Duration (seconds)',
      description: 'How long notifications stay visible',
      category: 'general',
      defaultValue: 5,
      validation: { min: 2, max: 30 },
    },
    
    // Privacy settings
    'privacy.analytics': {
      key: 'privacy.analytics',
      type: 'boolean',
      label: 'Analytics',
      description: 'Allow anonymous usage analytics',
      category: 'privacy',
      defaultValue: false,
    },
    'privacy.sessionTimeout': {
      key: 'privacy.sessionTimeout',
      type: 'range',
      label: 'Session Timeout (hours)',
      description: 'Auto-logout after inactivity',
      category: 'privacy',
      defaultValue: 24,
      validation: { min: 1, max: 168 },
    },
    'privacy.rememberLogin': {
      key: 'privacy.rememberLogin',
      type: 'boolean',
      label: 'Remember Login',
      description: 'Stay logged in between sessions',
      category: 'privacy',
      defaultValue: true,
    },
  },
  groups: {
    'general': {
      id: 'general',
      name: 'General',
      description: 'General application settings',
      icon: '⚙️',
      order: 0,
      settings: ['general.language', 'general.timezone', 'general.autoSave', 'notifications.enableNotifications', 'notifications.sound', 'notifications.duration']
    },
    'appearance': {
      id: 'appearance',
      name: 'Appearance',
      description: 'Visual appearance and theming',
      icon: '🎨',
      order: 1,
      settings: ['appearance.theme', 'appearance.fontSize', 'appearance.sidebarCollapsed', 'appearance.animations']
    },
    'privacy': {
      id: 'privacy',
      name: 'Privacy & Security',
      description: 'Privacy and security preferences',
      icon: '🔒',
      order: 2,
      settings: ['privacy.analytics', 'privacy.sessionTimeout', 'privacy.rememberLogin']
    }
  }
};


