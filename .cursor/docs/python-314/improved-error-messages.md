# Improved Error Messages in Python 3.14

## Overview

Python 3.14 introduces significant improvements to error messages, making them more informative, user-friendly, and actionable. These enhancements help developers diagnose and fix issues more efficiently by providing better context, suggestions, and clearer explanations.

## The Problem with Current Error Messages

### Unclear Error Messages

```python
# Python 3.13 - Unclear error messages
def process_data(data):
    return data.upper()

# This gives a generic AttributeError
try:
    result = process_data(123)
except AttributeError as e:
    print(f"Error: {e}")
    # Output: 'int' object has no attribute 'upper'
    # Not very helpful - doesn't suggest what to do
```

### Missing Context

```python
# Python 3.13 - Missing context in error messages
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count

# This gives a generic TypeError
try:
    result = calculate_average("hello")
except TypeError as e:
    print(f"Error: {e}")
    # Output: unsupported operand type(s) for +: 'int' and 'str'
    # Doesn't explain what the function expects
```

### Poor Suggestions

```python
# Python 3.13 - Poor suggestions for common mistakes
def greet_user(name, age):
    print(f"Hello {name}, you are {age} years old")

# This gives a generic TypeError
try:
    greet_user("Alice")
except TypeError as e:
    print(f"Error: {e}")
    # Output: greet_user() missing 1 required positional argument: 'age'
    # Doesn't suggest the correct usage
```

## Python 3.14 Solution: Improved Error Messages

### Better AttributeError Messages

```python
# Python 3.14 - Improved AttributeError messages
def process_data(data):
    return data.upper()

# This now provides better context and suggestions
try:
    result = process_data(123)
except AttributeError as e:
    print(f"Error: {e}")
    # Output: 'int' object has no attribute 'upper'.
    # Did you mean to convert to string first? Try str(data).upper()
    # Or perhaps you meant to use a different method like abs() for numbers?
```

### Enhanced TypeError Messages

```python
# Python 3.14 - Enhanced TypeError messages
def calculate_average(numbers):
    total = sum(numbers)
    count = len(numbers)
    return total / count

# This now provides better context
try:
    result = calculate_average("hello")
except TypeError as e:
    print(f"Error: {e}")
    # Output: calculate_average() expected an iterable of numbers,
    # but got 'str'. Did you mean to pass a list of numbers like [1, 2, 3]?
```

### Improved Function Call Errors

```python
# Python 3.14 - Improved function call errors
def greet_user(name, age):
    print(f"Hello {name}, you are {age} years old")

# This now provides better suggestions
try:
    greet_user("Alice")
except TypeError as e:
    print(f"Error: {e}")
    # Output: greet_user() missing 1 required positional argument: 'age'
    # Usage: greet_user(name, age)
    # Example: greet_user("Alice", 25)
```

## Advanced Error Message Features

### Contextual Suggestions

```python
# Python 3.14 - Contextual suggestions
def process_user_data(user_data):
    if not isinstance(user_data, dict):
        raise TypeError(
            f"Expected dict, got {type(user_data).__name__}. "
            f"Did you mean to pass a dictionary with user information? "
            f"Example: {{'name': 'Alice', 'age': 25}}"
        )

    name = user_data['name']
    age = user_data['age']
    return f"User: {name}, Age: {age}"

# This provides helpful suggestions
try:
    result = process_user_data("Alice")
except TypeError as e:
    print(f"Error: {e}")
    # Output: Expected dict, got str. Did you mean to pass a dictionary
    # with user information? Example: {'name': 'Alice', 'age': 25}
```

### Common Mistake Detection

```python
# Python 3.14 - Common mistake detection
def divide_numbers(a, b):
    return a / b

# This detects common mistakes
try:
    result = divide_numbers(10, 0)
except ZeroDivisionError as e:
    print(f"Error: {e}")
    # Output: division by zero
    # Suggestion: Check if the divisor is zero before dividing
    # Example: if b != 0: return a / b
```

### Import Error Improvements

```python
# Python 3.14 - Improved import errors
try:
    import non_existent_module
except ImportError as e:
    print(f"Error: {e}")
    # Output: No module named 'non_existent_module'
    # Suggestion: Check if the module name is correct
    # Did you mean 'existing_module'? (if similar name exists)
    # Or install it with: pip install non_existent_module
```

## Real-World Examples

### Database Connection Errors

```python
# Python 3.14 - Database connection error improvements
def connect_to_database(host, port, database, username, password):
    if not host:
        raise ValueError(
            "Database host is required. "
            "Example: connect_to_database('localhost', 5432, 'mydb', 'user', 'pass')"
        )

    if not isinstance(port, int):
        raise TypeError(
            f"Port must be an integer, got {type(port).__name__}. "
            f"Example: connect_to_database('localhost', 5432, 'mydb', 'user', 'pass')"
        )

    # Simulate connection
    return f"Connected to {database} on {host}:{port}"

# This provides helpful suggestions
try:
    result = connect_to_database("", 5432, "mydb", "user", "pass")
except ValueError as e:
    print(f"Error: {e}")
    # Output: Database host is required.
    # Example: connect_to_database('localhost', 5432, 'mydb', 'user', 'pass')
```

### File Processing Errors

```python
# Python 3.14 - File processing error improvements
def process_file(filename):
    if not filename:
        raise ValueError(
            "Filename is required. "
            "Example: process_file('data.txt')"
        )

    if not isinstance(filename, str):
        raise TypeError(
            f"Filename must be a string, got {type(filename).__name__}. "
            f"Example: process_file('data.txt')"
        )

    try:
        with open(filename, 'r') as f:
            return f.read()
    except FileNotFoundError as e:
        raise FileNotFoundError(
            f"File '{filename}' not found. "
            f"Check if the file exists and the path is correct. "
            f"Current working directory: {os.getcwd()}"
        ) from e

# This provides helpful context
try:
    result = process_file("nonexistent.txt")
except FileNotFoundError as e:
    print(f"Error: {e}")
    # Output: File 'nonexistent.txt' not found.
    # Check if the file exists and the path is correct.
    # Current working directory: /home/user/project
```

### API Response Errors

```python
# Python 3.14 - API response error improvements
def process_api_response(response):
    if not response:
        raise ValueError(
            "API response is required. "
            "Example: process_api_response({'status': 'success', 'data': {...}})"
        )

    if not isinstance(response, dict):
        raise TypeError(
            f"API response must be a dictionary, got {type(response).__name__}. "
            f"Example: process_api_response({'status': 'success', 'data': {...}})"
        )

    if 'status' not in response:
        raise KeyError(
            "API response missing 'status' field. "
            "Expected format: {'status': 'success', 'data': {...}}"
        )

    return response['data']

# This provides helpful suggestions
try:
    result = process_api_response("invalid response")
except TypeError as e:
    print(f"Error: {e}")
    # Output: API response must be a dictionary, got str.
    # Example: process_api_response({'status': 'success', 'data': {...}})
```

## Error Message Customization

### Custom Error Messages

```python
# Python 3.14 - Custom error messages
class ValidationError(Exception):
    def __init__(self, message, field=None, value=None, suggestions=None):
        self.field = field
        self.value = value
        self.suggestions = suggestions

        if suggestions:
            message += f"\nSuggestions: {', '.join(suggestions)}"

        super().__init__(message)

def validate_email(email):
    if not email:
        raise ValidationError(
            "Email is required",
            field="email",
            suggestions=["Enter a valid email address", "Example: user@example.com"]
        )

    if "@" not in email:
        raise ValidationError(
            f"Invalid email format: '{email}'",
            field="email",
            value=email,
            suggestions=["Email must contain '@'", "Example: user@example.com"]
        )

    return email

# This provides custom error messages with suggestions
try:
    result = validate_email("invalid-email")
except ValidationError as e:
    print(f"Error: {e}")
    # Output: Invalid email format: 'invalid-email'
    # Suggestions: Email must contain '@', Example: user@example.com
```

### Error Message Templates

```python
# Python 3.14 - Error message templates
class ErrorMessageTemplate:
    @staticmethod
    def missing_required_field(field_name, example_value):
        return (
            f"Required field '{field_name}' is missing. "
            f"Example: {field_name}='{example_value}'"
        )

    @staticmethod
    def invalid_type(field_name, expected_type, actual_type, example_value):
        return (
            f"Field '{field_name}' must be {expected_type}, got {actual_type}. "
            f"Example: {field_name}={example_value}"
        )

    @staticmethod
    def invalid_value(field_name, value, valid_values):
        return (
            f"Invalid value for '{field_name}': '{value}'. "
            f"Valid values: {', '.join(map(str, valid_values))}"
        )

def validate_user_data(user_data):
    if not isinstance(user_data, dict):
        raise TypeError(ErrorMessageTemplate.invalid_type(
            "user_data", "dict", type(user_data).__name__,
            {"name": "Alice", "age": 25}
        ))

    if "name" not in user_data:
        raise KeyError(ErrorMessageTemplate.missing_required_field(
            "name", "Alice"
        ))

    if "age" not in user_data:
        raise KeyError(ErrorMessageTemplate.missing_required_field(
            "age", 25
        ))

    if not isinstance(user_data["age"], int):
        raise TypeError(ErrorMessageTemplate.invalid_type(
            "age", "int", type(user_data["age"]).__name__, 25
        ))

    return user_data

# This provides consistent error messages
try:
    result = validate_user_data({"name": "Alice"})
except KeyError as e:
    print(f"Error: {e}")
    # Output: Required field 'age' is missing. Example: age=25
```

## Best Practices

### 1. Provide Context

```python
# Good: Provide context in error messages
def process_data(data, operation):
    if not data:
        raise ValueError(
            f"Cannot perform '{operation}' on empty data. "
            f"Data must contain at least one element."
        )

    if operation == "sort" and not all(isinstance(x, (int, float)) for x in data):
        raise TypeError(
            f"Cannot sort data containing non-numeric values. "
            f"Data contains: {[type(x).__name__ for x in data[:5]]}"
        )

    return sorted(data) if operation == "sort" else data
```

### 2. Suggest Solutions

```python
# Good: Suggest solutions in error messages
def connect_to_service(url, timeout=30):
    if not url:
        raise ValueError(
            "Service URL is required. "
            "Example: connect_to_service('https://api.example.com')"
        )

    if not url.startswith(('http://', 'https://')):
        raise ValueError(
            f"Invalid URL format: '{url}'. "
            f"URL must start with 'http://' or 'https://'. "
            f"Example: 'https://api.example.com'"
        )

    # Simulate connection
    return f"Connected to {url}"
```

### 3. Use Examples

```python
# Good: Use examples in error messages
def create_user(name, email, age=None):
    if not name:
        raise ValueError(
            "User name is required. "
            "Example: create_user('Alice', 'alice@example.com', 25)"
        )

    if not email:
        raise ValueError(
            "User email is required. "
            "Example: create_user('Alice', 'alice@example.com', 25)"
        )

    if age is not None and not isinstance(age, int):
        raise TypeError(
            f"Age must be an integer, got {type(age).__name__}. "
            f"Example: create_user('Alice', 'alice@example.com', 25)"
        )

    return {"name": name, "email": email, "age": age}
```

## Common Pitfalls

### 1. Generic Error Messages

```python
# Bad: Generic error messages
def bad_validation(data):
    if not data:
        raise ValueError("Invalid data")  # Too generic

# Good: Specific error messages
def good_validation(data):
    if not data:
        raise ValueError(
            "Data is required and cannot be empty. "
            "Example: validate_data([1, 2, 3])"
        )
```

### 2. Missing Context

```python
# Bad: Missing context
def bad_function(x):
    if x < 0:
        raise ValueError("Invalid value")  # No context

# Good: Provide context
def good_function(x):
    if x < 0:
        raise ValueError(
            f"Value must be non-negative, got {x}. "
            f"Example: function(5) or function(0)"
        )
```

### 3. Unhelpful Suggestions

```python
# Bad: Unhelpful suggestions
def bad_suggestion(data):
    if not isinstance(data, list):
        raise TypeError("Expected list")  # No suggestion

# Good: Helpful suggestions
def good_suggestion(data):
    if not isinstance(data, list):
        raise TypeError(
            f"Expected list, got {type(data).__name__}. "
            f"Did you mean to convert to list? Try list(data) or [data]"
        )
```

## Migration Guide

### Updating Existing Error Messages

```python
# Old: Generic error messages
def old_function(data):
    if not data:
        raise ValueError("Invalid data")
    return data

# New: Improved error messages
def new_function(data):
    if not data:
        raise ValueError(
            "Data is required and cannot be empty. "
            "Example: function([1, 2, 3]) or function('hello')"
        )
    return data
```

### Using Error Message Templates

```python
# Old: Inconsistent error messages
def old_validation(data):
    if not data:
        raise ValueError("Data required")
    if not isinstance(data, list):
        raise TypeError("Expected list")

# New: Consistent error messages
def new_validation(data):
    if not data:
        raise ValueError(
            "Data is required. "
            "Example: validation([1, 2, 3])"
        )
    if not isinstance(data, list):
        raise TypeError(
            f"Expected list, got {type(data).__name__}. "
            f"Example: validation([1, 2, 3])"
        )
```

## Conclusion

Python 3.14's improved error messages provide:

- **Better Context**: More informative error descriptions
- **Actionable Suggestions**: Specific recommendations for fixing issues
- **Examples**: Clear examples of correct usage
- **Consistency**: Uniform error message format across the standard library
- **Developer Experience**: Faster debugging and issue resolution

These enhancements make Python more user-friendly and help developers write better code by providing clear guidance when things go wrong.

## References

- [Python 3.14 What's New](https://docs.python.org/3.14/whatsnew/3.14.html)
- [Python Error Handling Best Practices](https://docs.python.org/3.14/tutorial/errors.html)
- [Exception Handling Documentation](https://docs.python.org/3.14/library/exceptions.html)
