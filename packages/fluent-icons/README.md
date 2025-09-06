# @reynard/fluent-icons

A comprehensive icon system for Reynard applications, featuring Fluent UI icons and custom SVG assets with a powerful registry system.

## Features

### 🎯 Icon System

- **Fluent UI Icons**: 150+ professionally designed icons from Microsoft's Fluent Design System
- **Custom Icons**: Reynard-specific icons including the official favicon
- **Modular Categories**: Icons organized by purpose (actions, navigation, files, etc.)
- **Dynamic Loading**: Icons loaded on-demand for optimal performance
- **TypeScript Support**: Full type safety with autocomplete for icon names

### 🔧 Registry System

- **Icon Registry**: Centralized management of icon packages
- **Metadata Support**: Rich metadata for each icon (categories, tags, descriptions)
- **Package System**: Support for multiple icon packages
- **Dynamic Registration**: Register new icon packages at runtime

### 🤖 AI/LLM Integration

- **Natural Language Captions**: Every icon includes a descriptive caption for AI understanding
- **Semantic Search**: Search icons using natural language queries
- **Caption Utilities**: Tools for generating, validating, and managing icon captions
- **LLM-Friendly Export**: Export captions in formats optimized for language models

### 📦 Categories

- **Actions**: Common actions (save, delete, edit, etc.)
- **Navigation**: UI navigation (home, back, forward, etc.)
- **Files**: File operations (upload, download, folder, etc.)
- **Status**: Status indicators (success, error, warning, etc.)
- **Media**: Media controls (play, pause, volume, etc.)
- **Interface**: UI elements (menu, settings, search, etc.)
- **Development**: Developer tools (code, debug, build, etc.)
- **Theme**: Theme-related icons (light, dark, color, etc.)
- **Animals**: Animal icons (including Reynard's fox)
- **Security**: Security-related icons (lock, shield, key, etc.)
- **Custom**: Reynard-specific custom icons

## Installation

```bash
npm install @reynard/fluent-icons
```

## Quick Start

### Basic Usage

```tsx
import { fluentIconsPackage, getIcon } from "@reynard/fluent-icons";

function MyComponent() {
  const saveIcon = getIcon("save");

  return (
    <button>
      <span innerHTML={saveIcon}></span>
      Save
    </button>
  );
}
```

### Using Icon Categories

```tsx
import { actionsIcons, navigationIcons } from "@reynard/fluent-icons";

function ActionButtons() {
  return (
    <div>
      <button innerHTML={actionsIcons.save}></button>
      <button innerHTML={actionsIcons.delete}></button>
      <button innerHTML={navigationIcons.home}></button>
    </div>
  );
}
```

### Dynamic Icon Rendering

```tsx
import { fluentIconsPackage, getIconMetadata } from "@reynard/fluent-icons";

function IconButton({ iconName }: { iconName: string }) {
  const iconSvg = getIcon(iconName);
  const metadata = getIconMetadata(iconName);

  return (
    <button title={metadata?.description}>
      <span innerHTML={iconSvg}></span>
    </button>
  );
}
```

## API Reference

### Core Functions

#### getIcon(name: string): string

Retrieves the SVG content for an icon by name.

```tsx
const saveIcon = getIcon("save");
// Returns: '<svg>...</svg>'
```

#### getIconMetadata(name: string): IconMetadata | undefined

Retrieves metadata for an icon.

```tsx
const metadata = getIconMetadata("save");
// Returns: { name: 'save', category: 'actions', description: 'Save document' }
```

#### registerIconPackage(pkg: IconPackage): void

Registers a new icon package.

```tsx
import { registerIconPackage } from "@reynard/fluent-icons";

registerIconPackage({
  name: "custom-icons",
  getIcon: (name) => customIcons[name],
  getIconMetadata: (name) => customMetadata[name],
  getAllIcons: () => Object.keys(customIcons),
});
```

### Icon Categories

Each category exports an object with icon names as keys and SVG content as values:

```tsx
import {
  actionsIcons,
  navigationIcons,
  filesIcons,
  statusIcons,
  mediaIcons,
  interfaceIcons,
  developmentIcons,
  themeIcons,
  animalsIcons,
  securityIcons,
  customIcons,
} from "@reynard/fluent-icons";
```

### Icon Registry

#### IconPackage Interface

```tsx
interface IconPackage {
  name: string;
  getIcon: (name: string) => string | undefined;
  getIconMetadata?: (name: string) => IconMetadata | undefined;
  getAllIcons?: () => string[];
}
```

#### IconMetadata Interface

```tsx
interface IconMetadata {
  name: string;
  category: string;
  description?: string;
  caption?: string;  // Natural language caption for AI/LLM understanding
  tags?: string[];
  keywords?: string[];
}
```

## Natural Language Captions

Every icon in the Reynard icon system includes a natural language caption designed to help AI and language models understand the icon's purpose and appearance. This makes it easier for AI systems to select appropriate icons for user interfaces.

### Using Captions

```tsx
import { getIcon, getAllCaptions, searchIconsByCaption } from "@reynard/fluent-icons";

// Get an icon's caption
const saveIcon = getIcon("save");
const metadata = fluentIconsPackage.getIconMetadata("save");
console.log(metadata?.caption); // "A floppy disk icon for saving documents or data to storage"

// Get all captions
const allCaptions = getAllCaptions(allIcons);
console.log(allCaptions["delete"]); // "A trash can icon for deleting or removing items permanently"

// Search icons by natural language
const results = searchIconsByCaption(allIcons, "save file");
// Returns icons with captions matching "save file" with relevance scores
```

### Caption Utilities

```tsx
import {
  generateCaption,
  validateCaption,
  suggestCaptionImprovements,
  exportCaptions
} from "@reynard/fluent-icons";

// Generate a caption for an icon without one
const caption = generateCaption(iconMetadata);

// Validate caption quality
const isValid = validateCaption(iconMetadata);

// Get suggestions for improving a caption
const suggestions = suggestCaptionImprovements(iconMetadata);

// Export all captions for AI training
const captionsJson = exportCaptions(allIcons, 'json');
const captionsMarkdown = exportCaptions(allIcons, 'markdown');
```

### Example Captions

- **save**: "A floppy disk icon for saving documents or data to storage"
- **delete**: "A trash can icon for deleting or removing items permanently"
- **search**: "A magnifying glass icon for searching, finding, or looking up content"
- **heart**: "A heart icon for love, favorites, emotional reactions, or affection"
- **brain**: "A brain icon representing artificial intelligence, machine learning, or cognitive computing"

## Available Icons

### Actions (25 icons)

- `save`, `delete`, `edit`, `copy`, `cut`, `paste`
- `undo`, `redo`, `refresh`, `reload`
- `add`, `remove`, `clear`, `reset`
- `submit`, `cancel`, `confirm`, `approve`
- `reject`, `archive`, `unarchive`, `restore`
- `duplicate`, `move`, `sort`, `filter`, `search`

### Navigation (20 icons)

- `home`, `back`, `forward`, `up`, `down`
- `left`, `right`, `menu`, `hamburger`
- `breadcrumb`, `pagination`, `tabs`
- `sidebar`, `panel`, `drawer`
- `modal`, `popup`, `tooltip`, `dropdown`
- `accordion`, `carousel`

### Files (18 icons)

- `file`, `folder`, `document`, `image`
- `video`, `audio`, `archive`, `pdf`
- `upload`, `download`, `share`, `link`
- `attachment`, `bookmark`, `favorite`
- `recent`, `history`, `trash`

### Status (15 icons)

- `success`, `error`, `warning`, `info`
- `loading`, `spinner`, `progress`
- `checkmark`, `cross`, `question`
- `alert`, `notification`, `badge`
- `indicator`, `status`, `health`

### Media (12 icons)

- `play`, `pause`, `stop`, `record`
- `volume`, `mute`, `fullscreen`
- `camera`, `microphone`, `speaker`
- `headphones`, `video-camera`

### Interface (20 icons)

- `settings`, `preferences`, `configuration`
- `user`, `profile`, `account`, `avatar`
- `login`, `logout`, `signin`, `signout`
- `help`, `support`, `documentation`
- `feedback`, `rating`, `review`
- `calendar`, `clock`, `timer`

### Development (10 icons)

- `code`, `debug`, `build`, `deploy`
- `git`, `github`, `terminal`, `console`
- `database`, `server`

### Theme (8 icons)

- `light`, `dark`, `color`, `palette`
- `contrast`, `accessibility`, `eye`, `visibility`

### Animals (5 icons)

- `fox` (Reynard's mascot), `cat`, `dog`, `bird`, `fish`

### Security (8 icons)

- `lock`, `unlock`, `shield`, `key`
- `password`, `security`, `privacy`, `encryption`

### Custom (3 icons)

- `yipyap` (Reynard's predecessor), `favicon` (Reynard logo), `reynard-logo`

## Usage Examples

### Icon Button Component

```tsx
import { getIcon, getIconMetadata } from "@reynard/fluent-icons";

interface IconButtonProps {
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

function IconButton({ icon, onClick, disabled }: IconButtonProps) {
  const iconSvg = getIcon(icon);
  const metadata = getIconMetadata(icon);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={metadata?.description}
      class="icon-button"
    >
      <span innerHTML={iconSvg}></span>
    </button>
  );
}
```

### Icon Grid Component

```tsx
import { allIcons, iconCategories } from "@reynard/fluent-icons";

function IconGrid() {
  return (
    <div class="icon-grid">
      {Object.entries(iconCategories).map(([category, icons]) => (
        <div class="category">
          <h3>{category}</h3>
          <div class="icons">
            {Object.entries(icons).map(([name, svg]) => (
              <div class="icon-item" title={name}>
                <span innerHTML={svg}></span>
                <span class="icon-name">{name}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Searchable Icon Picker

```tsx
import { allIcons, getIconMetadata } from "@reynard/fluent-icons";
import { createSignal, createMemo } from "solid-js";

function IconPicker() {
  const [searchTerm, setSearchTerm] = createSignal("");

  const filteredIcons = createMemo(() => {
    const term = searchTerm().toLowerCase();
    return Object.entries(allIcons).filter(([name, svg]) => {
      const metadata = getIconMetadata(name);
      return (
        name.toLowerCase().includes(term) ||
        metadata?.description?.toLowerCase().includes(term) ||
        metadata?.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    });
  });

  return (
    <div class="icon-picker">
      <input
        type="text"
        placeholder="Search icons..."
        value={searchTerm()}
        onInput={(e) => setSearchTerm(e.target.value)}
      />
      <div class="icon-list">
        {filteredIcons().map(([name, svg]) => (
          <div class="icon-option" onClick={() => selectIcon(name)}>
            <span innerHTML={svg}></span>
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Styling Icons

### CSS Classes

```css
.icon {
  width: 1em;
  height: 1em;
  display: inline-block;
  vertical-align: middle;
}

.icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
}

.icon-button:hover {
  background: var(--color-surface-hover);
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
}

.icon-item:hover {
  background: var(--color-surface-hover);
}
```

### Theme Integration

```css
/* Icons automatically inherit theme colors */
.icon {
  color: var(--color-text);
}

.icon-button:hover .icon {
  color: var(--color-primary);
}

/* High contrast support */
@media (prefers-contrast: high) {
  .icon {
    filter: contrast(1.5);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .icon-button {
    transition: none;
  }
}
```

## Performance Optimization

### Lazy Loading

```tsx
import { createMemo } from "solid-js";
import { getIcon } from "@reynard/fluent-icons";

function LazyIcon({ name }: { name: string }) {
  const iconSvg = createMemo(() => {
    // Only load icon when component is rendered
    return getIcon(name);
  });

  return <span innerHTML={iconSvg()}></span>;
}
```

### Icon Caching

The registry system automatically caches loaded icons for optimal performance.

### Bundle Optimization

```tsx
// Import only specific categories
import { actionsIcons } from "@reynard/fluent-icons";

// Or import individual icons
import { getIcon } from "@reynard/fluent-icons";
const saveIcon = getIcon("save");
```

## Custom Icon Development

### Adding Custom Icons

1. Create SVG files in the `src/custom-icons/` directory
2. Add icon definitions to `src/categories/custom.ts`
3. Update the icon metadata

```tsx
// src/categories/custom.ts
import customIconSvg from "../custom-icons/my-icon.svg?raw";

export const customIcons = {
  "my-icon": customIconSvg,
  // ... other custom icons
};
```

### Creating Icon Packages

```tsx
import { registerIconPackage } from "@reynard/fluent-icons";

const myIconPackage = {
  name: "my-package",
  getIcon: (name: string) => myIcons[name],
  getIconMetadata: (name: string) => myMetadata[name],
  getAllIcons: () => Object.keys(myIcons),
};

registerIconPackage(myIconPackage);
```

## Testing

The package includes comprehensive tests:

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage
npm run test:run      # Run once (CI mode)
```

### Test Categories

- **Registry Tests**: Icon package registration and management
- **Category Tests**: Icon categorization and organization
- **Integration Tests**: End-to-end functionality

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **SVG Support**: Required for icon rendering
- **ES2022**: Modern JavaScript features

## Migration from yipyap

If you're migrating from yipyap's icon system:

1. Replace `yipyap/icons` imports with `@reynard/fluent-icons`
2. Update icon names to match Fluent UI naming conventions
3. Use the new registry system for custom icons
4. Update CSS classes for icon styling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
