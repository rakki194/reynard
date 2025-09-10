# Changelog

All notable changes to the Reynard framework are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2025-01-09

### Added

- **Massive Testing Framework Overhaul**: Complete unification of testing utilities with centralized reynard-testing library
- **Enhanced Backend Integration**: New NLWeb integration with comprehensive tool calling, elaborate tool execution, and API integration tests
- **Advanced Algorithm Optimization**: Enhanced memory pool system with improved collision detection and spatial optimization
- **Comprehensive Documentation Cleanup**: Removed 15,164 lines of outdated documentation and research artifacts
- **New Backend Test Suite**: Complete integration testing for tool calling, NLWeb endpoints, and API integration
- **Enhanced ECS System**: Improved entity-component-system with better performance monitoring and parallel processing
- **Roguelike Game Integration**: New roguelike game components and CSS styling for the starter template
- **Python Development Tools**: Enhanced Python linting setup with comprehensive validation and formatting tools
- **Connection Package Enhancement**: New HTTP client with error handling, validation, and enterprise-grade networking
- **Unified Utilities Migration**: Comprehensive migration guide for consolidating testing utilities across packages

### Changed

- **Package Version Bumps**: All packages updated from 0.1.2 → 0.1.3 (main, 3d, algorithms, testing, games, connection, core, themes, ai-shared, boundingbox, caption, error-boundaries, file-processing, gallery-ai, settings, backend)
- **Testing Architecture**: Complete refactoring of testing utilities with centralized test-utils.tsx and modular utility files
- **Documentation Restructuring**: Massive cleanup removing outdated research papers, benchmark results, and obsolete documentation
- **Backend Service Integration**: Enhanced Ollama service with improved tool calling capabilities and comprehensive error handling
- **Algorithm Package Cleanup**: Removed deprecated optimization modules and streamlined to core functionality
- **ECS Performance Improvements**: Enhanced world management, query optimization, and parallel system execution
- **Bounding Box Operations**: Improved composables with better state management and operation handling
- **Theme System Updates**: Enhanced OKLCH color utilities and theme context management
- **Connection Package**: New HTTP client architecture with comprehensive error handling and validation

### Fixed

- **Testing Framework Issues**: Resolved integration test failures and centralized testing utilities
- **Backend API Stability**: Enhanced error handling for tool calling and NLWeb integration
- **Memory Management**: Improved memory pool allocation and collision detection performance
- **Type Safety**: Comprehensive TypeScript improvements across all packages
- **Package Dependencies**: Resolved version conflicts and updated all package.json files
- **Documentation Accuracy**: Removed outdated and conflicting documentation
- **ECS Performance**: Fixed parallel processing and query optimization issues
- **Component Architecture**: Better separation of concerns in complex components

### Removed

- **Massive Documentation Cleanup**: Removed 15,164 lines including:
  - Research algorithms documentation (2,000+ lines)
  - Benchmark results and optimization proposals (1,500+ lines)
  - Outdated API documentation and examples (1,200+ lines)
  - Obsolete algorithm optimization modules (800+ lines)
  - Legacy testing integration files (600+ lines)
- **Deprecated Algorithm Modules**: Removed memory-pool.ts, optimized-spatial-collision.ts, and related optimization files
- **Legacy Testing Infrastructure**: Removed integration test files and consolidated into unified testing framework
- **Obsolete Documentation**: Removed REYNARD_CAPTION_IMPLEMENTATION.md, SUMMARIZATION_BACKEND_README.md, and overview.md
- **Redundant Research Files**: Cleaned up paw-algorithms research directory with 15+ obsolete files

### Technical Details

- **Files Changed**: 236 files modified (3,864 insertions, 15,164 deletions)
- **Package Versions**: Comprehensive version bumps across 15+ packages
- **Testing Unification**: Centralized testing utilities with happy-dom integration
- **Backend Enhancement**: New NLWeb integration with comprehensive tool calling
- **Documentation Cleanup**: Removed 15,164 lines of outdated content
- **Algorithm Optimization**: Enhanced memory management and collision detection
- **ECS Improvements**: Better performance monitoring and parallel processing
- **Python Development**: Enhanced linting and validation tools

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
- Remove obsolete index.js files from auth, charts, colors, gallery, settings packages
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
