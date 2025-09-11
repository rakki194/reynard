/**
 * Translation interface definitions for the Reynard i18n system.
 *
 * This module contains all the specific translation interfaces for
 * different packages and components in the Reynard ecosystem.
 */

// Core package translations
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

// Component package translations
export interface ComponentTranslations {
  modal: {
    title: string;
    close: string;
    confirm: string;
    cancel: string;
  };
  tabs: {
    next: string;
    previous: string;
  };
  dropdown: {
    select: string;
    clear: string;
    search: string;
    noResults: string;
  };
  tooltip: {
    show: string;
    hide: string;
  };
}

// Gallery package translations
export interface GalleryTranslations {
  upload: {
    title: string;
    dragDrop: string;
    selectFiles: string;
    progress: string;
    complete: string;
    failed: string;
    cancel: string;
  };
  file: {
    name: string;
    size: string;
    date: string;
    type: string;
    actions: string;
    delete: string;
    rename: string;
    move: string;
    copy: string;
    download: string;
  };
  folder: {
    create: string;
    delete: string;
    rename: string;
    move: string;
    empty: string;
  };
  view: {
    grid: string;
    list: string;
    thumbnail: string;
    details: string;
  };
  sort: {
    name: string;
    date: string;
    size: string;
    type: string;
    ascending: string;
    descending: string;
  };
}

// Chart package translations
export interface ChartTranslations {
  types: {
    line: string;
    bar: string;
    pie: string;
    area: string;
    scatter: string;
    histogram: string;
  };
  axes: {
    x: string;
    y: string;
    value: string;
    category: string;
    time: string;
  };
  legend: {
    show: string;
    hide: string;
    position: string;
  };
  tooltip: {
    show: string;
    hide: string;
  };
  data: {
    noData: string;
    loading: string;
    error: string;
  };
}

// Auth package translations
export interface AuthTranslations {
  login: {
    title: string;
    username: string;
    password: string;
    remember: string;
    forgot: string;
    submit: string;
    success: string;
    failed: string;
  };
  register: {
    title: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    submit: string;
    success: string;
    failed: string;
  };
  logout: {
    title: string;
    confirm: string;
    success: string;
  };
  profile: {
    title: string;
    edit: string;
    save: string;
    cancel: string;
  };
}

// Chat package translations
export interface ChatTranslations {
  message: {
    send: string;
    type: string;
    placeholder: string;
    sent: string;
    received: string;
    failed: string;
  };
  room: {
    create: string;
    join: string;
    leave: string;
    delete: string;
    name: string;
    description: string;
  };
  user: {
    online: string;
    offline: string;
    typing: string;
    away: string;
  };
  p2p: {
    connect: string;
    disconnect: string;
    connected: string;
    disconnected: string;
  };
}

// Monaco package translations
export interface MonacoTranslations {
  editor: {
    save: string;
    format: string;
    find: string;
    replace: string;
    undo: string;
    redo: string;
    cut: string;
    copy: string;
    paste: string;
    selectAll: string;
  };
  language: {
    select: string;
    detect: string;
  };
  theme: {
    select: string;
    light: string;
    dark: string;
  };
  settings: {
    title: string;
    fontSize: string;
    tabSize: string;
    wordWrap: string;
    minimap: string;
    lineNumbers: string;
  };
}
