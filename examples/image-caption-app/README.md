# 🦊 Image Caption App - Reynard Framework Example

A comprehensive AI-powered image caption generation application demonstrating the full capabilities of the Reynard framework, including AI/ML integration, file management, and advanced UI components.

## ✨ Features Demonstrated

### 🤖 AI-Powered Caption Generation

- **Multiple AI Models**: Support for Florence2, JTP2, JoyCaption, WDv3, and other caption generation models
- **Model Management**: Dynamic model loading, preloading, and lifecycle management
- **Batch Processing**: Efficient caption generation with progress tracking
- **Confidence Scoring**: Configurable confidence thresholds for quality control

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

### 🔧 Advanced Features

- **Tabbed Interface**: Organized workflow with Gallery, Models, and Editor tabs
- **Model Configuration**: Detailed model information and status tracking
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

Visit `http://localhost:3001` to see the image caption app in action!

## 📱 Usage Guide

### 1. **Upload Images**

- Drag and drop images onto the upload area
- Or click "Choose Files" to browse for images
- Supports all common image formats (JPG, PNG, GIF, WebP, etc.)

### 2. **Select AI Model**

- Navigate to the "🤖 AI Models" tab
- Choose from available caption generation models
- Preload models for faster generation
- View model descriptions and capabilities

### 3. **Generate Captions**

- Click on any image in the gallery
- Click "🤖 Generate Caption" to create AI-powered captions
- View generated captions and extracted tags
- See generation metadata (model used, timestamp)

### 4. **Edit Captions**

- Navigate to the "✏️ Caption Editor" tab
- Select an image to edit its caption
- Use the modal editor for full-screen editing
- Add, remove, and reorder tags
- Save your changes

### 5. **Manage Your Gallery**

- View all uploaded images in a responsive grid
- See caption previews and generation status
- Delete images you no longer need
- Switch between different themes and languages

## 🏗️ Architecture

### Core Components

- **`App.tsx`** - Main application with state management and workflow orchestration
- **`ImageGallery.tsx`** - File upload and image display with drag-and-drop
- **`CaptionEditor.tsx`** - Caption editing interface with modal support
- **`ModelSelector.tsx`** - AI model selection and configuration
- **`ThemeToggle.tsx`** - Theme switching with emoji indicators
- **`LanguageSelector.tsx`** - Language selection for internationalization

### Reynard Packages Used

- **`reynard-core`** - Notifications, state management, and core utilities
- **`reynard-themes`** - Theme system and internationalization
- **`reynard-components`** - UI components (Button, Card, Modal, Tabs)
- **`reynard-gallery`** - File management and gallery functionality
- **`reynard-annotating`** - AI/ML caption generation engine
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

## 🤖 AI Models

### Available Models

- **Florence2** - Best for general image descriptions and detailed captions
- **JTP2** - Good for artistic and creative content
- **JoyCaption** - Optimized for joyful and positive content
- **WDv3** - Excellent for technical and detailed descriptions

### Model Management

- **Preloading** - Load models in advance for faster generation
- **Unloading** - Free up memory by unloading unused models
- **Status Tracking** - See which models are available and loaded
- **Configuration** - Adjust model parameters and thresholds

## 📦 Bundle Size

- **JavaScript**: ~45 kB (gzipped)
- **CSS**: ~8 kB (gzipped)
- **Total**: ~53 kB - Optimized for fast loading!

## 🎯 Learning Objectives

This example teaches:

1. **AI/ML Integration** - How to integrate AI models with SolidJS applications
2. **File Management** - Advanced file upload and gallery management
3. **State Management** - Complex state management with multiple signals
4. **Component Architecture** - Building reusable, composable components
5. **User Experience** - Creating intuitive workflows for complex operations
6. **Performance** - Optimizing for large file collections and AI processing
7. **Accessibility** - Building accessible interfaces for all users

## 🔄 Next Steps

Try modifying the app to:

- Add batch caption generation for multiple images
- Implement caption export (JSON, CSV, etc.)
- Add image filtering and search capabilities
- Integrate with cloud storage services
- Add caption templates and presets
- Implement caption history and versioning
- Add collaborative editing features
- Create custom AI model configurations

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
- [reynard-annotating Package](../../packages/annotating/README.md)
- [reynard-caption Package](../../packages/caption/README.md)
- [reynard-gallery Package](../../packages/gallery/README.md)
- [reynard-components Package](../../packages/components/README.md)

---

_Built with ❤️ using Reynard framework, SolidJS, and AI/ML technologies_ 🦊🤖
