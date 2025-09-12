export default {
  rootPath: "/home/kade/runeset/reynard",
  outputPath: "test-docs-generated",

  // Package discovery configuration - just test one package
  packages: [
    {
      name: "core",
      path: "/home/kade/runeset/reynard/packages/core",
      category: "Core",
      priority: 1,
    },
  ],

  // Site configuration
  site: {
    title: "Reynard Documentation Test",
    description: "Test documentation for Reynard packages",
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
        label: "API Reference",
        href: "/api",
        icon: "📚",
      },
    ],
    breadcrumbs: true,
    sidebar: true,
  },

  // Search configuration
  search: {
    enabled: true,
    provider: "local",
    placeholder: "Search documentation...",
  },

  // Watch configuration
  watch: false,
  verbose: true,
};
