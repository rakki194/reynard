# Editor Config and Prettier Setup

This document describes the Editor Config and Prettier configuration for YipYap, ensuring consistent code formatting across different editors and development environments.

## Overview

The project uses Editor Config for basic editor settings and Prettier for advanced code formatting. This combination ensures:

- **Consistent formatting** across all developers and editors
- **Automatic formatting** on save and commit
- **CSS-specific optimizations** for `@layer` blocks and import order
- **Integration** with existing Stylelint and TypeScript tooling

## Files

### Configuration Files

- `.editorconfig` - Basic editor settings (indentation, line endings, etc.)
- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from Prettier formatting

### Scripts

- `scripts/pre-commit.sh` - Comprehensive pre-commit hook for all file types
- `scripts/pre-commit-stylelint.sh` - CSS-specific pre-commit hook
- `scripts/setup-git-hooks.sh` - Automatic git hook installation

## Editor Config

The `.editorconfig` file defines basic editor settings that work across different IDEs and text editors.

### Key Settings

```ini
# Global settings
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

# CSS files - specific settings for @layer blocks
[*.{css,module.css}]
indent_style = space
indent_size = 2
max_line_length = 120
```

### Supported Editors

Editor Config is supported by most modern editors:

- **VS Code** - Built-in support
- **WebStorm/IntelliJ** - Built-in support
- **Sublime Text** - With EditorConfig plugin
- **Vim/Neovim** - With EditorConfig plugin
- **Emacs** - With EditorConfig plugin

## Prettier Configuration

The `.prettierrc` file defines advanced formatting rules for different file types.

### Global Settings

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 120,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

### CSS-Specific Settings

CSS files have special formatting rules to handle `@layer` blocks and maintain readability:

```json
{
  "files": "*.{css,module.css}",
  "options": {
    "printWidth": 120,
    "tabWidth": 2,
    "singleQuote": false,
    "semi": true,
    "trailingComma": "none"
  }
}
```

### Import Order for @layer Blocks

Prettier automatically handles `@layer` block formatting:

```css
/* Before formatting */
@layer reset, base, components, utilities, overrides;

@layer components {
  .button {
    background: var(--accent);
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
  }
}
```

```css
/* After formatting */
@layer reset, base, components, utilities, overrides;

@layer components {
  .button {
    background: var(--accent);
  }
}

@layer utilities {
  .sr-only {
    position: absolute;
  }
}
```

## Git Hooks

### Pre-commit Hooks

The project includes two pre-commit hooks:

1. **Comprehensive Hook** (`scripts/pre-commit.sh`)
   - Formats all file types with Prettier
   - Runs Stylelint on CSS files
   - Runs TypeScript type checking
   - Runs tests if files were modified

2. **CSS-Only Hook** (`scripts/pre-commit-stylelint.sh`)
   - Formats CSS files with Prettier
   - Runs Stylelint on CSS files
   - Faster for CSS-only changes

### Installation

Run the setup script to install git hooks:

```bash
npm run setup-hooks
```

Or manually:

```bash
chmod +x scripts/pre-commit.sh
chmod +x scripts/pre-commit-stylelint.sh
cp scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## NPM Scripts

The following npm scripts are available for formatting and linting:

### Formatting Scripts

```bash
# Format all files
npm run format

# Check formatting without changing files
npm run format:check

# Run both Stylelint and format checking
npm run lint

# Run Stylelint and format all files
npm run lint:fix
```

### CSS-Specific Scripts

```bash
# Run Stylelint on CSS files
npm run styles

# Setup git hooks
npm run setup-hooks
```

## Integration with Existing Tools

### Stylelint Integration

Prettier and Stylelint work together:

1. **Prettier** handles formatting (spacing, line breaks, etc.)
2. **Stylelint** handles linting (rules, best practices, etc.)

The configuration ensures no conflicts between the tools.

### TypeScript Integration

Prettier formats TypeScript files according to the project's style guide:

- 2-space indentation
- Single quotes for strings
- Semicolons required
- 120 character line length

### Vite Integration

The Vite configuration includes `vite-plugin-stylelint` for development-time linting.

## Editor Setup

### VS Code

1. Install the **EditorConfig** extension
2. Install the **Prettier** extension
3. Configure VS Code settings:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### WebStorm/IntelliJ

1. Enable EditorConfig support in settings
2. Install the Prettier plugin
3. Configure Prettier as the default formatter for supported file types

### Other Editors

Most editors support EditorConfig and Prettier through plugins or built-in features. Check the respective editor documentation for setup instructions.

## Workflow

### Development Workflow

1. **Write code** - Editor automatically formats on save
2. **Stage changes** - `git add <files>`
3. **Commit** - Pre-commit hooks automatically format and lint
4. **Push** - Code is consistently formatted

### Manual Formatting

```bash
# Format specific files
npx prettier --write src/components/Button.tsx

# Format all files
npm run format

# Check formatting
npm run format:check
```

### Troubleshooting

#### Format Conflicts

If Prettier and Stylelint conflict:

1. Run `npm run lint:fix` to format and fix issues
2. Check the configuration files for conflicting rules
3. Use `/* prettier-ignore */` comments sparingly

#### Git Hook Issues

If pre-commit hooks fail:

1. Check that the hooks are executable: `ls -la .git/hooks/`
2. Reinstall hooks: `npm run setup-hooks`
3. Check for syntax errors in the hook scripts

#### Editor Integration Issues

If formatting doesn't work in your editor:

1. Verify EditorConfig and Prettier extensions are installed
2. Check editor settings for formatter configuration
3. Restart the editor after configuration changes

## Best Practices

### CSS Formatting

- Use `@layer` blocks to organize CSS
- Keep selectors simple and avoid deep nesting
- Use CSS custom properties for values
- Maintain consistent spacing around properties

### TypeScript/JavaScript Formatting

- Use consistent import ordering
- Prefer const over let when possible
- Use template literals for string interpolation
- Keep functions focused and small

### Commit Messages

- Use conventional commit format
- Keep messages concise and descriptive
- Reference issues when applicable

## Configuration Reference

### EditorConfig Options

| Option                     | Description            | Default |
| -------------------------- | ---------------------- | ------- |
| `charset`                  | File encoding          | `utf-8` |
| `end_of_line`              | Line ending style      | `lf`    |
| `insert_final_newline`     | Add newline at end     | `true`  |
| `trim_trailing_whitespace` | Remove trailing spaces | `true`  |
| `indent_style`             | Indentation type       | `space` |
| `indent_size`              | Indentation size       | `2`     |
| `max_line_length`          | Maximum line length    | `120`   |

### Prettier Options

| Option            | Description                | Default |
| ----------------- | -------------------------- | ------- |
| `semi`            | Add semicolons             | `true`  |
| `trailingComma`   | Trailing comma style       | `es5`   |
| `singleQuote`     | Use single quotes          | `true`  |
| `printWidth`      | Line length                | `120`   |
| `tabWidth`        | Tab width                  | `2`     |
| `useTabs`         | Use tabs instead of spaces | `false` |
| `bracketSpacing`  | Spaces in object literals  | `true`  |
| `bracketSameLine` | JSX bracket placement      | `false` |
| `arrowParens`     | Arrow function parentheses | `avoid` |
| `endOfLine`       | Line ending                | `lf`    |

## Migration Guide

### From Manual Formatting

If you're migrating from manual formatting:

1. Install the configuration files
2. Set up your editor with the required extensions
3. Run `npm run format` to format existing code
4. Install git hooks: `npm run setup-hooks`
5. Update your workflow to use the new scripts

### From Other Formatters

If you're migrating from other formatters:

1. Remove old formatter configurations
2. Install Prettier and EditorConfig
3. Update editor settings
4. Test formatting on a few files
5. Gradually migrate the codebase

## Future Enhancements

### Potential Improvements

- **Import sorting** - Add import order rules
- **Custom Prettier plugins** - Project-specific formatting rules
- **CI integration** - Automated formatting checks in CI/CD
- **Performance optimization** - Faster formatting for large codebases

### Configuration Evolution

The configuration will evolve based on:

- Team feedback and preferences
- New language features and best practices
- Tool updates and improvements
- Project-specific requirements

## Support

For issues with Editor Config or Prettier setup:

1. Check this documentation
2. Review the configuration files
3. Test with a minimal example
4. Consult the tool documentation
5. Ask the development team

## References

- [EditorConfig](https://editorconfig.org/) - Official documentation
- [Prettier](https://prettier.io/) - Official documentation
- [Stylelint](https://stylelint.io/) - CSS linting tool
- [Git Hooks](https://git-scm.com/docs/githooks) - Git hook documentation
