export default {
  "rootPath": "/home/kade/runeset/reynard/packages/docs-generator",
  "outputPath": "docs-generated",
  "packages": [
    {
      "name": "packages",
      "pattern": "packages/*/package.json",
      "category": "Packages"
    }
  ],
  "site": {
    "title": "Reynard Documentation",
    "description": "Beautiful documentation powered by Reynard framework",
    "baseUrl": "/"
  },
  "theme": {
    "name": "reynard-default",
    "primaryColor": "#6366f1",
    "secondaryColor": "#8b5cf6",
    "backgroundColor": "#ffffff",
    "textColor": "#1f2937",
    "accentColor": "#f59e0b"
  },
  "navigation": {
    "main": [
      {
        "label": "Getting Started",
        "href": "/getting-started"
      },
      {
        "label": "Packages",
        "href": "/packages"
      },
      {
        "label": "API Reference",
        "href": "/api"
      }
    ],
    "breadcrumbs": true,
    "sidebar": true
  },
  "search": {
    "enabled": true,
    "provider": "local",
    "placeholder": "Search documentation..."
  }
};