export const en = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    charts: 'Charts',
    components: 'Components',
    gallery: 'Gallery',
    auth: 'Authentication',
    settings: 'Settings'
  },
  
  // Dashboard
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to Reynard Dashboard',
    subtitle: 'A comprehensive showcase of all Reynard components and features',
    stats: {
      users: 'Users',
      revenue: 'Revenue',
      orders: 'Orders',
      growth: 'Growth'
    },
    quickActions: {
      title: 'Quick Actions',
      newUser: 'Add User',
      viewReports: 'View Reports',
      manageSettings: 'Settings',
      uploadFile: 'Upload File'
    },
    recentActivity: {
      title: 'Recent Activity',
      userJoined: 'New user joined',
      orderPlaced: 'Order placed',
      settingsUpdated: 'Settings updated',
      fileUploaded: 'File uploaded'
    }
  },
  
  // Charts
  charts: {
    title: 'Charts & Analytics',
    types: {
      line: 'Line Chart',
      bar: 'Bar Chart',
      pie: 'Pie Chart',
      timeseries: 'Time Series'
    },
    data: {
      sales: 'Sales Data',
      users: 'User Data',
      performance: 'Performance Data'
    },
    interactive: {
      title: 'Interactive Chart'
    },
    comparison: {
      title: 'Yearly Comparison'
    },
    small: {
      revenue: 'Weekly Revenue',
      users: 'User Distribution',
      performance: 'System Performance'
    }
  },
  
  // Components
  components: {
    title: 'Component Showcase',
    breadcrumb: {
      home: 'Home',
      components: 'Components',
      showcase: 'Showcase'
    },
    tabs: {
      primitives: 'Primitives',
      layout: 'Layout',
      data: 'Data',
      navigation: 'Navigation'
    },
    primitives: {
      buttons: {
        title: 'Buttons',
        primary: 'Primary',
        secondary: 'Secondary',
        tertiary: 'Tertiary',
        ghost: 'Ghost',
        danger: 'Danger',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        clicked: '{variant} button clicked!'
      },
      inputs: {
        title: 'Input Components',
        text: 'Text Input',
        textPlaceholder: 'Enter some text...',
        password: 'Password',
        passwordPlaceholder: 'Enter password...',
        email: 'Email',
        emailPlaceholder: 'Enter email...',
        select: 'Select Option',
        option1: 'Option 1',
        option2: 'Option 2',
        option3: 'Option 3'
      },
      cards: {
        title: 'Cards',
        simple: 'Simple Card',
        simpleDesc: 'A basic card component with minimal styling.',
        elevated: 'Elevated Card',
        elevatedDesc: 'A card with shadow and elevation effects.',
        outlined: 'Outlined Card',
        outlinedDesc: 'A card with border and no background.'
      }
    },
    layout: {
      grid: {
        title: 'Grid Layout',
        item1: 'Analytics',
        item2: 'Users',
        item3: 'Settings'
      },
      modals: {
        title: 'Modals & Overlays',
        open: 'Open Modal',
        openDrawer: 'Open Drawer'
      }
    },
    data: {
      table: {
        title: 'Data Table',
        name: 'Name',
        email: 'Email',
        role: 'Role',
        status: 'Status',
        rowClicked: 'Clicked on row: {name}'
      }
    },
    navigation: {
      menu: {
        title: 'Navigation Menu',
        clicked: 'Navigated to: {label}'
      },
      breadcrumb: {
        title: 'Breadcrumb Navigation',
        clicked: 'Breadcrumb clicked: {label}'
      }
    },
    nav: {
      dashboard: 'Dashboard',
      users: 'Users',
      settings: 'Settings',
      components: 'Components'
    },
    modal: {
      title: 'Example Modal',
      content: 'This is an example modal dialog. You can put any content here.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      confirmed: 'Modal action confirmed!'
    },
    drawer: {
      title: 'Example Drawer',
      content: 'This is a drawer component. It can contain forms, menus, or any other content.',
      show: 'Show',
      notification: 'Showing {type} notification from drawer'
    }
  },
  
  // Gallery
  gallery: {
    title: 'Gallery & File Management',
    upload: 'Upload Files',
    selectAll: 'Select All',
    clearSelection: 'Clear Selection',
    navigated: 'Navigated to: {path}',
    selected: 'Selected {count} items',
    uploading: 'Uploading {count} files...',
    uploaded: 'Successfully uploaded {count} files',
    uploadError: 'Upload failed: {error}',
    opened: 'Opened: {name}',
    info: {
      title: 'Gallery Info',
      totalItems: 'Total Items',
      selectedItems: 'Selected',
      currentPath: 'Path',
      viewMode: 'View Mode'
    },
    viewModes: {
      grid: 'Grid View',
      list: 'List View'
    },
    stats: {
      images: 'Images',
      folders: 'Folders',
      documents: 'Documents',
      totalSize: 'Total Size'
    }
  },
  
  // Authentication
  auth: {
    title: 'Authentication',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    loginSuccess: 'Successfully logged in!',
    loginError: 'Login failed. Please try again.',
    registerSuccess: 'Account created successfully!',
    registerError: 'Registration failed. Please try again.',
    logoutSuccess: 'Successfully logged out!',
    logoutError: 'Logout failed. Please try again.',
    profile: {
      title: 'User Profile',
      name: 'Name',
      email: 'Email',
      role: 'Role',
      joinDate: 'Joined'
    },
    session: {
      title: 'Session Info',
      status: 'Status',
      active: 'Active',
      lastLogin: 'Last Login',
      tokenExpiry: 'Token Expires',
      refreshToken: 'Refresh Token',
      refreshed: 'Token refreshed successfully!'
    },
    security: {
      title: 'Security Settings',
      emailVerified: 'Email Verified',
      strongPassword: 'Strong Password',
      twoFactorDisabled: '2FA Disabled',
      manageSettings: 'Manage Security',
      settingsOpened: 'Security settings opened'
    }
  },
  
  // Settings
  settings: {
    title: 'Settings',
    categories: {
      general: 'General',
      appearance: 'Appearance',
      notifications: 'Notifications',
      privacy: 'Privacy',
      advanced: 'Advanced'
    },
    general: {
      language: 'Language',
      timezone: 'Timezone',
      dateFormat: 'Date Format'
    },
    appearance: {
      theme: 'Theme',
      fontSize: 'Font Size',
      compactMode: 'Compact Mode'
    },
    notifications: {
      emailNotifications: 'Email Notifications',
      pushNotifications: 'Push Notifications',
      soundEnabled: 'Sound Effects'
    },
    privacy: {
      profileVisible: 'Public Profile',
      dataSharing: 'Data Sharing',
      analytics: 'Analytics'
    },
    advanced: {
      debugging: 'Debug Mode',
      experimentalFeatures: 'Experimental Features',
      apiTimeout: 'API Timeout'
    },
    actions: {
      save: 'Save Changes',
      reset: 'Reset to Defaults',
      export: 'Export Settings',
      import: 'Import Settings'
    },
    messages: {
      saved: 'Settings saved successfully!',
      reset: 'Settings reset to defaults',
      exported: 'Settings exported',
      imported: 'Settings imported'
    }
  },
  
  // Common
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    retry: 'Retry',
    cancel: 'Cancel',
    confirm: 'Confirm',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    close: 'Close',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    actions: 'Actions',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled'
  },
  
  // Themes
  themes: {
    light: 'Light',
    dark: 'Dark',
    gray: 'Gray',
    banana: 'Banana',
    strawberry: 'Strawberry',
    peanut: 'Peanut',
    'high-contrast-black': 'High Contrast Black',
    'high-contrast-inverse': 'High Contrast Inverse'
  },
  
  // Languages
  languages: {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    it: 'Italiano',
    pt: 'Português',
    ru: 'Русский',
    ja: '日本語',
    ko: '한국어',
    zh: '中文'
  }
};
