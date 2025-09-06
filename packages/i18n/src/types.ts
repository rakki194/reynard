/**
 * Type definitions for Reynard i18n system
 * Based on yipyap's comprehensive translation architecture
 */

// Supported language codes (37 languages)
export type LanguageCode = 
  | 'en' | 'ja' | 'fr' | 'ru' | 'zh' | 'sv' | 'pl' | 'uk' | 'fi' | 'de'
  | 'es' | 'it' | 'pt' | 'pt-BR' | 'ko' | 'nl' | 'tr' | 'vi' | 'th' | 'ar'
  | 'he' | 'hi' | 'id' | 'cs' | 'el' | 'hu' | 'ro' | 'bg' | 'da' | 'nb'
  | 'sk' | 'sl' | 'hr' | 'et' | 'lv' | 'lt' | 'mt';

export type Locale = LanguageCode;

// Language metadata
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Translation parameter types
export type TranslationParams = {
  count?: number;
  name?: string;
  [key: string]: string | number | undefined;
};

// Translation value can be a string or a function
export type TranslationValue = string | ((params: TranslationParams) => string);

// Translation function type
export type TranslationFunction = {
  (key: string): string;
  (key: string, params: TranslationParams): string;
};

// Plural forms for different languages
export type PluralForms = {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

// Common UI translations
export interface CommonTranslations {
  // Basic actions
  close: string;
  delete: string;
  cancel: string;
  save: string;
  edit: string;
  add: string;
  remove: string;
  loading: string;
  error: string;
  success: string;
  confirm: string;
  download: string;
  upload: string;
  ok: string;
  open: string;
  copy: string;
  warning: string;
  info: string;
  update: string;
  clear: string;
  
  // Navigation
  home: string;
  back: string;
  next: string;
  previous: string;
  
  // Data
  path: string;
  size: string;
  date: string;
  name: string;
  type: string;
  actions: string;
  search: string;
  filter: string;
  apply: string;
  reset: string;
  selected: string;
  all: string;
  none: string;
  notFound: string;
  
  // UI elements
  toggleTheme: string;
  theme: string;
  language: string;
  description: string;
  settings: string;
  help: string;
  about: string;
}

// Theme translations
export interface ThemeTranslations {
  light: string;
  gray: string;
  dark: string;
  banana: string;
  strawberry: string;
  peanut: string;
  'high-contrast-black': string;
  'high-contrast-inverse': string;
}

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

// Main translations interface
export interface Translations {
  common: CommonTranslations;
  themes: ThemeTranslations;
  core: CoreTranslations;
  components: ComponentTranslations;
  gallery: GalleryTranslations;
  charts: ChartTranslations;
  auth: AuthTranslations;
  chat: ChatTranslations;
  monaco: MonacoTranslations;
}

// I18n module interface
export interface I18nModule {
  locale: () => LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  languages: Language[];
  t: TranslationFunction;
  isRTL: boolean;
  loadTranslations: (locale: LanguageCode) => Promise<Translations>;
}

// Translation context interface
export interface TranslationContext {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: TranslationFunction;
  languages: Language[];
  isRTL: boolean;
}
