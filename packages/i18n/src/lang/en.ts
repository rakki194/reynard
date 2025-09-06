/**
 * English translations for Reynard framework
 * Base translation file with comprehensive coverage
 */

import type { Translations } from '../types';

export default {
  common: {
    // Basic actions
    close: 'Close',
    delete: 'Delete',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    download: 'Download',
    upload: 'Upload',
    ok: 'OK',
    open: 'Open',
    copy: 'Copy',
    warning: 'Warning',
    info: 'Information',
    update: 'Update',
    clear: 'Clear',
    
    // Navigation
    home: 'Home',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    
    // Data
    path: 'Path',
    size: 'Size',
    date: 'Date',
    name: 'Name',
    type: 'Type',
    actions: 'Actions',
    search: 'Search',
    filter: 'Filter',
    apply: 'Apply',
    reset: 'Reset',
    selected: 'Selected',
    all: 'All',
    none: 'None',
    notFound: 'Not found',
    
    // UI elements
    toggleTheme: 'Toggle theme',
    theme: 'Theme',
    language: 'Language',
    description: 'Description',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
  },

  themes: {
    light: 'Light',
    gray: 'Gray',
    dark: 'Dark',
    banana: 'Banana',
    strawberry: 'Strawberry',
    peanut: 'Peanut',
    'high-contrast-black': 'High Contrast Black',
    'high-contrast-inverse': 'High Contrast Inverse',
  },

  core: {
    notifications: {
      title: 'Notifications',
      dismiss: 'Dismiss',
      dismissAll: 'Dismiss All',
      markAsRead: 'Mark as Read',
      markAllAsRead: 'Mark All as Read',
      noNotifications: 'No notifications',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
    },
    validation: {
      required: 'This field is required',
      invalid: 'Invalid value',
      tooShort: 'Value is too short',
      tooLong: 'Value is too long',
      invalidEmail: 'Invalid email address',
      invalidUrl: 'Invalid URL',
      invalidNumber: 'Invalid number',
      minValue: 'Value is too small',
      maxValue: 'Value is too large',
    },
    dateTime: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      format: 'Format',
      timezone: 'Timezone',
    },
  },

  components: {
    modal: {
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
    },
    tabs: {
      next: 'Next Tab',
      previous: 'Previous Tab',
    },
    dropdown: {
      select: 'Select',
      clear: 'Clear',
      search: 'Search',
      noResults: 'No results found',
    },
    tooltip: {
      show: 'Show tooltip',
      hide: 'Hide tooltip',
    },
  },

  gallery: {
    upload: {
      title: 'Upload Files',
      dragDrop: 'Drag and drop files here',
      selectFiles: 'Select Files',
      progress: 'Uploading...',
      complete: 'Upload complete',
      failed: 'Upload failed',
      cancel: 'Cancel upload',
    },
    file: {
      name: 'Name',
      size: 'Size',
      date: 'Date',
      type: 'Type',
      actions: 'Actions',
      delete: 'Delete',
      rename: 'Rename',
      move: 'Move',
      copy: 'Copy',
      download: 'Download',
    },
    folder: {
      create: 'Create Folder',
      delete: 'Delete Folder',
      rename: 'Rename Folder',
      move: 'Move Folder',
      empty: 'Empty folder',
    },
    view: {
      grid: 'Grid View',
      list: 'List View',
      thumbnail: 'Thumbnail View',
      details: 'Details View',
    },
    sort: {
      name: 'Sort by Name',
      date: 'Sort by Date',
      size: 'Sort by Size',
      type: 'Sort by Type',
      ascending: 'Ascending',
      descending: 'Descending',
    },
  },

  charts: {
    types: {
      line: 'Line Chart',
      bar: 'Bar Chart',
      pie: 'Pie Chart',
      area: 'Area Chart',
      scatter: 'Scatter Plot',
      histogram: 'Histogram',
    },
    axes: {
      x: 'X Axis',
      y: 'Y Axis',
      value: 'Value',
      category: 'Category',
      time: 'Time',
    },
    legend: {
      show: 'Show Legend',
      hide: 'Hide Legend',
      position: 'Legend Position',
    },
    tooltip: {
      show: 'Show Tooltip',
      hide: 'Hide Tooltip',
    },
    data: {
      noData: 'No data available',
      loading: 'Loading data...',
      error: 'Error loading data',
    },
  },

  auth: {
    login: {
      title: 'Login',
      username: 'Username',
      password: 'Password',
      remember: 'Remember me',
      forgot: 'Forgot password?',
      submit: 'Login',
      success: 'Login successful',
      failed: 'Login failed',
    },
    register: {
      title: 'Register',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      submit: 'Register',
      success: 'Registration successful',
      failed: 'Registration failed',
    },
    logout: {
      title: 'Logout',
      confirm: 'Are you sure you want to logout?',
      success: 'Logout successful',
    },
    profile: {
      title: 'Profile',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
    },
  },

  chat: {
    message: {
      send: 'Send Message',
      type: 'Type a message...',
      placeholder: 'Type your message here',
      sent: 'Message sent',
      received: 'Message received',
      failed: 'Failed to send message',
    },
    room: {
      create: 'Create Room',
      join: 'Join Room',
      leave: 'Leave Room',
      delete: 'Delete Room',
      name: 'Room Name',
      description: 'Room Description',
    },
    user: {
      online: 'Online',
      offline: 'Offline',
      typing: 'Typing...',
      away: 'Away',
    },
    p2p: {
      connect: 'Connect',
      disconnect: 'Disconnect',
      connected: 'Connected',
      disconnected: 'Disconnected',
    },
  },

  monaco: {
    editor: {
      save: 'Save',
      format: 'Format Code',
      find: 'Find',
      replace: 'Replace',
      undo: 'Undo',
      redo: 'Redo',
      cut: 'Cut',
      copy: 'Copy',
      paste: 'Paste',
      selectAll: 'Select All',
    },
    language: {
      select: 'Select Language',
      detect: 'Detect Language',
    },
    theme: {
      select: 'Select Theme',
      light: 'Light Theme',
      dark: 'Dark Theme',
    },
    settings: {
      title: 'Editor Settings',
      fontSize: 'Font Size',
      tabSize: 'Tab Size',
      wordWrap: 'Word Wrap',
      minimap: 'Minimap',
      lineNumbers: 'Line Numbers',
    },
  },
} as const satisfies Translations;
