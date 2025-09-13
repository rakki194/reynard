# 🦊 Reynard Starter Template

A modern, comprehensive SolidJS application template showcasing the full power of the Reynard framework. Experience cutting-edge web development with whimsical charm and professional polish.

## ✨ Features Demonstrated

- **🎨 Advanced Theme System** - 8 built-in themes with live preview and color palette exploration
- **📢 Smart Notifications** - Toast notifications with auto-dismiss, grouping, and custom durations
- **🎯 Interactive Dashboard** - Real-time reactive components with localStorage persistence
- **🖼️ Icon Gallery** - Comprehensive Fluent UI icon showcase with search and filtering
- **🎮 Component Playground** - Interactive testing environment with live code examples
- **🧩 Modular Architecture** - Zero-dependency modules under 140 lines each
- **🚀 Performance** - Optimized builds with Vite and tree shaking
- **♿ Accessibility** - WCAG compliant components with proper ARIA labels
- **📱 Responsive** - Mobile-first design with adaptive layouts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run serve
```

## 📁 Project Structure

```text
src/
├── components/                    # Modern UI components
│   ├── AppHeader.tsx            # Navigation header with theme selector
│   ├── HeroSection.tsx          # Dynamic hero with theme previews
│   ├── InteractiveDashboard.tsx # Live reactive components demo
│   ├── IconGallery.tsx          # Comprehensive icon showcase
│   ├── ThemeShowcase.tsx        # Interactive theme exploration
│   ├── ComponentPlayground.tsx  # Interactive testing environment
│   ├── NotificationToast.tsx    # Toast notification system
│   └── AppFooter.tsx            # Application footer
├── styles/                       # Modern CSS architecture
│   ├── app.css                 # Main application styles
│   ├── components.css          # Base component styles
│   └── modern-components.css   # Advanced component styles
├── App.tsx                     # Main application component
└── index.tsx                   # Application entry point
```

## 🎨 Theming

The template includes 8 built-in themes:

- **Light** - Clean and bright
- **Dark** - Easy on the eyes
- **Gray** - Professional neutral
- **Banana** - Warm and cheerful
- **Strawberry** - Vibrant and energetic
- **Peanut** - Earthy and cozy
- **High Contrast Black** - Maximum accessibility
- **High Contrast Inverse** - Alternative high contrast

Switch themes using the theme selector or programmatically:

```tsx
import { useTheme } from "reynard-themes";

const { theme, setTheme, nextTheme } = useTheme();
setTheme("dark");
```

## 📢 Notifications

Send toast notifications with the notification system:

```tsx
import { useNotifications } from "reynard-core";

const { notify } = useNotifications();

notify("Success message!", "success");
notify("Error occurred", "error", { duration: 0 }); // No auto-dismiss
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test:coverage
```

## 🎯 What's New in This Version

### 🚀 Modern Design System

- **Hero Section** with dynamic theme previews and animated demos
- **Interactive Dashboard** showcasing reactive state management
- **Comprehensive Icon Gallery** with search, filtering, and copy functionality
- **Advanced Theme Showcase** with live color palette exploration
- **Component Playground** for testing and learning Reynard features

### 🎨 Enhanced User Experience

- **Sticky Navigation** with smooth scrolling to sections
- **Responsive Design** optimized for all device sizes
- **Accessibility Features** with proper ARIA labels and keyboard navigation
- **Modern Animations** with smooth transitions and hover effects
- **Live Code Examples** with copy-to-clipboard functionality

### 🛠️ Developer Experience

- **TypeScript Support** with full type safety
- **Component Architecture** following Reynard's modular patterns
- **CSS Layer System** for maintainable styling
- **Performance Optimized** with lazy loading and tree shaking

## 🎯 Next Steps

1. **Add Routing** - Install `@solidjs/router` for navigation
2. **Add State Management** - Use SolidJS stores for complex state
3. **Add API Layer** - Create services for data fetching
4. **Add More Components** - Build your component library
5. **Customize Themes** - Create your own theme variants
6. **Add Authentication** - Implement user management
7. **Add Data Visualization** - Integrate charts and graphs
8. **Add Testing** - Set up comprehensive test suites

## 📚 Learn More

- [Reynard Documentation](../../../docs)
- [SolidJS Documentation](https://solidjs.com)
- [Vite Documentation](https://vitejs.dev)

## 🤝 Contributing

Found a bug or have a suggestion? Please open an issue!

---

_Built with ❤️ using the Reynard framework_ 🦊
