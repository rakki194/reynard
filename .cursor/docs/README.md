# Reynard Documentation Collection

Guides for robust, efficient, and maintainable development across the Reynard ecosystem.

## Overview

This documentation collection provides essential patterns and
best practices for development across the Reynard project, covering shell scripting, Python development, code quality,
testing, and project management. Each guide is based on real-world experience solving common issues, linter warnings,
and architectural challenges encountered in production environments.

## Documentation Structure

### 🐚 Shell Scripting & Bash

#### 📚 [Shell Script Best Practices](./shell-script-best-practices.md)

Essential patterns for maintainable, robust, and linter-compliant shell scripts

- Core principles and script headers
- Error handling patterns
- File I/O optimization
- Test syntax best practices
- Variable handling
- Function design patterns
- Output and logging
- Script organization

#### 🔍 [ShellCheck Rules Reference](./shellcheck-rules-reference.md)

Comprehensive guide to ShellCheck rules, their meanings, and solutions

- Critical rules (SC2181, SC2310, SC2086)
- Test syntax rules
- Variable and expansion rules
- Command substitution rules
- File and path rules
- Redirection rules
- Arithmetic rules
- Function rules
- Best practices for rule management

#### ⚠️ [Bash Error Handling Patterns](./bash-error-handling-patterns.md)

Comprehensive guide to robust error handling in bash scripts

- Core error handling principles
- The `set -e` behavior and dilemmas
- Error handling patterns
- Exit code management
- Validation patterns
- Retry patterns
- Logging and output
- Error recovery patterns
- Testing error handling

#### 🔄 [Command Substitution Best Practices](./command-substitution-best-practices.md)

Comprehensive guide to safe and efficient command substitution in bash

- Core substitution safety rules
- Modern vs legacy syntax
- Common patterns and solutions
- File operations
- Process substitution
- Performance optimization
- Error handling patterns
- Advanced patterns
- Security considerations
- Testing command substitution

#### 🚀 [Shell Script Optimization Patterns](./shell-script-optimization-patterns.md)

Advanced patterns for high-performance, efficient shell scripts

- Performance principles
- I/O optimization patterns
- Process optimization patterns
- Memory optimization patterns
- Algorithm optimization patterns
- Network optimization patterns
- Caching patterns
- Profiling and monitoring
- Optimization best practices
- Performance testing

#### 📁 [Shell Command Failure Directory Display](./shell-command-failure-directory-display.md)

Handling directory display and error states in shell commands

- Directory listing error handling
- Fallback display strategies
- User-friendly error messages
- Command failure recovery patterns

### 🐍 Python Development

#### 🚨 [Python Linter Warnings & Errors](./python-linter-warnings-errors.md)

Comprehensive guide to common Python linter warnings and errors with practical solutions

- Exception handling issues and chaining patterns
- Type annotation problems and modern solutions
- Code quality issues including magic numbers and unused variables
- Logging best practices and lazy formatting
- Code structure improvements and unnecessary else blocks
- Type safety enhancements and proper annotations

#### 🔗 [Python Exception Chaining](./python-exception-chaining.md)

Proper exception chaining with `raise ... from err` for better error context

- Exception chaining syntax and best practices
- Context preservation in error handling
- Debugging improvements through proper chaining
- Common anti-patterns and their solutions

#### ⚠️ [Python Exception Handling Issues](./python-exception-handling-issues.md)

Comprehensive guide to robust exception handling in Python applications

- Try-except-pass anti-pattern elimination
- Overly broad exception handling problems
- Custom exception classes and error context
- Retry mechanisms and circuit breaker patterns
- Error recovery strategies and graceful degradation

#### 📝 [Python Logging Best Practices](./python-logging-best-practices.md)

Professional logging implementation for Python applications

- Structured logging patterns and configuration
- Log levels and appropriate usage
- Performance optimization with lazy logging
- Security considerations and sensitive data handling
- Integration with monitoring and alerting systems

#### 🐛 [Python Logging Issues](./python-logging-issues.md)

Common logging problems and their solutions

- Lazy logging format implementation
- Performance issues with string formatting
- Log level configuration and debugging
- Error handling in logging systems

#### 🏗️ [Python Code Structure Issues](./python-code-structure-issues.md)

Improving code organization and maintainability

- Long functions and modular design patterns
- Mixed concerns and separation of responsibilities
- Layered architecture and domain-driven design
- Command and query separation (CQRS)
- Dependency injection patterns

#### 🎯 [Python Type Annotation Issues](./python-type-annotation-issues.md)

Modern type annotation practices and common problems

- Deprecated type imports and modern alternatives
- Undefined type variables and proper generic usage
- Union types and optional parameters
- Type aliases and complex type definitions

#### 🛡️ [Python Type Safety Issues](./python-type-safety-issues.md)

Enhancing code reliability through proper type checking

- Missing type annotations and their impact
- Type mismatches and runtime safety
- Generic types and type parameters
- Type narrowing and guard clauses

#### 📊 [Python Modern Type Annotations](./python-modern-type-annotations.md)

Current best practices for Python type annotations (Python 3.10+)

- Union syntax (`|` vs `Union`)
- Built-in generic types
- Type aliases and `TypeAlias`
- Protocol and structural typing
- Generic type parameters and variance

#### 🚀 [Performance Issues](./performance-issues.md)

Optimizing Python code for better runtime performance and efficiency

- Inefficient string operations and concatenation patterns
- Unnecessary list comprehensions and generator alternatives
- Dictionary operations and memory optimization
- Algorithm complexity and Big O analysis
- Profiling tools and performance measurement

#### 🔧 [Python Casting Response JSON](./python-casting-respone.json.md)

Handling JSON response casting and type conversion in Python

- JSON parsing and type safety
- Response validation and error handling
- Type conversion patterns and best practices

### 🏗️ Code Quality & Architecture

#### 🎯 [Code Organization Issues](./code-organization-issues.md)

Structuring code for maintainability, readability, and scalability

- Long functions and modular decomposition
- Mixed concerns and separation of responsibilities
- Advanced organization patterns including layered architecture
- Domain-driven design and CQRS implementation
- Dependency injection and interface segregation

#### 🔄 [Code Structure Issues](./code-structure-issues.md)

Simplifying control flow and eliminating unnecessary complexity

- Unnecessary else blocks and early return patterns
- Complex conditional logic and guard clauses
- Strategy patterns for complex business logic
- Refactoring techniques and code simplification

#### 🚨 [Error Handling Issues](./error-handling-issues.md)

Implementing robust error handling for reliable applications

- Try-except-pass anti-pattern elimination
- Overly broad exception handling problems
- Custom exception classes and error context
- Retry mechanisms and circuit breaker patterns
- Error recovery strategies and graceful degradation

#### 🎲 [Magic Numbers and Constants](./magic-numbers-and-constants.md)

Eliminating hard-coded values for maintainable and self-documenting code

- Magic number identification and replacement
- Named constants and configuration management
- Enum-based constants and type safety
- Best practices for constant organization

#### 🗑️ [Unused Variables and Dead Code](./unused-variables-and-dead-code.md)

Eliminating dead code for cleaner, more maintainable applications

- Unused variable detection and removal
- Unreachable code identification
- Redundant logic elimination
- Code cleanup strategies and tools

#### 🛡️ [Type Safety Issues](./type-safety-issues.md)

Enhancing code reliability through proper type annotations and type checking

- Missing type annotations and their impact
- Type mismatches and runtime safety
- Generic types and type parameters
- Type narrowing and guard clauses

### 🧪 Testing & Quality Assurance

#### 🧪 [Testing and Quality Assurance](./testing-and-quality-assurance.md)

Building reliable, maintainable applications through comprehensive testing

- Code quality metrics and cyclomatic complexity analysis
- Unit testing strategies and test organization
- Integration testing and end-to-end testing
- Test coverage analysis and quality gates
- Performance testing and benchmarking

### 🔍 Code Analysis & Monolith Detection

#### 🦊 [Monolith Detection Tools](./monolith-detection-tools.md)

Comprehensive codebase analysis and monolith detection system for the Reynard MCP server

- AST-based line counting excluding comments and docstrings
- Smart file filtering based on .gitignore patterns
- Complexity scoring and metrics analysis
- Multi-language support (Python, TypeScript, JavaScript)
- Real-time codebase health monitoring
- Refactoring recommendations and technical debt tracking

#### 📋 [Monolith Detection Quick Reference](./monolith-detection-quick-reference.md)

Quick reference guide for monolith detection tool usage

- MCP tool command examples
- Common use cases and parameters
- Threshold guidelines and best practices
- Recent analysis results from Reynard codebase

### 🎨 Frontend & UI

#### 🎨 [Icon System Architecture](./icon-system-architecture.md)

Comprehensive analysis of icon system architecture and optimization

- Current implementation analysis and usage patterns
- Security considerations and XSS prevention
- Performance optimization and caching strategies
- Modern icon handling best practices
- Migration strategies and developer experience improvements

### ⚡ Build Tools & Dependencies

#### 🔧 [Vite 7 and SolidJS Compatibility Research](./vite-7-solidjs-compatibility-research.md)

Comprehensive research on Vite 7 and SolidJS compatibility issues

- Peer dependency analysis and plugin requirements
- Native framework support investigation
- Plugin ecosystem status and alternatives
- Build tool compatibility matrix
- Future compatibility roadmap

#### 📦 [Peer Dependency Management Best Practices](./peer-dependency-management-best-practices.md)

Best practices for managing peer dependency warnings and conflicts

- Understanding peer dependencies and their purpose
- Update strategies and compatibility management
- Testing and validation procedures
- Monitoring and maintenance workflows
- Emergency procedures and rollback strategies

#### 🔄 [Vite and SolidJS Alternative Solutions](./vite-solidjs-alternative-solutions.md)

Alternative approaches and workarounds for build tool compatibility

- Immediate solutions and plugin updates
- Alternative build tools (Rollup, esbuild, Webpack)
- Framework-specific alternatives (SolidStart, Astro)
- Development workflow alternatives
- Migration strategies and decision matrix

#### 📈 [Dependency Update Strategy](./dependency-update-strategy.md)

Systematic approach to dependency management in the Reynard monorepo

- Update philosophy and risk assessment framework
- Categorized update workflows (security, patch, minor, major)
- Testing strategies and quality gates
- Monitoring and automation setup
- Long-term planning and metrics tracking

### ⚙️ Configuration & Tools

#### ⚙️ [JavaScript Defining Node for ESLint](./javascript-defining-node-for-eslint.md)

Guide to configuring ESLint for Node.js environments

- Environment-specific ESLint configuration
- Node.js globals and file pattern matching
- Common Node.js globals and their usage
- Best practices for ESLint configuration

### 📋 Project Management

#### 📋 [Project Management](./project-management.md)

Comprehensive project management guide for Reynard development

- Three spirits approach (Fox, Otter, Wolf) for strategic development
- Development environment architecture and VSCode configuration
- Quality assurance infrastructure and pre-commit hooks
- CI/CD pipeline architecture and GitHub Actions workflows
- Best practices for strategic planning and scope management

#### 📊 [Project Management Summary](./project-management-summary.md)

Executive summary of project management practices and workflows

- Key project management principles and methodologies
- Quality assurance standards and testing strategies
- Documentation and communication protocols
- Risk management and security considerations

## Quick Reference

### Essential Script Template

```bash
#!/bin/bash

# Script: script-name.sh
# Description: Brief description of what this script does
# Author: Your Name
# Date: $(date +%Y-%m-%d)

set -e          # Exit on any error
set -u          # Exit on undefined variables
set -o pipefail # Exit on pipe failures

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Logging functions
print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Main script logic here
main() {
    print_status "Starting script execution..."

    # Your code here

    print_success "Script completed successfully!"
}

# Run main function
main "$@"
```

### Common ShellCheck Solutions

| Rule   | Problem                        | Solution                                         |
| ------ | ------------------------------ | ------------------------------------------------ |
| SC2181 | Indirect exit code checking    | Use `if ! command; then`                         |
| SC2310 | Function in if disables set -e | Use explicit error handling with disable comment |
| SC2086 | Unquoted variables             | Quote all variables: `"${var}"`                  |
| SC2129 | Multiple redirects             | Use command groups: `{ cmd1; cmd2; } >> file`    |
| SC2069 | Return value masking           | Separate command execution                       |

### Error Handling Pattern

```bash
# ✅ Recommended pattern
# shellcheck disable=SC2310  # set -e is intentionally disabled for explicit error handling
if ! check_service "http://localhost:8080" "Service"; then
    print_error "Service is not running. Please start it with: service start"
    exit 1
fi
```

## Key Principles

### 1. Fail-Fast Philosophy

- Use `set -e` for immediate failure on errors
- Provide clear error messages
- Use meaningful exit codes
- Give users guidance on how to fix problems

### 2. Explicit Error Handling

- Handle errors explicitly rather than relying on `set -e`
- Use direct exit code checking with `if ! command; then`
- Document ShellCheck disables with detailed reasoning
- Provide specific error messages and user guidance

### 3. Modern Bash Practices

- Use `[[ ]]` instead of `[ ]` for test syntax
- Quote all variables to prevent word splitting
- Use `$(...)` instead of legacy backticks
- Use command groups for multiple redirects

### 4. Performance Optimization

- Batch file operations to minimize I/O
- Cache expensive commands when possible
- Use built-in operations instead of external commands
- Minimize subprocess creation

### 5. Security and Safety

- Validate all inputs before processing
- Sanitize command output when necessary
- Use safe command execution patterns
- Implement proper error recovery

## Common Issues and Solutions

### The `set -e` Dilemma

**Problem**: ShellCheck rules conflict - SC2181 wants direct exit code checking, but SC2310 warns that functions in if
conditions disable `set -e`.

**Solution**: Use `if ! command; then` with explicit error handling and disable SC2310 with detailed documentation.

### Command Substitution Masking

**Problem**: Command substitution in echo statements masks return values.

**Solution**: Separate command execution from output:

```bash
result=$(command)
echo "Result: ${result}"
```

### Multiple File Redirects

**Problem**: Multiple individual redirects to the same file are inefficient.

**Solution**: Use command groups:

```bash
{
    echo "Header"
    echo "Content"
    echo "Footer"
} >> file.txt
```

## Testing and Validation

### Script Validation

```bash
# Validate syntax
bash -n script.sh

# Run ShellCheck
shellcheck script.sh

# Test with different shells
bash script.sh
sh script.sh
```

### Performance Testing

```bash
# Time script execution
time ./script.sh

# Profile with strace
strace -c ./script.sh

# Monitor memory usage
/usr/bin/time -v ./script.sh
```

## Integration

### CI/CD Integration

```yaml
# .github/workflows/shellcheck.yml
name: ShellCheck
on: [push, pull_request]
jobs:
  shellcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run ShellCheck
        uses: koalaman/shellcheck-action@v0.9.0
        with:
          scandir: "."
          format: gcc
          severity: error
```

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit
shellcheck --severity=error --format=gcc *.sh
```

## Contributing

When adding new shell scripts to the project:

1. Follow the essential script template
2. Run ShellCheck and fix all warnings
3. Document any necessary rule disables
4. Test with multiple shells
5. Include proper error handling
6. Use the established logging patterns

## Resources

### Shell Scripting

- [ShellCheck Wiki](https://github.com/koalaman/shellcheck/wiki)
- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)
- [Advanced Bash Scripting Guide](https://tldp.org/LDP/abs/html/)

### Python Development

- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [Python Logging](https://docs.python.org/3/library/logging.html)
- [Python Exception Handling](https://docs.python.org/3/tutorial/errors.html)
- [PEP 484 - Type Hints](https://peps.python.org/pep-0484/)

### Code Quality

- [Pylint Documentation](https://pylint.pycqa.org/)
- [MyPy Type Checker](https://mypy.readthedocs.io/)
- [Black Code Formatter](https://black.readthedocs.io/)
- [Flake8 Linter](https://flake8.pycqa.org/)

### Testing

- [Pytest Documentation](https://docs.pytest.org/)
- [Python Testing Best Practices](https://docs.python.org/3/library/unittest.html)
- [Coverage.py](https://coverage.readthedocs.io/)

### 🖥️ Disk Usage Analysis Tools

#### 🦊 [Dust - Modern Disk Usage Analyzer](./dust-disk-usage-analyzer.md)

Modern, Rust-based alternative to traditional `du` command with intuitive visual interface

- Color-coded visual representation of directory sizes
- Fast Rust-based implementation optimized for modern systems
- Interactive navigation and depth control
- Advanced filtering and exclusion options
- Performance optimization for large filesystems

#### 📊 [Ncdu - NCurses Disk Usage Analyzer](./ncdu-disk-usage-analyzer.md)

Interactive disk usage analyzer with ncurses interface for comprehensive file management

- Full-featured interactive interface with file deletion capabilities
- Export/import functionality for scan results
- Mature and reliable C-based implementation
- Advanced filtering and performance options
- Comprehensive troubleshooting and integration guides

#### ⚡ [Gdu - Fast Go-based Disk Usage Analyzer](./gdu-disk-usage-analyzer.md)

Extremely fast, SSD-optimized disk usage analyzer written in Go

- Optimized for modern SSD storage with efficient I/O patterns
- Low memory footprint and streaming processing
- Interactive terminal interface with file management
- Performance benchmarking and optimization strategies
- Advanced usage patterns for large filesystems

#### ⏰ [Agedu - Time-based Disk Usage Analyzer](./agedu-disk-usage-analyzer.md)

Specialized tool for identifying unused files through access time analysis

- Time-based analysis to find truly unused files
- Web-based interface for detailed exploration
- Export capabilities in multiple formats (CSV, JSON)
- Trend analysis and historical comparison
- Automated monitoring and cleanup strategies

#### 🎨 [Diskonaut - Visual Disk Space Navigator](./diskonaut-disk-usage-analyzer.md)

Visual disk space navigator with intuitive interface and multiple view modes

- Visual representation with tree, list, and bar chart views
- Interactive navigation with file deletion capabilities
- Rust-based implementation with modern interface design
- Performance optimization for different filesystem types
- Advanced visual features and customization options

#### 🧹 [Arch Linux Disk Cleanup](./arch-linux-disk-cleanup.md)

Comprehensive disk cleanup strategies specifically for Arch Linux systems

- Package management cleanup (orphaned packages, cache management)
- System maintenance procedures and automated cleanup scripts
- Integration with disk usage analysis tools
- Performance monitoring and maintenance scheduling
- Best practices for system optimization

#### 📈 [Disk Usage Tools Comparison](./disk-usage-tools-comparison.md)

Comprehensive comparison guide for choosing the right disk usage analysis tool

- Detailed feature comparison matrix with performance benchmarks
- Use case recommendations and tool selection guide
- Integration strategies and workflow optimization
- Best practices for each tool with troubleshooting guides
- Performance testing and benchmarking methodologies

---

_These guides are based on real-world experience solving development issues across the Reynard ecosystem. Every pattern
has been tested and validated in production environments, from shell scripting to Python development, code quality
improvements, project management workflows, and system administration tasks._
