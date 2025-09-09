/**
 * Finnish translations for Reynard framework
 * Suomi translations
 *
 * NOTE: This is a placeholder file. Please translate the content to Suomi.
 */

import type { Translations } from "../types";

export default {
  common: {
    // Basic actions
    close: "Close (Suomi)",
    delete: "Delete (Suomi)",
    cancel: "Cancel (Suomi)",
    save: "Save (Suomi)",
    edit: "Edit (Suomi)",
    add: "Add (Suomi)",
    remove: "Remove (Suomi)",
    loading: "Loading... (Suomi)",
    error: "Error (Suomi)",
    success: "Success (Suomi)",
    confirm: "Confirm (Suomi)",
    download: "Download (Suomi)",
    upload: "Upload (Suomi)",
    ok: "OK (Suomi)",
    open: "Open (Suomi)",
    copy: "Copy (Suomi)",
    warning: "Warning (Suomi)",
    info: "Information (Suomi)",
    update: "Update (Suomi)",
    clear: "Clear (Suomi)",

    // Navigation
    home: "Home (Suomi)",
    back: "Back (Suomi)",
    next: "Next (Suomi)",
    previous: "Previous (Suomi)",

    // Data
    path: "Path (Suomi)",
    size: "Size (Suomi)",
    date: "Date (Suomi)",
    name: "Name (Suomi)",
    type: "Type (Suomi)",
    actions: "Actions (Suomi)",
    search: "Search (Suomi)",
    filter: "Filter (Suomi)",
    apply: "Apply (Suomi)",
    reset: "Reset (Suomi)",
    selected: "Selected (Suomi)",
    all: "All (Suomi)",
    none: "None (Suomi)",
    notFound: "Not found (Suomi)",

    // UI elements
    toggleTheme: "Toggle theme (Suomi)",
    theme: "Theme (Suomi)",
    language: "Language (Suomi)",
    description: "Description (Suomi)",
    settings: "Settings (Suomi)",
    help: "Help (Suomi)",
    about: "About (Suomi)",
  },

  themes: {
    light: "Light (Suomi)",
    gray: "Gray (Suomi)",
    dark: "Dark (Suomi)",
    banana: "Banana (Suomi)",
    strawberry: "Strawberry (Suomi)",
    peanut: "Peanut (Suomi)",
    "high-contrast-black": "High Contrast Black (Suomi)",
    "high-contrast-inverse": "High Contrast Inverse (Suomi)",
  },

  core: {
    notifications: {
      title: "Notifications (Suomi)",
      dismiss: "Dismiss (Suomi)",
      dismissAll: "Dismiss All (Suomi)",
      markAsRead: "Mark as Read (Suomi)",
      markAllAsRead: "Mark All as Read (Suomi)",
      noNotifications: "No notifications (Suomi)",
      error: "Error (Suomi)",
      success: "Success (Suomi)",
      warning: "Warning (Suomi)",
      info: "Information (Suomi)",
    },
    validation: {
      required: "This field is required (Suomi)",
      invalid: "Invalid value (Suomi)",
      tooShort: "Value is too short (Suomi)",
      tooLong: "Value is too long (Suomi)",
      invalidEmail: "Invalid email address (Suomi)",
      invalidUrl: "Invalid URL (Suomi)",
      invalidNumber: "Invalid number (Suomi)",
      minValue: "Value is too small (Suomi)",
      maxValue: "Value is too large (Suomi)",
    },
    dateTime: {
      now: "Now (Suomi)",
      today: "Today (Suomi)",
      yesterday: "Yesterday (Suomi)",
      tomorrow: "Tomorrow (Suomi)",
      format: "Format (Suomi)",
      timezone: "Timezone (Suomi)",
    },
  },

  components: {
    modal: {
      close: "Close (Suomi)",
      confirm: "Confirm (Suomi)",
      cancel: "Cancel (Suomi)",
    },
    tabs: {
      next: "Next Tab (Suomi)",
      previous: "Previous Tab (Suomi)",
    },
    dropdown: {
      select: "Select (Suomi)",
      clear: "Clear (Suomi)",
      search: "Search (Suomi)",
      noResults: "No results found (Suomi)",
    },
    tooltip: {
      show: "Show tooltip (Suomi)",
      hide: "Hide tooltip (Suomi)",
    },
  },

  gallery: {
    upload: {
      title: "Upload Files (Suomi)",
      dragDrop: "Drag and drop files here (Suomi)",
      selectFiles: "Select Files (Suomi)",
      progress: "Uploading... (Suomi)",
      complete: "Upload complete (Suomi)",
      failed: "Upload failed (Suomi)",
      cancel: "Cancel upload (Suomi)",
    },
    file: {
      name: "Name (Suomi)",
      size: "Size (Suomi)",
      date: "Date (Suomi)",
      type: "Type (Suomi)",
      actions: "Actions (Suomi)",
      delete: "Delete (Suomi)",
      rename: "Rename (Suomi)",
      move: "Move (Suomi)",
      copy: "Copy (Suomi)",
      download: "Download (Suomi)",
    },
    folder: {
      create: "Create Folder (Suomi)",
      delete: "Delete Folder (Suomi)",
      rename: "Rename Folder (Suomi)",
      move: "Move Folder (Suomi)",
      empty: "Empty folder (Suomi)",
    },
    view: {
      grid: "Grid View (Suomi)",
      list: "List View (Suomi)",
      thumbnail: "Thumbnail View (Suomi)",
      details: "Details View (Suomi)",
    },
    sort: {
      name: "Sort by Name (Suomi)",
      date: "Sort by Date (Suomi)",
      size: "Sort by Size (Suomi)",
      type: "Sort by Type (Suomi)",
      ascending: "Ascending (Suomi)",
      descending: "Descending (Suomi)",
    },
  },

  charts: {
    types: {
      line: "Line Chart (Suomi)",
      bar: "Bar Chart (Suomi)",
      pie: "Pie Chart (Suomi)",
      area: "Area Chart (Suomi)",
      scatter: "Scatter Plot (Suomi)",
      histogram: "Histogram (Suomi)",
    },
    axes: {
      x: "X Axis (Suomi)",
      y: "Y Axis (Suomi)",
      value: "Value (Suomi)",
      category: "Category (Suomi)",
      time: "Time (Suomi)",
    },
    legend: {
      show: "Show Legend (Suomi)",
      hide: "Hide Legend (Suomi)",
      position: "Legend Position (Suomi)",
    },
    tooltip: {
      show: "Show Tooltip (Suomi)",
      hide: "Hide Tooltip (Suomi)",
    },
    data: {
      noData: "No data available (Suomi)",
      loading: "Loading data... (Suomi)",
      error: "Error loading data (Suomi)",
    },
  },

  auth: {
    login: {
      title: "Login (Suomi)",
      username: "Username (Suomi)",
      password: "Password (Suomi)",
      remember: "Remember me (Suomi)",
      forgot: "Forgot password? (Suomi)",
      submit: "Login (Suomi)",
      success: "Login successful (Suomi)",
      failed: "Login failed (Suomi)",
    },
    register: {
      title: "Register (Suomi)",
      username: "Username (Suomi)",
      email: "Email (Suomi)",
      password: "Password (Suomi)",
      confirmPassword: "Confirm Password (Suomi)",
      submit: "Register (Suomi)",
      success: "Registration successful (Suomi)",
      failed: "Registration failed (Suomi)",
    },
    logout: {
      title: "Logout (Suomi)",
      confirm: "Are you sure you want to logout? (Suomi)",
      success: "Logout successful (Suomi)",
    },
    profile: {
      title: "Profile (Suomi)",
      edit: "Edit Profile (Suomi)",
      save: "Save Changes (Suomi)",
      cancel: "Cancel (Suomi)",
    },
  },

  chat: {
    message: {
      send: "Send Message (Suomi)",
      type: "Type a message... (Suomi)",
      placeholder: "Type your message here (Suomi)",
      sent: "Message sent (Suomi)",
      received: "Message received (Suomi)",
      failed: "Failed to send message (Suomi)",
    },
    room: {
      create: "Create Room (Suomi)",
      join: "Join Room (Suomi)",
      leave: "Leave Room (Suomi)",
      delete: "Delete Room (Suomi)",
      name: "Room Name (Suomi)",
      description: "Room Description (Suomi)",
    },
    user: {
      online: "Online (Suomi)",
      offline: "Offline (Suomi)",
      typing: "Typing... (Suomi)",
      away: "Away (Suomi)",
    },
    p2p: {
      connect: "Connect (Suomi)",
      disconnect: "Disconnect (Suomi)",
      connected: "Connected (Suomi)",
      disconnected: "Disconnected (Suomi)",
    },
  },

  monaco: {
    editor: {
      save: "Save (Suomi)",
      format: "Format Code (Suomi)",
      find: "Find (Suomi)",
      replace: "Replace (Suomi)",
      undo: "Undo (Suomi)",
      redo: "Redo (Suomi)",
      cut: "Cut (Suomi)",
      copy: "Copy (Suomi)",
      paste: "Paste (Suomi)",
      selectAll: "Select All (Suomi)",
    },
    language: {
      select: "Select Language (Suomi)",
      detect: "Detect Language (Suomi)",
    },
    theme: {
      select: "Select Theme (Suomi)",
      light: "Light Theme (Suomi)",
      dark: "Dark Theme (Suomi)",
    },
    settings: {
      title: "Editor Settings (Suomi)",
      fontSize: "Font Size (Suomi)",
      tabSize: "Tab Size (Suomi)",
      wordWrap: "Word Wrap (Suomi)",
      minimap: "Minimap (Suomi)",
      lineNumbers: "Line Numbers (Suomi)",
    },
  },
} as const satisfies Translations;
