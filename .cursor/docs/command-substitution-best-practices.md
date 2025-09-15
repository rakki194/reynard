# Command Substitution Best Practices

> Comprehensive guide to safe and efficient command substitution in bash

## Core Principles

### The Substitution Safety Rule

Command substitution should be:

- **Safe**: Protected against word splitting and pathname expansion
- **Efficient**: Minimize subprocess creation
- **Reliable**: Handle errors gracefully
- **Readable**: Clear and maintainable

### Essential Safety Patterns

```bash
#!/bin/bash
set -e

# Always quote command substitution
result="$(command)"
echo "${result}"

# Never use unquoted command substitution
# result=$(command)  # ❌ Dangerous
```

## Command Substitution Syntax

### Modern vs Legacy Syntax

```bash
# ✅ Modern syntax (preferred)
result=$(command)
files=$(ls *.txt)

# ❌ Legacy syntax (avoid)
result=`command`
files=`ls *.txt`
```

**Benefits of modern syntax**:

- Better nesting support
- More readable
- Consistent with other expansions
- ShellCheck compliant

### Nested Command Substitution

```bash
# ✅ Modern syntax handles nesting well
result=$(echo "The date is $(date)")

# ❌ Legacy syntax is problematic with nesting
result=`echo "The date is `date`"`  # This breaks!
```

## Common Patterns and Solutions

### Pattern 1: Simple Value Capture

```bash
#!/bin/bash
set -e

# ✅ Safe: Quoted command substitution
current_time=$(date)
current_dir=$(pwd)
user_name=$(whoami)

echo "Current time: ${current_time}"
echo "Current directory: ${current_dir}"
echo "User: ${user_name}"
```

### Pattern 2: Avoiding Return Value Masking

```bash
#!/bin/bash
set -e

# ❌ Problem: Command substitution masks return value
echo "Result: $(my_command)"

# ✅ Solution: Separate command execution
result=$(my_command)
echo "Result: ${result}"
```

**Why this matters**:

- The `echo` command's return value masks the `my_command` return value
- ShellCheck warns about this (SC2069)
- Separating allows proper error handling

### Pattern 3: Error Handling with Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Safe: Check command success before using result
if result=$(my_command 2>/dev/null); then
    echo "Success: ${result}"
else
    echo "Command failed"
    exit 1
fi

# ✅ Alternative: Use separate execution
my_command > temp_file
if [[ $? -eq 0 ]]; then
    result=$(cat temp_file)
    echo "Success: ${result}"
    rm temp_file
else
    echo "Command failed"
    rm -f temp_file
    exit 1
fi
```

### Pattern 4: Multiple Command Results

```bash
#!/bin/bash
set -e

# ✅ Efficient: Single command substitution
{
    echo "=== System Information ==="
    echo "Date: $(date)"
    echo "User: $(whoami)"
    echo "Host: $(hostname)"
    echo "Uptime: $(uptime)"
} > system_info.txt

# ❌ Inefficient: Multiple command substitutions
echo "Date: $(date)" > system_info.txt
echo "User: $(whoami)" >> system_info.txt
echo "Host: $(hostname)" >> system_info.txt
echo "Uptime: $(uptime)" >> system_info.txt
```

## File Operations

### Reading File Contents

```bash
#!/bin/bash
set -e

# ✅ Safe: Read file with error handling
if [[ -f "config.txt" ]]; then
    config_content=$(cat "config.txt")
    echo "Config loaded: ${#config_content} characters"
else
    echo "Config file not found"
    exit 1
fi

# ✅ Safe: Read with null handling
config_content=$(cat "config.txt" 2>/dev/null || echo "")
if [[ -n "${config_content}" ]]; then
    echo "Config: ${config_content}"
else
    echo "No config found"
fi
```

### Processing File Lists

```bash
#!/bin/bash
set -e

# ✅ Safe: Handle filenames with spaces
find . -name "*.txt" -print0 | while IFS= read -r -d '' file; do
    echo "Processing: ${file}"
    content=$(cat "${file}")
    echo "Content length: ${#content}"
done

# ❌ Dangerous: Word splitting on filenames with spaces
for file in $(find . -name "*.txt"); do
    echo "Processing: ${file}"  # Breaks with spaces in filenames
done
```

## Process Substitution

### Advanced Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Process substitution for complex operations
diff <(sort file1.txt) <(sort file2.txt)

# ✅ Process substitution with error handling
if diff <(sort file1.txt 2>/dev/null) <(sort file2.txt 2>/dev/null); then
    echo "Files are identical"
else
    echo "Files differ"
fi
```

### Combining Commands

```bash
#!/bin/bash
set -e

# ✅ Efficient: Combine multiple commands
{
    echo "=== Process List ==="
    ps aux
    echo ""
    echo "=== Memory Usage ==="
    free -h
    echo ""
    echo "=== Disk Usage ==="
    df -h
} > system_report.txt

# ✅ Alternative: Use process substitution
cat <(echo "=== Process List ==="; ps aux) \
    <(echo ""; echo "=== Memory Usage ==="; free -h) \
    <(echo ""; echo "=== Disk Usage ==="; df -h) \
    > system_report.txt
```

## Performance Optimization

### Minimizing Subprocess Creation

```bash
#!/bin/bash
set -e

# ❌ Inefficient: Multiple subprocess calls
echo "Date: $(date)"
echo "Time: $(date +%H:%M:%S)"
echo "Day: $(date +%A)"

# ✅ Efficient: Single subprocess call
date_info=$(date)
date_time=$(date +%H:%M:%S)
date_day=$(date +%A)

echo "Date: ${date_info}"
echo "Time: ${date_time}"
echo "Day: ${date_day}"

# ✅ Most efficient: Single command with multiple outputs
{
    echo "Date: $(date)"
    echo "Time: $(date +%H:%M:%S)"
    echo "Day: $(date +%A)"
} > date_info.txt
```

### Caching Command Results

```bash
#!/bin/bash
set -e

# ✅ Cache expensive command results
if [[ -z "${CACHED_HOSTNAME:-}" ]]; then
    CACHED_HOSTNAME=$(hostname)
fi

echo "Hostname: ${CACHED_HOSTNAME}"

# ✅ Cache with timestamp
CACHE_FILE="/tmp/hostname_cache"
CACHE_AGE=300  # 5 minutes

if [[ -f "${CACHE_FILE}" ]] && [[ $(($(date +%s) - $(stat -c %Y "${CACHE_FILE}"))) -lt ${CACHE_AGE} ]]; then
    CACHED_HOSTNAME=$(cat "${CACHE_FILE}")
else
    CACHED_HOSTNAME=$(hostname)
    echo "${CACHED_HOSTNAME}" > "${CACHE_FILE}"
fi
```

## Error Handling Patterns

### Safe Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Safe: Handle command failures
safe_command_substitution() {
    local command="$1"
    local default_value="${2:-}"

    if result=$(${command} 2>/dev/null); then
        echo "${result}"
    else
        echo "${default_value}"
    fi
}

# Usage
hostname=$(safe_command_substitution "hostname" "unknown")
uptime=$(safe_command_substitution "uptime" "unknown")
```

### Error Recovery

```bash
#!/bin/bash
set -e

# ✅ Error recovery with fallbacks
get_system_info() {
    local info_type="$1"

    case "${info_type}" in
        "hostname")
            hostname 2>/dev/null || echo "localhost"
            ;;
        "uptime")
            uptime 2>/dev/null || echo "uptime unavailable"
            ;;
        "memory")
            free -h 2>/dev/null || echo "memory info unavailable"
            ;;
        *)
            echo "unknown info type: ${info_type}"
            return 1
            ;;
    esac
}

# Usage
hostname=$(get_system_info "hostname")
uptime=$(get_system_info "uptime")
```

## Advanced Patterns

### Conditional Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Conditional execution
if [[ "${DEBUG:-0}" = "1" ]]; then
    debug_info=$(ps aux | head -10)
    echo "Debug info: ${debug_info}"
fi

# ✅ Conditional with default
verbose_output=$(if [[ "${VERBOSE:-0}" = "1" ]]; then echo "verbose"; else echo "quiet"; fi)
```

### Multi-line Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Multi-line command substitution
system_info=$(cat <<EOF
Hostname: $(hostname)
Date: $(date)
User: $(whoami)
Uptime: $(uptime)
EOF
)

echo "${system_info}"
```

### Array Command Substitution

```bash
#!/bin/bash
set -e

# ✅ Array from command substitution
mapfile -t files < <(find . -name "*.txt" -type f)

# ✅ Process array elements
for file in "${files[@]}"; do
    echo "Processing: ${file}"
    content=$(cat "${file}")
    echo "Size: ${#content} characters"
done
```

## Security Considerations

### Sanitizing Command Output

```bash
#!/bin/bash
set -e

# ✅ Sanitize command output
sanitize_output() {
    local input="$1"

    # Remove control characters
    echo "${input}" | tr -d '\000-\037\177-\377'
}

# Usage
user_input=$(sanitize_output "$(whoami)")
echo "Sanitized user: ${user_input}"
```

### Safe Command Execution

```bash
#!/bin/bash
set -e

# ✅ Safe command execution with validation
safe_execute() {
    local command="$1"
    local allowed_commands=("date" "whoami" "hostname" "pwd")

    # Validate command
    if [[ " ${allowed_commands[*]} " =~ " ${command} " ]]; then
        result=$(${command} 2>/dev/null)
        echo "${result}"
    else
        echo "Command not allowed: ${command}"
        return 1
    fi
}

# Usage
current_date=$(safe_execute "date")
current_user=$(safe_execute "whoami")
```

## Testing Command Substitution

### Unit Testing

```bash
#!/bin/bash
set -e

# Test command substitution functions
test_command_substitution() {
    echo "Testing command substitution..."

    # Test 1: Basic substitution
    result=$(echo "test")
    if [[ "${result}" = "test" ]]; then
        echo "✓ Basic substitution works"
    else
        echo "✗ Basic substitution failed"
        return 1
    fi

    # Test 2: Error handling
    if result=$(false 2>/dev/null); then
        echo "✗ Error handling failed"
        return 1
    else
        echo "✓ Error handling works"
    fi

    # Test 3: Nested substitution
    result=$(echo "The date is $(date)")
    if [[ "${result}" =~ "The date is" ]]; then
        echo "✓ Nested substitution works"
    else
        echo "✗ Nested substitution failed"
        return 1
    fi

    echo "All command substitution tests passed"
}

# Run tests
test_command_substitution
```

## Common Anti-Patterns

### What to Avoid

```bash
# ❌ Unquoted command substitution
result=$(command)

# ❌ Legacy backticks
result=`command`

# ❌ Command substitution in echo
echo "Result: $(command)"

# ❌ Unsafe file processing
for file in $(ls *.txt); do

# ❌ No error handling
result=$(risky_command)

# ❌ Inefficient multiple calls
echo "Date: $(date)"
echo "Time: $(date +%H:%M:%S)"
```

### What to Use Instead

```bash
# ✅ Quoted command substitution
result="$(command)"

# ✅ Modern syntax
result=$(command)

# ✅ Separate command execution
result=$(command)
echo "Result: ${result}"

# ✅ Safe file processing
find . -name "*.txt" -print0 | while IFS= read -r -d '' file; do

# ✅ Error handling
if result=$(risky_command 2>/dev/null); then
    echo "Success: ${result}"
else
    echo "Command failed"
fi

# ✅ Efficient single call
date_info=$(date)
echo "Date: ${date_info}"
echo "Time: $(date +%H:%M:%S)"
```

## Key Takeaways

1. **Always quote command substitution** to prevent word splitting
2. **Use modern `$(...)` syntax** instead of legacy backticks
3. **Separate command execution** from output to avoid return value masking
4. **Handle errors explicitly** with proper error checking
5. **Minimize subprocess creation** for better performance
6. **Use process substitution** for complex operations
7. **Sanitize command output** for security
8. **Test command substitution** thoroughly
9. **Cache expensive results** when appropriate
10. **Use arrays** for multi-line command output

## Reference

- [Bash Command Substitution](https://mywiki.wooledge.org/CommandSubstitution)
- [ShellCheck Rules](https://github.com/koalaman/shellcheck/wiki)
- [Bash Best Practices](https://google.github.io/styleguide/shellguide.html)

_Command substitution is powerful but dangerous. Use it wisely and safely._
