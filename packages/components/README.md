# reynard-components

Production-ready SolidJS component library with comprehensive theming and accessibility support.

## 🚀 Features

- **🎨 Theme Integration**: Seamlessly works with Reynard's theming system
- **♿ Accessibility**: Full ARIA support and keyboard navigation
- **📱 Responsive**: Mobile-first design with responsive breakpoints
- **🎯 TypeScript**: Complete type safety with excellent IntelliSense
- **⚡ Performance**: Optimized for SolidJS's fine-grained reactivity
- **🧪 Tested**: Comprehensive test coverage with Vitest
- **📦 Modular**: Import only what you need

## 📦 Installation

```bash
pnpm install reynard-components reynard-core solid-js
```

## 🎯 Quick Start

```tsx
import { Button, Card, TextField } from "reynard-components";
import "reynard-components/styles";

function App() {
  return (
    <Card padding="lg">
      <TextField label="Email" type="email" placeholder="Enter your email" />
      <Button variant="primary" fullWidth>
        Sign Up
      </Button>
    </Card>
  );
}
```

## 📚 Components

### Primitives

#### Button

Versatile button component with multiple variants and states.

```tsx
<Button variant="primary" size="lg" loading>
  Submit
</Button>

<Button variant="secondary" leftIcon={<Icon />}>
  With Icon
</Button>

<Button variant="danger" iconOnly>
  <DeleteIcon />
</Button>
```

> _Props:_

- `variant`: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean
- `iconOnly`: boolean
- `leftIcon`, `rightIcon`: JSX.Element

#### Card

Flexible container component with consistent styling.

```tsx
<Card variant="elevated" padding="lg" header={<h3>Card Title</h3>} footer={<Button>Action</Button>}>
  Card content goes here
</Card>
```

> _Props:_

- `variant`: 'default' | 'elevated' | 'outlined' | 'filled'
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `interactive`: boolean
- `selected`: boolean
- `header`, `footer`: JSX.Element

#### TextField

Flexible text input with validation and styling.

```tsx
<TextField
  label="Full Name"
  placeholder="Enter your name"
  error={hasError}
  errorMessage="This field is required"
  leftIcon={<UserIcon />}
  required
/>
```

> _Props:_

- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `error`: boolean
- `errorMessage`, `helperText`: string
- `label`: string
- `required`: boolean
- `leftIcon`, `rightIcon`: JSX.Element
- `fullWidth`: boolean
- `loading`: boolean

#### Select

Dropdown select component with options support.

```tsx
<Select
  label="Country"
  placeholder="Choose a country"
  options={[
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
  ]}
/>
```

> _Props:_

- `variant`: 'default' | 'filled' | 'outlined'
- `size`: 'sm' | 'md' | 'lg'
- `options`: SelectOption[]
- `placeholder`: string
- All TextField props except `type`

### Composite Components

#### Modal

Flexible modal dialog with backdrop and animations.

```tsx
const [isOpen, setIsOpen] = createSignal(false);

<Modal open={isOpen()} onClose={() => setIsOpen(false)} title="Confirm Action" size="md">
  <p>Are you sure you want to continue?</p>
  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </div>
</Modal>;
```

> _Props:_

- `open`: boolean
- `onClose`: () => void
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `title`: JSX.Element
- `showCloseButton`: boolean
- `closeOnBackdrop`, `closeOnEscape`: boolean

#### Tabs

Tab navigation with keyboard support and accessibility.

```tsx
const [activeTab, setActiveTab] = createSignal("tab1");

const tabs = [
  { id: "tab1", label: "Overview", icon: <OverviewIcon /> },
  { id: "tab2", label: "Settings", badge: 3 },
  { id: "tab3", label: "Help" },
];

<Tabs items={tabs} activeTab={activeTab()} onTabChange={setActiveTab} variant="pills">
  <TabPanel tabId="tab1" activeTab={activeTab()}>
    <h3>Overview Content</h3>
  </TabPanel>
  <TabPanel tabId="tab2" activeTab={activeTab()}>
    <h3>Settings Content</h3>
  </TabPanel>
  <TabPanel tabId="tab3" activeTab={activeTab()}>
    <h3>Help Content</h3>
  </TabPanel>
</Tabs>;
```

> _Props:_

- `items`: TabItem[]
- `activeTab`: string
- `onTabChange`: (tabId: string) => void
- `variant`: 'default' | 'pills' | 'underline'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean

## 🎨 Theming

Components automatically adapt to your theme using CSS custom properties:

```css
:root {
  --accent: hsl(270deg 60% 60%);
  --bg-color: hsl(220deg 20% 95%);
  --card-bg: hsl(220deg 15% 85%);
  --text-primary: hsl(240deg 15% 12%);
  --text-secondary: hsl(240deg 10% 45%);
  --border-color: hsl(220deg 15% 75%);
  /* ... */
}
```

Works seamlessly with `reynard-themes` theme system:

```tsx
import { useTheme } from "reynard-themes";

function ThemedComponent() {
  const { theme, setTheme } = useTheme();

  return <Button onClick={() => setTheme("dark")}>Current theme: {theme}</Button>;
}
```

## ♿ Accessibility

All components follow WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Visible focus indicators
- **Color Contrast**: Meets AA standards
- **Semantic HTML**: Proper element usage

## 📦 Bundle Size

- **Core components**: ~12 kB (gzipped)
- **Styles**: ~8 kB (gzipped)
- **Tree-shakable**: Import only what you use

## 🧪 Testing

```bash
pnpm test        # Run tests
pnpm test:coverage  # Coverage report
pnpm test:ui     # Visual test runner
```

### Chat System

Complete streaming chat messaging system with AI assistant support.

```tsx
import { ChatContainer } from "reynard-components";

<ChatContainer
  endpoint="/api/chat"
  height="600px"
  config={{
    enableThinking: true,
    enableTools: true,
    showTimestamps: true,
  }}
  onMessageSent={message => console.log("Sent:", message)}
  onMessageReceived={message => console.log("Received:", message)}
/>;
```

> _Features:_

- **Real-time Streaming**: Advanced streaming text processing with real-time markdown rendering
- **Thinking Sections**: Support for AI assistant thinking process visualization
- **Tool Integration**: Complete tool calling system with progress tracking
- **Markdown Parsing**: Full markdown support including tables, code blocks, and math
- **Accessibility**: Full WCAG 2.1 compliance with keyboard navigation
- **Responsive Design**: Mobile-first with adaptive layouts
- **Dark Mode**: Built-in dark mode support

[📖 Chat Package Documentation](../chat/README.md)

## 🤝 Contributing

See the main [Reynard repository](../../README.md) for contribution guidelines.

---

**Built with ❤️ using SolidJS and modern web standards** 🦊
