# Changelog

All notable changes to the Reynard framework are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] (unreleased) - 2025-01-09

### Added

- Comprehensive Backend API enhancements: new monitoring endpoints for system statistics, health status, and model usage metrics
- Advanced chart system: professional unified chart component with OKLCH color integration and real-time capabilities
- Enhanced AI/ML type system: comprehensive type definitions for caption generation, chat LLM, ComfyUI, model management, and performance monitoring
- 3D visualization components: point cloud visualization, cluster visualization, and embedding visualization with Three.js integration
- OKLCH color system: advanced color management with OKLCH color space, gradient demos, and theme comparison tools
- Service management integration: feature service bridge, integration examples, and comprehensive service mappings
- RAG system overhaul: complete RAG client, admin interface, auto-refresh, and query management
- Documentation architecture: TypeScript modularity standards, SolidJS naming conventions, and development guidelines
- Memory pool optimization: enhanced algorithm optimization with collision detection improvements and memory pool utilities

### Changed

- Package version bumps: comprehensive version updates across all packages (0.1.0 → 0.1.1 → 0.1.2, 1.0.0 → 1.0.1)
- Bounding box editor refactoring: updated API to accept object parameters with imageInfo, enhanced validation with image dimension constraints
- Chart component architecture: new unified chart system with real-time data updates, animation control, and OKLCH color integration
- Image caption app simplification: streamlined architecture with composable-based state management and workflow separation
- Documentation restructuring: removed outdated API.md, EXAMPLES.md, and PERFORMANCE.md files, added comprehensive development guides
- Annotating package cleanup: removed deprecated services and generators, streamlined to core functionality
- Monaco editor optimization: enhanced composables with better separation of concerns and improved performance
- Theme system enhancement: improved OKLCH color conversion, theme showcase components, and color utilities

### Fixed

- Backend API stability: enhanced error handling and logging for caption generation endpoints
- Type safety improvements: comprehensive TypeScript definitions across AI/ML packages and service integrations
- Chart rendering issues: fixed real-time data updates and animation control problems
- Bounding box validation: improved coordinate transformation and image constraint validation
- Component architecture: better separation of concerns in complex components like BoundingBoxEditor
- Package dependencies: resolved version conflicts and updated all package.json files with correct versions

### Removed

- Deprecated documentation: removed outdated API.md (965 lines), EXAMPLES.md (507 lines), and PERFORMANCE.md (759 lines)
- Legacy annotating services: removed deprecated AnnotationManager, AnnotationService, and BackendIntegrationService
- Obsolete generators: removed BaseCaptionGenerator and related generator infrastructure
- Redundant components: cleaned up duplicate and unused components across multiple packages

### Technical Details

- New architecture decisions: added comprehensive TypeScript modularity refactoring documentation
- Enhanced development workflow: new SolidJS naming conventions and TypeScript quick reference guides
- Performance optimizations: memory pool utilities, collision detection improvements, and algorithm optimization
- Comprehensive testing: enhanced test coverage for color conversion, OKLCH utilities, and service integrations
- Modular architecture: continued adherence to 140-line axiom with strategic code decomposition

## [0.1.2] - 2025-09-08

### Added

- Enhanced algorithm optimization with collision detection improvements
- New memory pool utilities for performance optimization
- Improved bounding box editor with refactored architecture
- Enhanced charts package with comprehensive type definitions
- New documentation components and core modules
- Enhanced composables with RAG integration and service management
- Improved file processing with metadata extraction
- Enhanced testing utilities with documentation testing framework
- New theme showcase components with OKLCH color system
- Enhanced starter template with comprehensive dashboard features

### Changed

- Updated all package versions to 0.1.2 (from 0.1.0/0.1.1)
- Enhanced algorithm selector with optimized collision detection
- Improved bounding box editor with modular architecture
- Updated charts package with better type safety and utilities
- Enhanced documentation generator with improved analyzers
- Improved composables with better state management
- Enhanced file processing with TypeScript configuration
- Updated testing framework with better utilities and rendering
- Improved themes package with enhanced color conversion and hooks
- Enhanced starter template with comprehensive component architecture

### Fixed

- Type safety improvements across multiple packages
- Enhanced error handling in algorithm optimization
- Improved memory management in collision detection
- Better component architecture in bounding box editor
- Enhanced type definitions in charts package
- Improved documentation generation and parsing
- Better state management in composables
- Enhanced file processing with proper TypeScript support
- Improved testing utilities and rendering capabilities
- Better theme system integration and color handling

### Technical Details

- Version bumps: 0.1.0 → 0.1.1, 0.1.1 → 0.1.2, 1.0.0 → 1.0.1
- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages
- Comprehensive modularization following 140-line axiom

## [0.1.1] - 2025-09-07

### Added

- Major system enhancements and security hardening
- Comprehensive algorithms optimization with performance benchmarks
- Enhanced ECS query system with improved type safety
- New dashboard components and theme showcase functionality
- Advanced algorithm optimization with memory allocation tests
- Enhanced backend with rate limiting and security middleware
- Comprehensive test suites for algorithm optimization

### Changed

- Enhanced ECS query system with improved type safety and performance optimizations
- Improved backend security with comprehensive validation
- Streamlined theme provider with better lifecycle management
- Enhanced starter template with improved component architecture

### Fixed

- Enhanced file validation with comprehensive path traversal prevention
- Upgraded SQL injection protection with ultra-enhanced regex patterns
- Improved input sanitization and validation across core security modules
- Added rate limiting and trusted host middleware to backend

### Technical Details

- Added 30+ new files including tests, documentation, and optimization modules
- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.1.0] - 2025-09-06

### Added

- Major documentation and codebase restructuring
- Comprehensive backend infrastructure with caption generation
- Enhanced ECS architecture with better type safety and performance
- Gallery-AI package for AI-powered image gallery functionality
- Blackhat security testing framework with exploit modules
- Comprehensive research documentation and algorithm analysis
- Enhanced package documentation with optimization guides
- New dashboard components and theme showcase functionality

### Changed

- Removed outdated academic papers and LaTeX artifacts (186 files deleted)
- Consolidated research documentation into organized structure
- Updated README.md with streamlined content (1320 lines removed)
- Reorganized docs/ structure with new API, CONTRIBUTING, EXAMPLES docs
- Refactored BoundingBoxEditor with modular architecture
- Enhanced annotation services with improved type safety
- Updated Monaco editor composables with better separation of concerns

### Fixed

- Enhanced file validation with comprehensive path traversal prevention
- Upgraded SQL injection protection with ultra-enhanced regex patterns
- Improved input sanitization and validation across core security modules
- Added rate limiting and trusted host middleware to backend

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.9] - 2025-09-08

### Added

- ECS architecture improvements and notification system updates
- Enhanced ECS archetype system with better type safety and performance
- Refactored query system with improved component filtering
- Comprehensive ECS examples with components and systems
- Performance monitoring utilities for ECS operations
- Modular notification components (NotificationIcon, NotificationItem)
- Test configuration for improved development workflow

### Changed

- Enhanced ECS archetype system with better type safety and performance
- Refactored query system with improved component filtering
- Updated CONTRIBUTING.md with latest development guidelines
- Removed deprecated useDebounce composable and tests

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.8] - 2025-09-07

### Added

- Gallery-AI package for AI-powered image gallery functionality
- AIGALLERY_TODO.md for tracking gallery-ai development tasks
- New gallery-ai package with AI-powered image gallery functionality
- Comprehensive AI gallery provider and composables
- Enhanced gallery functionality with AI integration

### Changed

- Removed deprecated SIMD position system mock file from games package
- Cleanup of experimental SIMD code that was no longer needed
- Updated package structure to use TypeScript-first approach

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.7] - 2025-09-07

### Added

- Major modularization and code cleanup
- New focused utility files and composables
- Enhanced package dependencies and configurations
- Comprehensive modularization standards
- New focused utility files and composables

### Changed

- Break down large monolithic components into focused modules
- Extract utilities and composables for better reusability
- Streamline auth, gallery, games, and i18n packages
- Updated package dependencies and configurations
- Reduced codebase complexity through strategic decomposition

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.6] - 2025-09-07

### Added

- Major package cleanup and ECS system integration
- Comprehensive ECS (Entity Component System) implementation in games package
- ECS examples, experiments, and Bevy comparison documentation
- New test utilities (test-utils.jsx) for enhanced testing capabilities
- Enhanced testing utilities with better assertion and mock capabilities

### Changed

- Remove legacy JavaScript index files across multiple packages
- Update modularity standards from 100-line to 140-line axiom
- Remove obsolete index.js files from auth, charts, color-media, gallery, settings packages
- Delete legacy composables, components, and utility files
- Clean up package structure to use TypeScript-first approach

### Fixed

- Fix Monaco Editor CSS to use CSS custom properties instead of attr() functions
- Update LaTeX writing rules with improved academic writing guidelines
- Adjust modularity standards documentation to reflect 140-line limit

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.5] - 2025-09-07

### Added

- Restructure algorithms package and enhance prompt-note example
- New test structure in **tests** directories
- New collision detection core and spatial optimization modules
- Enhanced prompt-note example with new backend routes and types
- New algo-bench example directory
- Comprehensive algorithm testing and optimization

### Changed

- Reorganize algorithms package with new test structure
- Remove old test files and consolidate into organized test suites
- Update package configurations and dependencies
- Enhanced prompt-note example with new backend routes and types

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.4] - 2025-09-07

### Added

- Comprehensive backend improvements and package restructuring
- Enhanced basic-backend example with structured logging, improved auth, and better error handling
- Beacon library integration and updated gatekeeper configuration
- Enhanced chat package with enhanced P2P functionality, streaming markdown parsing, and better type safety
- Enhanced file-processing with modular thumbnail generators and comprehensive type support
- Updated i18n package with better pluralization and translation utilities
- Comprehensive testing utilities and assertion helpers
- Updated tools package with improved API endpoints and streaming capabilities
- New documentation structure and research papers
- Python development setup scripts and configuration files

### Changed

- Refactored algorithms package: removed deprecated modules, reorganized geometry utilities
- Enhanced basic-backend example with structured logging, improved auth, and better error handling
- Updated package configurations and dependencies across multiple packages
- Enhanced chat package with enhanced P2P functionality, streaming markdown parsing, and better type safety

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.3] - 2025-09-06

### Added

- Comprehensive security and infrastructure overhaul
- Complete cryptographic utilities, headers management, and validation framework
- New error boundaries package with advanced error handling and recovery strategies
- Infrastructure for documentation-driven testing
- Git hooks migration, security docs, audit configuration
- Enhanced test coverage across all packages
- Monaco editor improvements and CSS enhancements

### Changed

- Enhanced security across auth, file-processing, and core packages
- Comprehensive error boundary system with recovery strategies
- Documentation testing framework for better code quality
- Infrastructure improvements for production readiness

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.2] - 2025-09-06

### Added

- Major infrastructure and package updates
- Enhanced package dependencies and configurations
- Comprehensive package updates across all packages
- Enhanced error boundaries and testing infrastructure
- Improved i18n and features package configurations

### Changed

- Updated package.json files across all packages
- Fixed version references and dependency management
- Enhanced error boundaries and testing infrastructure
- Improved i18n and features package configurations

### Technical Details

- Enhanced TypeScript configurations and package dependencies
- Improved error handling and validation across multiple packages

## [0.0.1] - 2025-09-06

### Added

- Initial commit with basic framework structure
- Core package with composables and modules
- Starter template with basic components
- Basic testing infrastructure
- Initial package structure

### Technical Details

- Initial framework setup with core functionality
- Basic TypeScript configurations and package dependencies

---

## Legend

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for security-related changes

## Development Notes

This changelog is automatically generated based on actual git commit diffs and file changes. Each entry represents real modifications to the codebase, not speculative changes.

The Reynard framework follows a modular architecture with packages for different functionalities:

- **Core**: Base utilities, composables, and modules
- **UI**: User interface components and layouts
- **Auth**: Authentication and authorization
- **Chat**: Chat functionality with P2P support
- **Gallery**: Image gallery and file management
- **Games**: Game development with ECS architecture
- **Algorithms**: Mathematical and geometric algorithms
- **Themes**: Theme system with OKLCH color support
- **Testing**: Comprehensive testing utilities
- **Security**: Security utilities and validation

## Contributing

When making changes, please ensure:

1. Update this changelog with your changes
2. Follow the existing format and structure
3. Include technical details for significant changes
4. Test your changes thoroughly
5. Update documentation as needed

For more information, see [CONTRIBUTING.md](CONTRIBUTING.md).
