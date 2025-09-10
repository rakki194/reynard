# Adding New Settings

This document outlines the process of adding new settings to the Reynard
application.

## Table of Contents

---

- [Adding New Settings](#adding-new-settings)
  - [Table of Contents](#table-of-contents)
  - [Step-by-Step Guide](#step-by-step-guide)
    - [1. Update App Context](#1-update-app-context)
    - [2. Add to Store](#2-add-to-store)
    - [3. Add Persistence](#3-add-persistence)
    - [4. Add Getter and Setter](#4-add-getter-and-setter)
    - [5. Add Translation Types](#5-add-translation-types)
    - [6. Add UI Component](#6-add-ui-component)
    - [7. Add Translations](#7-add-translations)
  - [Best Practices](#best-practices)
    - [Type Safety](#type-safety)
    - [State Management](#state-management)
    - [Persistence](#persistence)
    - [UI/UX](#uiux)
    - [Translations](#translations)
  - [Testing](#testing)
    - [1. State Tests](#1-state-tests)
    - [2. UI Tests](#2-ui-tests)
    - [3. Translation Tests](#3-translation-tests)
  - [Architecture Overview](#architecture-overview)
  - [Local versus Server‑Backed Settings](#local-versus-serverbacked-settings)
  - [Storage Keys and Type Conventions](#storage-keys-and-type-conventions)
  - [UI Control Patterns](#ui-control-patterns)
  - [Translations and Types](#translations-and-types)
  - [Accessibility and RTL](#accessibility-and-rtl)
  - [Testing Guidance](#testing-guidance)
  - [Common Pitfalls](#common-pitfalls)

## Step-by-Step Guide

### 1. Update App Context

Add the setting to the `AppContext` interface in `/src/contexts/app.tsx`:

```typescript
export interface AppContext {
  // ... existing settings ...
  newSetting: boolean; // or appropriate type
  setNewSetting: (value: boolean) => void;
}
```

### 2. Add to Store

Add the setting to the store type and initial state in `createAppContext`:

```typescript
const [store, setStore] = createStaticStore<{
  // ... existing store properties ...
  newSetting: boolean;
}>({
  // ... existing initial values ...
  newSetting: localStorage.getItem("newSetting") === "true",
});
```

### 3. Add Persistence

Add a persistence effect to save the setting to localStorage:

```typescript
createRenderEffect(() =>
  localStorage.setItem("newSetting", store.newSetting.toString()),
);
```

### 4. Add Getter and Setter

Add the getter and setter to the returned app context:

```typescript
const appContext = {
  // ... existing context properties ...
  get newSetting() {
    return store.newSetting;
  },
  setNewSetting: (value: boolean) => setStore("newSetting", value),
};
```

### 5. Add Translation Types

Add the setting to the `SettingsTranslations` interface in `/src/i18n/types.ts`:

```typescript
export interface SettingsTranslations {
  // ... existing translations ...
  newSetting: string;
  newSettingTooltip?: string; // if tooltip is needed
}
```

### 6. Add UI Component

Add the setting UI to the Settings component in
`/src/components/Settings/Settings.tsx`:

```typescript
<div class="setting-item">
  <label class="tooltip-container">
    <input
      type="checkbox"
      checked={app.newSetting}
      onChange={(e) => app.setNewSetting(e.currentTarget.checked)}
    />
    {t('settings.newSetting')}
    <span class="tooltip">{t('settings.newSettingTooltip')}</span>
  </label>
</div>
```

### 7. Add Translations

Add translations for the setting in each language file in `/src/i18n/lang/`:

```typescript
settings: {
  // ... existing translations ...
  newSetting: "New Setting Name",
  newSettingTooltip: "Description of what the setting does",
}
```

## Best Practices

### Type Safety

Type safety is crucial when implementing settings. All settings should have
properly defined TypeScript types that accurately represent their possible
values and constraints. Interfaces need to be kept up to date as settings
evolve, with any changes properly documented. Type constraints should be clearly
documented to help other developers understand the valid ranges and formats for
setting values.

### State Management

When managing settings state, use consistent naming patterns that align with the
existing codebase. The store structure should be followed to maintain
consistency and predictability. State updates should be handled atomically to
prevent race conditions or invalid intermediate states. Consider any side
effects that may occur when settings change and handle them appropriately.

### Persistence

Settings persistence requires careful handling of localStorage. Missing or
invalid values should be gracefully handled with appropriate fallbacks. As
settings evolve, consider migration strategies for handling outdated stored
values. Regularly clean up old or deprecated settings to prevent localStorage
bloat. The persistence layer should be robust and handle edge cases gracefully.

### UI/UX

The settings interface should be thoughtfully designed with related settings
grouped together logically. Each setting needs a clear, descriptive label that
helps users understand its purpose. Tooltips should be added to provide
additional context and explanation where needed. Keyboard accessibility must be
considered to ensure all users can effectively navigate and modify settings.

### Translations

All settings must include translations for every supported language in the
application. Translation keys should be clear and descriptive to help maintain
the codebase. Include tooltip translations when additional context is needed.
Special consideration should be given to RTL languages to ensure proper display
and functionality of the settings interface in those language contexts.

## Testing

### 1. State Tests

```typescript
describe("Settings State", () => {
  it("should persist setting value", () => {
    const app = useAppContext();
    app.setNewSetting(true);
    expect(localStorage.getItem("newSetting")).toBe("true");
  });
});
```

### 2. UI Tests

```typescript
describe("Settings UI", () => {
  it("should update on change", () => {
    const { getByLabelText } = render(() => <Settings />);
    const checkbox = getByLabelText("New Setting Name");
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });
});
```

### 3. Translation Tests

```typescript
describe("Settings Translations", () => {
  it("should have all required keys", () => {
    const keys = ["newSetting", "newSettingTooltip"];
    keys.forEach((key) => {
      expect(translations.settings[key]).toBeDefined();
    });
  });
});
```

When adding new settings to the application, it's crucial to maintain
comprehensive documentation that reflects all changes. Every aspect of new
settings should be thoroughly tested to ensure reliability and proper
functionality. Backward compatibility must be carefully considered to prevent
disruption for existing users.

Always follow the established patterns in the codebase to maintain consistency
and make the code easier to understand for other developers. Settings should be
organized in a logical manner that makes sense to both developers and users.
Finally, consider the performance implications of any new settings, especially
those that might affect the application's responsiveness or resource usage.

## Architecture Overview

Settings in Reynard are managed in the global app context and, for some domains,
in dedicated modules. The primary source of truth for app-wide, theme, gallery,
and performance preferences is the app context in `src/contexts/app.tsx`. It
uses a static store created via `createStaticStore` and persists values to
`localStorage` using effects and targeted setter paths. For focused domains or
when you want to reuse a cohesive settings set independently of the app context,
implement them as a module in `src/modules`, as done in
`src/modules/settings.ts`. Modules encapsulate signals, provide typed getters
and setters, and persist values via `localStorage` inside setters for immediate
consistency.

In the UI, most settings are surfaced through
`src/components/Settings/Settings.tsx` and specialized panels in
`src/components/Settings/*Settings.tsx`. These panels read from the app context
or a module and call typed setters. Translations for labels and tooltips come
from `src/i18n`, with keys typed by `src/i18n/types.ts`.

## Local versus Server‑Backed Settings

Prefer local persistence in `localStorage` for device-specific UX preferences
such as toggles for animations, zoom, minimap, or visual thresholds. Use
server-backed persistence for user profile preferences that must follow a
signed-in user across devices or sessions. The codebase demonstrates
server-backed user settings in
`src/components/Settings/TTSAndCrawlSettings.tsx`, which interacts with
`/api/users/me/settings` using `useAuthFetch`.

When adding server-backed settings, read on initialization, optimistically
update UI state on change, and synchronize to the backend. Fall back gracefully
if the network fails and inform the user via the notification system. For
security and privacy, do not store secrets in `localStorage` and avoid
persisting tokens or sensitive configuration as a "setting".

## Storage Keys and Type Conventions

Use stable, descriptive camelCase keys for `localStorage`. Booleans must be
stored as the strings "true" or "false" to simplify strict equality checks.
Numbers should be converted with `parseInt` or `parseFloat` with sane defaults
if the key is missing. For structured settings, serialize with `JSON.stringify`
and deserialize with `JSON.parse`, guarding with try/catch and fallbacks.

If you change the representation of a setting, implement non-breaking reads with
a migration path. The app already includes a compatibility pattern for `locale`
that accepts either a plain string or a JSON payload and then writes back a
normalized value. Use a similar approach when evolving your settings.

```ts
// Example: tolerant read with fallback and normalization
const stored = localStorage.getItem("myNewSetting");
const value = (() => {
  if (!stored) return 0.5; // default
  try {
    return stored.startsWith("{")
      ? (JSON.parse(stored).value ?? 0.5)
      : parseFloat(stored);
  } catch {
    return 0.5;
  }
})();
// ... later, persist normalized representation
localStorage.setItem("myNewSetting", value.toString());
```

## UI Control Patterns

Use the shared UI components and patterns already employed in
`src/components/Settings/Settings.tsx` and its subpanels. For binary settings,
prefer the `Toggle` component with a translated label and optional tooltip. For
numeric ranges, use the `Slider` component with a clear label, units when
applicable, and live value feedback. For enumerations, use a select control
bound to a typed union value or an enum, with explicit mapping to human-readable
translation keys.

Bind controls directly to app context getters and setters for immediate
reactivity and persistence. Keep event handlers concise and only set the
specific setting being modified. Provide tooltips for non-obvious behaviors,
using translation keys typed by `SettingsTranslations`.

```tsx
// Example: boolean toggle
<Toggle
  checked={app.enableMinimap}
  onChange={(checked) => app.setEnableMinimap(checked)}
  title={t('settings.enableMinimap')}
/>
{t('settings.enableMinimap')}

// Example: numeric slider
<Slider
  value={app.thumbnailSize}
  min={64}
  max={512}
  step={16}
  onInput={(size) => app.setThumbnailSize(size)}
/>
<span>{t('settings.thumbnailSize')}</span>
```

Follow accessibility practices described below. Do not rely on CSS `!important`,
and respect theme variables defined in `src/themes.css` and global styles in
`src/styles.css` for consistent theming.

## Translations and Types

All settings labels and tooltips must be represented in `SettingsTranslations`
in `src/i18n/types.ts` so that language files remain type-safe. Add your new
keys there first, then add corresponding entries to each language file in
`src/i18n/lang/*.ts` under the `settings` section. For grouped settings, prefer
nested objects (as used for `tagSuggestions`) to keep related translations
together and discoverable. Access translations via the `useTranslations`
composable or the app context's translator, and avoid hard-coded strings in UI.

```ts
// types.ts
export interface SettingsTranslations {
  // existing keys
  myNewSetting: string;
  myNewSettingTooltip?: string;
}

// en.ts (and other languages)
export default {
  settings: {
    myNewSetting: "My new setting",
    myNewSettingTooltip: "Explains what this setting does.",
  },
} satisfies Translations;
```

## Accessibility and RTL

The settings UI must be navigable with a keyboard and screen readers. Associate
controls with labels using `<label>` and ensure `Toggle`, `Slider`, and selects
expose appropriate roles and states. Provide ARIA labels only when a visible
label is not sufficient. Respect right-to-left languages by leveraging the
existing `rtl` class logic in `Settings.tsx`, which derives from the active
locale. Ensure focus states are visible with theme-aware styling, and avoid
capturing scroll or keyboard events in ways that impede navigation.

## Testing Guidance

Unit test state persistence by setting a value through the setter and verifying
`localStorage` writes. Test UI behavior by rendering the relevant settings
panel, interacting with controls, and asserting reactive updates. Validate
translations by asserting the presence of required keys in
`translations.settings` across languages. For server-backed settings, mock
`useAuthFetch` and test optimistic UI updates and error paths, verifying that
failure surfaces a notification and state is rolled back or reconciled on the
next fetch.

```ts
// Example: UI test for a toggle
const { getByLabelText } = render(() => <Settings onClose={() => {}} />);
const toggle = getByLabelText('My new setting');
fireEvent.click(toggle);
expect(toggle).toBeChecked();
expect(localStorage.getItem('myNewSetting')).toBe('true');
```

## Common Pitfalls

Do not treat authentication tokens or secrets as settings; never persist them
alongside UI preferences. Always provide defaults when reading from
`localStorage`, and avoid throwing during JSON parsing. When evolving a
setting's schema, read old formats and normalize to the new representation
before writing. Ensure enumeration values map to stable storage strings to avoid
breaking changes. Consider server synchronization only when the preference must
follow the user across devices; otherwise, prefer local-only storage to reduce
backend coupling and complexity.
