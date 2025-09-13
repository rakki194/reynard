# Shared Documentation

_Common patterns, configurations, and guides used across Reynard documentation_

This directory contains shared documentation that
eliminates duplication across the Reynard documentation system. These files provide standardized patterns and
configurations that are referenced by multiple other documentation files.

## 📁 Contents

### [Configuration Examples](./configuration-examples.md)

Common configuration patterns and templates:

- **TypeScript Configuration** - Standard tsconfig.json templates
- **Vite Configuration** - Build and development setup
- **Package.json Templates** - Package and application templates
- **ESLint Configuration** - Code quality and linting setup
- **Environment Variables** - Development and production configs
- **Backend Configuration** - FastAPI and service configuration
- **Docker Configuration** - Containerization setup
- **Common Scripts** - Package and workspace scripts

### [Installation Guides](./installation-guides.md)

Standardized installation procedures:

- **Frontend Package Installation** - Core packages and dependencies
- **Backend Service Installation** - Python environment and services
- **Project Setup** - New applications and test apps
- **Environment Configuration** - Frontend and backend setup
- **Verification** - Health checks and testing
- **Troubleshooting** - Common issues and solutions

### [API Patterns](./api-patterns.md)

Common API design patterns and structures:

- **Standard Request/Response Models** - Base response structures
- **Common Endpoint Patterns** - Health checks, stats, configuration
- **Service-Specific Patterns** - RAG, TTS, Ollama, Summarization
- **Streaming Patterns** - Server-sent events and WebSocket
- **Error Handling Patterns** - Standard error codes and responses
- **Authentication Patterns** - JWT and API key authentication
- **Rate Limiting Patterns** - Rate limit headers and responses
- **Monitoring and Observability** - Logging and metrics
- **Testing Patterns** - API test utilities and mocks

## 🎯 Usage

These shared documents are referenced throughout the Reynard documentation system to:

1. **Eliminate Duplication** - Single source of truth for common patterns
2. **Ensure Consistency** - Standardized approaches across all services
3. **Improve Maintainability** - Update once, apply everywhere
4. **Enhance Discoverability** - Centralized location for common patterns

## 🔗 Cross-References

These shared documents are referenced by:

- [Quick Start Guide](../quickstart.md)
- [Backend Services](../rag-backend.md) | [TTS Backend](../tts-backend.md) | [Ollama Backend](../ollama-backend.md) | [Summarization Backend](../summarization-backend.md)
- [Development Documentation](../development/)
- [Architecture Documentation](../architecture/)

## 📝 Contributing

When adding new shared patterns:

1. **Check for Existing Patterns** - Avoid duplicating existing content
2. **Follow Established Structure** - Maintain consistent formatting
3. **Add Cross-References** - Update referencing documents
4. **Test Examples** - Ensure all code examples work
5. **Update This Index** - Add new patterns to this README

## 🚀 Benefits

Using shared documentation provides:

- **Reduced Maintenance** - Update patterns in one place
- **Improved Consistency** - Standardized approaches across services
- **Better Developer Experience** - Clear, centralized patterns
- **Easier Onboarding** - Single location for common setups
- **Reduced Documentation Size** - Eliminate redundant content

---

_These shared patterns form the foundation of consistent, maintainable documentation across the Reynard ecosystem._
