# 📱 Reynard Examples and Templates

Explore real-world applications and templates built with the Reynard framework. These examples showcase the full spectrum of capabilities, from simple demos to complex multi-modal applications.

## 🎯 Real-World Applications

### **🖼️ Image Caption App**

Complete AI-powered image caption generation with multiple models.

**Features:**

- Multiple AI models (JTP2, WDv3, Florence-2, JoyCaption)
- Batch processing with progress tracking
- Real-time caption editing and validation
- Tag management with autocomplete
- Export capabilities

**Technologies:**

- `reynard-annotating` - AI caption generation
- `reynard-caption` - Caption editing UI
- `reynard-gallery` - Image management
- `reynard-components` - UI components

**Location:** `examples/image-caption-app/`

### **🔍 RAG Demo**

Retrieval-Augmented Generation system with semantic search.

**Features:**

- EmbeddingGemma integration
- Real-time search with similarity scoring
- Advanced filtering and metadata support
- Vector database integration
- Query visualization

**Technologies:**

- `reynard-rag` - RAG system components
- `reynard-charts` - Query visualization
- `reynard-components` - Search interface

**Location:** `examples/rag-demo/`

### **💬 Chat Demo**

Real-time chat with streaming, P2P, and tool integration.

**Features:**

- Real-time streaming with markdown parsing
- Peer-to-peer chat capabilities
- Tool calling system with progress tracking
- Thinking sections for AI assistants
- Message history and persistence

**Technologies:**

- `reynard-chat` - Chat system
- `reynard-auth` - User authentication
- `reynard-connection` - WebRTC integration

**Location:** `examples/chat-demo/`

### **📊 Comprehensive Dashboard**

Full-featured dashboard with charts, settings, and analytics.

**Features:**

- Real-time data visualization
- Interactive charts and graphs
- Settings management
- User preferences
- Analytics and reporting

**Technologies:**

- `reynard-charts` - Data visualization
- `reynard-settings` - Configuration management
- `reynard-components` - Dashboard components
- `reynard-auth` - User management

**Location:** `examples/comprehensive-dashboard/`

### **🎨 Multi-Theme Gallery**

Advanced theming showcase with component library.

**Features:**

- 8 built-in themes with live switching
- Custom theme creation
- Component library showcase
- Theme persistence
- Accessibility features

**Technologies:**

- `reynard-themes` - Theming system
- `reynard-components` - Component library
- `reynard-i18n` - Internationalization

**Location:** `examples/multi-theme/`

### **⏰ Clock App**

Clock, timer, alarm, and countdown application with advanced features.

**Features:**

- Multiple time zones
- Customizable alarms
- Timer with notifications
- Countdown timers
- Stopwatch functionality

**Technologies:**

- `reynard-core` - Core utilities
- `reynard-components` - UI components
- `reynard-settings` - User preferences

**Location:** `examples/clock/`

### **🌍 i18n Demo**

Internationalization showcase with 37 languages and RTL support.

**Features:**

- 37 language support
- RTL language support
- Locale-aware formatting
- Dynamic language switching
- Plural form handling

**Technologies:**

- `reynard-i18n` - Internationalization
- `reynard-themes` - RTL theme support
- `reynard-components` - Localized components

**Location:** `examples/i18n-demo/`

### **🎮 3D Demo**

Three.js integration for 3D graphics and visualizations.

**Features:**

- 3D scene rendering
- Interactive 3D objects
- Camera controls
- Lighting and materials
- Animation system

**Technologies:**

- `reynard-3d` - 3D graphics
- `reynard-components` - UI integration
- Three.js - 3D rendering

**Location:** `examples/3d-demo/`

### **🧪 Algorithm Bench**

Performance testing and algorithm demonstrations.

**Features:**

- Union-Find algorithm demo
- Collision detection examples
- Spatial hashing visualization
- Performance benchmarking
- Algorithm comparison

**Technologies:**

- `reynard-algorithms` - Algorithm primitives
- `reynard-charts` - Performance visualization
- `reynard-components` - Interactive demos

**Location:** `examples/algo-bench/`

### **🔧 Features App**

Feature management system with service dependencies.

**Features:**

- Feature flag management
- Service dependency tracking
- Health monitoring
- Configuration management
- Service discovery

**Technologies:**

- `reynard-features` - Feature system
- `reynard-service-manager` - Service management
- `reynard-connection` - Health monitoring

**Location:** `examples/features-app/`

### **📁 File Test**

Advanced file processing and management capabilities.

**Features:**

- Multi-format file support
- Thumbnail generation
- Metadata extraction
- File validation
- Upload progress tracking

**Technologies:**

- `reynard-file-processing` - File processing
- `reynard-gallery` - File management
- `reynard-components` - Upload interface

**Location:** `examples/file-test/`

### **🎯 Error Demo**

Comprehensive error handling and boundary demonstrations.

**Features:**

- Error boundary examples
- Error recovery strategies
- Error reporting
- Graceful degradation
- Error monitoring

**Technologies:**

- `reynard-error-boundaries` - Error handling
- `reynard-components` - Error UI
- `reynard-core` - Error utilities

**Location:** `examples/error-demo/`

### **🔐 Auth App**

Complete authentication system with JWT and security features.

**Features:**

- JWT authentication
- Password strength analysis
- User registration and login
- Profile management
- Security features

**Technologies:**

- `reynard-auth` - Authentication system
- `reynard-components` - Auth forms
- `reynard-core` - Security utilities

**Location:** `examples/auth-app/`

## Templates

### **Starter Template**

Basic application template with essential features.

**Features:**

- Basic project structure
- Theme system setup
- Core components
- Development configuration
- Build scripts

**Technologies:**

- `reynard-core` - Core utilities
- `reynard-themes` - Theming
- `reynard-components` - Basic components

**Location:** `templates/starter/`

### **Dashboard Template**

Dashboard-focused template with charts and analytics.

**Features:**

- Dashboard layout
- Chart components
- Data visualization
- Settings panel
- User management

**Technologies:**

- `reynard-charts` - Data visualization
- `reynard-settings` - Configuration
- `reynard-auth` - User management
- `reynard-components` - Dashboard components

**Location:** `templates/dashboard/`

### **Portfolio Template**

Portfolio website template with gallery and contact forms.

**Features:**

- Portfolio layout
- Image gallery
- Contact forms
- Responsive design
- SEO optimization

**Technologies:**

- `reynard-gallery` - Image management
- `reynard-components` - Forms and layout
- `reynard-themes` - Styling
- `reynard-connection` - Form submission

**Location:** `templates/portfolio/`

## Running Examples

### Quick Start

```bash
# Navigate to any example directory
cd examples/basic-app

# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

### Available Examples

```bash
# Basic application
cd examples/basic-app

# Image caption generation
cd examples/image-caption-app

# RAG system demo
cd examples/rag-demo

# Chat application
cd examples/chat-demo

# Comprehensive dashboard
cd examples/comprehensive-dashboard

# Multi-theme showcase
cd examples/multi-theme

# Clock application
cd examples/clock

# Internationalization demo
cd examples/i18n-demo

# 3D graphics demo
cd examples/3d-demo

# Algorithm benchmarking
cd examples/algo-bench

# Features management
cd examples/features-app

# File processing test
cd examples/file-test

# Error handling demo
cd examples/error-demo

# Authentication app
cd examples/auth-app
```

### Using Templates

```bash
# Copy starter template
cp -r templates/starter my-new-app
cd my-new-app

# Install dependencies
pnpm install

# Start development
pnpm run dev
```

## Example Features by Category

### **AI/ML Integration**

- **Caption Generation** - Multiple AI models with batch processing
- **RAG System** - Semantic search with vector databases
- **Object Detection** - Bounding box annotation with YOLO/OWLv2
- **Text-to-Speech** - TTS integration with multiple voices

### **Data Visualization**

- **Real-time Charts** - Live data streaming with Chart.js
- **Performance Monitoring** - Algorithm benchmarking and profiling
- **Query Visualization** - RAG search result visualization
- **Analytics Dashboard** - Comprehensive data analytics

### **User Interface**

- **Theming System** - 8 built-in themes with custom support
- **Internationalization** - 37 languages with RTL support
- **Accessibility** - WCAG 2.1 compliance with ARIA labels
- **Responsive Design** - Mobile-first responsive layouts

### **File Management**

- **Multi-format Support** - Images, videos, audio, documents
- **Thumbnail Generation** - Smart thumbnail creation
- **Metadata Extraction** - Comprehensive file analysis
- **Drag-and-Drop** - Intuitive file upload interface

### **Real-time Features**

- **Chat System** - Real-time messaging with streaming
- **P2P Communication** - WebRTC peer-to-peer chat
- **Live Updates** - Real-time data synchronization
- **WebSocket Integration** - Bidirectional communication

### **Authentication & Security**

- **JWT Authentication** - Token-based authentication
- **Password Security** - Advanced strength analysis
- **User Management** - Profile and preference management
- **Security Features** - CSRF protection and secure storage

## Development Patterns

### **Component Architecture**

All examples follow consistent patterns:

- **Modular Design** - Independent, reusable components
- **Type Safety** - Full TypeScript coverage
- **Accessibility** - WCAG 2.1 compliance
- **Performance** - Optimized rendering and bundle splitting

### **State Management**

- **SolidJS Signals** - Reactive state management
- **Context Providers** - Shared state across components
- **Local Storage** - Persistent user preferences
- **Real-time Sync** - Live data synchronization

### **Styling Patterns**

- **CSS Custom Properties** - Dynamic theming
- **Component Variants** - Consistent design system
- **Responsive Design** - Mobile-first approach
- **Accessibility** - High contrast and keyboard navigation

## Contributing Examples

### **Adding New Examples**

1. Create a new directory in `examples/`
2. Follow the established project structure
3. Include comprehensive documentation
4. Add to this examples guide
5. Test across different themes and devices

### **Example Requirements**

- **Documentation** - Clear README with setup instructions
- **TypeScript** - Full type safety
- **Accessibility** - WCAG 2.1 compliance
- **Responsive** - Mobile-friendly design
- **Testing** - Unit and integration tests

## Next Steps

- **[Package Documentation](./packages.md)** - Detailed package documentation
- **[API Reference](./api.md)** - Complete API documentation
- **[Performance Guide](./performance.md)** - Optimization tips
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute

---

_Explore these examples to see the full power of Reynard in action!_ 🦊
