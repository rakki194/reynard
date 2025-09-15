# Shell Script Best Practices Guide

> Essential patterns for maintainable, robust, and linter-compliant shell scripts

## Core Principles

### The Robustness Principle

Every shell script should be:

- **Fail-fast**: Exit immediately on unexpected errors
- **Explicit**: Clear error handling and user feedback
- **Maintainable**: Easy to understand and modify
- **Linter-compliant**: Follows ShellCheck recommendations

### Essential Script Headers

```bash
#!/bin/bash

# Script: script-name.sh
# Description: Brief description of what this script does
# Author: Your Name
# Date: $(date +%Y-%m-%d)

set -e          # Exit on any error
set -u          # Exit on undefined variables
set -o pipefail # Exit on pipe failures
```

## Error Handling Patterns

### The `set -e` Dilemma

The `set -e` option causes scripts to exit immediately on any command failure. However,
it's disabled in certain contexts, creating a conflict with linter recommendations.

#### Problem: Conflicting ShellCheck Rules

- **SC2181**: "Check exit code directly with e.g. 'if ! mycmd;', not indirectly with $?"
- **SC2310**: "This function is invoked in an 'if' condition so set -e will be disabled"

#### Solution: Explicit Error Handling

```bash
# ❌ Avoid: Indirect exit code checking
my_function
if [[ $? -ne 0 ]]; then
    echo "Function failed"
    exit 1
fi

# ❌ Avoid: Function in if condition (disables set -e)
if my_function; then
    echo "Success"
else
    echo "Failed"
fi

# ✅ Preferred: Direct exit code checking with explicit handling
# shellcheck disable=SC2310  # set -e is intentionally disabled for explicit error handling
if ! my_function; then
    echo "Function failed"
    exit 1
fi
```

### Command Substitution Best Practices

#### Problem: Return Value Masking

```bash
# ❌ Avoid: Command substitution in echo masks return value
echo "Result: $(my_command)"
```

#### Solution: Separate Command Execution

```bash
# ✅ Preferred: Separate command execution
result=$(my_command)
echo "Result: ${result}"
```

## File I/O Optimization

### Multiple Redirects to Same File

#### Problem: Inefficient Multiple Redirects

```bash
# ❌ Avoid: Multiple individual redirects
echo "Header" >> file.txt
echo "" >> file.txt
cat content.txt >> file.txt
echo "" >> file.txt
```

#### Solution: Command Groups

```bash
# ✅ Preferred: Single redirect with command group
{
    echo "Header"
    echo ""
    cat content.txt
    echo ""
} >> file.txt
```

## Test Syntax Best Practices

### Modern Test Syntax

```bash
# ❌ Avoid: Legacy test syntax
if [ ! -f "file.txt" ]; then
    echo "File not found"
fi

# ✅ Preferred: Modern test syntax
if [[ ! -f "file.txt" ]]; then
    echo "File not found"
fi
```

### Benefits of `[[ ]]` over `[ ]`

- Better string handling
- More reliable pattern matching
- Safer variable expansion
- Enhanced logical operators

## Variable Handling

### Proper Variable Expansion

```bash
# ❌ Avoid: Unquoted variables
echo $variable

# ✅ Preferred: Quoted variables
echo "${variable}"

# ✅ Preferred: Explicit variable assignment
current_dir=$(pwd)
echo "Current directory: ${current_dir}"
```

### Variable Naming Conventions

```bash
# Use descriptive names
failed_benchmarks=0
execution_time=$(date)
current_directory=$(pwd)

# Use UPPERCASE for constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly MAX_RETRIES=3
```

## Function Design Patterns

### Robust Function Structure

```bash
# Function with proper error handling
check_service() {
    local url="$1"
    local name="$2"

    if curl -s --head "${url}" > /dev/null; then
        print_success "${name} is running at ${url}"
        return 0
    else
        print_warning "${name} is not running at ${url}"
        return 1
    fi
}
```

### Function Best Practices

- Use `local` for function variables
- Quote all variable expansions
- Return meaningful exit codes
- Provide clear success/failure messages

## Output and Logging

### Colored Output Functions

```bash
# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}
```

## Script Organization

### Directory Structure

```bash
# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "e2e" ]]; then
    print_error "Please run this script from the Reynard project root directory"
    exit 1
fi
```

### Service Dependencies

```bash
# Check required services
check_service "http://localhost:8888" "Backend"
# shellcheck disable=SC2310  # set -e is intentionally disabled for explicit error handling
if ! check_service "http://localhost:8888" "Backend"; then
    print_error "Backend is not running. Please start it with: cd backend && ./start.sh"
    exit 1
fi
```

## Performance Optimization

### Efficient Command Execution

```bash
# ❌ Avoid: Multiple command calls
echo "Time: $(date)"
echo "Directory: $(pwd)"

# ✅ Preferred: Single command calls
current_time=$(date)
current_dir=$(pwd)
echo "Time: ${current_time}"
echo "Directory: ${current_dir}"
```

### Batch Operations

```bash
# ✅ Preferred: Batch file operations
{
    echo "### Section 1"
    echo ""
    cat file1.txt
    echo ""
    echo "### Section 2"
    echo ""
    cat file2.txt
} >> combined-report.md
```

## Common Anti-Patterns

### What to Avoid

```bash
# ❌ Unquoted variables
if [ $var = "value" ]; then

# ❌ Legacy test syntax
if [ ! -f file ]; then

# ❌ Indirect exit code checking
cmd; if [ $? -ne 0 ]; then

# ❌ Multiple redirects
echo "line1" >> file
echo "line2" >> file

# ❌ Command substitution in echo
echo "Result: $(cmd)"
```

### What to Use Instead

```bash
# ✅ Quoted variables
if [[ "${var}" = "value" ]]; then

# ✅ Modern test syntax
if [[ ! -f "file" ]]; then

# ✅ Direct exit code checking
if ! cmd; then

# ✅ Command groups
{ echo "line1"; echo "line2"; } >> file

# ✅ Separate command execution
result=$(cmd)
echo "Result: ${result}"
```

## ShellCheck Integration

### Common ShellCheck Rules

- **SC2181**: Use direct exit code checking
- **SC2310**: Function in if condition disables set -e
- **SC2086**: Quote variables to prevent word splitting
- **SC2034**: Unused variables
- **SC1091**: Source files not found

### Disabling Rules (When Appropriate)

```bash
# shellcheck disable=SC2310
# SC2310: "This function is invoked in an 'if' condition so set -e will be disabled"
#
# DETAILED REASONING:
# 1. We use "if ! check_service" (ShellCheck SC2181 recommended pattern)
# 2. The "if !" pattern disables set -e for this specific command, which is INTENTIONAL
# 3. We want explicit error handling here - if the service check fails, we want to:
#    - Print a specific error message
#    - Exit with code 1
#    - Not rely on set -e to terminate the script
# 4. This gives us precise control over error handling and user messaging
if ! check_service "http://localhost:8888" "Backend"; then
    print_error "Backend is not running. Please start it with: cd backend && ./start.sh"
    exit 1
fi
```

## Testing and Validation

### Script Validation

```bash
# Validate script syntax
bash -n script.sh

# Run ShellCheck
shellcheck script.sh

# Test with different shells
bash script.sh
sh script.sh
```

### Error Simulation

```bash
# Test error handling
set -e
# Simulate failure
false  # This should exit the script
```

## Key Takeaways

1. **Use `set -e`** for fail-fast behavior
2. **Quote all variables** to prevent word splitting
3. **Use `[[ ]]` instead of `[ ]`** for modern test syntax
4. **Handle errors explicitly** with proper exit codes
5. **Use command groups** for multiple redirects
6. **Separate command execution** from output
7. **Document ShellCheck disables** with detailed reasoning
8. **Follow consistent naming conventions**
9. **Provide clear user feedback** with colored output
10. **Validate scripts** before deployment

## Reference

- [ShellCheck Wiki](https://github.com/koalaman/shellcheck/wiki)
- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide)
- [Google Shell Style Guide](https://google.github.io/styleguide/shellguide.html)

_Every line of shell script is a potential point of failure. Make each line robust, clear, and purposeful._
