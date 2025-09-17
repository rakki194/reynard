# Unused Variables and Dead Code Guide

Eliminating dead code for cleaner, more maintainable Python applications.

## Overview

Dead code refers to code that is never executed or variables that are assigned but
never used. This includes unused variables, unreachable code, and
redundant logic. Dead code increases complexity, reduces readability, and
can hide bugs. This guide shows how to identify and eliminate dead code effectively.

## The Problem: Unused Variables

**❌ Unused Variables:**

```python
def get_hash_variant(hashed_password: str) -> str | None:
    parts = hashed_password.split("$")
    if len(parts) >= 2:
        variant = parts[1]  # Assigned but never used
        version = parts[2]  # Assigned but never used
        return parts[1]  # Why not use variant?

    return None

def validate_password_strength(password: str) -> tuple[bool, str]:
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    # has_special is calculated but never used

    if not (has_lower and has_upper and has_digit):
        return False, "Password must contain lowercase, uppercase, and numeric characters"

    return True, "Password meets strength requirements"
```

**Problems:**

- Dead code that serves no purpose
- Confusing variable names
- Unnecessary computations
- Poor code readability
- Increased maintenance burden

## The Solution: Clean Code

**✅ Clean Code:**

```python
def get_hash_variant(hashed_password: str) -> str | None:
    parts = hashed_password.split("$")
    if len(parts) >= ARGON2_MIN_PARTS:
        return parts[1]  # Direct return, no intermediate variable

    return None

def validate_password_strength(password: str) -> tuple[bool, str]:
    has_lower = any(c.islower() for c in password)
    has_upper = any(c.isupper() for c in password)
    has_digit = any(c.isdigit() for c in password)
    # Removed unused has_special variable

    if not (has_lower and has_upper and has_digit):
        return False, "Password must contain lowercase, uppercase, and numeric characters"

    return True, "Password meets strength requirements"
```

## Types of Dead Code

### 1. Unused Variables

```python
# ❌ Unused variables
def process_data(data: list) -> list:
    result = []
    multiplier = 2  # Unused
    for item in data:
        result.append(item * 2)
    return result

# ✅ Clean code
def process_data(data: list) -> list:
    return [item * 2 for item in data]
```

### 2. Unreachable Code

```python
# ❌ Unreachable code
def get_user_status(user_id: str) -> str:
    if not user_id:
        return "invalid"
        print("This will never execute")  # Unreachable

    return "valid"

# ✅ Clean code
def get_user_status(user_id: str) -> str:
    if not user_id:
        return "invalid"

    return "valid"
```

### 3. Redundant Conditions

```python
# ❌ Redundant conditions
def is_valid_age(age: int) -> bool:
    if age < 0:
        return False
    elif age > 150:
        return False
    elif age >= 0 and age <= 150:  # Redundant
        return True
    else:
        return False  # Unreachable

# ✅ Simplified logic
def is_valid_age(age: int) -> bool:
    return 0 <= age <= 150
```

### 4. Unused Imports

```python
# ❌ Unused imports
import os
import sys
import json
from typing import List, Dict, Any

def process_data(data: str) -> str:
    return data.upper()  # Only using string methods

# ✅ Clean imports
def process_data(data: str) -> str:
    return data.upper()
```

## Advanced Dead Code Detection

### AST-based Detection

```python
import ast
import sys
from typing import Set, List, Dict, Any

class DeadCodeDetector(ast.NodeVisitor):
    """AST visitor to detect dead code patterns."""

    def __init__(self):
        self.assigned_vars: Set[str] = set()
        self.used_vars: Set[str] = set()
        self.unused_vars: List[tuple[int, str]] = []
        self.imports: Dict[str, int] = {}
        self.used_imports: Set[str] = set()

    def visit_Assign(self, node):
        """Track variable assignments."""
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.assigned_vars.add(target.id)
        self.generic_visit(node)

    def visit_Name(self, node):
        """Track variable usage."""
        if isinstance(node.ctx, ast.Load):
            self.used_vars.add(node.id)
        self.generic_visit(node)

    def visit_Import(self, node):
        """Track import statements."""
        for alias in node.names:
            self.imports[alias.name] = node.lineno
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        """Track from imports."""
        for alias in node.names:
            full_name = f"{node.module}.{alias.name}" if node.module else alias.name
            self.imports[full_name] = node.lineno
        self.generic_visit(node)

    def visit_Attribute(self, node):
        """Track attribute access (for import usage)."""
        if isinstance(node.value, ast.Name):
            self.used_imports.add(node.value.id)
        self.generic_visit(node)

    def get_unused_variables(self) -> List[tuple[int, str]]:
        """Get list of unused variables with line numbers."""
        unused = []
        for var in self.assigned_vars - self.used_vars:
            # Find line number (simplified)
            unused.append((0, var))  # Would need more complex tracking
        return unused

    def get_unused_imports(self) -> List[tuple[int, str]]:
        """Get list of unused imports."""
        unused = []
        for imp, line in self.imports.items():
            if imp not in self.used_imports:
                unused.append((line, imp))
        return unused

def analyze_file(file_path: str) -> Dict[str, List[tuple[int, str]]]:
    """Analyze a Python file for dead code."""
    with open(file_path, 'r') as f:
        tree = ast.parse(f.read())

    detector = DeadCodeDetector()
    detector.visit(tree)

    return {
        'unused_variables': detector.get_unused_variables(),
        'unused_imports': detector.get_unused_imports()
    }
```

### Using Static Analysis Tools

```python
# Using vulture for dead code detection
# pip install vulture

import subprocess
import json
from pathlib import Path

class DeadCodeAnalyzer:
    """Analyze dead code using various tools."""

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def run_vulture(self) -> List[Dict[str, Any]]:
        """Run vulture dead code detection."""
        try:
            result = subprocess.run(
                ['vulture', str(self.project_root), '--min-confidence', '60'],
                capture_output=True,
                text=True
            )

            # Parse vulture output
            issues = []
            for line in result.stdout.split('\n'):
                if line.strip():
                    parts = line.split(':')
                    if len(parts) >= 3:
                        issues.append({
                            'file': parts[0],
                            'line': parts[1],
                            'message': ':'.join(parts[2:]).strip()
                        })

            return issues
        except FileNotFoundError:
            print("Vulture not found. Install with: pip install vulture")
            return []

    def run_unimport(self) -> List[str]:
        """Run unimport to find unused imports."""
        try:
            result = subprocess.run(
                ['unimport', '--check', str(self.project_root)],
                capture_output=True,
                text=True
            )

            # Parse unimport output
            unused_imports = []
            for line in result.stdout.split('\n'):
                if 'unused import' in line.lower():
                    unused_imports.append(line.strip())

            return unused_imports
        except FileNotFoundError:
            print("Unimport not found. Install with: pip install unimport")
            return []
```

## Common Dead Code Patterns

### 1. Unused Function Parameters

```python
# ❌ Unused parameters
def process_user(user_id: str, user_data: dict, unused_param: str) -> dict:
    # unused_param is never used
    return {"id": user_id, "data": user_data}

# ✅ Clean parameters
def process_user(user_id: str, user_data: dict) -> dict:
    return {"id": user_id, "data": user_data}

# ✅ Or use underscore for intentionally unused
def process_user(user_id: str, user_data: dict, _unused_param: str) -> dict:
    return {"id": user_id, "data": user_data}
```

### 2. Unused Return Values

```python
# ❌ Ignoring return values
def get_user_count() -> int:
    return 42

def process_users():
    get_user_count()  # Return value ignored
    # ... rest of function

# ✅ Use return values meaningfully
def process_users():
    user_count = get_user_count()
    if user_count > 100:
        print(f"Processing {user_count} users")
    # ... rest of function
```

### 3. Dead Conditional Branches

```python
# ❌ Dead branches
def get_status(is_active: bool) -> str:
    if is_active:
        return "active"
    elif not is_active:  # This is always true if we reach here
        return "inactive"
    else:
        return "unknown"  # Unreachable

# ✅ Simplified logic
def get_status(is_active: bool) -> str:
    return "active" if is_active else "inactive"
```

### 4. Unused Exception Variables

```python
# ❌ Unused exception variable
try:
    risky_operation()
except ValueError as e:  # e is never used
    print("Value error occurred")

# ✅ Use underscore for unused exceptions
try:
    risky_operation()
except ValueError as _:
    print("Value error occurred")

# ✅ Or use the exception meaningfully
try:
    risky_operation()
except ValueError as e:
    print(f"Value error occurred: {e}")
```

## Refactoring Strategies

### 1. Extract and Eliminate

```python
# Before: Mixed concerns with unused variables
def process_file(file_path: str) -> dict:
    with open(file_path, 'r') as f:
        content = f.read()

    lines = content.split('\n')
    word_count = len(content.split())
    char_count = len(content)
    line_count = len(lines)

    # Only using line_count, others are unused
    return {"lines": line_count}

# After: Focused function
def process_file(file_path: str) -> dict:
    with open(file_path, 'r') as f:
        content = f.read()

    line_count = len(content.split('\n'))
    return {"lines": line_count}
```

### 2. Consolidate Similar Logic

```python
# Before: Duplicate logic
def validate_email(email: str) -> bool:
    if not email:
        return False
    if '@' not in email:
        return False
    if '.' not in email.split('@')[1]:
        return False
    return True

def validate_username(username: str) -> bool:
    if not username:
        return False
    if len(username) < 3:
        return False
    if len(username) > 20:
        return False
    return True

# After: Consolidated validation
def validate_field(value: str, field_type: str) -> bool:
    if not value:
        return False

    if field_type == "email":
        return '@' in value and '.' in value.split('@')[1]
    elif field_type == "username":
        return 3 <= len(value) <= 20

    return False
```

### 3. Remove Redundant Checks

```python
# Before: Redundant validation
def process_data(data: list) -> list:
    if not data:
        return []

    if len(data) == 0:  # Redundant check
        return []

    if data is None:  # Already checked with 'not data'
        return []

    return [item * 2 for item in data]

# After: Clean validation
def process_data(data: list) -> list:
    if not data:
        return []

    return [item * 2 for item in data]
```

## Tools and Automation

### Pre-commit Hooks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/jendrikseipp/vulture
    rev: v2.9.1
    hooks:
      - id: vulture
        args: [--min-confidence, 60]

  - repo: https://github.com/hakancelik96/unimport
    rev: v0.1.0
    hooks:
      - id: unimport
        args: [--check]
```

### CI/CD Integration

```python
# scripts/dead_code_check.py
import subprocess
import sys
from pathlib import Path

def check_dead_code():
    """Check for dead code in the project."""
    project_root = Path(__file__).parent.parent

    # Run vulture
    vulture_result = subprocess.run(
        ['vulture', str(project_root), '--min-confidence', '70'],
        capture_output=True,
        text=True
    )

    if vulture_result.returncode != 0:
        print("Dead code detected:")
        print(vulture_result.stdout)
        return False

    # Run unimport
    unimport_result = subprocess.run(
        ['unimport', '--check', str(project_root)],
        capture_output=True,
        text=True
    )

    if unimport_result.returncode != 0:
        print("Unused imports detected:")
        print(unimport_result.stdout)
        return False

    print("No dead code detected!")
    return True

if __name__ == "__main__":
    success = check_dead_code()
    sys.exit(0 if success else 1)
```

## Best Practices

### 1. Regular Cleanup

```python
# Set up regular dead code detection
# In your development workflow:

# 1. Before committing
def pre_commit_check():
    """Run dead code detection before commit."""
    # Run vulture, unimport, etc.
    pass

# 2. In CI/CD pipeline
def ci_dead_code_check():
    """Check for dead code in CI."""
    # Fail build if dead code detected
    pass

# 3. Regular code reviews
def review_dead_code():
    """Include dead code in code reviews."""
    # Check for unused variables, imports, etc.
    pass
```

### 2. Gradual Elimination

```python
# Don't try to eliminate all dead code at once
# Start with the most obvious cases:

# Phase 1: Remove unused imports
# Phase 2: Remove unused variables
# Phase 3: Remove unreachable code
# Phase 4: Consolidate duplicate logic
```

### 3. Use Tools Consistently

```python
# Configure tools with consistent settings
# vulture.ini
[vulture]
min_confidence = 60
paths = src/
exclude = tests/

# .unimport.cfg
[tool.unimport]
sources = ["src"]
```

## Conclusion

🦦 _Eliminating dead code requires the playful thoroughness of an otter - diving deep into every nook and
cranny to find hidden treasures of unused code._

Removing dead code provides:

- **Clarity**: Code becomes easier to understand
- **Maintainability**: Less code to maintain and debug
- **Performance**: Slightly better runtime performance
- **Reliability**: Fewer places for bugs to hide
- **Reviewability**: Code reviews focus on meaningful changes

Key principles:

- **Detect systematically** using AST analysis and tools
- **Remove gradually** to avoid breaking changes
- **Automate detection** in CI/CD pipelines
- **Review regularly** as part of code maintenance
- **Use meaningful names** to avoid confusion
- **Document intentionally unused code** with comments

_Build code that flows like a crystal-clear stream, free of dead branches and unused debris._ 🦦
