# reynard-monaco

Monaco code editor and text editing components for Reynard, built with SolidJS.

## Features

- **Monaco Editor Integration**: Full Monaco Editor support with syntax highlighting
- **Shiki Integration**: Enhanced syntax highlighting with Shiki
- **Language Detection**: Automatic detection of programming and natural languages
- **Theme Support**: Dark, light, and custom theme support
- **TypeScript Support**: Full TypeScript definitions included
- **Accessible**: Built with accessibility in mind

## Installation

```bash
npm install reynard-monaco
```

## Usage

### Basic Code Editor

```tsx
import { CodeEditor } from "reynard-monaco";

function App() {
  const [code, setCode] = createSignal('console.log("Hello, World!");');

  return <CodeEditor value={code()} language="javascript" theme="dark" onChange={setCode} height="400px" />;
}
```

### With Language Detection

```tsx
import { CodeEditor, useLanguageDetection } from "reynard-monaco";

function App() {
  const [code, setCode] = createSignal('def hello_world():\n    print("Hello, World!")');
  const languageDetection = useLanguageDetection();

  return (
    <CodeEditor
      value={code()}
      onChange={setCode}
      height="400px"
      // Language will be auto-detected
    />
  );
}
```

### With Shiki Integration

```tsx
import { CodeEditor, useMonacoShiki } from "reynard-monaco";

function App() {
  const [code, setCode] = createSignal("const x = 42;");
  const monacoShiki = useMonacoShiki({
    theme: "github-dark",
    lang: "typescript",
    enableShikiHighlighting: true,
  });

  return <CodeEditor value={code()} language="typescript" onChange={setCode} height="400px" />;
}
```

## API Reference

### CodeEditor Props

| Prop              | Type                      | Default        | Description                 |
| ----------------- | ------------------------- | -------------- | --------------------------- |
| `value`           | `string`                  | `''`           | The code content            |
| `language`        | `string`                  | `'javascript'` | Programming language        |
| `theme`           | `string`                  | `'auto'`       | Editor theme                |
| `readOnly`        | `boolean`                 | `false`        | Whether editor is read-only |
| `onChange`        | `(value: string) => void` | -              | Change handler              |
| `onSave`          | `() => void`              | -              | Save handler                |
| `height`          | `string`                  | `'400px'`      | Editor height               |
| `width`           | `string`                  | `'100%'`       | Editor width                |
| `showLineNumbers` | `boolean`                 | `true`         | Show line numbers           |
| `showSearch`      | `boolean`                 | `false`        | Show search functionality   |
| `className`       | `string`                  | -              | Additional CSS class        |

### Composables

#### `useLanguageDetection()`

Provides language detection capabilities.

```tsx
const languageDetection = useLanguageDetection();

// Detect natural language
await languageDetection.detectNaturalLanguage("Hello, world!");

// Detect programming language from filename
const lang = languageDetection.detectProgrammingLanguageFromFile("app.js");
```

#### `useMonacoShiki(options)`

Provides Monaco-Shiki integration.

```tsx
const monacoShiki = useMonacoShiki({
  theme: "github-dark",
  lang: "typescript",
  enableShikiHighlighting: true,
});
```

#### `useShiki(options)`

Provides Shiki syntax highlighting.

```tsx
const shiki = useShiki({
  theme: "github-dark",
  lang: "typescript",
});
```

### Utilities

#### Language Utilities

```tsx
import { getMonacoLanguage, getLanguageDisplayName, isCodeFile, getLanguageInfo } from "reynard-monaco";

// Get Monaco language from file path
const lang = getMonacoLanguage("app.js"); // 'javascript'

// Get display name
const name = getLanguageDisplayName("app.js"); // 'JavaScript'

// Check if file is code
const isCode = isCodeFile("app.js"); // true

// Get complete language info
const info = getLanguageInfo("app.js");
// { monacoLanguage: 'javascript', displayName: 'JavaScript', isCode: true }
```

## Supported Languages

The package supports a wide range of programming languages including:

- JavaScript/TypeScript (JS, TS, JSX, TSX)
- Web Technologies (HTML, CSS, SCSS, SASS, Less)
- Programming Languages (Python, Java, C/C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin, Scala, R, Julia, MATLAB)
- Data Formats (SQL, JSON, XML, YAML, TOML)
- Documentation (Markdown)
- Shell Scripts (Bash, Zsh, Fish, PowerShell)
- Configuration Files (Dockerfile, Git configs, etc.)
- Build Systems (Make, CMake, Gradle, Maven, etc.)

## Theming

The package supports CSS custom properties for theming:

```css
:root {
  --bg-color: #ffffff;
  --secondary-bg: #f8f9fa;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --border-color: #e1e5e9;
  --accent: #007bff;
  --text-on-accent: #ffffff;
  --border-radius: 8px;
  --spacing: 12px;
  --half-spacing: 8px;
  --quarter-spacing: 4px;
  --font-size: 14px;
  --font-family-mono: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  --transition-duration: 0.2s;
  --transition-timing: ease;
  --hover-transform: translateY(-1px);
  --shadow-hover: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run type-check

# Linting
npm run lint
```

## License

MIT
