# Reynard Comprehensive Dashboard

A complete showcase of all Reynard framework components and features, demonstrating how to build a modern, fully-featured dashboard application with SolidJS.

## Features Demonstrated

### 🎨 All Reynard Packages
- **@reynard/core** - Theme management, i18n, notifications, utilities
- **@reynard/components** - Primitive UI components (Button, Card, TextField, etc.)
- **@reynard/ui** - Advanced components (AppLayout, DataTable, Drawer, etc.)
- **@reynard/charts** - Data visualization with Chart.js integration
- **@reynard/gallery** - File and media management system
- **@reynard/auth** - Authentication with JWT and password strength
- **@reynard/settings** - Comprehensive settings management

### 🌍 Internationalization
- Multi-language support with reactive translations
- Dynamic language switching without page refresh
- Comprehensive translation coverage for all components

### 🎭 Theming System
- 8 built-in themes including high contrast options
- Real-time theme switching
- Persistent theme preferences

### 📊 Dashboard Pages
1. **Dashboard** - Overview with stats, quick actions, and recent activity
2. **Charts** - Interactive data visualization showcase
3. **Components** - Complete component library demonstration
4. **Gallery** - File management and media gallery
5. **Authentication** - Login/register forms and user management
6. **Settings** - Comprehensive settings panel with all options

### 🎯 Key Features
- **Responsive Design** - Works on mobile, tablet, and desktop
- **Dark/Light Themes** - Multiple theme options with accessibility support
- **Real-time Updates** - Reactive state management with SolidJS
- **Type Safety** - Full TypeScript coverage
- **Testing Ready** - Configured with Vitest and testing utilities
- **Performance** - Optimized builds with Vite
- **Accessibility** - ARIA labels, keyboard navigation, screen reader support

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run typecheck
```

### Development

The dashboard runs on `http://localhost:5173` by default.

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Main header with navigation
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── ThemeSelector.tsx
│   ├── LanguageSelector.tsx
│   └── NotificationCenter.tsx
├── pages/              # Route components
│   ├── Dashboard.tsx   # Main dashboard page
│   ├── Charts.tsx      # Data visualization showcase
│   ├── Components.tsx  # Component library demo
│   ├── Gallery.tsx     # File management interface
│   ├── Auth.tsx        # Authentication flows
│   └── Settings.tsx    # Settings management
├── settings/           # Settings configuration
│   └── schema.ts       # Settings schema definition
├── utils/              # Utility functions
│   └── translations.ts # Translation loading
├── translations/       # Language files
│   └── en.ts          # English translations
├── App.tsx            # Main app component with routing
├── index.tsx          # Application entry point
└── styles.css         # Global styles and utilities
```

### Key Implementation Patterns

#### 1. Reactive State Management
```tsx
// Theme switching with persistence
const { theme, setTheme } = useTheme();
createEffect(() => {
  localStorage.setItem('theme', theme().name);
});
```

#### 2. Internationalization
```tsx
// Reactive translations
const { t, locale, setLocale } = useI18n();
const [translations] = createResource(() => locale(), loadTranslations);
```

#### 3. Settings Integration
```tsx
// Settings with schema validation
const settings = useSettings({
  schema: appSettingsSchema,
  storageKey: 'reynard-dashboard-settings',
  autoSave: true
});
```

#### 4. Authentication Flow
```tsx
// JWT-based authentication
const { user, login, logout, isLoading } = useAuth();
```

#### 5. File Management
```tsx
// Gallery with upload and navigation
const galleryState = useGalleryState({
  items: mediaItems(),
  onNavigate: setCurrentPath,
  onSelect: handleSelection
});
```

### Customization

#### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation in `Sidebar.tsx`
4. Add translations

#### Extending Settings
1. Update `src/settings/schema.ts`
2. Add UI controls in `Settings.tsx`
3. Add translations for new settings

#### Custom Themes
1. Define theme in `@reynard/core/themes`
2. Update theme selector components
3. Add CSS custom properties

### Production Deployment

```bash
# Build optimized bundle
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Performance Considerations

- **Code Splitting** - Routes are lazily loaded
- **Tree Shaking** - Unused code is eliminated
- **Asset Optimization** - Images and other assets are optimized
- **Reactive Updates** - Only affected components re-render
- **Local Storage** - Settings and preferences are cached

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Contributing

This example serves as both a showcase and a template. Feel free to:
- Add new component demonstrations
- Extend the settings schema
- Add more chart types
- Implement additional authentication methods
- Enhance the gallery features

### License

MIT License - see the main Reynard repository for details.
