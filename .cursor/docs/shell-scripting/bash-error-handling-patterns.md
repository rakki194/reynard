# Bash Error Handling Patterns

> Comprehensive guide to robust error handling in bash scripts

## Core Error Handling Principles

### The Fail-Fast Philosophy

Every bash script should fail fast and fail clearly:

- **Immediate failure**: Stop execution on first error
- **Clear messages**: Provide specific error information
- **Proper exit codes**: Use meaningful exit statuses
- **User guidance**: Tell users how to fix problems

### Essential Error Handling Setup

```bash
#!/bin/bash

# Essential error handling flags
set -e          # Exit immediately if a command exits with a non-zero status
set -u          # Exit immediately if an undefined variable is referenced
set -o pipefail # Exit immediately if any command in a pipeline fails

# Optional: Enable debugging
# set -x        # Print commands and their arguments as they are executed
```

## The `set -e` Behavior

### When `set -e` is Active

```bash
set -e

# These will cause script to exit immediately on failure
command_that_might_fail
another_command
```

### When `set -e` is Disabled

`set -e` is automatically disabled in these contexts:

1. **If statements**: `if command; then`
2. **While/until loops**: `while command; do`
3. **Command lists**: `command1 && command2`
4. **Negated commands**: `! command`

### The `set -e` Dilemma

This creates a conflict between:

- **Robustness**: Want `set -e` to catch all errors
- **Control**: Want explicit error handling in conditionals

## Error Handling Patterns

### Pattern 1: Explicit Error Handling (Recommended)

```bash
#!/bin/bash
set -e

# Function with explicit error handling
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

# Usage with explicit error handling
# shellcheck disable=SC2310  # set -e is intentionally disabled for explicit error handling
if ! check_service "http://localhost:8888" "Backend"; then
    print_error "Backend is not running. Please start it with: cd backend && ./start.sh"
    exit 1
fi
```

**Benefits**:

- Clear error messages
- Specific user guidance
- Controlled exit behavior
- Linter compliant

### Pattern 2: Separate Command Execution

```bash
#!/bin/bash
set -e

# Separate command execution
check_service "http://localhost:8888" "Backend"
if [[ $? -ne 0 ]]; then
    print_error "Backend is not running. Please start it with: cd backend && ./start.sh"
    exit 1
fi
```

**Benefits**:

- Preserves `set -e` behavior
- Explicit error checking
- Clear control flow

**Drawbacks**:

- ShellCheck SC2181 warning
- More verbose

### Pattern 3: Error Trapping

```bash
#!/bin/bash
set -e

# Global error handler
error_handler() {
    local exit_code=$?
    local line_number=$1

    echo "Error occurred on line ${line_number} with exit code ${exit_code}"
    echo "Script: ${BASH_SOURCE[0]}"
    echo "Function: ${FUNCNAME[1]}"

    # Cleanup operations
    cleanup

    exit ${exit_code}
}

# Set up error trap
trap 'error_handler ${LINENO}' ERR

# Cleanup function
cleanup() {
    echo "Performing cleanup..."
    # Remove temporary files, close connections, etc.
}
```

### Pattern 4: Function-Level Error Handling

```bash
#!/bin/bash
set -e

# Function with internal error handling
process_file() {
    local file="$1"

    # Check if file exists
    if [[ ! -f "${file}" ]]; then
        echo "Error: File ${file} does not exist" >&2
        return 1
    fi

    # Process file with error handling
    if ! process_content "${file}"; then
        echo "Error: Failed to process file ${file}" >&2
        return 1
    fi

    echo "Successfully processed ${file}"
    return 0
}

# Usage
if ! process_file "input.txt"; then
    echo "File processing failed"
    exit 1
fi
```

## Exit Code Management

### Standard Exit Codes

```bash
# Standard exit codes
EXIT_SUCCESS=0      # Success
EXIT_GENERAL=1      # General error
EXIT_MISUSE=2       # Misuse of shell builtins
EXIT_CANNOT_EXEC=126 # Command cannot execute
EXIT_NOT_FOUND=127  # Command not found
EXIT_INVALID_EXIT=128 # Invalid exit argument
EXIT_SIGNAL_BASE=128 # Base for signal exits

# Custom exit codes
EXIT_CONFIG_ERROR=10
EXIT_DEPENDENCY_ERROR=20
EXIT_PERMISSION_ERROR=30
EXIT_NETWORK_ERROR=40
```

### Exit Code Functions

```bash
# Exit with specific codes
exit_success() {
    echo "Operation completed successfully"
    exit ${EXIT_SUCCESS}
}

exit_config_error() {
    echo "Configuration error: $1" >&2
    exit ${EXIT_CONFIG_ERROR}
}

exit_dependency_error() {
    echo "Dependency error: $1" >&2
    exit ${EXIT_DEPENDENCY_ERROR}
}

exit_permission_error() {
    echo "Permission error: $1" >&2
    exit ${EXIT_PERMISSION_ERROR}
}

exit_network_error() {
    echo "Network error: $1" >&2
    exit ${EXIT_NETWORK_ERROR}
}
```

## Validation Patterns

### Input Validation

```bash
#!/bin/bash
set -e

# Validate required parameters
validate_parameters() {
    local required_params=("$@")

    for param in "${required_params[@]}"; do
        if [[ -z "${!param:-}" ]]; then
            echo "Error: Required parameter '${param}' is not set" >&2
            exit 1
        fi
    done
}

# Usage
validate_parameters "URL" "NAME" "TIMEOUT"
```

### File Validation

```bash
#!/bin/bash
set -e

# Validate file exists and is readable
validate_file() {
    local file="$1"
    local description="${2:-file}"

    if [[ -z "${file}" ]]; then
        echo "Error: ${description} path is empty" >&2
        return 1
    fi

    if [[ ! -e "${file}" ]]; then
        echo "Error: ${description} '${file}' does not exist" >&2
        return 1
    fi

    if [[ ! -f "${file}" ]]; then
        echo "Error: '${file}' is not a regular file" >&2
        return 1
    fi

    if [[ ! -r "${file}" ]]; then
        echo "Error: '${file}' is not readable" >&2
        return 1
    fi

    return 0
}

# Usage
validate_file "${config_file}" "configuration file"
```

### Directory Validation

```bash
#!/bin/bash
set -e

# Validate directory exists and is writable
validate_directory() {
    local dir="$1"
    local description="${2:-directory}"

    if [[ -z "${dir}" ]]; then
        echo "Error: ${description} path is empty" >&2
        return 1
    fi

    if [[ ! -d "${dir}" ]]; then
        echo "Error: '${dir}' is not a directory" >&2
        return 1
    fi

    if [[ ! -w "${dir}" ]]; then
        echo "Error: '${dir}' is not writable" >&2
        return 1
    fi

    return 0
}

# Usage
validate_directory "${output_dir}" "output directory"
```

## Retry Patterns

### Simple Retry

```bash
#!/bin/bash
set -e

# Simple retry function
retry() {
    local max_attempts="$1"
    local delay="$2"
    shift 2
    local command=("$@")

    local attempt=1
    while [[ ${attempt} -le ${max_attempts} ]]; do
        echo "Attempt ${attempt}/${max_attempts}: ${command[*]}"

        if "${command[@]}"; then
            echo "Command succeeded on attempt ${attempt}"
            return 0
        fi

        if [[ ${attempt} -lt ${max_attempts} ]]; then
            echo "Command failed, retrying in ${delay} seconds..."
            sleep "${delay}"
        fi

        ((attempt++))
    done

    echo "Command failed after ${max_attempts} attempts"
    return 1
}

# Usage
retry 3 5 curl -s "http://localhost:8080/health"
```

### Exponential Backoff

```bash
#!/bin/bash
set -e

# Exponential backoff retry
retry_with_backoff() {
    local max_attempts="$1"
    local base_delay="$2"
    shift 2
    local command=("$@")

    local attempt=1
    local delay="${base_delay}"

    while [[ ${attempt} -le ${max_attempts} ]]; do
        echo "Attempt ${attempt}/${max_attempts}: ${command[*]}"

        if "${command[@]}"; then
            echo "Command succeeded on attempt ${attempt}"
            return 0
        fi

        if [[ ${attempt} -lt ${max_attempts} ]]; then
            echo "Command failed, retrying in ${delay} seconds..."
            sleep "${delay}"
            delay=$((delay * 2))  # Exponential backoff
        fi

        ((attempt++))
    done

    echo "Command failed after ${max_attempts} attempts"
    return 1
}

# Usage
retry_with_backoff 5 2 curl -s "http://localhost:8080/health"
```

## Logging and Output

### Colored Output Functions

```bash
#!/bin/bash

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly BLUE='\033[0;34m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_debug() {
    if [[ "${DEBUG:-0}" = "1" ]]; then
        echo -e "${BLUE}[DEBUG]${NC} $1"
    fi
}
```

### Structured Logging

```bash
#!/bin/bash

# Structured logging
log_structured() {
    local level="$1"
    local message="$2"
    local timestamp=$(date -Iseconds)

    echo "{\"timestamp\":\"${timestamp}\",\"level\":\"${level}\",\"message\":\"${message}\"}"
}

# Usage
log_structured "INFO" "Script started"
log_structured "ERROR" "Failed to connect to database"
```

## Error Recovery Patterns

### Graceful Degradation

```bash
#!/bin/bash
set -e

# Graceful degradation example
check_optional_service() {
    local url="$1"
    local name="$2"

    if curl -s --head "${url}" > /dev/null; then
        log_success "${name} is available"
        return 0
    else
        log_warning "${name} is not available, continuing without it"
        return 1
    fi
}

# Usage with graceful degradation
if ! check_optional_service "http://localhost:9000" "Optional Service"; then
    log_info "Continuing without optional service"
    # Continue with reduced functionality
fi
```

### Fallback Mechanisms

```bash
#!/bin/bash
set -e

# Fallback mechanism
get_config_value() {
    local key="$1"
    local default_value="$2"

    # Try primary config
    if [[ -f "${PRIMARY_CONFIG}" ]]; then
        local value=$(grep "^${key}=" "${PRIMARY_CONFIG}" | cut -d'=' -f2)
        if [[ -n "${value}" ]]; then
            echo "${value}"
            return 0
        fi
    fi

    # Try secondary config
    if [[ -f "${SECONDARY_CONFIG}" ]]; then
        local value=$(grep "^${key}=" "${SECONDARY_CONFIG}" | cut -d'=' -f2)
        if [[ -n "${value}" ]]; then
            log_warning "Using secondary config for ${key}"
            echo "${value}"
            return 0
        fi
    fi

    # Use default value
    log_warning "Using default value for ${key}"
    echo "${default_value}"
    return 0
}

# Usage
timeout=$(get_config_value "TIMEOUT" "30")
```

## Testing Error Handling

### Error Simulation

```bash
#!/bin/bash
set -e

# Test error handling
test_error_handling() {
    echo "Testing error handling..."

    # Test 1: Command failure
    if ! false; then
        echo "✓ Command failure handling works"
    fi

    # Test 2: Function failure
    failing_function() {
        return 1
    }

    if ! failing_function; then
        echo "✓ Function failure handling works"
    fi

    # Test 3: File not found
    if ! [[ -f "/nonexistent/file" ]]; then
        echo "✓ File validation works"
    fi

    echo "All error handling tests passed"
}

# Run tests
test_error_handling
```

### Error Injection

```bash
#!/bin/bash
set -e

# Error injection for testing
inject_error() {
    local error_type="$1"

    case "${error_type}" in
        "network")
            # Simulate network error
            curl -s --connect-timeout 1 "http://nonexistent.invalid" > /dev/null
            ;;
        "permission")
            # Simulate permission error
            touch "/root/test" 2>/dev/null
            ;;
        "file")
            # Simulate file error
            cat "/nonexistent/file" > /dev/null
            ;;
        *)
            echo "Unknown error type: ${error_type}"
            return 1
            ;;
    esac
}

# Usage in tests
# inject_error "network"
```

## Key Takeaways

1. **Use `set -e`** for fail-fast behavior
2. **Handle errors explicitly** with clear messages
3. **Use proper exit codes** for different error types
4. **Validate inputs** before processing
5. **Implement retry logic** for transient failures
6. **Provide user guidance** in error messages
7. **Use structured logging** for debugging
8. **Test error handling** thoroughly
9. **Implement graceful degradation** where possible
10. **Document error handling decisions**

## Common Anti-Patterns

### What to Avoid

```bash
# ❌ Silent failures
command_that_might_fail > /dev/null 2>&1

# ❌ Generic error messages
echo "Error occurred"

# ❌ No error handling
command_that_might_fail
next_command  # This might fail too

# ❌ Ignoring exit codes
command_that_might_fail || true

# ❌ Poor error messages
echo "Failed"
```

### What to Use Instead

```bash
# ✅ Explicit error handling
if ! command_that_might_fail; then
    log_error "Specific error message with context"
    exit 1
fi

# ✅ Clear error messages
log_error "Failed to connect to database at ${DB_HOST}:${DB_PORT}"

# ✅ Proper error handling
if ! command_that_might_fail; then
    log_error "Command failed, aborting"
    exit 1
fi

# ✅ Meaningful exit codes
exit ${EXIT_DATABASE_ERROR}

# ✅ Helpful error messages
log_error "Configuration file '${config_file}' not found. Please create it using the template in docs/"
```

## Reference

- [Bash Error Handling](https://mywiki.wooledge.org/BashGuide/Practices#Error_Handling)
- [Shell Script Error Handling](https://www.davidpashley.com/articles/writing-robust-shell-scripts/)
- [Bash Best Practices](https://google.github.io/styleguide/shellguide.html)

_Robust error handling is not optional. It's the difference between a script that works and
a script that works reliably._
