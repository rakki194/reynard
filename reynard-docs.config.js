/**
 * @fileoverview Reynard Documentation Configuration
 *
 * This configuration file defines how to generate beautiful documentation
 * for all Reynard packages using the built-in documentation system.
 * @env node
 */

export default {
  rootPath: "/home/kade/runeset/reynard",
  outputPath: "docs-generated",

  // Package discovery configuration
  packages: [
    {
      name: "core",
      path: "/home/kade/runeset/reynard/packages/core",
      category: "Core",
      priority: 1,
    },
    {
      name: "components",
      path: "/home/kade/runeset/reynard/packages/components",
      category: "UI Components",
      priority: 2,
    },
    {
      name: "themes",
      path: "/home/kade/runeset/reynard/packages/themes",
      category: "Styling",
      priority: 3,
    },
    {
      name: "auth",
      path: "/home/kade/runeset/reynard/packages/auth",
      category: "Authentication",
      priority: 4,
    },
    {
      name: "charts",
      path: "/home/kade/runeset/reynard/packages/charts",
      category: "Data Visualization",
      priority: 5,
    },
    {
      name: "testing",
      path: "/home/kade/runeset/reynard/packages/testing",
      category: "Testing",
      priority: 6,
    },
    {
      name: "i18n",
      path: "/home/kade/runeset/reynard/packages/i18n",
      category: "Internationalization",
      priority: 7,
    },
    {
      name: "3d",
      path: "/home/kade/runeset/reynard/packages/3d",
      category: "3D Graphics",
      priority: 8,
    },
    {
      name: "algorithms",
      path: "/home/kade/runeset/reynard/packages/algorithms",
      category: "Algorithms",
      priority: 9,
    },
    {
      name: "annotating",
      path: "/home/kade/runeset/reynard/packages/annotating",
      category: "Annotation",
      priority: 10,
    },
    {
      name: "boundingbox",
      path: "/home/kade/runeset/reynard/packages/boundingbox",
      category: "Computer Vision",
      priority: 11,
    },
    {
      name: "caption",
      path: "/home/kade/runeset/reynard/packages/caption",
      category: "Computer Vision",
      priority: 12,
    },
    {
      name: "chat",
      path: "/home/kade/runeset/reynard/packages/chat",
      category: "Communication",
      priority: 13,
    },
    {
      name: "colors",
      path: "/home/kade/runeset/reynard/packages/colors",
      category: "Media Processing",
      priority: 14,
    },
    {
      name: "composables",
      path: "/home/kade/runeset/reynard/packages/composables",
      category: "Core",
      priority: 15,
    },
    {
      name: "connection",
      path: "/home/kade/runeset/reynard/packages/connection",
      category: "Networking",
      priority: 16,
    },
    {
      name: "error-boundaries",
      path: "/home/kade/runeset/reynard/packages/error-boundaries",
      category: "Error Handling",
      priority: 17,
    },
    {
      name: "features",
      path: "/home/kade/runeset/reynard/packages/features",
      category: "Feature Management",
      priority: 18,
    },
    {
      name: "file-processing",
      path: "/home/kade/runeset/reynard/packages/file-processing",
      category: "File Processing",
      priority: 19,
    },
    {
      name: "fluent-icons",
      path: "/home/kade/runeset/reynard/packages/fluent-icons",
      category: "UI Components",
      priority: 20,
    },
    {
      name: "gallery",
      path: "/home/kade/runeset/reynard/packages/gallery",
      category: "Media Display",
      priority: 21,
    },
    {
      name: "games",
      path: "/home/kade/runeset/reynard/packages/games",
      category: "Gaming",
      priority: 22,
    },
    {
      name: "model-management",
      path: "/home/kade/runeset/reynard/packages/model-management",
      category: "AI/ML",
      priority: 23,
    },
    {
      name: "monaco",
      path: "/home/kade/runeset/reynard/packages/monaco",
      category: "Code Editing",
      priority: 24,
    },
    {
      name: "rag",
      path: "/home/kade/runeset/reynard/packages/rag",
      category: "AI/ML",
      priority: 25,
    },
    {
      name: "service-manager",
      path: "/home/kade/runeset/reynard/packages/service-manager",
      category: "Service Management",
      priority: 26,
    },
    {
      name: "settings",
      path: "/home/kade/runeset/reynard/packages/settings",
      category: "Configuration",
      priority: 27,
    },
    {
      name: "tools",
      path: "/home/kade/runeset/reynard/packages/tools",
      category: "Development Tools",
      priority: 28,
    },
    {
      name: "ui",
      path: "/home/kade/runeset/reynard/packages/ui",
      category: "UI Components",
      priority: 29,
    },
    {
      name: "backend",
      path: "/home/kade/runeset/reynard/backend",
      category: "Backend Services",
      priority: 30,
    },
  ],

  // Exclude patterns for package discovery
  excludePatterns: [
    "**/third_party/**",
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.git/**",
    "**/coverage/**",
  ],

  // Site configuration
  site: {
    title: "Reynard Framework",
    description:
      "A modern, modular framework for building fast, accessible, and maintainable web applications. Built with SolidJS and TypeScript.",
    baseUrl: "/",
    logo: "/logo.svg",
    favicon: "/favicon.ico",
  },

  // Theme configuration
  theme: {
    name: "reynard-default",
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    accentColor: "#f59e0b",
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Navigation configuration
  navigation: {
    main: [
      {
        label: "Getting Started",
        href: "/getting-started",
        icon: "🚀",
      },
      {
        label: "Core",
        href: "/packages/core",
        icon: "⚡",
      },
      {
        label: "Components",
        href: "/packages/components",
        icon: "🎨",
      },
      {
        label: "Themes",
        href: "/packages/themes",
        icon: "🌙",
      },
      {
        label: "API Reference",
        href: "/api",
        icon: "📚",
      },
      {
        label: "Examples",
        href: "/examples",
        icon: "💡",
      },
    ],
    footer: [
      {
        label: "GitHub",
        href: "https://github.com/rakki194/reynard",
        external: true,
      },
      { label: "Discord", href: "https://discord.gg/reynard", external: true },
      {
        label: "Twitter",
        href: "https://twitter.com/reynard_framework",
        external: true,
      },
    ],
    breadcrumbs: true,
    sidebar: true,
  },

  // Footer configuration
  footer: {
    links: [
      { label: "Documentation", href: "/" },
      { label: "API Reference", href: "/api" },
      { label: "Examples", href: "/examples" },
      {
        label: "GitHub",
        href: "https://github.com/rakki194/reynard",
        external: true,
      },
    ],
    copyright: "© 2024 Reynard Framework. Built with ❤️ using SolidJS.",
    social: {
      github: "https://github.com/rakki194/reynard",
      discord: "https://discord.gg/reynard",
      twitter: "https://twitter.com/reynard_framework",
    },
  },

  // Search configuration
  search: {
    enabled: true,
    provider: "local",
    placeholder: "Search documentation...",
    suggestions: [
      "Getting Started",
      "Components",
      "Themes",
      "API Reference",
      "Examples",
      "Authentication",
      "Charts",
      "Testing",
    ],
  },

  // Analytics configuration (optional)
  analytics: {
    provider: "google",
    trackingId: "GA_TRACKING_ID", // Replace with your Google Analytics ID
  },

  // Social media links
  social: {
    github: "https://github.com/rakki194/reynard",
    discord: "https://discord.gg/reynard",
    twitter: "https://twitter.com/reynard_framework",
    linkedin: "https://linkedin.com/company/reynard-framework",
  },

  // Template configuration
  templates: [
    {
      name: "package-overview",
      path: "./templates/package-overview.hbs",
      type: "package-overview",
    },
    {
      name: "api-documentation",
      path: "./templates/api-documentation.hbs",
      type: "api",
    },
    {
      name: "code-example",
      path: "./templates/code-example.hbs",
      type: "example",
    },
  ],

  // Example configuration
  examples: [
    {
      name: "basic-usage",
      path: "./examples/basic-usage",
      type: "component",
      framework: "solid",
    },
    {
      name: "theme-customization",
      path: "./examples/theme-customization",
      type: "utility",
      framework: "solid",
    },
    {
      name: "authentication",
      path: "./examples/authentication",
      type: "integration",
      framework: "solid",
    },
  ],

  // Watch configuration
  watch: false,
  verbose: true,
};
