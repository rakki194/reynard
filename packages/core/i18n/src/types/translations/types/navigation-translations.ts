/**
 * Navigation translation interface definitions
 */

export interface NavigationTranslations {
  // Main navigation
  home: string;
  about: string;
  contact: string;
  services: string;

  // Services submenu
  servicesMenu: {
    webDevelopment: string;
    mobileApps: string;
    aiIntegration: string;
    dataAnalytics: string;
    cloudServices: string;
  };

  // User account navigation
  account: {
    profile: string;
    settings: string;
    notifications: string;
    messages: string;
    logout: string;
    login: string;
    register: string;
  };

  // Breadcrumb navigation
  breadcrumb: {
    home: string;
    category: string;
    subcategory: string;
    currentPage: string;
    ellipsis: string;
    separator: string;
  };

  // Navigation states
  states: {
    current: string;
    active: string;
    disabled: string;
    loading: string;
    error: string;
  };

  // Navigation actions
  actions: {
    goBack: string;
    goForward: string;
    goHome: string;
    openMenu: string;
    closeMenu: string;
    toggleMenu: string;
    expandMenu: string;
    collapseMenu: string;
  };

  // Navigation labels
  labels: {
    mainNavigation: string;
    userMenu: string;
    breadcrumb: string;
    pagination: string;
    sidebar: string;
    header: string;
    footer: string;
  };

  // Navigation accessibility
  accessibility: {
    skipToContent: string;
    skipToNavigation: string;
    navigationLandmark: string;
    mainContentLandmark: string;
    complementaryLandmark: string;
    bannerLandmark: string;
    contentinfoLandmark: string;
  };

  // Mobile navigation
  mobile: {
    menuButton: string;
    closeButton: string;
    backButton: string;
    drawerTitle: string;
    drawerContent: string;
  };

  // Navigation messages
  messages: {
    pageNotFound: string;
    accessDenied: string;
    sessionExpired: string;
    redirecting: string;
    loadingPage: string;
  };
}
