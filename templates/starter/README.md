# 🦊 Reynard Starter Template

A SolidJS application template built with the Reynard framework, demonstrating modern web development patterns with whimsical charm.

## ✨ Features Demonstrated

- **🎨 Theme System** - 8 built-in themes with reactive switching
- **📢 Notifications** - Toast notifications with auto-dismiss
- **🧩 Modular Architecture** - Zero-dependency modules under 100 lines
- **🚀 Performance** - Optimized builds with Vite
- **♿ Accessibility** - WCAG compliant components
- **📱 Responsive** - Mobile-first design

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

```
src/
├── components/          # Reusable UI components
│   ├── Counter.tsx     # Reactive state demo
│   ├── NotificationDemo.tsx  # Notification system demo
│   └── ThemeSelector.tsx     # Theme switching demo
├── styles/             # CSS modules and themes
│   ├── app.css        # Main application styles
│   ├── components.css # Component-specific styles
│   └── themes.css     # Theme system styles
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
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
import { useTheme } from '@reynard/core';

const { theme, setTheme, nextTheme } = useTheme();
setTheme('dark');
```

## 📢 Notifications

Send toast notifications with the notification system:

```tsx
import { useNotifications } from '@reynard/core';

const { notify } = useNotifications();

notify('Success message!', 'success');
notify('Error occurred', 'error', { duration: 0 }); // No auto-dismiss
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test:coverage
```

## 🎯 Next Steps

1. **Add Routing** - Install `@solidjs/router` for navigation
2. **Add State Management** - Use SolidJS stores for complex state
3. **Add API Layer** - Create services for data fetching
4. **Add More Components** - Build your component library
5. **Customize Themes** - Create your own theme variants

## 📚 Learn More

- [Reynard Documentation](../../../docs)
- [SolidJS Documentation](https://solidjs.com)
- [Vite Documentation](https://vitejs.dev)

## 🤝 Contributing

Found a bug or have a suggestion? Please open an issue!

---

*Built with ❤️ using the Reynard framework* 🦊
