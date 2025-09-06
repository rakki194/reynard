/**
 * @fileoverview Reynard Documentation Configuration
 * 
 * This configuration file defines how to generate beautiful documentation
 * for all Reynard packages using the built-in documentation system.
 * @env node
 */

export default {
  rootPath: process.cwd(),
  outputPath: 'docs-generated',
  
  // Package discovery configuration
  packages: [
    {
      name: 'core',
      path: './packages/core',
      category: 'Core',
      priority: 1
    },
    {
      name: 'components',
      path: './packages/components',
      category: 'UI Components',
      priority: 2
    },
    {
      name: 'themes',
      path: './packages/themes',
      category: 'Styling',
      priority: 3
    },
    {
      name: 'auth',
      path: './packages/auth',
      category: 'Authentication',
      priority: 4
    },
    {
      name: 'charts',
      path: './packages/charts',
      category: 'Data Visualization',
      priority: 5
    },
    {
      name: 'testing',
      path: './packages/testing',
      category: 'Testing',
      priority: 6
    },
    {
      name: 'i18n',
      path: './packages/i18n',
      category: 'Internationalization',
      priority: 7
    },
    {
      name: '3d',
      path: './packages/3d',
      category: '3D Graphics',
      priority: 8
    },
    {
      name: 'algorithms',
      path: './packages/algorithms',
      category: 'Algorithms',
      priority: 9
    },
    {
      name: 'annotating',
      path: './packages/annotating',
      category: 'Annotation',
      priority: 10
    },
    {
      name: 'boundingbox',
      path: './packages/boundingbox',
      category: 'Computer Vision',
      priority: 11
    },
    {
      name: 'caption',
      path: './packages/caption',
      category: 'Computer Vision',
      priority: 12
    },
    {
      name: 'chat',
      path: './packages/chat',
      category: 'Communication',
      priority: 13
    },
    {
      name: 'color-media',
      path: './packages/color-media',
      category: 'Media Processing',
      priority: 14
    },
    {
      name: 'composables',
      path: './packages/composables',
      category: 'Core',
      priority: 15
    },
    {
      name: 'connection',
      path: './packages/connection',
      category: 'Networking',
      priority: 16
    },
    {
      name: 'error-boundaries',
      path: './packages/error-boundaries',
      category: 'Error Handling',
      priority: 17
    },
    {
      name: 'features',
      path: './packages/features',
      category: 'Feature Management',
      priority: 18
    },
    {
      name: 'file-processing',
      path: './packages/file-processing',
      category: 'File Processing',
      priority: 19
    },
    {
      name: 'fluent-icons',
      path: './packages/fluent-icons',
      category: 'UI Components',
      priority: 20
    },
    {
      name: 'gallery',
      path: './packages/gallery',
      category: 'Media Display',
      priority: 21
    },
    {
      name: 'games',
      path: './packages/games',
      category: 'Gaming',
      priority: 22
    },
    {
      name: 'model-management',
      path: './packages/model-management',
      category: 'AI/ML',
      priority: 23
    },
    {
      name: 'monaco',
      path: './packages/monaco',
      category: 'Code Editing',
      priority: 24
    },
    {
      name: 'rag',
      path: './packages/rag',
      category: 'AI/ML',
      priority: 25
    },
    {
      name: 'service-manager',
      path: './packages/service-manager',
      category: 'Service Management',
      priority: 26
    },
    {
      name: 'settings',
      path: './packages/settings',
      category: 'Configuration',
      priority: 27
    },
    {
      name: 'tools',
      path: './packages/tools',
      category: 'Development Tools',
      priority: 28
    },
    {
      name: 'ui',
      path: './packages/ui',
      category: 'UI Components',
      priority: 29
    }
  ],

  // Site configuration
  site: {
    title: 'Reynard Framework',
    description: 'A modern, modular framework for building fast, accessible, and maintainable web applications. Built with SolidJS and TypeScript.',
    baseUrl: '/',
    logo: '/logo.svg',
    favicon: '/favicon.ico'
  },

  // Theme configuration
  theme: {
    name: 'reynard-default',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#f59e0b',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },

  // Navigation configuration
  navigation: {
    main: [
      { 
        label: 'Getting Started', 
        href: '/getting-started',
        icon: '🚀'
      },
      { 
        label: 'Core', 
        href: '/packages/core',
        icon: '⚡'
      },
      { 
        label: 'Components', 
        href: '/packages/components',
        icon: '🎨'
      },
      { 
        label: 'Themes', 
        href: '/packages/themes',
        icon: '🌙'
      },
      { 
        label: 'API Reference', 
        href: '/api',
        icon: '📚'
      },
      { 
        label: 'Examples', 
        href: '/examples',
        icon: '💡'
      }
    ],
    footer: [
      { label: 'GitHub', href: 'https://github.com/rakki194/reynard', external: true },
      { label: 'Discord', href: 'https://discord.gg/reynard', external: true },
      { label: 'Twitter', href: 'https://twitter.com/reynard_framework', external: true }
    ],
    breadcrumbs: true,
    sidebar: true
  },

  // Footer configuration
  footer: {
    links: [
      { label: 'Documentation', href: '/' },
      { label: 'API Reference', href: '/api' },
      { label: 'Examples', href: '/examples' },
      { label: 'GitHub', href: 'https://github.com/rakki194/reynard', external: true }
    ],
    copyright: '© 2024 Reynard Framework. Built with ❤️ using SolidJS.',
    social: {
      github: 'https://github.com/rakki194/reynard',
      discord: 'https://discord.gg/reynard',
      twitter: 'https://twitter.com/reynard_framework'
    }
  },

  // Search configuration
  search: {
    enabled: true,
    provider: 'local',
    placeholder: 'Search documentation...',
    suggestions: [
      'Getting Started',
      'Components',
      'Themes',
      'API Reference',
      'Examples',
      'Authentication',
      'Charts',
      'Testing'
    ]
  },

  // Analytics configuration (optional)
  analytics: {
    provider: 'google',
    trackingId: 'GA_TRACKING_ID' // Replace with your Google Analytics ID
  },

  // Social media links
  social: {
    github: 'https://github.com/rakki194/reynard',
    discord: 'https://discord.gg/reynard',
    twitter: 'https://twitter.com/reynard_framework',
    linkedin: 'https://linkedin.com/company/reynard-framework'
  },

  // Template configuration
  templates: [
    {
      name: 'package-overview',
      path: './templates/package-overview.hbs',
      type: 'package-overview'
    },
    {
      name: 'api-documentation',
      path: './templates/api-documentation.hbs',
      type: 'api'
    },
    {
      name: 'code-example',
      path: './templates/code-example.hbs',
      type: 'example'
    }
  ],

  // Example configuration
  examples: [
    {
      name: 'basic-usage',
      path: './examples/basic-usage',
      type: 'component',
      framework: 'solid'
    },
    {
      name: 'theme-customization',
      path: './examples/theme-customization',
      type: 'utility',
      framework: 'solid'
    },
    {
      name: 'authentication',
      path: './examples/authentication',
      type: 'integration',
      framework: 'solid'
    }
  ],

  // Watch configuration
  watch: false,
  verbose: true
};
