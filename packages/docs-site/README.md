# reynard-docs-site

> **Beautiful documentation site application for Reynard framework** 🦊

A complete documentation site built with Reynard itself, featuring beautiful design, interactive examples, and comprehensive API documentation.

## ✨ Features

### 🎯 **Core Features**

- **Beautiful Design**: Modern, responsive design with dark mode support
- **Interactive Examples**: Live code examples with editable playgrounds
- **API Documentation**: Comprehensive API docs with search and filtering
- **Search Functionality**: Full-text search across all documentation
- **Navigation**: Intuitive navigation with breadcrumbs and sidebar
- **Responsive**: Mobile-first design that works on all devices

### 🎨 **Design Features**

- **Theme System**: Seamless integration with Reynard's theming system
- **Dark Mode**: Automatic dark mode support
- **Custom Styling**: Customizable CSS variables and themes
- **Accessibility**: WCAG 2.1 compliant design
- **Performance**: Optimized for fast loading and smooth interactions

### 🔧 **Technical Features**

- **SolidJS**: Built with SolidJS for optimal performance
- **TypeScript**: Full TypeScript support with type safety
- **Vite**: Fast development and build process
- **Routing**: Client-side routing with Solid Router
- **State Management**: Reactive state management with SolidJS

## 📦 Installation

```bash
npm install reynard-docs-site
```

## 🚀 Quick Start

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Generate Documentation

```bash
# Generate documentation from packages
npm run generate-docs

# Watch for changes and regenerate
npm run generate-docs:watch
```

## 🏗️ Project Structure

```
src/
├── App.tsx                 # Main application component
├── App.css                 # Application styles
├── main.tsx                # Application entry point
├── index.css               # Global styles
├── pages/                  # Page components
│   ├── HomePage.tsx        # Home page
│   ├── PackagePage.tsx     # Package documentation
│   ├── ApiPage.tsx         # API documentation
│   ├── ExamplePage.tsx     # Code examples
│   ├── SearchPage.tsx      # Search page
│   └── NotFoundPage.tsx    # 404 page
└── test-setup.ts           # Test setup
```

## 🎨 Customization

### Themes

The documentation site integrates seamlessly with Reynard's theming system:

```typescript
import { useTheme } from 'reynard-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div class={`docs-component docs-component--${theme()}`}>
      <button onClick={() => setTheme(theme() === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### Custom Styles

Override CSS variables to customize the appearance:

```css
:root {
  --accent: #your-color;
  --bg-color: #your-bg;
  --text-primary: #your-text;
  /* ... other variables */
}
```

### Custom Components

Register custom components for documentation:

```typescript
import { createDocEngine } from 'reynard-docs-core';

const engine = createDocEngine({
  // ... other config
  customComponents: {
    'MyCustomComponent': MyCustomComponent,
    'InteractiveDemo': InteractiveDemo
  }
});
```

## 📱 Responsive Design

The documentation site is built with a mobile-first approach:

- **Mobile**: Optimized for touch interactions and small screens
- **Tablet**: Adapted layout for medium screens
- **Desktop**: Full-featured experience for large screens

## 🔍 Search Integration

The site includes comprehensive search functionality:

- **Full-text search** across all documentation
- **API search** for functions, classes, and types
- **Example search** for code examples
- **Tag-based filtering** for categorized content

## 🎯 Performance

The documentation site is optimized for performance:

- **Code splitting** for faster initial load
- **Lazy loading** for images and components
- **Optimized bundles** with tree shaking
- **Service worker** for offline support (optional)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Bundle Size

- **Initial bundle**: ~150 kB (gzipped)
- **Total bundle**: ~300 kB (gzipped)
- **Runtime**: ~50 kB (gzipped)

## 🚀 Deployment

### Static Hosting

The documentation site can be deployed to any static hosting service:

```bash
# Build the site
npm run build

# Deploy to your hosting service
# The dist/ folder contains all the files needed
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### CI/CD

Example GitHub Actions workflow:

```yaml
name: Deploy Documentation

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
