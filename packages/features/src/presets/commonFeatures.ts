import type { FeatureDefinition } from '../core/types';

/**
 * Common feature definitions for typical applications
 * Updated to align with actual Reynard service implementations
 */
export const COMMON_FEATURES: FeatureDefinition[] = [
  // Core features
  {
    id: 'file-management',
    name: 'File Management',
    description: 'Manage and organize files in the system',
    dependencies: [{ services: ['FileProcessingService'], required: true }],
    category: 'core',
    priority: 'critical',
    tags: ['storage', 'filesystem'],
    icon: 'folder'
  },
  {
    id: 'user-authentication',
    name: 'User Authentication',
    description: 'User login, logout, and session management',
    dependencies: [{ services: ['AuthService'], required: true }],
    category: 'core',
    priority: 'critical',
    tags: ['security', 'auth'],
    icon: 'user'
  },
  {
    id: 'data-persistence',
    name: 'Data Persistence',
    description: 'Save and retrieve application data',
    dependencies: [{ services: ['DatabaseService'], required: true }],
    category: 'core',
    priority: 'critical',
    tags: ['database', 'storage'],
    icon: 'database'
  },
  {
    id: 'service-management',
    name: 'Service Management',
    description: 'Manage application services and dependencies',
    dependencies: [{ services: ['ServiceManager'], required: true }],
    category: 'core',
    priority: 'critical',
    tags: ['services', 'management'],
    icon: 'settings'
  },

  // ML/AI features
  {
    id: 'image-processing',
    name: 'Image Processing',
    description: 'Process and manipulate images with various formats',
    dependencies: [{ services: ['FileProcessingService'], required: true }],
    category: 'ml',
    priority: 'high',
    tags: ['computer-vision', 'image'],
    icon: 'image'
  },
  {
    id: 'caption-generation',
    name: 'Caption Generation',
    description: 'Generate captions for images using AI models',
    dependencies: [
      { services: ['AnnotationService'], required: true },
      { services: ['FileProcessingService'], required: true }
    ],
    category: 'ml',
    priority: 'high',
    tags: ['ai', 'nlp', 'image'],
    icon: 'message-square'
  },
  {
    id: 'object-detection',
    name: 'Object Detection',
    description: 'Detect objects in images using AI models',
    dependencies: [
      { services: ['AnnotationService'], required: true },
      { services: ['FileProcessingService'], required: true }
    ],
    category: 'ml',
    priority: 'high',
    tags: ['computer-vision', 'detection'],
    icon: 'target'
  },
  {
    id: 'text-analysis',
    name: 'Text Analysis',
    description: 'Analyze and process text content',
    dependencies: [{ services: ['RAGService'], required: false }],
    category: 'ml',
    priority: 'medium',
    tags: ['nlp', 'text'],
    icon: 'file-text'
  },
  {
    id: 'model-training',
    name: 'Model Training',
    description: 'Train and fine-tune AI models',
    dependencies: [{ services: ['AIService'], required: false }],
    category: 'ml',
    priority: 'medium',
    tags: ['training', 'ml'],
    icon: 'cpu'
  },

  // Integration features
  {
    id: 'git-integration',
    name: 'Git Integration',
    description: 'Version control and repository management',
    dependencies: [{ services: ['GitService'], required: false }],
    category: 'integration',
    priority: 'medium',
    tags: ['version-control', 'git'],
    icon: 'git-branch'
  },
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Connect to external APIs and services',
    dependencies: [{ services: ['ConnectionService'], required: false }],
    category: 'integration',
    priority: 'medium',
    tags: ['api', 'external'],
    icon: 'globe'
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Store and retrieve files from cloud providers',
    dependencies: [{ services: ['FileProcessingService'], required: false }],
    category: 'integration',
    priority: 'medium',
    tags: ['cloud', 'storage'],
    icon: 'cloud'
  },
  {
    id: 'notification-service',
    name: 'Notification Service',
    description: 'Send notifications via email, SMS, or push',
    dependencies: [{ services: ['CoreService'], required: false }],
    category: 'integration',
    priority: 'low',
    tags: ['notifications', 'communication'],
    icon: 'bell'
  },

  // Utility features
  {
    id: 'caching',
    name: 'Caching System',
    description: 'Cache data for improved performance',
    dependencies: [{ services: ['CoreService'], required: false }],
    category: 'utility',
    priority: 'medium',
    tags: ['performance', 'cache'],
    icon: 'zap'
  },
  {
    id: 'logging',
    name: 'Logging System',
    description: 'Log application events and errors',
    dependencies: [{ services: ['CoreService'], required: false }],
    category: 'utility',
    priority: 'low',
    tags: ['logging', 'debugging'],
    icon: 'file-text'
  },
  {
    id: 'monitoring',
    name: 'System Monitoring',
    description: 'Monitor system health and performance',
    dependencies: [{ services: ['ServiceManager'], required: false }],
    category: 'utility',
    priority: 'low',
    tags: ['monitoring', 'health'],
    icon: 'activity'
  },
  {
    id: 'backup',
    name: 'Backup System',
    description: 'Backup and restore application data',
    dependencies: [{ services: ['FileProcessingService'], required: false }],
    category: 'utility',
    priority: 'medium',
    tags: ['backup', 'recovery'],
    icon: 'save'
  },
  {
    id: 'tools',
    name: 'Development Tools',
    description: 'Development and runtime tools for debugging and profiling',
    dependencies: [{ services: ['ToolsService'], required: false }],
    category: 'utility',
    priority: 'low',
    tags: ['tools', 'development'],
    icon: 'wrench'
  },

  // UI features
  {
    id: 'theme-system',
    name: 'Theme System',
    description: 'Customizable themes and styling',
    dependencies: [{ services: ['ThemesService'], required: false }],
    category: 'ui',
    priority: 'low',
    tags: ['ui', 'styling'],
    icon: 'palette'
  },
  {
    id: 'responsive-design',
    name: 'Responsive Design',
    description: 'Adaptive UI for different screen sizes',
    dependencies: [{ services: ['UIService'], required: false }],
    category: 'ui',
    priority: 'medium',
    tags: ['ui', 'responsive'],
    icon: 'smartphone'
  },
  {
    id: 'accessibility',
    name: 'Accessibility Features',
    description: 'Accessibility support for users with disabilities',
    dependencies: [{ services: ['UIService'], required: false }],
    category: 'ui',
    priority: 'medium',
    tags: ['accessibility', 'a11y'],
    icon: 'eye'
  },
  {
    id: 'components',
    name: 'UI Components',
    description: 'Reusable UI components and layouts',
    dependencies: [{ services: ['ComponentsService'], required: false }],
    category: 'ui',
    priority: 'medium',
    tags: ['ui', 'components'],
    icon: 'puzzle-piece'
  },

  // Data features
  {
    id: 'data-export',
    name: 'Data Export',
    description: 'Export data in various formats',
    dependencies: [{ services: ['FileProcessingService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['export', 'data'],
    icon: 'download'
  },
  {
    id: 'data-import',
    name: 'Data Import',
    description: 'Import data from various sources',
    dependencies: [{ services: ['FileProcessingService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['import', 'data'],
    icon: 'upload'
  },
  {
    id: 'data-validation',
    name: 'Data Validation',
    description: 'Validate data integrity and format',
    dependencies: [{ services: ['CoreService'], required: false }],
    category: 'data',
    priority: 'high',
    tags: ['validation', 'data'],
    icon: 'check-circle'
  },
  {
    id: 'search',
    name: 'Search System',
    description: 'Search and filter application data',
    dependencies: [{ services: ['RAGService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['search', 'filter'],
    icon: 'search'
  },
  {
    id: 'gallery',
    name: 'Gallery System',
    description: 'Image gallery and media management',
    dependencies: [
      { services: ['GalleryService'], required: false },
      { services: ['FileProcessingService'], required: false }
    ],
    category: 'data',
    priority: 'medium',
    tags: ['gallery', 'media'],
    icon: 'images'
  }
];

/**
 * Feature categories with descriptions
 */
export const FEATURE_CATEGORIES = {
  core: {
    name: 'Core Features',
    description: 'Essential features required for basic application functionality',
    priority: 'critical'
  },
  ml: {
    name: 'Machine Learning',
    description: 'AI and machine learning capabilities',
    priority: 'high'
  },
  integration: {
    name: 'Integrations',
    description: 'Third-party service integrations',
    priority: 'medium'
  },
  utility: {
    name: 'Utilities',
    description: 'Supporting utilities and tools',
    priority: 'low'
  },
  ui: {
    name: 'User Interface',
    description: 'User interface and experience features',
    priority: 'medium'
  },
  data: {
    name: 'Data Management',
    description: 'Data processing and management features',
    priority: 'high'
  }
} as const;

/**
 * Feature priorities with descriptions
 */
export const FEATURE_PRIORITIES = {
  critical: {
    name: 'Critical',
    description: 'Essential for application functionality',
    color: 'red'
  },
  high: {
    name: 'High',
    description: 'Important for core user experience',
    color: 'orange'
  },
  medium: {
    name: 'Medium',
    description: 'Enhances user experience',
    color: 'yellow'
  },
  low: {
    name: 'Low',
    description: 'Nice to have features',
    color: 'green'
  }
} as const;
