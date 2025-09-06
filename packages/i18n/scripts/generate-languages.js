#!/usr/bin/env node

/**
 * Script to generate translation files for all 37 languages
 * Based on the English template with placeholder translations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// All 37 supported languages
const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'zh', name: 'Chinese', nativeName: '简体中文' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'nb', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
];

// Read the English template
const englishTemplate = fs.readFileSync(path.join(__dirname, '../src/lang/en.ts'), 'utf8');

// Generate placeholder translations for each language
languages.forEach(lang => {
  if (lang.code === 'en') return; // Skip English, already exists
  
  const langDir = path.join(__dirname, '../src/lang');
  const langFile = path.join(langDir, `${lang.code}.ts`);
  
  // Skip if file already exists (manually created)
  if (fs.existsSync(langFile)) {
    console.log(`Skipping ${lang.code} - file already exists`);
    return;
  }
  
  // Generate placeholder content
  const placeholderContent = `/**
 * ${lang.name} translations for Reynard framework
 * ${lang.nativeName} translations
 * 
 * NOTE: This is a placeholder file. Please translate the content to ${lang.nativeName}.
 */

import type { Translations } from '../types';

export default {
  common: {
    // Basic actions
    close: 'Close (${lang.nativeName})',
    delete: 'Delete (${lang.nativeName})',
    cancel: 'Cancel (${lang.nativeName})',
    save: 'Save (${lang.nativeName})',
    edit: 'Edit (${lang.nativeName})',
    add: 'Add (${lang.nativeName})',
    remove: 'Remove (${lang.nativeName})',
    loading: 'Loading... (${lang.nativeName})',
    error: 'Error (${lang.nativeName})',
    success: 'Success (${lang.nativeName})',
    confirm: 'Confirm (${lang.nativeName})',
    download: 'Download (${lang.nativeName})',
    upload: 'Upload (${lang.nativeName})',
    ok: 'OK (${lang.nativeName})',
    open: 'Open (${lang.nativeName})',
    copy: 'Copy (${lang.nativeName})',
    warning: 'Warning (${lang.nativeName})',
    info: 'Information (${lang.nativeName})',
    update: 'Update (${lang.nativeName})',
    clear: 'Clear (${lang.nativeName})',
    
    // Navigation
    home: 'Home (${lang.nativeName})',
    back: 'Back (${lang.nativeName})',
    next: 'Next (${lang.nativeName})',
    previous: 'Previous (${lang.nativeName})',
    
    // Data
    path: 'Path (${lang.nativeName})',
    size: 'Size (${lang.nativeName})',
    date: 'Date (${lang.nativeName})',
    name: 'Name (${lang.nativeName})',
    type: 'Type (${lang.nativeName})',
    actions: 'Actions (${lang.nativeName})',
    search: 'Search (${lang.nativeName})',
    filter: 'Filter (${lang.nativeName})',
    apply: 'Apply (${lang.nativeName})',
    reset: 'Reset (${lang.nativeName})',
    selected: 'Selected (${lang.nativeName})',
    all: 'All (${lang.nativeName})',
    none: 'None (${lang.nativeName})',
    notFound: 'Not found (${lang.nativeName})',
    
    // UI elements
    toggleTheme: 'Toggle theme (${lang.nativeName})',
    theme: 'Theme (${lang.nativeName})',
    language: 'Language (${lang.nativeName})',
    description: 'Description (${lang.nativeName})',
    settings: 'Settings (${lang.nativeName})',
    help: 'Help (${lang.nativeName})',
    about: 'About (${lang.nativeName})',
  },

  themes: {
    light: 'Light (${lang.nativeName})',
    gray: 'Gray (${lang.nativeName})',
    dark: 'Dark (${lang.nativeName})',
    banana: 'Banana (${lang.nativeName})',
    strawberry: 'Strawberry (${lang.nativeName})',
    peanut: 'Peanut (${lang.nativeName})',
    'high-contrast-black': 'High Contrast Black (${lang.nativeName})',
    'high-contrast-inverse': 'High Contrast Inverse (${lang.nativeName})',
  },

  core: {
    notifications: {
      title: 'Notifications (${lang.nativeName})',
      dismiss: 'Dismiss (${lang.nativeName})',
      dismissAll: 'Dismiss All (${lang.nativeName})',
      markAsRead: 'Mark as Read (${lang.nativeName})',
      markAllAsRead: 'Mark All as Read (${lang.nativeName})',
      noNotifications: 'No notifications (${lang.nativeName})',
      error: 'Error (${lang.nativeName})',
      success: 'Success (${lang.nativeName})',
      warning: 'Warning (${lang.nativeName})',
      info: 'Information (${lang.nativeName})',
    },
    validation: {
      required: 'This field is required (${lang.nativeName})',
      invalid: 'Invalid value (${lang.nativeName})',
      tooShort: 'Value is too short (${lang.nativeName})',
      tooLong: 'Value is too long (${lang.nativeName})',
      invalidEmail: 'Invalid email address (${lang.nativeName})',
      invalidUrl: 'Invalid URL (${lang.nativeName})',
      invalidNumber: 'Invalid number (${lang.nativeName})',
      minValue: 'Value is too small (${lang.nativeName})',
      maxValue: 'Value is too large (${lang.nativeName})',
    },
    dateTime: {
      now: 'Now (${lang.nativeName})',
      today: 'Today (${lang.nativeName})',
      yesterday: 'Yesterday (${lang.nativeName})',
      tomorrow: 'Tomorrow (${lang.nativeName})',
      format: 'Format (${lang.nativeName})',
      timezone: 'Timezone (${lang.nativeName})',
    },
  },

  components: {
    modal: {
      close: 'Close (${lang.nativeName})',
      confirm: 'Confirm (${lang.nativeName})',
      cancel: 'Cancel (${lang.nativeName})',
    },
    tabs: {
      next: 'Next Tab (${lang.nativeName})',
      previous: 'Previous Tab (${lang.nativeName})',
    },
    dropdown: {
      select: 'Select (${lang.nativeName})',
      clear: 'Clear (${lang.nativeName})',
      search: 'Search (${lang.nativeName})',
      noResults: 'No results found (${lang.nativeName})',
    },
    tooltip: {
      show: 'Show tooltip (${lang.nativeName})',
      hide: 'Hide tooltip (${lang.nativeName})',
    },
  },

  gallery: {
    upload: {
      title: 'Upload Files (${lang.nativeName})',
      dragDrop: 'Drag and drop files here (${lang.nativeName})',
      selectFiles: 'Select Files (${lang.nativeName})',
      progress: 'Uploading... (${lang.nativeName})',
      complete: 'Upload complete (${lang.nativeName})',
      failed: 'Upload failed (${lang.nativeName})',
      cancel: 'Cancel upload (${lang.nativeName})',
    },
    file: {
      name: 'Name (${lang.nativeName})',
      size: 'Size (${lang.nativeName})',
      date: 'Date (${lang.nativeName})',
      type: 'Type (${lang.nativeName})',
      actions: 'Actions (${lang.nativeName})',
      delete: 'Delete (${lang.nativeName})',
      rename: 'Rename (${lang.nativeName})',
      move: 'Move (${lang.nativeName})',
      copy: 'Copy (${lang.nativeName})',
      download: 'Download (${lang.nativeName})',
    },
    folder: {
      create: 'Create Folder (${lang.nativeName})',
      delete: 'Delete Folder (${lang.nativeName})',
      rename: 'Rename Folder (${lang.nativeName})',
      move: 'Move Folder (${lang.nativeName})',
      empty: 'Empty folder (${lang.nativeName})',
    },
    view: {
      grid: 'Grid View (${lang.nativeName})',
      list: 'List View (${lang.nativeName})',
      thumbnail: 'Thumbnail View (${lang.nativeName})',
      details: 'Details View (${lang.nativeName})',
    },
    sort: {
      name: 'Sort by Name (${lang.nativeName})',
      date: 'Sort by Date (${lang.nativeName})',
      size: 'Sort by Size (${lang.nativeName})',
      type: 'Sort by Type (${lang.nativeName})',
      ascending: 'Ascending (${lang.nativeName})',
      descending: 'Descending (${lang.nativeName})',
    },
  },

  charts: {
    types: {
      line: 'Line Chart (${lang.nativeName})',
      bar: 'Bar Chart (${lang.nativeName})',
      pie: 'Pie Chart (${lang.nativeName})',
      area: 'Area Chart (${lang.nativeName})',
      scatter: 'Scatter Plot (${lang.nativeName})',
      histogram: 'Histogram (${lang.nativeName})',
    },
    axes: {
      x: 'X Axis (${lang.nativeName})',
      y: 'Y Axis (${lang.nativeName})',
      value: 'Value (${lang.nativeName})',
      category: 'Category (${lang.nativeName})',
      time: 'Time (${lang.nativeName})',
    },
    legend: {
      show: 'Show Legend (${lang.nativeName})',
      hide: 'Hide Legend (${lang.nativeName})',
      position: 'Legend Position (${lang.nativeName})',
    },
    tooltip: {
      show: 'Show Tooltip (${lang.nativeName})',
      hide: 'Hide Tooltip (${lang.nativeName})',
    },
    data: {
      noData: 'No data available (${lang.nativeName})',
      loading: 'Loading data... (${lang.nativeName})',
      error: 'Error loading data (${lang.nativeName})',
    },
  },

  auth: {
    login: {
      title: 'Login (${lang.nativeName})',
      username: 'Username (${lang.nativeName})',
      password: 'Password (${lang.nativeName})',
      remember: 'Remember me (${lang.nativeName})',
      forgot: 'Forgot password? (${lang.nativeName})',
      submit: 'Login (${lang.nativeName})',
      success: 'Login successful (${lang.nativeName})',
      failed: 'Login failed (${lang.nativeName})',
    },
    register: {
      title: 'Register (${lang.nativeName})',
      username: 'Username (${lang.nativeName})',
      email: 'Email (${lang.nativeName})',
      password: 'Password (${lang.nativeName})',
      confirmPassword: 'Confirm Password (${lang.nativeName})',
      submit: 'Register (${lang.nativeName})',
      success: 'Registration successful (${lang.nativeName})',
      failed: 'Registration failed (${lang.nativeName})',
    },
    logout: {
      title: 'Logout (${lang.nativeName})',
      confirm: 'Are you sure you want to logout? (${lang.nativeName})',
      success: 'Logout successful (${lang.nativeName})',
    },
    profile: {
      title: 'Profile (${lang.nativeName})',
      edit: 'Edit Profile (${lang.nativeName})',
      save: 'Save Changes (${lang.nativeName})',
      cancel: 'Cancel (${lang.nativeName})',
    },
  },

  chat: {
    message: {
      send: 'Send Message (${lang.nativeName})',
      type: 'Type a message... (${lang.nativeName})',
      placeholder: 'Type your message here (${lang.nativeName})',
      sent: 'Message sent (${lang.nativeName})',
      received: 'Message received (${lang.nativeName})',
      failed: 'Failed to send message (${lang.nativeName})',
    },
    room: {
      create: 'Create Room (${lang.nativeName})',
      join: 'Join Room (${lang.nativeName})',
      leave: 'Leave Room (${lang.nativeName})',
      delete: 'Delete Room (${lang.nativeName})',
      name: 'Room Name (${lang.nativeName})',
      description: 'Room Description (${lang.nativeName})',
    },
    user: {
      online: 'Online (${lang.nativeName})',
      offline: 'Offline (${lang.nativeName})',
      typing: 'Typing... (${lang.nativeName})',
      away: 'Away (${lang.nativeName})',
    },
    p2p: {
      connect: 'Connect (${lang.nativeName})',
      disconnect: 'Disconnect (${lang.nativeName})',
      connected: 'Connected (${lang.nativeName})',
      disconnected: 'Disconnected (${lang.nativeName})',
    },
  },

  monaco: {
    editor: {
      save: 'Save (${lang.nativeName})',
      format: 'Format Code (${lang.nativeName})',
      find: 'Find (${lang.nativeName})',
      replace: 'Replace (${lang.nativeName})',
      undo: 'Undo (${lang.nativeName})',
      redo: 'Redo (${lang.nativeName})',
      cut: 'Cut (${lang.nativeName})',
      copy: 'Copy (${lang.nativeName})',
      paste: 'Paste (${lang.nativeName})',
      selectAll: 'Select All (${lang.nativeName})',
    },
    language: {
      select: 'Select Language (${lang.nativeName})',
      detect: 'Detect Language (${lang.nativeName})',
    },
    theme: {
      select: 'Select Theme (${lang.nativeName})',
      light: 'Light Theme (${lang.nativeName})',
      dark: 'Dark Theme (${lang.nativeName})',
    },
    settings: {
      title: 'Editor Settings (${lang.nativeName})',
      fontSize: 'Font Size (${lang.nativeName})',
      tabSize: 'Tab Size (${lang.nativeName})',
      wordWrap: 'Word Wrap (${lang.nativeName})',
      minimap: 'Minimap (${lang.nativeName})',
      lineNumbers: 'Line Numbers (${lang.nativeName})',
    },
  },
} as const satisfies Translations;
`;
  
  // Ensure directory exists
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  // Write the file
  fs.writeFileSync(langFile, placeholderContent);
  console.log(`Generated placeholder for ${lang.code} (${lang.nativeName})`);
});

console.log('\\n🎉 Generated placeholder translation files for all languages!');
console.log('\\n📝 Next steps:');
console.log('1. Translate the placeholder content to the respective languages');
console.log('2. Test the translations in your application');
console.log('3. Update any language-specific pluralization rules if needed');
console.log('\\n🦦> Happy translating with Reynard i18n!');
