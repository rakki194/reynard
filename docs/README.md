# Reynard Framework Documentation 🦊

Welcome to the comprehensive documentation for the Reynard framework - a cunning SolidJS framework with
modular architecture, built for modern web applications. This documentation reflects the current state of
the Reynard ecosystem with its 25+ specialized packages.

> _From dataset editor to multi-modal CMS: The evolution of a cunning framework_

Reynard is a SolidJS framework derived from **yipyap**,
a multi-modal content management system. The framework extracts and
modularizes yipyap's proven architectural patterns into reusable packages for modern web development.

## Architecture Evolution

## Table of Contents

- [🦦 Architecture Evolution](#architecture-evolution)
- [✨ Core Capabilities](#core-capabilities)
  - [**🎯 Multi-Modal Content Management**](#multi-modal-content-management)
  - [**🤖 AI/ML Integration**](#aiml-integration)
- [🎯 Philosophy](#philosophy)
- [📦 Package Ecosystem](#package-ecosystem)
- [📚 Documentation Structure](#documentation-structure)
  - [🛠️ [Development](./development/)](#developmentdevelopment)
  - [🏗️ [Architecture](./architecture/)](#architecturearchitecture)
  - [🔗 [Integrations](./integrations/)](#integrationsintegrations)
  - [📖 [Guides](./guides/)](#guidesguides)
  - [📁 [Archive](./archive/)](#archivearchive)
- [🚀 Quick Start](#quick-start)
  - [For Developers](#for-developers)
  - [For Users](#for-users)
  - [For Administrators](#for-administrators)
- [🔄 Reynard Framework Overview](#reynard-framework-overview)
  - [Core Packages](#core-packages)
  - [Specialized Packages](#specialized-packages)
- [📋 Documentation Status](#documentation-status)
  - [✅ Current and Relevant](#current-and-relevant)
  - [🔄 Needs Updates](#needs-updates)
  - [📦 Archived](#archived)
- [🤝 Contributing to Documentation](#contributing-to-documentation)
- [📞 Getting Help](#getting-help)
- [🚀 The Future of Reynard](#the-future-of-reynard)
  - [**🦊 Join the Evolution**](#join-the-evolution)
- [📚 Next Steps](#next-steps)

## ✨ Core Capabilities

### **🎯 Multi-Modal Content Management**

Reynard inherits yipyap's sophisticated content management capabilities,
offering advanced solutions for a wide range of media types. For images,
Reynard provides powerful processing features such as advanced thumbnail generation, metadata extraction, and
seamless format conversion. Video support is equally comprehensive,
enabling detailed video processing with preview generation and in-depth metadata analysis.

Audio handling in Reynard is robust, supporting multiple formats and offering features like waveform visualization and
thorough metadata extraction. Document processing is also a core strength, with the ability to handle PDFs,
Office documents, and text files, all while performing intelligent content analysis.

At the heart of these capabilities is AI-powered analysis, which enables automatic content analysis, tagging, and
classification, ensuring that all types of content are organized and discoverable with cunning efficiency.

### **🤖 AI/ML Integration**

Reynard is built on yipyap's proven AI infrastructure,
offering a robust suite of intelligent features. Caption generation is powered by multiple AI models—including JTP2,
WDv3, Florence-2, and JoyCaption—with support for
efficient batch processing. Smart tagging enables automatic tag generation, complete with confidence scoring and
the flexibility to incorporate custom models.

The framework includes a Retrieval-Augmented Generation (RAG) system, leveraging vector databases and
semantic search to enhance content discovery and
analysis. For object detection, Reynard integrates models such as YOLO, OWLv2, and
Florence-2, providing advanced bounding box annotation capabilities.

Text-to-speech (TTS) functionality is also available, supporting multiple voice options and
a wide range of languages to ensure accessibility and versatility.

## 🎯 Philosophy

Reynard is guided by the "cunning fox" philosophy. The framework values smart,
elegant solutions over unnecessary complexity, aiming to be adaptable so
it can integrate seamlessly with your existing patterns. It is resourceful, minimizing dependencies while
maximizing functionality, and maintains a professional standard with high expectations for code quality and
naming conventions.

## 📦 Package Ecosystem

Reynard's package ecosystem is built on the foundation of yipyap's proven architecture,
with each package designed to be independently useful while
working seamlessly together. All packages are published to npm and ready for production use!

| Package                    | Description                                                                                                        | Version |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| `reynard-core`             | Core utilities and modules for Reynard framework                                                                   | `0.1.1` |
| `reynard-components`       | Production-ready SolidJS component library                                                                         | `0.1.1` |
| `reynard-chat`             | Production-ready chat messaging system for SolidJS                                                                 | `0.1.0` |
| `reynard-rag`              | Retrieval-Augmented Generation components for SolidJS                                                              | `0.1.1` |
| `reynard-auth`             | Authentication and user management for SolidJS                                                                     | `0.1.0` |
| `reynard-charts`           | Data visualization components for SolidJS                                                                          | `0.1.0` |
| `reynard-gallery`          | File and media management components for SolidJS                                                                   | `0.1.0` |
| `reynard-settings`         | Comprehensive settings and preferences management for SolidJS                                                      | `0.1.0` |
| `reynard-file-processing`  | Advanced file processing, thumbnail generation, and media analysis for SolidJS applications                        | `0.1.0` |
| `reynard-algorithms`       | Algorithm primitives and data structures for Reynard applications                                                  | `0.1.0` |
| `reynard-colors`           | Color generation utilities and media handling components using OKLCH color space                                   | `1.0.0` |
| `reynard-ui`               | Advanced layout and navigation components                                                                          | `0.1.0` |
| `reynard-themes`           | Comprehensive theming system for Reynard applications with translation support                                     | `0.1.1` |
| `reynard-monaco`           | Monaco code editor and text editing components for Reynard                                                         | `0.1.1` |
| `reynard-annotating`       | Annotation and caption generation system for Reynard - handles image captioning, tagging, and annotation workflows | `0.1.0` |
| `reynard-boundingbox`      | Reusable bounding box and annotation editing components for Reynard                                                | `0.1.0` |
| `reynard-caption`          | Caption editing UI components for Reynard - textarea and tag bubbles for caption editing                           | `0.1.0` |
| `reynard-floating-panel`   | Advanced floating panel system with staggered animations and state management for Reynard                          | `0.1.0` |
| `reynard-composables`      | Reusable reactive logic for Reynard applications                                                                   | `0.1.0` |
| `reynard-connection`       | Enterprise-grade networking for Reynard applications                                                               | `0.1.0` |
| `reynard-features`         | Advanced feature system for managing application features, dependencies, and capabilities                          | `0.1.0` |
| `reynard-fluent-icons`     | Fluent UI icons for Reynard design system                                                                          | `0.1.1` |
| `reynard-games`            | Interactive games and visualizations for Reynard framework                                                         | `0.1.0` |
| `reynard-model-management` | Model management system for Reynard - handles ML model loading, downloading, and lifecycle management              | `0.1.0` |
| `reynard-service-manager`  | Service management system for Reynard - handles service lifecycle, dependencies, and health monitoring             | `0.1.0` |
| `reynard-tools`            | Development and runtime tools for Reynard applications                                                             | `0.1.0` |
| `reynard-testing`          | Unified testing framework for Reynard packages                                                                     | `0.1.0` |
| `reynard-3d`               | 3D graphics and visualization components for Reynard framework using Three.js                                      | `0.1.0` |
| `reynard-error-boundaries` | Comprehensive error boundary system for Reynard framework                                                          | `0.1.1` |
| `reynard-i18n`             | Comprehensive internationalization system for Reynard framework with 37 language support                           | `1.0.0` |
| `reynard-docs-components`  | Beautiful UI components for Reynard documentation sites                                                            | `0.1.0` |
| `reynard-docs-core`        | Core documentation rendering engine for Reynard framework                                                          | `0.1.0` |
| `reynard-docs-generator`   | Automated documentation generator for Reynard packages                                                             | `0.1.0` |
| `reynard-docs-site`        | Beautiful documentation site application for Reynard framework                                                     | `0.1.0` |
| `reynard-basic-app`        | Basic Todo App - Minimal Reynard framework example                                                                 | `0.1.0` |
| `reynard-clock-app`        | A comprehensive clock, timer, alarm, and countdown application built with Reynard framework                        | `1.0.0` |
| `reynard-test-app`         | Comprehensive test application showcasing Reynard framework features                                               | `1.0.0` |

## 📚 Documentation Structure

### 🛠️ [Development](./development/)

Comprehensive development documentation covering frontend, backend, testing, and deployment.

**Key Topics:**

- **Frontend**: SolidJS composables, Reynard packages, theming, accessibility
- **Backend**: FastAPI integration, database configuration, authentication
- **Testing**: Unit testing, E2E testing, package testing patterns
- **Deployment**: Service deployment, Docker configuration, monitoring

### 🏗️ [Architecture](./architecture/)

System architecture, component design, and architectural patterns.

**Key Topics:**

- **System Architecture**: Reynard package architecture, authentication, security
- **Component Architecture**: SolidJS patterns, notification systems, state management
- **Design Patterns**: Package exports, composables, reactive patterns
- **Modularity Patterns**: [140-line axiom and refactoring strategies](./architecture/modularity-patterns.md)

### 🔗 [Integrations](./integrations/)

Comprehensive integration documentation for AI/ML, external services, and APIs.

**Key Topics:**

- **AI/ML**: RAG system, caption generation, model management, embeddings
- **External Services**: Ollama integration, TTS services, external APIs
- **APIs**: WebSocket, streaming, REST API integrations, authentication

### 📖 [Guides](./guides/)

User and administrator guides for using and maintaining the system.

**Key Topics:**

- **User Guides**: Using Reynard packages, gallery management, chat features
- **Admin Guides**: System configuration, package management, deployment

### 📁 [Archive](./archive/)

Archived documentation from the previous monolithic architecture.

**Key Topics:**

- **Obsolete Docs**: Legacy patterns, deprecated architecture references
- **Migration Notes**: How to migrate from legacy systems to Reynard

## 🚀 Quick Start

### For Developers

1. **[Quick Start Guide](./quickstart.md)** - Get up and running in minutes
2. **[Complete Tutorial](./tutorial.md)** - Build your first application
3. **[Shared Configuration](./shared/configuration-examples.md)** - Common setup patterns

### For Users

1. **[User Guides](./guides/user/)** - Feature usage and navigation
2. **[Examples](./examples.md)** - Real-world applications and templates

### For Administrators

1. **[Admin Guides](./guides/admin/)** - System configuration and maintenance
2. **[Backend Services](./rag-backend.md)** - Service setup and management

## 🔄 Reynard Framework Overview

The Reynard framework is a comprehensive SolidJS ecosystem with 25+ specialized packages:

### Core Packages

- **reynard-core**: Foundation utilities, notifications, localStorage, validation
- **reynard-components**: UI components, modals, tooltips, forms
- **reynard-auth**: Complete authentication system with JWT and security features
- **reynard-themes**: Theming system with 8 built-in themes and i18n support
- **reynard-i18n**: Internationalization with 37 language support

### Specialized Packages

- **reynard-gallery**: Advanced file management with drag-and-drop
- **reynard-chat**: Real-time chat system with streaming and tool integration
- **reynard-rag**: RAG system with EmbeddingGemma integration
- **reynard-annotating**: Caption generation with multiple AI models
- **reynard-caption**: Caption editing UI with tag management
- **reynard-floating-panel**: Advanced floating panel system with staggered animations and state management
- **reynard-charts**: Data visualization components
- **reynard-3d**: Three.js integration for 3D graphics
- **reynard-monaco**: Code editor integration
- **reynard-games**: Game development utilities

## 📋 Documentation Status

### ✅ Current and Relevant

- **Development**: All development docs updated for Reynard packages
- **Architecture**: Package architecture reflects current design
- **Integrations**: All integration docs current and maintained
- **Guides**: User and admin guides up to date

### 🔄 Needs Updates

- **Package Examples**: Examples updated for Reynard package structure
- **Testing**: Patterns updated for Reynard package organization
- **Service Integration**: Updated for Reynard modular approach

### 📦 Archived

- **Legacy References**: Old architecture patterns archived
- **Deprecated Patterns**: Superseded by Reynard architecture
- **Historical Context**: Kept for migration reference

## 🤝 Contributing to Documentation

When updating documentation:

1. **Follow the Structure**: Place docs in appropriate categories
2. **Update for Reynard**: Ensure docs reflect current Reynard package architecture
3. **Maintain Quality**: Keep technical accuracy and clarity
4. **Cross-Reference**: Link related documentation appropriately

## 📞 Getting Help

- **Development Issues**: Check [Development](./development/) documentation
- **Architecture Questions**: Review [Architecture](./architecture/) docs
- **Integration Problems**: See [Integrations](./integrations/) guides
- **User Support**: Refer to [User Guides](./guides/user/)
- **Admin Tasks**: Check [Admin Guides](./guides/admin/)

## 🚀 The Future of Reynard

Reynard represents the next phase in the evolution of multi-modal content management. As we continue to develop and
refine the framework, we're building toward a future where:

- **🤖 AI-First Development**: Every component is designed with AI integration in mind
- **🌐 Universal Content**: Seamless handling of any content type, from images to 3D models
- **⚡ Real-Time Collaboration**: Live editing and collaboration across all content types
- **🔮 Predictive Interfaces**: AI-powered UI that adapts to user behavior and content
- **🌍 Global Scale**: Built for worldwide deployment with edge computing support

### **🦊 Join the Evolution**

Reynard is more than a framework - it's a movement toward smarter,
more intuitive web development. Whether you're building the next generation of content management systems,
AI-powered applications, or simply want to leverage the power of multi-modal AI in your projects,
Reynard provides the foundation you need.

**From dataset editor to multi-modal CMS to universal framework - the journey continues!**

## 📚 Next Steps

- **[Quick Start Guide](./quickstart.md)** - Get up and running with Reynard
- **[Complete Tutorial](./tutorial.md)** - Build your first Reynard application
- **[Package Documentation](./packages.md)** - Detailed package documentation
- **[Examples and Templates](./examples.md)** - Real-world applications and templates
- **[API Reference](./api.md)** - Complete API documentation
- **[Performance Guide](./performance.md)** - Optimization and performance tips
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to Reynard

---

_This documentation reflects the Reynard framework - a cunning SolidJS ecosystem with modular architecture,
providing comprehensive guidance for development, architecture, integrations, and usage._

_Built with ❤️, 🐺 and 🤖!_
