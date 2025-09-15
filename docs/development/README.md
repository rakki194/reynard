# Development Documentation

This directory contains comprehensive development documentation for the Reynard modular framework.

## Structure

### Frontend Development

#### TypeScript and Modularity

- **`typescript-modularity-standards.md`** - Comprehensive TypeScript modularity standards and type safety
- **`typescript-quick-reference.md`** - Quick reference for common TypeScript issues and solutions

#### SolidJS and Components

- **`composables.md`** - SolidJS composables guide and patterns
- **`solidjs-naming-conventions.md`** - Official SolidJS naming conventions and documentation guide
- **`css-modules-guide.md`** - CSS Modules implementation guide
- **`css-modules/`** - Detailed CSS Modules documentation
- **`theming.md`** - Theme system implementation

#### Code Quality and Tools

- **`linting.md`** - Code linting and formatting
- **`editor-config-prettier.md`** - Editor configuration
- **`stylelint-setup.md`** - CSS linting setup
- **`git-development-setup.md`** - Enhanced Git setup with Delta for superior diff analysis
- **`documentation-word-diffing-guide.md`** - Advanced word-level diffing strategies for documentation files

#### UI Components and Patterns

- **`translations.md`** - Internationalization
- **`responsive-css.md`** - Responsive design patterns
- **`drag-and-drop.md`** - Drag and drop functionality
- **`lazy-loading.md`** - Lazy loading strategies
- **`passive-events.md`** - Event handling best practices
- **`aria-labels.md`** - Accessibility labels
- **`breadcrumb.md`** - Breadcrumb navigation
- **`tooltip.md`** - Tooltip implementation
- **`backdrop-filter.md`** - Backdrop filter effects
- **`overlay-transitions.md`** - Overlay transition patterns
- **`image-viewer.md`** - Image viewer component
- **`lazy-loading-quick-guide.md`** - Quick lazy loading guide
- **`gallery-performance-validation.md`** - Gallery performance
- **`query-point-visualization-analysis.md`** - Query visualization
- **`tooltip-troubleshooting.md`** - Tooltip troubleshooting
- **`animated-webp-thumbnails.md`** - Animated thumbnail support

### Backend Development

- **`environment-configuration.md`** - Environment setup
- **`remote-development.md`** - Remote development setup
- **`POSTGRESQL_SETUP.md`** - PostgreSQL configuration
- **`uvicorn-reload-fix.md`** - Uvicorn reload issues
- **`logging.md`** - Logging configuration
- **`memory-tracking.md`** - Memory usage tracking
- **`runtime-configuration-management.md`** - Runtime configuration
- **`strategy-configuration.md`** - Strategy patterns
- **`memory-pressure-management.md`** - Memory pressure handling
- **`intelligent-package-unloading.md`** - Package unloading
- **`dependency-cache-system.md`** - Dependency caching

### Testing

- **`testing.md`** - Comprehensive testing guide
- **`e2e-testing.md`** - End-to-end testing

### Deployment

- **`summarization-deployment.md`** - Summarization service deployment
- **`summarization-monitoring.md`** - Service monitoring

## Getting Started

1. **TypeScript Development**: Start with `typescript-modularity-standards.md` and `typescript-quick-reference.md`
2. **Frontend Development**: Continue with `solidjs-naming-conventions.md`, `composables.md`, and `css-modules-guide.md`
3. **Backend Development**: Begin with `environment-configuration.md` and `POSTGRESQL_SETUP.md`
4. **Testing**: Review `testing.md` for comprehensive testing strategies
5. **Deployment**: Check deployment-specific documentation in the `deployment/` subdirectory

## Best Practices

- Follow the [140-line axiom and modularity patterns](../architecture/modularity-patterns.md) for code organization
- Adhere to [TypeScript modularity standards](./frontend/typescript-modularity-standards.md) for type safety and maintainability
- Use the established composable patterns for frontend development
- Maintain consistent theming and styling across components
- Implement proper testing strategies for all new features
- Follow the established logging and monitoring patterns for backend services
