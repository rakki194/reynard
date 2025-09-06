# Stylelint Setup for CSS Cleanup Quest

This document describes the Stylelint configuration and tooling setup for the CSS cleanup quest in YipYap.

## Overview

The Stylelint configuration enforces CSS best practices and helps maintain consistency across the codebase. It focuses on the core requirements from the CSS cleanup quest while being practical for the existing codebase.

## Configuration Files

### Main Configuration: `src/.stylelintrc`

The main Stylelint configuration file extends `stylelint-config-standard` and adds custom rules for the CSS cleanup quest.

#### Key Rules

**Core Requirements (from CSS_TODO.md):**

- **`declaration-no-important`**: Warns against `!important` usage, encouraging proper layering and specificity
- **`color-no-hex`**: Warns against hex colors, encouraging CSS custom properties
- **`color-named`**: Warns against named colors, encouraging CSS custom properties
- **`declaration-property-value-no-unknown`**: Enforces z-index tokens instead of raw numbers

**Code Quality:**

- **`max-nesting-depth`**: Limits nesting to 4 levels
- **`selector-max-compound-selectors`**: Limits compound selectors to 6
- **`selector-no-qualifying-type`**: Warns against qualifying type selectors
- **`at-rule-no-unknown`**: Allows modern CSS at-rules (`layer`, `supports`, `container`)

**Formatting and Standards:**

- **`color-function-notation`**: Uses modern color function notation
- **`color-hex-length`**: Prefers short hex colors
- **`font-weight-notation`**: Uses numeric font weights
- **`function-calc-no-unspaced-operator`**: Enforces spacing in calc functions
- **`length-zero-no-unit`**: Removes units from zero values
- **`time-min-milliseconds`**: Enforces minimum animation durations

**Disabled Rules:**

Some rules are disabled to avoid conflicts with existing code patterns:

- `selector-max-specificity`: Too strict for existing codebase
- `selector-class-pattern`: Allows existing class naming patterns
- `no-descending-specificity`: Allows existing selector ordering
- `keyframes-name-pattern`: Allows existing animation names
- `no-duplicate-selectors`: Allows existing duplicate selectors

### Z-Index Tokens

The configuration enforces the use of z-index tokens instead of raw numbers:

```css
/* ✅ Allowed */
z-index: var(--z-base);      /* 0 */
z-index: var(--z-dropdown);  /* 10 */
z-index: var(--z-sticky);    /* 20 */
z-index: var(--z-tooltip);   /* 30 */
z-index: var(--z-modal);     /* 40 */
z-index: var(--z-toast);     /* 50 */

/* ❌ Not allowed */
z-index: 1000;
z-index: 9999;
```

## CI/CD Integration

### GitHub Actions: `.github/workflows/css-lint.yml`

The CI workflow runs Stylelint on changed CSS files:

- **Triggers**: Push to `main`/`develop` branches and pull requests
- **Scope**: Only runs on changes to `src/**/*.css`, `src/**/*.module.css`, and `src/.stylelintrc`
- **Strategy**:
  - For pushes: Runs on changed files only
  - For PRs: Runs full Stylelint check

### Pre-commit Hook: `scripts/pre-commit-stylelint.sh`

A pre-commit hook script that runs Stylelint on staged CSS files:

```bash
# Make executable
chmod +x scripts/pre-commit-stylelint.sh

# Run manually
./scripts/pre-commit-stylelint.sh
```

## Usage

### Running Stylelint

```bash
# Lint all CSS files
npm run styles

# Lint specific files
npx stylelint src/styles.css
npx stylelint src/components/Gallery/Gallery.css

# Lint with auto-fix
npx stylelint src/styles.css --fix

# Lint with specific formatter
npx stylelint src/styles.css --formatter verbose
```

### Available Scripts

- `npm run styles`: Runs Stylelint on all CSS files in `src/`

### IDE Integration

Most modern IDEs support Stylelint integration:

**VS Code:**

- Install the "Stylelint" extension
- Add to `settings.json`:

  ```json
  {
    "stylelint.validate": ["css", "scss"],
    "css.validate": false,
    "scss.validate": false
  }
  ```

**Other IDEs:**

- Install the appropriate Stylelint plugin
- Configure to use the project's `.stylelintrc` file

## Migration Strategy

### Phase 1: Warnings Only

The current configuration uses warnings for most rules to avoid breaking existing code:

- `!important` usage → Warning
- Hex colors → Warning  
- Named colors → Warning
- Raw z-index values → Warning

### Phase 2: Gradual Enforcement

As the CSS cleanup quest progresses:

1. **Convert hex colors to CSS custom properties**
2. **Replace `!important` with proper layering**
3. **Replace raw z-index values with tokens**
4. **Convert qualifying type selectors to classes**

### Phase 3: Strict Enforcement

Once migration is complete, rules can be changed from warnings to errors:

```json
{
  "declaration-no-important": true,
  "color-no-hex": true,
  "color-named": "never"
}
```

## Common Issues and Solutions

### High Specificity Selectors

**Problem**: Complex selectors with high specificity

```css
/* ❌ High specificity */
#gallery .responsive-grid .item img:hover
```

**Solution**: Use CSS Modules or data attributes

```css
/* ✅ Lower specificity */
.gallery-item[data-selected] img:hover
```

### Hex Color Usage

**Problem**: Hard-coded hex colors

```css
/* ❌ Hex colors */
color: #8839ef;
background: #eff1f5;
```

**Solution**: Use CSS custom properties

```css
/* ✅ CSS custom properties */
color: var(--accent);
background: var(--bg-color);
```

### Z-Index Magic Numbers

**Problem**: Raw z-index values

```css
/* ❌ Magic numbers */
z-index: 1000;
z-index: 9999;
```

**Solution**: Use z-index tokens

```css
/* ✅ Tokens */
z-index: var(--z-modal);
z-index: var(--z-toast);
```

## Best Practices

### CSS Custom Properties

Define colors in `src/themes.css`:

```css
:root {
  --accent: #8839ef;
  --bg-color: #eff1f5;
  --text-primary: #1a1b24;
}
```

### Z-Index Scale

Use the defined z-index scale:

```css
:root {
  --z-base: 0;          /* base content */
  --z-dropdown: 10;     /* menus, dropdowns */
  --z-sticky: 20;       /* sticky headers/footers */
  --z-tooltip: 30;      /* tooltips */
  --z-modal: 40;        /* modals/dialogs */
  --z-toast: 50;        /* toasts/notifications */
}
```

### Avoiding !important

Instead of `!important`, use:

1. **Proper layering** with `@layer`
2. **Higher specificity** selectors
3. **CSS custom properties** for dynamic values

```css
/* ❌ Avoid */
color: red !important;

/* ✅ Better */
@layer overrides {
  .specific-selector {
    color: var(--error-color);
  }
}
```

## Troubleshooting

### Rule Conflicts

If a rule conflicts with existing code:

1. **Check if the rule is necessary** for the cleanup quest
2. **Consider disabling the rule** temporarily
3. **Plan migration** to comply with the rule

### Performance Issues

For large CSS files:

1. **Run Stylelint on specific files** instead of the entire project
2. **Use the `--cache` option** for faster subsequent runs
3. **Consider running in CI only** for large codebases

### False Positives

If Stylelint reports false positives:

1. **Check the rule documentation**
2. **Add exceptions** to the configuration
3. **Use `/* stylelint-disable */`** comments sparingly

## Future Enhancements

### Additional Rules

Consider adding these rules as the codebase matures:

- **`declaration-block-sorted-properties`**: Enforce property ordering
- **`selector-max-id`**: Limit ID selector usage
- **`selector-no-id`**: Prevent ID selectors entirely
- **`selector-no-vendor-prefix`**: Remove vendor prefixes

### Custom Plugins

For project-specific needs:

- **Custom z-index token validation**
- **Theme variable usage enforcement**
- **Component-specific naming conventions**

### Integration with Other Tools

- **Prettier integration** for consistent formatting
- **PostCSS plugins** for advanced transformations
- **CSS-in-JS linting** for styled-components or similar
