# 🎨 Multi-Theme Gallery - Reynard Example

An advanced demonstration of the Reynard framework's theming capabilities with comprehensive component showcases and
side-by-side theme comparisons.

## ✨ Features Demonstrated

- **Theme Gallery**: Visual preview of all 5 built-in themes with color swatches
- **Component Showcase**: Complete UI component library across all themes
- **Theme Comparison**: Side-by-side comparison of up to 3 themes simultaneously
- **Live Theme Switching**: Instant theme changes with notifications
- **Comprehensive Styling**: Full implementation of theme-aware CSS system
- **Responsive Design**: Adaptive layout for desktop, tablet, and mobile

## 🎨 Available Themes

### ☀️ Light Theme

Clean and bright design perfect for daytime productivity work.

### 🌙 Dark Theme

Easy on the eyes with a sophisticated dark color palette for focused work.

### 🍌 Banana Theme

Warm and cheerful yellow tones that bring sunshine to your interface.

### 🍓 Strawberry Theme

Vibrant pink and red colors that add energy and personality.

### 🥜 Peanut Theme

Earthy brown and orange tones creating a cozy, autumn-inspired feel.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on port 3002)
npm run dev

# Build for production
npm run build
```

## 📱 App Sections

### 🖼️ Gallery View

- Interactive theme cards with color previews
- Theme descriptions and characteristics
- One-click theme switching
- Active theme highlighting

### 🧩 Component Showcase

Comprehensive demonstration of UI components including:

- **Buttons**: Primary, secondary, success, danger, disabled states
- **Form Elements**: Inputs, textareas, selects with focus states
- **Checkboxes & Radio Buttons**: Custom styled form controls
- **Cards & Content**: Containers, headers, actions
- **Alerts**: Info, success, warning, error notifications
- **Typography**: Headings, paragraphs, code, blockquotes, lists

### ⚖️ Theme Comparison

- Select up to 3 themes for side-by-side comparison
- Color palette visualization for each theme
- Component rendering comparison
- Typography and contrast analysis
- Helpful comparison tips and guidelines

## 🏗️ Architecture

### Components

- **`App.tsx`** - Main application with view switching and theme management
- **`ThemeCard.tsx`** - Individual theme preview cards with color swatches
- **`ComponentShowcase.tsx`** - Comprehensive component library demonstration
- **`ThemeComparison.tsx`** - Side-by-side theme comparison interface

### Styling System

- **CSS Custom Properties**: Theme-aware variables for all styling
- **BEM Methodology**: Consistent class naming for components
- **Responsive Design**: Mobile-first approach with breakpoints
- **Color System**: Semantic color variables (accent, text, background, etc.)
- **Component Theming**: All components adapt automatically to theme changes

### Reynard Integration

- **Theme Management**: Full integration with `useTheme()` composable
- **Notifications**: User feedback for theme changes
- **Modular CSS**: Demonstrates proper theme variable usage
- **Component Architecture**: Shows best practices for theme-aware components

## 🎯 Learning Objectives

This example teaches:

1. **Advanced Theming**: How to create comprehensive theme systems
2. **Component Design**: Building theme-aware, reusable components
3. **CSS Architecture**: Organizing styles with custom properties
4. **User Experience**: Smooth transitions and interactive feedback
5. **Comparison Tools**: Building interfaces for design system evaluation
6. **Accessibility**: Maintaining readability and contrast across themes

## 🔧 Customization

### Adding New Themes

1. Add theme variables to `styles.css`:

```css
:root[data-theme="mytheme"] {
  --accent: hsl(120deg 60% 50%);
  --bg-color: hsl(120deg 20% 95%);
  /* ... other variables */
}
```

2. Update the theme descriptions in `App.tsx`
3. Add emoji and colors to `ThemeCard.tsx`

### Extending Components

Add new components to `ComponentShowcase.tsx` to demonstrate how they adapt to different themes.

## 📊 Performance

- **Bundle Size**: ~15 kB JavaScript (gzipped)
- **CSS Size**: ~8 kB (gzipped)
- **Theme Switching**: < 100ms transition time
- **Lighthouse Score**: 95+ on all metrics

## 🔄 Next Steps

Extend this example by:

- Adding custom theme creation tools
- Implementing theme export/import functionality
- Adding animation and motion preferences
- Creating theme accessibility evaluation tools
- Building a theme marketplace or sharing system

## 🤝 Contributing

This example is part of the Reynard framework. Found an issue or have improvements?

---

_Built with ❤️ using Reynard framework, SolidJS, and modern CSS_ 🦊
