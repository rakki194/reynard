# reynard-caption

Caption editing UI components for Reynard applications - provides textarea and tag bubbles for caption editing with a modern, accessible interface.

## Features

- **TagBubble Component**: Interactive tag bubbles with editing, removal, and navigation capabilities
- **CaptionInput Component**: Comprehensive caption input with support for different caption types
- **Tag Management**: Utilities for tag parsing, validation, and autocomplete
- **Accessibility**: Full keyboard navigation and screen reader support
- **Theming**: Support for light/dark modes and high contrast
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install reynard-caption
```

## Quick Start

```typescript
import { TagBubble, CaptionInput, CaptionType } from 'reynard-caption';

// Basic tag bubble
const MyTagBubble = () => {
  const [tag, setTag] = createSignal('furry');
  
  return (
    <TagBubble
      tag={tag()}
      index={0}
      onEdit={(newTag) => setTag(newTag)}
      onRemove={() => setTag('')}
      editable={true}
      removable={true}
    />
  );
};

// Caption input with different types
const MyCaptionInput = () => {
  const [caption, setCaption] = createSignal({
    type: CaptionType.TAGS,
    content: 'furry, anthro, digital art'
  });
  
  return (
    <CaptionInput
      caption={caption()}
      state="expanded"
      onClick={() => {}}
      onCaptionChange={setCaption}
      onSave={(caption) => console.log('Saved:', caption)}
      placeholder="Enter tags..."
    />
  );
};
```

## API Reference

### TagBubble

A component that renders an individual tag with editing and navigation capabilities.

#### Props

```typescript
interface TagBubbleProps {
  tag: string;                    // The tag text to display
  index: number;                  // The index of the tag in the list
  onRemove: () => void;           // Callback when tag is removed
  onEdit: (newTag: string) => void; // Callback when tag is edited
  onNavigate?: (direction: 'left' | 'right' | 'up' | 'down' | 'start' | 'end') => void;
  editable?: boolean;             // Whether the tag can be edited (default: true)
  removable?: boolean;            // Whether the tag can be removed (default: true)
  color?: string;                 // Custom color for the tag
  size?: 'small' | 'medium' | 'large'; // Size of the tag bubble (default: 'medium')
}
```

#### Usage

```typescript
<TagBubble
  tag="furry"
  index={0}
  onEdit={(newTag) => console.log('Edited to:', newTag)}
  onRemove={() => console.log('Removed')}
  onNavigate={(direction) => console.log('Navigate:', direction)}
  editable={true}
  removable={true}
  size="medium"
/>
```

### CaptionInput

A comprehensive caption input component that supports different caption types.

#### Props

```typescript
interface CaptionInputProps {
  caption: CaptionData;           // The caption data
  state: 'expanded' | 'collapsed' | null; // Current state
  onClick: () => void;            // Click handler
  shouldAutoFocus?: boolean;      // Whether to auto-focus (default: false)
  imageInfo?: ImageInfo;          // Optional image information
  onCaptionChange: (caption: CaptionData) => void; // Caption change handler
  onSave?: (caption: CaptionData) => void; // Save handler
  onCancel?: () => void;          // Cancel handler
  placeholder?: string;           // Placeholder text
  maxLength?: number;             // Maximum length
  disabled?: boolean;             // Whether disabled (default: false)
  readonly?: boolean;             // Whether readonly (default: false)
}
```

#### Usage

```typescript
<CaptionInput
  caption={{ type: CaptionType.TAGS, content: 'furry, anthro' }}
  state="expanded"
  onClick={() => setExpanded(true)}
  onCaptionChange={(caption) => setCaption(caption)}
  onSave={(caption) => saveCaption(caption)}
  onCancel={() => setExpanded(false)}
  placeholder="Enter tags..."
  maxLength={1000}
/>
```

## Types

### CaptionData

```typescript
interface CaptionData {
  type: CaptionType;
  content: string;
}
```

### CaptionType

```typescript
enum CaptionType {
  CAPTION = 'caption',
  TAGS = 'tags',
  E621 = 'e621',
  TOML = 'toml'
}
```

## Utilities

### Tag Utilities

```typescript
import { splitAndCleanTags, validateTag, formatTags } from 'reynard-caption';

// Split comma-separated tags
const tags = splitAndCleanTags('furry, anthro, digital art');
// Result: ['furry', 'anthro', 'digital art']

// Validate a tag
const isValid = validateTag('furry');
// Result: true

// Format tags array to string
const tagString = formatTags(['furry', 'anthro']);
// Result: 'furry, anthro'
```

### Tag Colors

```typescript
import { createTagColorGenerator, getTagColor } from 'reynard-caption';

// Create a color generator
const generator = createTagColorGenerator();
const color = generator.getColor('furry');
// Result: { background: '#e3f2fd', text: '#1976d2', border: '#bbdefb' }

// Get color for a single tag
const color = getTagColor('anthro');
```

### Tag Autocomplete

```typescript
import { useTagAutocomplete, createTagAutocompleteManager } from 'reynard-caption';

// Use in a component
const MyComponent = () => {
  const autocomplete = useTagAutocomplete();
  
  return (
    <div>
      <input
        value={autocomplete.query()}
        onInput={(e) => autocomplete.setQuery(e.target.value)}
      />
      {autocomplete.isOpen() && (
        <div>
          {autocomplete.suggestions().map((suggestion, index) => (
            <div
              class={index === autocomplete.selectedIndex() ? 'selected' : ''}
              onClick={() => autocomplete.setQuery(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Advanced Usage

### Custom Tag Colors

```typescript
import { TagColorGenerator } from 'reynard-caption';

const customGenerator = new TagColorGenerator();
// Add custom colors
customGenerator.colors.push({
  background: '#ffebee',
  text: '#c62828',
  border: '#ffcdd2'
});

const color = customGenerator.getColor('custom-tag');
```

### Tag Validation

```typescript
import { validateTag, cleanTag } from 'reynard-caption';

const validateAndCleanTag = (tag: string) => {
  const cleaned = cleanTag(tag);
  if (validateTag(cleaned)) {
    return cleaned;
  }
  throw new Error('Invalid tag');
};
```

### Keyboard Navigation

The components support full keyboard navigation:

- **Tab**: Navigate between elements
- **Enter**: Edit tag or save caption
- **Escape**: Cancel editing or close suggestions
- **Arrow Keys**: Navigate suggestions or between tags
- **Backspace/Delete**: Remove tag when empty
- **Ctrl+S**: Save caption
- **Ctrl+Z**: Undo (when implemented)

### Accessibility

The components are built with accessibility in mind:

- Full keyboard navigation support
- ARIA labels and roles
- Screen reader friendly
- High contrast mode support
- Reduced motion support

### Theming

The components support CSS custom properties for theming:

```css
.tag-bubble {
  --tag-color: #e3f2fd;
  --tag-text-color: #1976d2;
  --tag-border-color: #bbdefb;
}
```

## License

MIT
