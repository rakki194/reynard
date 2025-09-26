/**
 * UI translation interface definitions
 */

export interface UiTranslations {
  // Layout components
  layout: {
    header: {
      title: string;
      content: string;
    };
    sidebar: {
      title: string;
      content: string;
    };
    main: {
      title: string;
      content: string;
    };
    footer: {
      title: string;
      content: string;
    };
  };

  // Drawer component
  drawer: {
    title: string;
    content: string;
    footer: string;
    closeButton: string;
    openButton: string;
    toggleButton: string;
  };

  // Data table components
  dataTable: {
    loading: string;
    noData: string;
    error: string;
    emptyState: string;
    rowsPerPage: string;
    page: string;
    of: string;
    previous: string;
    next: string;
    first: string;
    last: string;
    selectAll: string;
    clearSelection: string;
    selectedRows: string;
    totalRows: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    refresh: string;
  };

  // Form components
  form: {
    submit: string;
    cancel: string;
    reset: string;
    save: string;
    edit: string;
    delete: string;
    add: string;
    remove: string;
    required: string;
    optional: string;
    invalid: string;
    valid: string;
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
  };

  // Button variants
  button: {
    primary: string;
    secondary: string;
    tertiary: string;
    danger: string;
    success: string;
    warning: string;
    info: string;
    ghost: string;
    outline: string;
    link: string;
  };

  // Status indicators
  status: {
    online: string;
    offline: string;
    pending: string;
    processing: string;
    completed: string;
    failed: string;
    cancelled: string;
    active: string;
    inactive: string;
    enabled: string;
    disabled: string;
  };

  // Common UI elements
  elements: {
    close: string;
    open: string;
    expand: string;
    collapse: string;
    show: string;
    hide: string;
    toggle: string;
    select: string;
    deselect: string;
    check: string;
    uncheck: string;
    enable: string;
    disable: string;
    activate: string;
    deactivate: string;
  };

  // Loading states
  loading: {
    default: string;
    pleaseWait: string;
    processing: string;
    saving: string;
    uploading: string;
    downloading: string;
    connecting: string;
    disconnecting: string;
    synchronizing: string;
    initializing: string;
  };

  // Error messages
  errors: {
    generic: string;
    networkError: string;
    serverError: string;
    validationError: string;
    permissionError: string;
    notFound: string;
    unauthorized: string;
    forbidden: string;
    timeout: string;
    unknown: string;
  };

  // Success messages
  success: {
    saved: string;
    updated: string;
    deleted: string;
    created: string;
    uploaded: string;
    downloaded: string;
    connected: string;
    disconnected: string;
    synchronized: string;
    initialized: string;
  };

  // Confirmation dialogs
  confirm: {
    delete: string;
    remove: string;
    cancel: string;
    reset: string;
    logout: string;
    close: string;
    save: string;
    discard: string;
  };

  // Tooltips
  tooltips: {
    show: string;
    hide: string;
    toggle: string;
    help: string;
    info: string;
    warning: string;
    error: string;
  };

  // Accessibility
  accessibility: {
    closeDialog: string;
    openDialog: string;
    closeMenu: string;
    openMenu: string;
    closeDrawer: string;
    openDrawer: string;
    closeModal: string;
    openModal: string;
    closePanel: string;
    openPanel: string;
    expandSection: string;
    collapseSection: string;
    showMore: string;
    showLess: string;
    nextPage: string;
    previousPage: string;
    firstPage: string;
    lastPage: string;
    selectItem: string;
    deselectItem: string;
    selectAll: string;
    clearSelection: string;
  };
}
