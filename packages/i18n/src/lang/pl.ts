/**
 * Polish translations for Reynard framework
 * Polski translations
 *
 * NOTE: This is a placeholder file. Please translate the content to Polski.
 */

import type { Translations } from "../types";

export default {
  common: {
    // Basic actions
    close: "Close (Polski)",
    delete: "Delete (Polski)",
    cancel: "Cancel (Polski)",
    save: "Save (Polski)",
    edit: "Edit (Polski)",
    add: "Add (Polski)",
    remove: "Remove (Polski)",
    loading: "Loading... (Polski)",
    error: "Error (Polski)",
    success: "Success (Polski)",
    confirm: "Confirm (Polski)",
    download: "Download (Polski)",
    upload: "Upload (Polski)",
    ok: "OK (Polski)",
    open: "Open (Polski)",
    copy: "Copy (Polski)",
    warning: "Warning (Polski)",
    info: "Information (Polski)",
    update: "Update (Polski)",
    clear: "Clear (Polski)",

    // Navigation
    home: "Home (Polski)",
    back: "Back (Polski)",
    next: "Next (Polski)",
    previous: "Previous (Polski)",

    // Data
    path: "Path (Polski)",
    size: "Size (Polski)",
    date: "Date (Polski)",
    name: "Name (Polski)",
    type: "Type (Polski)",
    actions: "Actions (Polski)",
    search: "Search (Polski)",
    filter: "Filter (Polski)",
    apply: "Apply (Polski)",
    reset: "Reset (Polski)",
    selected: "Selected (Polski)",
    all: "All (Polski)",
    none: "None (Polski)",
    notFound: "Not found (Polski)",

    // UI elements
    toggleTheme: "Toggle theme (Polski)",
    theme: "Theme (Polski)",
    language: "Language (Polski)",
    description: "Description (Polski)",
    settings: "Settings (Polski)",
    help: "Help (Polski)",
    about: "About (Polski)",
  },

  themes: {
    light: "Light (Polski)",
    gray: "Gray (Polski)",
    dark: "Dark (Polski)",
    banana: "Banana (Polski)",
    strawberry: "Strawberry (Polski)",
    peanut: "Peanut (Polski)",
    "high-contrast-black": "High Contrast Black (Polski)",
    "high-contrast-inverse": "High Contrast Inverse (Polski)",
  },

  core: {
    notifications: {
      title: "Notifications (Polski)",
      dismiss: "Dismiss (Polski)",
      dismissAll: "Dismiss All (Polski)",
      markAsRead: "Mark as Read (Polski)",
      markAllAsRead: "Mark All as Read (Polski)",
      noNotifications: "No notifications (Polski)",
      error: "Error (Polski)",
      success: "Success (Polski)",
      warning: "Warning (Polski)",
      info: "Information (Polski)",
    },
    validation: {
      required: "This field is required (Polski)",
      invalid: "Invalid value (Polski)",
      tooShort: "Value is too short (Polski)",
      tooLong: "Value is too long (Polski)",
      invalidEmail: "Invalid email address (Polski)",
      invalidUrl: "Invalid URL (Polski)",
      invalidNumber: "Invalid number (Polski)",
      minValue: "Value is too small (Polski)",
      maxValue: "Value is too large (Polski)",
    },
    dateTime: {
      now: "Now (Polski)",
      today: "Today (Polski)",
      yesterday: "Yesterday (Polski)",
      tomorrow: "Tomorrow (Polski)",
      format: "Format (Polski)",
      timezone: "Timezone (Polski)",
    },
  },

  components: {
    modal: {
      close: "Close (Polski)",
      confirm: "Confirm (Polski)",
      cancel: "Cancel (Polski)",
    },
    tabs: {
      next: "Next Tab (Polski)",
      previous: "Previous Tab (Polski)",
    },
    dropdown: {
      select: "Select (Polski)",
      clear: "Clear (Polski)",
      search: "Search (Polski)",
      noResults: "No results found (Polski)",
    },
    tooltip: {
      show: "Show tooltip (Polski)",
      hide: "Hide tooltip (Polski)",
    },
  },

  gallery: {
    upload: {
      title: "Upload Files (Polski)",
      dragDrop: "Drag and drop files here (Polski)",
      selectFiles: "Select Files (Polski)",
      progress: "Uploading... (Polski)",
      complete: "Upload complete (Polski)",
      failed: "Upload failed (Polski)",
      cancel: "Cancel upload (Polski)",
    },
    file: {
      name: "Name (Polski)",
      size: "Size (Polski)",
      date: "Date (Polski)",
      type: "Type (Polski)",
      actions: "Actions (Polski)",
      delete: "Delete (Polski)",
      rename: "Rename (Polski)",
      move: "Move (Polski)",
      copy: "Copy (Polski)",
      download: "Download (Polski)",
    },
    folder: {
      create: "Create Folder (Polski)",
      delete: "Delete Folder (Polski)",
      rename: "Rename Folder (Polski)",
      move: "Move Folder (Polski)",
      empty: "Empty folder (Polski)",
    },
    view: {
      grid: "Grid View (Polski)",
      list: "List View (Polski)",
      thumbnail: "Thumbnail View (Polski)",
      details: "Details View (Polski)",
    },
    sort: {
      name: "Sort by Name (Polski)",
      date: "Sort by Date (Polski)",
      size: "Sort by Size (Polski)",
      type: "Sort by Type (Polski)",
      ascending: "Ascending (Polski)",
      descending: "Descending (Polski)",
    },
  },

  charts: {
    types: {
      line: "Line Chart (Polski)",
      bar: "Bar Chart (Polski)",
      pie: "Pie Chart (Polski)",
      area: "Area Chart (Polski)",
      scatter: "Scatter Plot (Polski)",
      histogram: "Histogram (Polski)",
    },
    axes: {
      x: "X Axis (Polski)",
      y: "Y Axis (Polski)",
      value: "Value (Polski)",
      category: "Category (Polski)",
      time: "Time (Polski)",
    },
    legend: {
      show: "Show Legend (Polski)",
      hide: "Hide Legend (Polski)",
      position: "Legend Position (Polski)",
    },
    tooltip: {
      show: "Show Tooltip (Polski)",
      hide: "Hide Tooltip (Polski)",
    },
    data: {
      noData: "No data available (Polski)",
      loading: "Loading data... (Polski)",
      error: "Error loading data (Polski)",
    },
  },

  auth: {
    login: {
      title: "Login (Polski)",
      username: "Username (Polski)",
      password: "Password (Polski)",
      remember: "Remember me (Polski)",
      forgot: "Forgot password? (Polski)",
      submit: "Login (Polski)",
      success: "Login successful (Polski)",
      failed: "Login failed (Polski)",
    },
    register: {
      title: "Register (Polski)",
      username: "Username (Polski)",
      email: "Email (Polski)",
      password: "Password (Polski)",
      confirmPassword: "Confirm Password (Polski)",
      submit: "Register (Polski)",
      success: "Registration successful (Polski)",
      failed: "Registration failed (Polski)",
    },
    logout: {
      title: "Logout (Polski)",
      confirm: "Are you sure you want to logout? (Polski)",
      success: "Logout successful (Polski)",
    },
    profile: {
      title: "Profile (Polski)",
      edit: "Edit Profile (Polski)",
      save: "Save Changes (Polski)",
      cancel: "Cancel (Polski)",
    },
  },

  chat: {
    message: {
      send: "Send Message (Polski)",
      type: "Type a message... (Polski)",
      placeholder: "Type your message here (Polski)",
      sent: "Message sent (Polski)",
      received: "Message received (Polski)",
      failed: "Failed to send message (Polski)",
    },
    room: {
      create: "Create Room (Polski)",
      join: "Join Room (Polski)",
      leave: "Leave Room (Polski)",
      delete: "Delete Room (Polski)",
      name: "Room Name (Polski)",
      description: "Room Description (Polski)",
    },
    user: {
      online: "Online (Polski)",
      offline: "Offline (Polski)",
      typing: "Typing... (Polski)",
      away: "Away (Polski)",
    },
    p2p: {
      connect: "Connect (Polski)",
      disconnect: "Disconnect (Polski)",
      connected: "Connected (Polski)",
      disconnected: "Disconnected (Polski)",
    },
  },

  monaco: {
    editor: {
      save: "Save (Polski)",
      format: "Format Code (Polski)",
      find: "Find (Polski)",
      replace: "Replace (Polski)",
      undo: "Undo (Polski)",
      redo: "Redo (Polski)",
      cut: "Cut (Polski)",
      copy: "Copy (Polski)",
      paste: "Paste (Polski)",
      selectAll: "Select All (Polski)",
    },
    language: {
      select: "Select Language (Polski)",
      detect: "Detect Language (Polski)",
    },
    theme: {
      select: "Select Theme (Polski)",
      light: "Light Theme (Polski)",
      dark: "Dark Theme (Polski)",
    },
    settings: {
      title: "Editor Settings (Polski)",
      fontSize: "Font Size (Polski)",
      tabSize: "Tab Size (Polski)",
      wordWrap: "Word Wrap (Polski)",
      minimap: "Minimap (Polski)",
      lineNumbers: "Line Numbers (Polski)",
    },
  },
} as const satisfies Translations;
