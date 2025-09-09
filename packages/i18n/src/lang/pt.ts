/**
 * Portuguese translations for Reynard framework
 * Português translations
 *
 * NOTE: This is a placeholder file. Please translate the content to Português.
 */

import type { Translations } from "../types";

export default {
  common: {
    // Basic actions
    close: "Close (Português)",
    delete: "Delete (Português)",
    cancel: "Cancel (Português)",
    save: "Save (Português)",
    edit: "Edit (Português)",
    add: "Add (Português)",
    remove: "Remove (Português)",
    loading: "Loading... (Português)",
    error: "Error (Português)",
    success: "Success (Português)",
    confirm: "Confirm (Português)",
    download: "Download (Português)",
    upload: "Upload (Português)",
    ok: "OK (Português)",
    open: "Open (Português)",
    copy: "Copy (Português)",
    warning: "Warning (Português)",
    info: "Information (Português)",
    update: "Update (Português)",
    clear: "Clear (Português)",

    // Navigation
    home: "Home (Português)",
    back: "Back (Português)",
    next: "Next (Português)",
    previous: "Previous (Português)",

    // Data
    path: "Path (Português)",
    size: "Size (Português)",
    date: "Date (Português)",
    name: "Name (Português)",
    type: "Type (Português)",
    actions: "Actions (Português)",
    search: "Search (Português)",
    filter: "Filter (Português)",
    apply: "Apply (Português)",
    reset: "Reset (Português)",
    selected: "Selected (Português)",
    all: "All (Português)",
    none: "None (Português)",
    notFound: "Not found (Português)",

    // UI elements
    toggleTheme: "Toggle theme (Português)",
    theme: "Theme (Português)",
    language: "Language (Português)",
    description: "Description (Português)",
    settings: "Settings (Português)",
    help: "Help (Português)",
    about: "About (Português)",
  },

  themes: {
    light: "Light (Português)",
    gray: "Gray (Português)",
    dark: "Dark (Português)",
    banana: "Banana (Português)",
    strawberry: "Strawberry (Português)",
    peanut: "Peanut (Português)",
    "high-contrast-black": "High Contrast Black (Português)",
    "high-contrast-inverse": "High Contrast Inverse (Português)",
  },

  core: {
    notifications: {
      title: "Notifications (Português)",
      dismiss: "Dismiss (Português)",
      dismissAll: "Dismiss All (Português)",
      markAsRead: "Mark as Read (Português)",
      markAllAsRead: "Mark All as Read (Português)",
      noNotifications: "No notifications (Português)",
      error: "Error (Português)",
      success: "Success (Português)",
      warning: "Warning (Português)",
      info: "Information (Português)",
    },
    validation: {
      required: "This field is required (Português)",
      invalid: "Invalid value (Português)",
      tooShort: "Value is too short (Português)",
      tooLong: "Value is too long (Português)",
      invalidEmail: "Invalid email address (Português)",
      invalidUrl: "Invalid URL (Português)",
      invalidNumber: "Invalid number (Português)",
      minValue: "Value is too small (Português)",
      maxValue: "Value is too large (Português)",
    },
    dateTime: {
      now: "Now (Português)",
      today: "Today (Português)",
      yesterday: "Yesterday (Português)",
      tomorrow: "Tomorrow (Português)",
      format: "Format (Português)",
      timezone: "Timezone (Português)",
    },
  },

  components: {
    modal: {
      close: "Close (Português)",
      confirm: "Confirm (Português)",
      cancel: "Cancel (Português)",
    },
    tabs: {
      next: "Next Tab (Português)",
      previous: "Previous Tab (Português)",
    },
    dropdown: {
      select: "Select (Português)",
      clear: "Clear (Português)",
      search: "Search (Português)",
      noResults: "No results found (Português)",
    },
    tooltip: {
      show: "Show tooltip (Português)",
      hide: "Hide tooltip (Português)",
    },
  },

  gallery: {
    upload: {
      title: "Upload Files (Português)",
      dragDrop: "Drag and drop files here (Português)",
      selectFiles: "Select Files (Português)",
      progress: "Uploading... (Português)",
      complete: "Upload complete (Português)",
      failed: "Upload failed (Português)",
      cancel: "Cancel upload (Português)",
    },
    file: {
      name: "Name (Português)",
      size: "Size (Português)",
      date: "Date (Português)",
      type: "Type (Português)",
      actions: "Actions (Português)",
      delete: "Delete (Português)",
      rename: "Rename (Português)",
      move: "Move (Português)",
      copy: "Copy (Português)",
      download: "Download (Português)",
    },
    folder: {
      create: "Create Folder (Português)",
      delete: "Delete Folder (Português)",
      rename: "Rename Folder (Português)",
      move: "Move Folder (Português)",
      empty: "Empty folder (Português)",
    },
    view: {
      grid: "Grid View (Português)",
      list: "List View (Português)",
      thumbnail: "Thumbnail View (Português)",
      details: "Details View (Português)",
    },
    sort: {
      name: "Sort by Name (Português)",
      date: "Sort by Date (Português)",
      size: "Sort by Size (Português)",
      type: "Sort by Type (Português)",
      ascending: "Ascending (Português)",
      descending: "Descending (Português)",
    },
  },

  charts: {
    types: {
      line: "Line Chart (Português)",
      bar: "Bar Chart (Português)",
      pie: "Pie Chart (Português)",
      area: "Area Chart (Português)",
      scatter: "Scatter Plot (Português)",
      histogram: "Histogram (Português)",
    },
    axes: {
      x: "X Axis (Português)",
      y: "Y Axis (Português)",
      value: "Value (Português)",
      category: "Category (Português)",
      time: "Time (Português)",
    },
    legend: {
      show: "Show Legend (Português)",
      hide: "Hide Legend (Português)",
      position: "Legend Position (Português)",
    },
    tooltip: {
      show: "Show Tooltip (Português)",
      hide: "Hide Tooltip (Português)",
    },
    data: {
      noData: "No data available (Português)",
      loading: "Loading data... (Português)",
      error: "Error loading data (Português)",
    },
  },

  auth: {
    login: {
      title: "Login (Português)",
      username: "Username (Português)",
      password: "Password (Português)",
      remember: "Remember me (Português)",
      forgot: "Forgot password? (Português)",
      submit: "Login (Português)",
      success: "Login successful (Português)",
      failed: "Login failed (Português)",
    },
    register: {
      title: "Register (Português)",
      username: "Username (Português)",
      email: "Email (Português)",
      password: "Password (Português)",
      confirmPassword: "Confirm Password (Português)",
      submit: "Register (Português)",
      success: "Registration successful (Português)",
      failed: "Registration failed (Português)",
    },
    logout: {
      title: "Logout (Português)",
      confirm: "Are you sure you want to logout? (Português)",
      success: "Logout successful (Português)",
    },
    profile: {
      title: "Profile (Português)",
      edit: "Edit Profile (Português)",
      save: "Save Changes (Português)",
      cancel: "Cancel (Português)",
    },
  },

  chat: {
    message: {
      send: "Send Message (Português)",
      type: "Type a message... (Português)",
      placeholder: "Type your message here (Português)",
      sent: "Message sent (Português)",
      received: "Message received (Português)",
      failed: "Failed to send message (Português)",
    },
    room: {
      create: "Create Room (Português)",
      join: "Join Room (Português)",
      leave: "Leave Room (Português)",
      delete: "Delete Room (Português)",
      name: "Room Name (Português)",
      description: "Room Description (Português)",
    },
    user: {
      online: "Online (Português)",
      offline: "Offline (Português)",
      typing: "Typing... (Português)",
      away: "Away (Português)",
    },
    p2p: {
      connect: "Connect (Português)",
      disconnect: "Disconnect (Português)",
      connected: "Connected (Português)",
      disconnected: "Disconnected (Português)",
    },
  },

  monaco: {
    editor: {
      save: "Save (Português)",
      format: "Format Code (Português)",
      find: "Find (Português)",
      replace: "Replace (Português)",
      undo: "Undo (Português)",
      redo: "Redo (Português)",
      cut: "Cut (Português)",
      copy: "Copy (Português)",
      paste: "Paste (Português)",
      selectAll: "Select All (Português)",
    },
    language: {
      select: "Select Language (Português)",
      detect: "Detect Language (Português)",
    },
    theme: {
      select: "Select Theme (Português)",
      light: "Light Theme (Português)",
      dark: "Dark Theme (Português)",
    },
    settings: {
      title: "Editor Settings (Português)",
      fontSize: "Font Size (Português)",
      tabSize: "Tab Size (Português)",
      wordWrap: "Word Wrap (Português)",
      minimap: "Minimap (Português)",
      lineNumbers: "Line Numbers (Português)",
    },
  },
} as const satisfies Translations;
