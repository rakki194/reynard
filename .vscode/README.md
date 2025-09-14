# 🦊 Reynard VSCode Configuration

_Three spirits, one mission: automatic code perfection through intelligent formatting and
validation!_

This directory contains comprehensive VSCode configuration for the Reynard framework, providing
automatic formatting, linting, and validation for all supported file types.

## 🎯 Overview

The VSCode configuration provides:

- **🦊 Automatic Formatting**: Format on save for all file types
- **🦦 Comprehensive Linting**: ESLint, Ruff, ShellCheck, and more
- **🐺 Adversarial Validation**: Security scanning and quality checks
- **🧪 Integrated Testing**: Debug configurations for all test types
- **📚 Documentation Support**: Markdown validation and formatting

## 📁 Configuration Files

### Core Configuration

- **`settings.json`** - Main VSCode settings with auto-formatting rules
- **`extensions.json`** - Recommended extensions for Reynard development
- **`tasks.json`** - Build and validation tasks
- **`launch.json`** - Debug configurations
- **`README.md`** - This documentation

### Workspace Configuration

- **`reynard.code-workspace`** - Multi-folder workspace configuration

## 🚀 Quick Start

### 1. Install Recommended Extensions

VSCode will automatically prompt you to install recommended extensions when you open the workspace. Or install them manually:

```bash
# Install all recommended extensions
code --install-extension charliermarsh.ruff
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension solidjs.solidjs-vscode
# ... and more (see extensions.json)
```

### 2. Open the Workspace

```bash
# Open the Reynard workspace
code reynard.code-workspace
```

### 3. Verify Auto-Formatting

Create a test file and save it - formatting should happen automatically:

```typescript
// test.tsx - Save this file to see auto-formatting in action
import { createSignal } from "solid-js"
function TestComponent() {
const [count, setCount] = createSignal(0)
return <div>Count: {count()}</div>
}
```

## 🎨 Auto-Formatting by File Type

### 🐍 Python Files (`.py`)

- **Formatter**: Ruff (Black-compatible)
- **Linter**: Ruff with Flake8 rules
- **Import Organizer**: Ruff
- **Line Length**: 88 characters
- **Tab Size**: 4 spaces

```python
# Auto-formatted Python code
def example_function(param1: str, param2: int) -> str:
    """Example function with proper formatting."""
    return f"{param1}: {param2}"
```

### 🦊 TypeScript/JavaScript Files (`.ts`, `.tsx`, `.js`, `.jsx`)

- **Formatter**: Prettier
- **Linter**: ESLint with TypeScript rules
- **Import Organizer**: ESLint
- **Line Length**: 120 characters
- **Tab Size**: 2 spaces

```typescript
// Auto-formatted TypeScript code
import { createSignal } from "solid-js";

function ExampleComponent() {
  const [count, setCount] = createSignal(0);
  return <div>Count: {count()}</div>;
}
```

### 🎨 CSS Files (`.css`, `.scss`, `.less`)

- **Formatter**: Prettier
- **Line Length**: 120 characters
- **Tab Size**: 2 spaces

```css
/* Auto-formatted CSS */
.example-class {
  color: var(--text-primary);
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
}
```

### 📚 Markdown Files (`.md`, `.markdown`)

- **Formatter**: Prettier
- **Linter**: Markdownlint
- **Auto-Validation**: Table of Contents, Sentence Length, Link Validation
- **Line Length**: 120 characters
- **Word Wrap**: Enabled

```markdown
<!-- Auto-formatted Markdown -->

# Example Document

This is an example markdown document that will be automatically formatted
and validated for proper structure and link integrity.
```

**🦊 Built-in Auto-Validation:**

- **Markdownlint**: Automatically fixes common markdown issues on save
- **Prettier**: Formats markdown structure and styling

**🦦 Manual Validation Tasks:**

- **Table of Contents**: Handled automatically by Markdown All in One extension on save
- **Sentence Length**: Run "🔄 Queue-Based Validate Current File" task or use watcher
- **Link Validation**: Use the queue-based validation task
- **Keyboard Shortcut**: `Ctrl+Shift+M` to validate current file with perfect sequencing

**🦊 Automatic Validation (Queue-Based System):**

- **Auto-Start**: Queue-based watcher automatically starts when VSCode opens (workspace mode)
- **Manual Start**: Run "🔄 Start Queue-Based Watcher" task or press `Ctrl+Shift+W`
- **Auto-Validation**: Watches all files and runs validation in perfect sequence
- **Background Process**: Runs continuously until stopped
- **Auto-Restart**: Automatically restarts if it crashes
- **Queue-Based Processing**: Each file gets its own processing queue
- **Perfect Sequencing**: All validators/formatters run in perfect order
- **Race Condition Elimination**: No more conflicts between tools
- **Multi-File Support**: Handles markdown, Python, TypeScript, JavaScript files
- **Test Queue System**: Run "🔄 Test Queue System" to verify perfect sequencing

### 🐺 Shell Scripts (`.sh`, `.bash`, `.zsh`)

- **Formatter**: Shell Format
- **Linter**: ShellCheck
- **Line Length**: 120 characters
- **Tab Size**: 4 spaces

```bash
#!/bin/bash
# Auto-formatted shell script
example_function() {
    local param1="$1"
    local param2="$2"
    echo "Parameters: $param1, $param2"
}
```

### ⚙️ Configuration Files

- **JSON** (`.json`, `.jsonc`): Prettier formatting
- **YAML** (`.yml`, `.yaml`): Prettier formatting
- **TOML** (`.toml`): Even Better TOML formatting
- **HTML** (`.html`): Prettier formatting

## ⌨️ Keyboard Shortcuts

- **`Ctrl+Shift+M`** - Queue-based validate current file (perfect sequencing)
- **`Ctrl+Shift+Alt+M`** - Fix all issues across all file types
- **`Ctrl+Shift+W`** - Start queue-based watcher for automatic validation
- **`Ctrl+Shift+Q`** - Auto-start queue-based watcher (workspace mode)

## 🚀 Auto-Start Configuration

The queue-based watcher can automatically start when VSCode opens:

### Option 1: Workspace Mode (Recommended)

1. **Open the workspace**: `File > Open Workspace from File > reynard.code-workspace`
2. **Auto-start enabled**: The queue-based watcher will automatically start when you open the workspace
3. **Background operation**: Runs silently in the background

### Option 2: Manual Start

1. **Press `Ctrl+Shift+W`** to start the queue-based watcher manually
2. **Or use Command Palette**: `Ctrl+Shift+P > Tasks: Run Task > 🔄 Auto-Start Queue-Based Watcher`
3. **Background operation**: Runs continuously until stopped

## 🏁 Race Condition Prevention

The system includes comprehensive race condition prevention:

### **Problem Solved**

- **VSCode's markdownlint** was conflicting with custom validation tools
- **Multiple tools** were trying to modify the same file simultaneously
- **File corruption** could occur from concurrent writes

### **Solution Implemented**

1. **Disabled built-in markdownlint** on save to prevent conflicts
2. **Disabled conflicting markdown extensions** (Markdown All in One, Markdown Preview Enhanced)
3. **File locking mechanism** prevents concurrent processing of the same file
4. **Sequential validation** with proper delays between tools
5. **Smart throttling** prevents excessive runs
6. **Async processing** with proper error handling
7. **Extension management** to prevent ToC conflicts

### **Validation Order**

1. **Markdown All in One** extension handles ToC automatically on save
2. **Wait 500ms** for VSCode to finish writing the file
3. **Sentence Length** validation and fixing (our custom validator)
4. **Wait 200ms** between validations
5. **Link Validation** (if applicable)

### **Extension Management**

- **Markdown All in One** extension enabled for proper ToC handling
- **Markdown Preview Enhanced** extension enabled for enhanced preview
- **markdownlint** extension enabled for basic markdown linting
- **Custom Reynard validators** handle sentence length validation only

### **Queue-Based Processing System**

The new queue system provides perfect file processing sequencing:

#### **How It Works**

1. **Individual File Queues**: Each file gets its own processing queue
2. **Sequential Processing**: All validators/formatters run in perfect order
3. **Race Condition Elimination**: No more conflicts between tools
4. **Multi-File Support**: Handles different file types with appropriate processors

#### **File Type Processing Chains**

- **Markdown**: Wait → Sentence Length → Link Validation
- **Python**: Wait → Python Validation
- **TypeScript/JavaScript**: Wait → Prettier → ESLint

#### **Queue Manager Features**

- **Event-driven**: Uses EventEmitter for coordination
- **Status Reporting**: Real-time queue status monitoring
- **Auto-cleanup**: Removes completed queues automatically
- **Error Handling**: Continues processing even if one step fails

### **Testing**

- **Run "🏁 Test Race Condition Prevention"** to verify the fixes work
- **Run "📚 Test ToC Conflict Detection"** to verify no ToC conflicts
- **Run "💾 Test Save Simulation"** to simulate actual save process
- **Run "🔄 Test Queue System"** to verify perfect sequencing
- **Multiple rapid saves** are handled gracefully
- **No file corruption** or conflicts between tools

## 🛠️ Available Tasks

### Formatting Tasks

- **🦊 Format All Files** - Format all TypeScript, JavaScript, CSS, JSON, and Markdown files
- **🦊 Format Check All Files** - Check formatting without making changes
- **🐍 Format Python Files** - Format all Python files using Black and isort
- **🐍 Format Check Python Files** - Check Python formatting without changes

### Linting Tasks

- **🦊 Lint All Files** - Lint all TypeScript and JavaScript files
- **🦊 Lint Fix All Files** - Lint and auto-fix all TypeScript and JavaScript files
- **🐍 Lint Python Files** - Lint all Python files using Flake8
- **🐍 Type Check Python Files** - Type check all Python files using MyPy

### Validation Tasks

- **🦊 Type Check All Files** - Type check all TypeScript files
- **🐍 Validate Python Files** - Comprehensive Python validation
- **📚 Validate Markdown Files** - Validate all Markdown files
- **🐺 Validate Shell Scripts** - Validate all shell scripts
- **🎨 Validate CSS Variables** - Validate CSS variables across themes

### Testing Tasks

- **🧪 Run All Tests** - Run all Vitest tests
- **🧪 Run Python Tests** - Run all Python tests using pytest

### Comprehensive Tasks

- **🦊 Run All Validations** - Run comprehensive validation across all file types
- **🦊 Fix All Issues** - Auto-fix all fixable issues across all file types

## 🐛 Debug Configurations

### Frontend Debugging

- **🦊 Debug Frontend (Vite Dev Server)** - Debug the Vite development server
- **🧪 Debug Vitest Tests** - Debug Vitest test runs
- **🧪 Debug Specific Vitest Test** - Debug a specific test file

### Backend Debugging

- **🐍 Debug Python Backend** - Debug the Python backend server
- **🧪 Debug Python Tests** - Debug Python test runs
- **🧪 Debug Specific Python Test** - Debug a specific Python test file

### Script Debugging

- **🐺 Debug Shell Script** - Debug shell scripts
- **🦊 Debug Node.js Script** - Debug Node.js scripts
- **🐍 Debug Python Script** - Debug Python scripts

### Compound Debugging

- **🦊 Debug Full Stack** - Debug both frontend and backend simultaneously
- **🧪 Debug All Tests** - Debug both Python and Vitest tests

## ⚙️ Configuration Details

### Auto-Formatting Rules

All file types are configured with:

- **Format on Save**: Enabled for all supported file types
- **Code Actions on Save**: Auto-fix and organize imports
- **Consistent Line Lengths**: 88 for Python, 120 for others
- **Proper Tab Sizes**: 4 for Python/Shell, 2 for others

### Linting Integration

- **ESLint**: TypeScript/JavaScript linting with SolidJS rules
- **Ruff**: Python linting and formatting
- **ShellCheck**: Shell script validation
- **Markdownlint**: Markdown quality checks

### File Associations

The configuration includes proper file associations for:

- `.tsx` → TypeScript React
- `.jsx` → JavaScript React
- `.mdc` → Markdown
- `.toml` → TOML
- `.yml` → YAML
- `.sh` → Shell Script

### Exclude Patterns

The following directories are excluded from search and file watching:

- `node_modules/`
- `dist/`, `build/`, `coverage/`
- `__pycache__/`, `.pytest_cache/`, `.mypy_cache/`
- `venv/`, `.venv/`
- `third_party/`
- `.git/`

## 🎯 Best Practices

### 🦊 The Fox's Strategic Approach

1. **Always use the workspace** - Open `reynard.code-workspace` for the best experience
2. **Install recommended extensions** - Let VSCode prompt you or install manually
3. **Use tasks for validation** - Run tasks instead of manual commands
4. **Leverage auto-formatting** - Let the system format your code automatically
5. **Use debug configurations** - Debug with proper breakpoints and variable inspection

### 🦦 The Otter's Thorough Testing

1. **Test all file types** - Verify formatting works for each supported type
2. **Run validation tasks** - Use the comprehensive validation tasks regularly
3. **Check debug configurations** - Ensure debugging works for your use cases
4. **Verify extensions** - Make sure all recommended extensions are installed
5. **Test workspace features** - Use multi-folder workspace for better organization

### 🐺 The Wolf's Adversarial Analysis

1. **Challenge the configuration** - Test edge cases and unusual file types
2. **Verify security settings** - Ensure no sensitive data is exposed
3. **Test performance** - Check that auto-formatting doesn't slow down editing
4. **Validate integration** - Ensure all tools work together properly
5. **Stress test debugging** - Test debugging with complex scenarios

## 🔧 Customization

### Adding New File Types

To add support for new file types:

1. **Add file association** in `settings.json`:

   ```json
   "files.associations": {
     "*.newtype": "language-id"
   }
   ```

2. **Add formatting rules**:

   ```json
   "[newtype]": {
     "editor.defaultFormatter": "formatter-extension-id",
     "editor.formatOnSave": true
   }
   ```

3. **Add to tasks** if needed for validation

### Modifying Formatting Rules

Edit the appropriate section in `settings.json`:

```json
"[typescript]": {
  "editor.rulers": [100],  // Change line length
  "editor.tabSize": 4      // Change tab size
}
```

### Adding New Tasks

Add to `tasks.json`:

```json
{
  "label": "🦊 New Task",
  "type": "shell",
  "command": "command",
  "args": ["arg1", "arg2"],
  "group": "build"
}
```

## 🚨 Troubleshooting

### Auto-Formatting Not Working

1. **Check extensions** - Ensure required extensions are installed
2. **Verify settings** - Check that `formatOnSave` is enabled
3. **Check file association** - Ensure file type is properly recognized
4. **Restart VSCode** - Sometimes a restart is needed

### Linting Errors

1. **Check extension status** - Ensure linters are enabled
2. **Verify configuration** - Check linter configuration files
3. **Check dependencies** - Ensure required tools are installed
4. **Review error messages** - Follow specific error guidance

### Debug Configuration Issues

1. **Check Python path** - Ensure virtual environment is correct
2. **Verify Node.js** - Ensure Node.js and npm are available
3. **Check working directory** - Ensure paths are correct
4. **Review launch configuration** - Verify program paths and arguments

## 📚 Additional Resources

- [VSCode Settings Reference](https://code.visualstudio.com/docs/getstarted/settings)
- [VSCode Tasks Documentation](https://code.visualstudio.com/docs/editor/tasks)
- [VSCode Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [ESLint Configuration](https://eslint.org/docs/user-guide/configuring/)
- [Ruff Documentation](https://docs.astral.sh/ruff/)

---

🦊 _Built with the cunning of a fox, the thoroughness of an otter, and the precision of a wolf - the Reynard way!_

_Three spirits, one mission: ensuring your code is automatically perfected with every save!_
