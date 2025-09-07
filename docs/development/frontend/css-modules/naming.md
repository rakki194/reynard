# Naming

We recommend camelCase for local class names.

While not enforced, camelCase is preferred as kebab-case may cause unexpected
behavior when trying to access `styles.class-name` with dot notation. You can
still work around kebab-case with bracket notation (e.g. `styles['class-name']`)
but `styles.className` is preferred.
