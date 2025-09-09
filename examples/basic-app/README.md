# 🦊 Basic Todo App - Reynard Example

A minimal todo application demonstrating the core features of the Reynard framework.

## ✨ Features Demonstrated

- **Core Functionality**: Todo CRUD operations with SolidJS reactivity
- **Theme System**: 5 themes with live switching (light, dark, banana, strawberry, peanut)
- **Notifications**: Success and info notifications for user actions
- **Responsive Design**: Mobile-first layout that works on all devices
- **Accessibility**: Proper ARIA labels, keyboard navigation, focus management

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build
```

## 📱 Usage

1. **Add Todos**: Type in the input field and click "Add Todo" or press Enter
2. **Toggle Completion**: Click the checkbox to mark todos as complete/incomplete
3. **Delete Todos**: Click the red × button to remove todos
4. **Switch Themes**: Click the theme button to cycle through available themes
5. **View Progress**: See completion count at the top

## 🎨 Themes

The app includes 5 beautiful themes:

- **☀️ Light** - Clean and bright
- **🌙 Dark** - Easy on the eyes
- **🍌 Banana** - Warm and cheerful
- **🍓 Strawberry** - Vibrant and energetic
- **🥜 Peanut** - Earthy and cozy

Themes persist across browser sessions and update in real-time.

## 🏗️ Architecture

### Components

- **`App.tsx`** - Main application with todo state management
- **`TodoItem.tsx`** - Individual todo with toggle and delete actions
- **`AddTodo.tsx`** - Form for creating new todos
- **`ThemeToggle.tsx`** - Theme switching button with emoji indicators

### Reynard Features Used

- **Theme Management**: `useTheme()` for reactive theme switching
- **Notifications**: `useNotifications()` for user feedback
- **Modular CSS**: Theme-aware CSS custom properties
- **Zero Dependencies**: Self-contained Reynard modules

## 📦 Bundle Size

- **JavaScript**: ~8 kB (gzipped)
- **CSS**: ~3 kB (gzipped)
- **Total**: ~11 kB - Perfect for fast loading!

## 🎯 Learning Objectives

This example teaches:

1. **SolidJS Basics**: Signals, effects, components, and reactivity
2. **Reynard Integration**: Theme and notification system usage
3. **State Management**: Local component state with signals
4. **Event Handling**: Form submission, button clicks, keyboard input
5. **Responsive Design**: Mobile-first CSS with theme support

## 🔄 Next Steps

Try modifying the app to:

- Add todo categories or tags
- Implement todo filtering (all, active, completed)
- Add due dates and priority levels
- Persist todos to localStorage
- Add animations and transitions

## 🤝 Contributing

Found a bug or have an improvement? This example is part of the Reynard framework!

---

_Built with ❤️ using Reynard framework and SolidJS_ 🦊
