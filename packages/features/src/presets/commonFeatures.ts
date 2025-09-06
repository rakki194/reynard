import type { FeatureDefinition } from '../core/types';

/**
 * Common feature definitions for typical applications
 */
export const COMMON_FEATURES: FeatureDefinition[] = [
  // Core features
  {
    id: 'file-management',
    name: 'File Management',
    description: 'Manage and organize files in the system',
    dependencies: [{ services: ['DataSourceService'], required: true }],
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

  // ML/AI features
  {
    id: 'image-processing',
    name: 'Image Processing',
    description: 'Process and manipulate images with various formats',
    dependencies: [{ services: ['ImageProcessingService'], required: true }],
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
      { services: ['CaptionGeneratorService'], required: true },
      { services: ['ImageProcessingService'], required: true }
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
      { services: ['DetectionModelsService'], required: true },
      { services: ['ImageProcessingService'], required: true }
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
    dependencies: [{ services: ['NLPService'], required: true }],
    category: 'ml',
    priority: 'medium',
    tags: ['nlp', 'text'],
    icon: 'file-text'
  },
  {
    id: 'model-training',
    name: 'Model Training',
    description: 'Train and fine-tune AI models',
    dependencies: [{ services: ['TrainingService'], required: false }],
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
    dependencies: [{ services: ['APIGateway'], required: false }],
    category: 'integration',
    priority: 'medium',
    tags: ['api', 'external'],
    icon: 'globe'
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    description: 'Store and retrieve files from cloud providers',
    dependencies: [{ services: ['CloudStorageService'], required: false }],
    category: 'integration',
    priority: 'medium',
    tags: ['cloud', 'storage'],
    icon: 'cloud'
  },
  {
    id: 'notification-service',
    name: 'Notification Service',
    description: 'Send notifications via email, SMS, or push',
    dependencies: [{ services: ['NotificationService'], required: false }],
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
    dependencies: [{ services: ['CacheService'], required: false }],
    category: 'utility',
    priority: 'medium',
    tags: ['performance', 'cache'],
    icon: 'zap'
  },
  {
    id: 'logging',
    name: 'Logging System',
    description: 'Log application events and errors',
    dependencies: [{ services: ['LoggingService'], required: false }],
    category: 'utility',
    priority: 'low',
    tags: ['logging', 'debugging'],
    icon: 'file-text'
  },
  {
    id: 'monitoring',
    name: 'System Monitoring',
    description: 'Monitor system health and performance',
    dependencies: [{ services: ['MonitoringService'], required: false }],
    category: 'utility',
    priority: 'low',
    tags: ['monitoring', 'health'],
    icon: 'activity'
  },
  {
    id: 'backup',
    name: 'Backup System',
    description: 'Backup and restore application data',
    dependencies: [{ services: ['BackupService'], required: false }],
    category: 'utility',
    priority: 'medium',
    tags: ['backup', 'recovery'],
    icon: 'save'
  },

  // UI features
  {
    id: 'theme-system',
    name: 'Theme System',
    description: 'Customizable themes and styling',
    dependencies: [],
    category: 'ui',
    priority: 'low',
    tags: ['ui', 'styling'],
    icon: 'palette'
  },
  {
    id: 'responsive-design',
    name: 'Responsive Design',
    description: 'Adaptive UI for different screen sizes',
    dependencies: [],
    category: 'ui',
    priority: 'medium',
    tags: ['ui', 'responsive'],
    icon: 'smartphone'
  },
  {
    id: 'accessibility',
    name: 'Accessibility Features',
    description: 'Accessibility support for users with disabilities',
    dependencies: [],
    category: 'ui',
    priority: 'medium',
    tags: ['accessibility', 'a11y'],
    icon: 'eye'
  },

  // Data features
  {
    id: 'data-export',
    name: 'Data Export',
    description: 'Export data in various formats',
    dependencies: [{ services: ['ExportService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['export', 'data'],
    icon: 'download'
  },
  {
    id: 'data-import',
    name: 'Data Import',
    description: 'Import data from various sources',
    dependencies: [{ services: ['ImportService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['import', 'data'],
    icon: 'upload'
  },
  {
    id: 'data-validation',
    name: 'Data Validation',
    description: 'Validate data integrity and format',
    dependencies: [{ services: ['ValidationService'], required: false }],
    category: 'data',
    priority: 'high',
    tags: ['validation', 'data'],
    icon: 'check-circle'
  },
  {
    id: 'search',
    name: 'Search System',
    description: 'Search and filter application data',
    dependencies: [{ services: ['SearchService'], required: false }],
    category: 'data',
    priority: 'medium',
    tags: ['search', 'filter'],
    icon: 'search'
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
