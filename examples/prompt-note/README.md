# 🦊 Prompt Note - OneNote-like Note-Taking Application

A comprehensive OneNote-like note-taking application built with the Reynard framework, featuring multi-user support,
real-time collaboration, AI-powered features, and gamification elements to make note-taking engaging and productive.

## ✨ Features Demonstrated

### 📝 Rich Note-Taking

- **Monaco Editor Integration**: Professional code and markdown editing with syntax highlighting
- **Multiple Content Types**: Support for markdown, rich-text, and code notes
- **Notebook Organization**: Hierarchical structure with notebooks, sections, and pages
- **Real-time Editing**: Live collaboration with multiple users

### 🎮 Gamification System

- **Experience Points (XP)**: Gain XP for various note-taking activities
- **Level System**: Progressive levels with unlockable features
- **Achievement System**: Badges for milestones and accomplishments
- **Leaderboards**: Weekly challenges and team competitions
- **Visual Progression**: Unlockable avatars, themes, and accessories

### 🤖 AI-Powered Features

- **Smart Summarization**: Auto-generate note summaries
- **Content Suggestions**: AI-powered writing assistance
- **Auto-categorization**: Smart tagging and organization
- **Semantic Search**: AI-powered content discovery
- **Voice-to-Text**: Speech recognition for notes

### 🤝 Real-time Collaboration

- **Live Editing**: Multiple users editing simultaneously
- **Presence Indicators**: See who's online and where
- **Comments & Suggestions**: Inline commenting system
- **Version History**: Track changes and revert
- **Conflict Resolution**: Smart merge for simultaneous edits

### 🎨 Comprehensive UI/UX

- **Theme System**: 8 built-in themes with live switching
- **Internationalization**: Multi-language support with RTL capabilities
- **Responsive Design**: Mobile-first layout that works on all devices
- **Accessibility**: WCAG 2.1 compliance with keyboard navigation

### 🔧 Advanced Features

- **Tabbed Interface**: Organized workflow with Notebooks, Recent, and Favorites tabs
- **File Attachments**: Support for images, PDFs, and documents
- **Search & Discovery**: Full-text and semantic search across all notes
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

Visit `http://localhost:5173` to see the prompt-note app in action!

## 📱 Usage Guide

### 1. **Create Notebooks**

- Click "➕ New Notebook" to create a new notebook
- Choose a title, description, and color for your notebook
- Organize your notes into logical collections

### 2. **Write Notes**

- Click on any notebook to view its notes
- Create new notes with rich text editing
- Use markdown, code blocks, or rich text formatting
- Add file attachments and images

### 3. **Gamification & Progress**

- Click "🏆 Achievements" to view your progress
- Earn XP for creating notes, collaborating, and using AI features
- Unlock new levels and achievements
- Compete on weekly leaderboards

### 4. **Collaborate**

- Share notebooks with other users
- Edit notes together in real-time
- Leave comments and suggestions
- Track version history and changes

### 5. **AI-Powered Features**

- Use AI to summarize your notes
- Get content suggestions while writing
- Auto-categorize and tag your notes
- Search semantically across all content

## 🏗️ Architecture

### Core Components

- **`App.tsx`** - Main application with state management and workflow orchestration
- **`DashboardPage.tsx`** - Main dashboard with notebooks overview
- **`NotebookPage.tsx`** - Individual notebook view with notes list
- **`NoteEditorPage.tsx`** - Rich text editor for note creation and editing
- **`GamificationPanel.tsx`** - Achievements, progress, and leaderboards
- **`ThemeToggle.tsx`** - Theme switching with emoji indicators
- **`LanguageSelector.tsx`** - Language selection for internationalization

### Reynard Packages Used

- **`reynard-core`** - Notifications, state management, and core utilities
- **`reynard-themes`** - Theme system and internationalization
- **`reynard-components`** - UI components (Button, Card, Modal, Tabs)
- **`reynard-auth`** - Authentication and user management
- **`reynard-monaco`** - Rich text editor with Monaco integration
- **`reynard-chat`** - Real-time collaboration features
- **`reynard-games`** - Gamification system and achievements
- **`reynard-rag`** - AI-powered search and content generation
- **`reynard-fluent-icons`** - Icon system for visual elements

### State Management

The app uses SolidJS signals for reactive state management:

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  experiencePoints: number;
  achievements: Achievement[];
}

interface Notebook {
  id: string;
  title: string;
  description?: string;
  color: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  pageCount: number;
}

interface Note {
  id: string;
  notebookId: string;
  title: string;
  content: string;
  contentType: "markdown" | "rich-text" | "code";
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  collaborators?: User[];
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

## 🎮 Gamification System

### Experience Points (XP)

- **Creating notes**: +10 XP
- **Completing todos**: +5 XP
- **Collaborating**: +15 XP
- **Using AI features**: +8 XP
- **Daily login streak**: +20 XP

### Level System

- **Level 1-5**: Basic features
- **Level 6-10**: Advanced editing tools
- **Level 11-15**: AI features
- **Level 16-20**: Collaboration features
- **Level 21+**: Custom themes and advanced features

### Achievement System

- **📝 "First Note"**: Create your first note
- **🎯 "Organized"**: Create 10 notebooks
- **🤝 "Collaborator"**: Share 5 notes
- **🧠 "AI Assistant"**: Use AI features 20 times
- **📅 "Streak Master"**: 30-day login streak
- **🎨 "Artist"**: Use 5 different themes

## 🗄️ Database Schema

The backend uses PostgreSQL with the following tables:

- **users** - User authentication and profile data
- **notebooks** - Notebook metadata and organization
- **notes** - Individual note content and metadata
- **collaborations** - Sharing and permissions
- **achievements** - Gamification data
- **activity_logs** - User actions for analytics
- **file_attachments** - File metadata and storage

## 🎯 Learning Objectives

This example teaches:

1. **Full-Stack Development** - Complete frontend and backend integration
2. **Real-time Collaboration** - WebSocket-based live editing
3. **Gamification Design** - Engaging user experience with progression systems
4. **AI Integration** - Smart features and content generation
5. **Database Design** - Complex relational data modeling
6. **Authentication** - Secure user management and permissions
7. **State Management** - Complex state management with multiple signals
8. **Component Architecture** - Building reusable, composable components

## 🔄 Next Steps

Try modifying the app to:

- Add voice notes and speech-to-text
- Implement handwriting support with digital pen
- Add mind mapping and visual note organization
- Integrate with calendar and scheduling
- Add third-party integrations (Slack, Google Drive, etc.)
- Implement offline mode with sync
- Add advanced AI features (personal assistant, content generation)
- Create custom themes and layouts

## 🧪 Development

```bash
# Install dependencies
npm install

# Start frontend development server
npm run dev

# Start backend server (in separate terminal)
npm run dev:backend

# Start both frontend and backend
npm run start:full

# Setup database
npm run setup:db

# Build for production
npm run build

# Type check
npm run typecheck
```

## 🤝 Contributing

Found a bug or have an improvement? This example is part of the Reynard framework!

## 📚 Related Documentation

- [Reynard Framework Documentation](../../README.md)
- [reynard-auth Package](../../packages/auth/README.md)
- [reynard-monaco Package](../../packages/monaco/README.md)
- [reynard-chat Package](../../packages/chat/README.md)
- [reynard-games Package](../../packages/games/README.md)
- [reynard-components Package](../../packages/components/README.md)

---

_Built with ❤️ using Reynard framework, SolidJS, FastAPI, and gamification technologies_ 🦊📝
