# 🦊 AI-Enhanced Image Caption App - Reynard Framework Example

A comprehensive AI-powered image caption generation application featuring the new **Reynard Gallery AI** package with advanced AI capabilities, smart image management, and production-ready features including usage tracking, health monitoring, circuit breakers, and real-time event logging.

## ✨ Features Demonstrated

### 🤖 AI Gallery Integration (NEW!)

- **Smart Image Gallery**: AI-enhanced gallery with intelligent indicators and context menus
- **Multi-Model Support**: JTP2, JoyCaption, Florence2, and WDv3 with automatic model selection
- **Batch Processing**: Process multiple images simultaneously with real-time progress tracking
- **Context Menus**: Right-click actions for caption generation, editing, and smart organization
- **AI Image Viewer**: Enhanced viewer with caption editing and generation controls
- **Smart Indicators**: Visual indicators showing caption status, AI processing state, and model information

### 🚀 Enhanced AI-Powered Caption Generation

- **Modular Generator System**: Individual packages for JTP2, JoyCaption, Florence2, and WDv3
- **Production Features**: Usage tracking, health monitoring, circuit breakers, and request queuing
- **Smart Model Management**: Automatic loading, unloading, and lifecycle coordination
- **Batch Processing**: Efficient caption generation with real-time progress tracking
- **Event System**: Comprehensive event logging and monitoring
- **System Statistics**: Real-time performance metrics and health status

### 📁 Advanced File Management

- **Drag & Drop Upload**: Intuitive file upload with drag-and-drop support
- **Image Gallery**: Responsive grid layout with image previews
- **File Validation**: Automatic filtering for image files only
- **Progress Tracking**: Real-time upload and processing progress

### ✏️ Caption Editing & Management

- **Interactive Tag Editing**: TagBubble components with drag-and-drop reordering
- **Multiple Caption Types**: Support for CAPTION, TAGS, E621, TOML formats
- **Real-time Validation**: Live validation with error highlighting
- **Modal Editing**: Full-screen caption editing with image preview

### 🎨 Comprehensive UI/UX

- **Theme System**: 8 built-in themes with live switching
- **Internationalization**: Multi-language support with RTL capabilities
- **Responsive Design**: Mobile-first layout that works on all devices
- **Accessibility**: WCAG 2.1 compliance with keyboard navigation

### 🔧 Production Features

- **Tabbed Interface**: Organized workflow with Gallery, Model Monitor, System Stats, Event Log, and Editor tabs
- **Real-time Monitoring**: Live system statistics, health status, and performance metrics
- **Event Logging**: Comprehensive event tracking with real-time updates
- **Model Management**: Advanced model loading, usage statistics, and health monitoring
- **Batch Processing**: Efficient multi-image processing with progress tracking
- **Notification System**: Toast notifications for user feedback
- **State Management**: Comprehensive state management with SolidJS signals

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Visit `http://localhost:3001` to see the AI-enhanced image caption app in action!

## 🤖 New AI Gallery Features

### 🎯 AI Gallery Tab

- **Smart Image Grid**: AI-enhanced gallery with intelligent indicators
- **Context Menus**: Right-click any image for AI-powered actions
- **Batch Selection**: Select multiple images for batch processing
- **AI Indicators**: Visual indicators showing caption status and AI processing state

### 🖼️ AI Viewer Tab

- **Enhanced Image Viewer**: Full-featured AI image viewer with caption editing
- **Caption Generation**: Generate captions directly in the viewer
- **Caption Editing**: Edit and save captions with real-time preview
- **Model Selection**: Choose from multiple AI models

### 🤖 Model Monitor Tab

- **Model Statistics**: Track model performance and usage
- **Success Rates**: Monitor caption generation success rates
- **Processing Stats**: View total images processed and current model status

### 📊 Enhanced System Stats

- **AI Metrics**: Track AI-specific statistics
- **Processing History**: View historical processing data
- **Performance Analytics**: Monitor system performance and efficiency

For detailed information about all AI features, see [AI_FEATURES.md](./AI_FEATURES.md).

## 📱 Usage Guide

### 1. **Upload Images**

- Drag and drop images onto the upload area
- Or click "Choose Files" to browse for images
- Supports all common image formats (JPG, PNG, GIF, WebP, etc.)

### 2. **Monitor AI Models**

- Navigate to the "🤖 Model Monitor" tab
- View all available generators (JTP2, JoyCaption, Florence2, WDv3)
- Monitor model health, usage statistics, and performance
- Preload/unload models for optimal resource management

### 3. **Generate Captions**

- Select your preferred model from the dropdown (JTP2, JoyCaption, Florence2, WDv3)
- Click "🤖 Generate Caption" on individual images
- Use "Batch Generate All" for processing multiple images
- Monitor real-time progress and processing statistics
- View generated captions with processing time and model information

### 4. **Edit Captions**

- Navigate to the "✏️ Caption Editor" tab
- Select an image to edit its caption
- Use the modal editor for full-screen editing
- Add, remove, and reorder tags
- Save your changes

### 5. **Monitor System Performance**

- Navigate to "📊 System Stats" to view comprehensive metrics
- Check "📝 Event Log" for real-time system events
- Monitor model usage statistics and health status
- Track processing performance and system resources

### 6. **Manage Your Gallery**

- View all uploaded images in a responsive grid
- See caption previews and generation status
- Delete images you no longer need
- Switch between different themes and languages

## 🏗️ Architecture

### Core Components

- **`App.tsx`** - Main application with enhanced state management and production features
- **`ImageGallery.tsx`** - File upload and image display with batch processing support
- **`CaptionEditor.tsx`** - Caption editing interface with modal support
- **`ModelSelector.tsx`** - Enhanced AI model monitoring and management
- **`SystemStats.tsx`** - Real-time system statistics and performance metrics
- **`EventLog.tsx`** - Comprehensive event logging and monitoring
- **`ThemeToggle.tsx`** - Theme switching with emoji indicators
- **`LanguageSelector.tsx`** - Language selection for internationalization

### Reynard Packages Used

- **`reynard-core`** - Notifications, state management, and core utilities
- **`reynard-themes`** - Theme system and internationalization
- **`reynard-components`** - UI components (Button, Card, Modal, Tabs)
- **`reynard-annotating`** - **NEW!** Unified annotation system with production features
  - `reynard-annotating-core` - Core functionality and types
  - `reynard-annotating-jtp2` - JTP2 generator package
  - `reynard-annotating-joy` - JoyCaption generator package
  - `reynard-annotating-florence2` - Florence2 generator package
  - `reynard-annotating-wdv3` - WDv3 generator package
- **`reynard-caption`** - Caption editing UI components
- **`reynard-fluent-icons`** - Icon system for visual elements

### State Management

The app uses SolidJS signals for reactive state management:

```typescript
interface ImageItem {
  id: string;
  name: string;
  url: string;
  file: File;
  caption?: string;
  tags?: string[];
  generatedAt?: Date;
  model?: string;
}

interface CaptionWorkflow {
  image: ImageItem;
  generatedCaption: string;
  editedCaption: string;
  tags: string[];
  isGenerating: boolean;
  isEditing: boolean;
}
```

## 🎨 Themes

The app includes 8 beautiful themes:

- **☀️ Light** - Clean and bright
- **🌙 Dark** - Easy on the eyes
- **☁️ Gray** - Professional neutral
- **🍌 Banana** - Warm and cheerful
- **🍓 Strawberry** - Vibrant and energetic
- **🥜 Peanut** - Earthy and cozy
- **⚫ High Contrast Black** - Maximum accessibility
- **⚪ High Contrast Inverse** - Alternative high contrast

Themes persist across browser sessions and update in real-time.

## 🌍 Internationalization

Built-in support for multiple languages:

- **English** - Default language
- **Spanish** - Español
- **French** - Français
- **And more** - Extensible language system

Language selection persists across sessions and updates the entire interface.

## 🤖 Enhanced AI Models

### Available Models

- **JTP2** - Specialized for furry artwork tagging with high accuracy
- **JoyCaption** - Large language model for detailed, multilingual captions
- **Florence2** - General purpose captioning with multiple tasks
- **WDv3** - Danbooru-style tagging optimized for anime/manga content

### Production Features

- **Usage Tracking** - Comprehensive statistics for each model
- **Health Monitoring** - Real-time health checks and performance metrics
- **Circuit Breakers** - Automatic fault tolerance and recovery
- **Request Queuing** - Smart queue management with priority handling
- **Event Logging** - Complete audit trail of all operations
- **Model Management** - Automatic loading, unloading, and lifecycle coordination

## 📦 Bundle Size

- **JavaScript**: ~45 kB (gzipped)
- **CSS**: ~8 kB (gzipped)
- **Total**: ~53 kB - Optimized for fast loading!

## 🎯 Learning Objectives

This enhanced example teaches:

1. **Modular Architecture** - Building with the new modular annotation system
2. **Production Features** - Implementing usage tracking, health monitoring, and circuit breakers
3. **Event Systems** - Real-time event logging and monitoring
4. **AI/ML Integration** - Advanced AI model management with production features
5. **Batch Processing** - Efficient multi-image processing with progress tracking
6. **System Monitoring** - Real-time statistics and performance metrics
7. **File Management** - Advanced file upload and gallery management
8. **State Management** - Complex state management with multiple signals
9. **Component Architecture** - Building reusable, composable components
10. **User Experience** - Creating intuitive workflows for complex operations
11. **Performance** - Optimizing for large file collections and AI processing
12. **Accessibility** - Building accessible interfaces for all users

## 🔄 Next Steps

Try modifying the enhanced app to:

- Add custom model configurations and presets
- Implement caption export (JSON, CSV, etc.)
- Add image filtering and search capabilities
- Integrate with cloud storage services
- Add caption templates and presets
- Implement caption history and versioning
- Add collaborative editing features
- Create custom AI model configurations
- Add advanced monitoring dashboards
- Implement model performance analytics
- Add custom event filters and alerts
- Create model comparison tools

## 🧪 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## 🤝 Contributing

Found a bug or have an improvement? This example is part of the Reynard framework!

## 📚 Related Documentation

- [Reynard Framework Documentation](../../README.md)
- [reynard-annotating Package](../../packages/annotating/README.md) - **NEW!** Unified annotation system
- [reynard-annotating-core Package](../../packages/annotating-core/README.md) - Core functionality
- [reynard-caption Package](../../packages/caption/README.md)
- [reynard-components Package](../../packages/components/README.md)

---

_Built with ❤️ using Reynard framework, SolidJS, and AI/ML technologies_ 🦊🤖
