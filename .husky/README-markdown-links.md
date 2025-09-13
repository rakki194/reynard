# 🦊 Reynard Markdown Link Validator

A comprehensive markdown link validation script for the Reynard framework that
ensures all documentation links are valid and functional.

## Features

### 🔗 Link Type Support

- **External URLs**: HTTP/HTTPS links with basic validation
- **Internal Links**: Relative file paths with existence checking
- **Anchor Links**: In-document anchor references with heading validation
- **Image Links**: Markdown image references with file validation
- **Auto-links**: Angle-bracket wrapped URLs
- **Reference Links**: Markdown reference-style links

### 📁 Comprehensive Scanning

- Scans all markdown files in the project
- Excludes third-party and build directories
- Supports multiple markdown extensions (`.md`, `.markdown`, `.mdown`, etc.)
- Recursive directory traversal

### 🎯 Smart Validation

- **File Existence**: Checks if internal file references exist
- **Anchor Validation**: Verifies anchor links match actual headings
- **URL Format**: Validates external URL structure
- **Code Block Awareness**: Skips links inside code blocks
- **Fragment Support**: Handles URL fragments and anchors

### 🚀 Integration

- **Husky Pre-commit**: Automatically validates staged files
- **Package Scripts**: Easy access via npm/pnpm commands
- **CI/CD Ready**: Exit codes for automated workflows

## Usage

### Command Line Interface

```bash
# Validate staged files (default for pre-commit)
node .husky/validate-markdown-links.js --staged

# Validate all markdown files in project
node .husky/validate-markdown-links.js --all

# Show help
node .husky/validate-markdown-links.js --help
```

### Package Scripts

```bash
# Check staged files
pnpm run markdown:links:check

# Check all files
pnpm run markdown:links:check:all

# Full markdown validation (ToC + lint + sentence + links)
pnpm run markdown:validate:all
```

### Pre-commit Integration

The validator is automatically integrated into the Husky pre-commit hook. It will:

1. Check for staged markdown files
2. Validate all links in those files
3. Block commits if broken links are found
4. Provide helpful error messages and suggestions

## Configuration

### Scan Directories

The validator scans these directories by default:

- `docs/` - Documentation files
- `packages/` - Package documentation
- `examples/` - Example documentation
- `templates/` - Template documentation
- `backend/` - Backend documentation
- `e2e/` - End-to-end test documentation
- `scripts/` - Script documentation
- `libraries/` - Library documentation
- `blackhat/` - Security testing documentation
- `todos/` - TODO documentation

### Excluded Directories

These directories are automatically excluded:

- `node_modules/`
- `third_party/`
- `.git/`
- `dist/`
- `build/`
- `coverage/`
- `htmlcov/`
- `__pycache__/`
- `.venv/`
- `venv/`
- `.husky/node_modules/`

### Supported File Extensions

- `.md`
- `.markdown`
- `.mdown`
- `.mkdn`
- `.mkd`

## Link Types and Validation

### External Links

```markdown
[External Link](https://example.com)
[External with Fragment](https://example.com#section)
<https://example.com>
<mailto:test@example.com>
<tel:+1234567890>
```

> *Validation:*

- URL format validation
- Protocol checking (HTTP/HTTPS preferred)
- Localhost detection (warnings)
- Basic structure validation

### Internal Links

```markdown
[Internal File](./other-file.md)
[Internal with Fragment](./other-file.md#section)
[Relative Path](../docs/guide.md)
[Absolute Path](/docs/guide.md)
```

> *Validation:*

- File existence checking
- Path resolution
- Fragment validation (if target is markdown)
- Relative path correctness

### Anchor Links

```markdown
[Same Document](#section-name)
[Another Section](#another-section)
```

> *Validation:*

- Heading extraction and anchor generation
- GitHub-style anchor ID matching
- Case-insensitive matching
- Special character handling

### Image Links

```markdown
![Alt Text](./image.png)
![External Image](https://example.com/image.jpg)
```

> *Validation:*

- Same validation as regular links
- File existence for local images
- URL format for external images

## Error Reporting

### Validation Results

The validator provides detailed error reporting:

```
❌ docs/guide.md: 2 broken links found
   Line 15: Target file does not exist: ./missing-file.md
   💡 Check if the file exists at: /path/to/missing-file.md
   Line 23: Anchor not found: #nonexistent-section
   💡 Available anchors: getting-started, installation, configuration
```

### Summary Statistics

```
📊 Validation Summary
==============================
📁 Files scanned: 45
📎 Total links: 234
✅ Valid links: 230
❌ Broken links: 4
⚠️  Warnings: 2
```

### Tips and Suggestions

The validator provides helpful tips for fixing issues:

```
💡 Tips for fixing broken links:
  - Check file paths and ensure files exist
  - Verify anchor names match heading text
  - Use relative paths for internal links
  - Test external URLs in a browser
  - Run "node .husky/validate-markdown-links.js --all" to validate all files
```

## Advanced Features

### Code Block Awareness

The validator intelligently skips links inside code blocks:

````markdown
This is a [real link](https://example.com) that gets validated.

```bash
# This [link](https://example.com) is ignored
echo "Hello World"
```
````

Another [real link](https://example.com) that gets validated.

````

### Anchor Generation

Anchors are generated using GitHub's algorithm:

```markdown
# Main Title                    → #main-title
## Getting Started (v2.0)       → #getting-started-v20
### Error Handling & Debugging  → #error-handling-debugging
````

### Fragment Handling

The validator properly handles URL fragments:

```markdown
[Link with Fragment](./file.md#section)
[External with Fragment](https://example.com#section)
[Anchor Only](#section)
```

## Testing

### Test Suite

The validator includes a comprehensive test suite:

```bash
# Run tests
vitest run .husky/validate-markdown-links.test.js
```

### Test Coverage

Tests cover:

- URL parsing and classification
- Link extraction from markdown
- Anchor extraction from headings
- Link validation logic
- File validation results
- Integration scenarios

## Troubleshooting

### Common Issues

1. **"Target file does not exist"**
   - Check the file path is correct
   - Ensure the file exists in the expected location
   - Verify relative path resolution

2. **"Anchor not found"**
   - Check the heading text matches the anchor
   - Verify special characters are handled correctly
   - Ensure the heading exists in the target file

3. **"Invalid URL"**
   - Check URL format and protocol
   - Ensure proper escaping of special characters
   - Verify the URL is complete and valid

### Debug Mode

For debugging, you can modify the script to add more verbose output or run specific validation scenarios.

## Contributing

### Adding New Link Types

To add support for new link types:

1. Add pattern matching in `extractLinks()`
2. Add URL parsing logic in `parseUrl()`
3. Add validation logic in the appropriate `validate*Link()` method
4. Add tests for the new functionality

### Extending Validation

To add new validation rules:

1. Modify the appropriate validation method
2. Add new result types if needed
3. Update error reporting
4. Add comprehensive tests

## Performance

### Optimization Features

- **File Caching**: Markdown content is cached during validation
- **Anchor Caching**: Extracted anchors are cached per file
- **Selective Scanning**: Only scans relevant directories
- **Early Exit**: Stops on first error in pre-commit mode

### Scalability

The validator is designed to handle large codebases:

- Efficient file system operations
- Memory-conscious processing
- Configurable scan directories
- Exclude patterns for performance

## Integration with Reynard

### Framework Integration

The validator is fully integrated with the Reynard framework:

- Follows Reynard coding standards
- Uses Reynard color scheme and styling
- Integrates with existing Husky hooks
- Compatible with Reynard's monorepo structure

### Documentation Standards

The validator enforces Reynard's documentation standards:

- Consistent link formatting
- Proper relative path usage
- Valid anchor references
- External link best practices

---

_🦊 Built with the cunning of a fox, the thoroughness of an otter, and the precision of a wolf - the Reynard way!_

