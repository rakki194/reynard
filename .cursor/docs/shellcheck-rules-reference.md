# ShellCheck Rules Reference

> Comprehensive guide to ShellCheck rules, their meanings, and solutions

## Critical Rules (Must Fix)

### SC2181: Check exit code directly

**Message**: `Check exit code directly with e.g. 'if ! mycmd;', not indirectly with $?.`

**Problem**: Using `$?` to check exit codes can be unreliable if other commands execute between the target command and
the check.

```bash
# ❌ Avoid: Indirect exit code checking
my_command
if [[ $? -ne 0 ]]; then
    echo "Command failed"
fi

# ✅ Preferred: Direct exit code checking
if ! my_command; then
    echo "Command failed"
fi
```

### SC2310: Function in if condition disables set -e

**Message**: `This function is invoked in an 'if' condition so set -e will be disabled. Invoke separately if
failures should cause the script to exit.`

**Problem**: When a function is called within an `if` statement, bash disables `set -e` for that specific command.

```bash
# ❌ Avoid: Function in if condition (disables set -e)
if my_function; then
    echo "Success"
fi

# ✅ Solution: Use direct exit code checking with explicit handling
# shellcheck disable=SC2310  # set -e is intentionally disabled for explicit error handling
if ! my_function; then
    echo "Function failed"
    exit 1
fi
```

### SC2086: Double quote to prevent globbing and word splitting

**Message**: `Double quote to prevent globbing and word splitting.`

**Problem**: Unquoted variables can cause word splitting and pathname expansion.

```bash
# ❌ Avoid: Unquoted variables
if [ $var = "value" ]; then
    echo $filename
fi

# ✅ Preferred: Quoted variables
if [[ "${var}" = "value" ]]; then
    echo "${filename}"
fi
```

## Test Syntax Rules

### SC2039: In POSIX sh, `[[ ]]` is undefined

**Message**: `In POSIX sh, [[ ]] is undefined.`

**Problem**: `[[ ]]` is a bash extension, not available in POSIX sh.

```bash
# ❌ Avoid: [[ ]] in POSIX sh scripts
#!/bin/sh
if [[ $var = "value" ]]; then

# ✅ Solution: Use [ ] for POSIX compatibility
#!/bin/sh
if [ "$var" = "value" ]; then

# ✅ Or: Use bash explicitly
#!/bin/bash
if [[ "$var" = "value" ]]; then
```

### SC2166: Prefer `[ p ] && [ q ]` as `[ p -a q ]` is not well defined

**Message**: `Prefer [ p ] && [ q ] as [ p -a q ] is not well defined.`

**Problem**: The `-a` and `-o` operators in `[ ]` are not well defined.

```bash
# ❌ Avoid: -a and -o operators
if [ -f file -a -r file ]; then

# ✅ Preferred: Separate conditions
if [[ -f "file" ]] && [[ -r "file" ]]; then
```

## Variable and Expansion Rules

### SC2034: Variable appears unused

**Message**: `Variable appears unused. Verify use (or export if used externally).`

**Problem**: Variable is defined but never used.

```bash
# ❌ Avoid: Unused variables
unused_var="value"
echo "Hello"

# ✅ Solution: Remove unused variables or use them
used_var="value"
echo "Hello ${used_var}"
```

### SC2154: Variable is referenced but not assigned

**Message**: `Variable is referenced but not assigned.`

**Problem**: Variable is used but never defined.

```bash
# ❌ Avoid: Undefined variables
echo "${undefined_var}"

# ✅ Solution: Define the variable
defined_var="value"
echo "${defined_var}"
```

### SC1091: Not following: source files not found

**Message**: `Not following: source files not found.`

**Problem**: ShellCheck cannot find source files.

```bash
# ❌ Avoid: Relative paths that may not exist
source ./config.sh

# ✅ Solution: Use absolute paths or check existence
if [[ -f "./config.sh" ]]; then
    source "./config.sh"
fi
```

## Command Substitution Rules

### SC2005: Useless use of echo

**Message**: `Useless use of echo.`

**Problem**: Using `echo` with command substitution when direct output is sufficient.

```bash
# ❌ Avoid: Useless echo
echo $(date)

# ✅ Preferred: Direct command
date
```

### SC2006: Use `$(..)` instead of legacy `..`

**Message**: `Use $(..) instead of legacy ..`

**Problem**: Backticks are legacy syntax.

```bash
# ❌ Avoid: Legacy backticks
result=`command`

# ✅ Preferred: Modern command substitution
result=$(command)
```

## File and Path Rules

### SC2044: For loops over find output are fragile

**Message**: `For loops over find output are fragile. Use find -exec or a while read loop.`

**Problem**: `for` loops over `find` output can break with filenames containing spaces.

```bash
# ❌ Avoid: Fragile find loop
for file in $(find . -name "*.txt"); do
    echo "$file"
done

# ✅ Preferred: Use find -exec
find . -name "*.txt" -exec echo {} \;

# ✅ Or: Use while read loop
find . -name "*.txt" -print0 | while IFS= read -r -d '' file; do
    echo "$file"
done
```

### SC2086: Double quote to prevent globbing and word splitting

**Message**: `Double quote to prevent globbing and word splitting.`

**Problem**: Unquoted variables in file operations.

```bash
# ❌ Avoid: Unquoted file variables
rm $file
cp $source $dest

# ✅ Preferred: Quoted file variables
rm "${file}"
cp "${source}" "${dest}"
```

## Redirection Rules

### SC2129: Consider using `{ cmd1; cmd2; } >> file` instead of individual redirects

**Message**: `Consider using { cmd1; cmd2; } >> file instead of individual redirects.`

**Problem**: Multiple individual redirects to the same file are inefficient.

```bash
# ❌ Avoid: Multiple individual redirects
echo "Header" >> file.txt
echo "" >> file.txt
cat content.txt >> file.txt
echo "" >> file.txt

# ✅ Preferred: Command group with single redirect
{
    echo "Header"
    echo ""
    cat content.txt
    echo ""
} >> file.txt
```

### SC2069: Consider invoking this command separately to avoid masking its return value

**Message**: `Consider invoking this command separately to avoid masking its return value (or use '|| true' to ignore).`

**Problem**: Command substitution can mask return values.

```bash
# ❌ Avoid: Command substitution masking return value
echo "Result: $(my_command)"

# ✅ Preferred: Separate command execution
result=$(my_command)
echo "Result: ${result}"
```

## Arithmetic Rules

### SC2003: `expr` is antiquated

**Message**: `expr is antiquated. Consider using $((..)), ${var//search/replace}, or [[ string =~ regex ]].`

**Problem**: `expr` is legacy syntax.

```bash
# ❌ Avoid: Legacy expr
result=$(expr $a + $b)

# ✅ Preferred: Modern arithmetic
result=$((a + b))
```

### SC2004: `$/${}` is unnecessary on arithmetic variables

**Message**: `$/${} is unnecessary on arithmetic variables.`

**Problem**: Unnecessary variable expansion in arithmetic contexts.

```bash
# ❌ Avoid: Unnecessary expansion
result=$((${a} + ${b}))

# ✅ Preferred: Direct arithmetic
result=$((a + b))
```

## Function Rules

### SC2120: Function is defined but never called

**Message**: `Function is defined but never called.`

**Problem**: Function is defined but never used.

```bash
# ❌ Avoid: Unused functions
unused_function() {
    echo "Never called"
}

# ✅ Solution: Remove unused functions or call them
used_function() {
    echo "Called somewhere"
}
```

### SC2121: Function is called but never defined

**Message**: `Function is called but never defined.`

**Problem**: Function is called but not defined.

```bash
# ❌ Avoid: Undefined function calls
my_function

# ✅ Solution: Define the function
my_function() {
    echo "Function body"
}
```

## Best Practices for Rule Management

### When to Disable Rules

Only disable ShellCheck rules when:

1. The rule conflicts with another rule
2. The alternative is significantly worse
3. You have a valid technical reason
4. You document the decision thoroughly

### Proper Disable Comments

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

### Rule Priority

1. **Critical Rules** (SC2181, SC2310, SC2086): Always fix or document
2. **Syntax Rules** (SC2039, SC2166): Fix for compatibility
3. **Variable Rules** (SC2034, SC2154): Fix for correctness
4. **Performance Rules** (SC2129, SC2069): Fix for efficiency
5. **Style Rules** (SC2006, SC2003): Fix for modern syntax

## Integration with CI/CD

### ShellCheck in CI Pipeline

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

## Key Takeaways

1. **Always quote variables** to prevent word splitting
2. **Use direct exit code checking** with `if ! command; then`
3. **Prefer `[[ ]]` over `[ ]`** for bash scripts
4. **Use command groups** for multiple redirects
5. **Separate command execution** from output
6. **Document rule disables** with detailed reasoning
7. **Run ShellCheck** in CI/CD pipelines
8. **Fix critical rules** before style rules
9. **Use modern syntax** over legacy alternatives
10. **Test scripts** after making changes

## Reference

- [ShellCheck Wiki](https://github.com/koalaman/shellcheck/wiki)
- [ShellCheck Rules](https://github.com/koalaman/shellcheck/wiki/Checks)
- [Bash Best Practices](https://mywiki.wooledge.org/BashGuide)

_ShellCheck is your friend. Listen to its warnings, but understand the reasoning behind each rule._
