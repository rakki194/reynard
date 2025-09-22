# PEP 750: Template Strings (t-strings)

## Overview

PEP 750 introduces template string literals (t-strings) in Python 3.14, providing a new syntax for creating reusable string templates with deferred evaluation. Unlike f-strings which evaluate immediately, t-strings create template objects that can be evaluated later with different contexts.

## The Problem with Current String Formatting

### F-String Limitations

F-strings evaluate immediately at definition time:

```python
# F-strings evaluate immediately
name = "Alice"
age = 30
message = f"Hello {name}, you are {age} years old"
print(message)  # "Hello Alice, you are 30 years old"

# Cannot reuse with different values
# message = f"Hello {name}, you are {age} years old"  # Always uses current values
```

### String Template Limitations

The `string.Template` class exists but has limited functionality:

```python
from string import Template

# Limited functionality
template = Template("Hello $name, you are $age years old")
message = template.substitute(name="Alice", age=30)
print(message)  # "Hello Alice, you are 30 years old"

# No expression evaluation
# template = Template("Hello $name, you are ${age + 1} years old")  # Doesn't work
```

## PEP 750 Solution: Template Strings

### Basic Syntax

Template strings use the `t""` prefix:

```python
# Python 3.14 - Template strings
name = "Alice"
age = 30

# Create a template (not evaluated immediately)
template = t"Hello {name}, you are {age} years old"
print(type(template))  # <class 'template'>

# Evaluate the template
message = template.evaluate()
print(message)  # "Hello Alice, you are 30 years old"
```

### Deferred Evaluation

```python
# Template creation doesn't evaluate expressions
def create_template():
    # This doesn't execute the expressions
    return t"Current time: {time.time()}, random: {random.randint(1, 100)}"

template = create_template()
# time.time() and random.randint() are not called yet

# Evaluation happens when needed
import time
import random
result = template.evaluate()
print(result)  # "Current time: 1234567890.123, random: 42"
```

## Advanced Features

### Template Objects

```python
# Template objects have methods for evaluation
template = t"User: {user.name}, Score: {user.score * 2}"

class User:
    def __init__(self, name, score):
        self.name = name
        self.score = score

# Evaluate with different contexts
user1 = User("Alice", 100)
user2 = User("Bob", 150)

result1 = template.evaluate(user=user1)
result2 = template.evaluate(user=user2)

print(result1)  # "User: Alice, Score: 200"
print(result2)  # "User: Bob, Score: 300"
```

### Multiple Evaluation Contexts

```python
# Template with multiple variables
template = t"Product: {product.name}, Price: ${product.price:.2f}, Tax: ${tax_rate * 100:.1f}%"

class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

# Different evaluation contexts
product1 = Product("Laptop", 999.99)
product2 = Product("Mouse", 29.99)

# Same template, different contexts
result1 = template.evaluate(product=product1, tax_rate=0.08)
result2 = template.evaluate(product=product2, tax_rate=0.10)

print(result1)  # "Product: Laptop, Price: $999.99, Tax: 8.0%"
print(result2)  # "Product: Mouse, Price: $29.99, Tax: 10.0%"
```

### Template Composition

```python
# Create reusable template components
header_template = t"=== {title} ==="
item_template = t"  {index}. {item.name}: ${item.price:.2f}"
footer_template = t"Total: ${total:.2f}"

def create_invoice(items, title="Invoice"):
    # Compose templates
    result = []
    result.append(header_template.evaluate(title=title))

    total = 0
    for i, item in enumerate(items, 1):
        result.append(item_template.evaluate(index=i, item=item))
        total += item.price

    result.append(footer_template.evaluate(total=total))
    return "\n".join(result)

# Usage
items = [
    Product("Laptop", 999.99),
    Product("Mouse", 29.99),
    Product("Keyboard", 79.99)
]

invoice = create_invoice(items, "Computer Store Invoice")
print(invoice)
```

## Performance Benefits

### Lazy Evaluation

```python
import time

# Expensive computation in template
def expensive_computation():
    time.sleep(0.1)  # Simulate expensive operation
    return "expensive_result"

# Template creation is fast (no evaluation)
start = time.time()
template = t"Result: {expensive_computation()}"
creation_time = time.time() - start
print(f"Template creation time: {creation_time:.4f}s")  # Very fast

# Evaluation happens only when needed
start = time.time()
result = template.evaluate()
evaluation_time = time.time() - start
print(f"Template evaluation time: {evaluation_time:.4f}s")  # Includes expensive computation
```

### Memory Efficiency

```python
# Create many templates without evaluation
templates = []
for i in range(1000):
    # No evaluation happens here
    template = t"Item {i}: {expensive_function()}"
    templates.append(template)

# Evaluate only when needed
for template in templates[:5]:  # Only evaluate first 5
    result = template.evaluate()
    print(result)
```

## Real-World Use Cases

### Configuration Templates

```python
# Database connection templates
db_template = t"""
Database Configuration:
  Host: {host}
  Port: {port}
  Database: {database}
  Username: {username}
  Password: {'*' * len(password)}
"""

# Different environments
dev_config = db_template.evaluate(
    host="localhost",
    port=5432,
    database="myapp_dev",
    username="dev_user",
    password="dev_password"
)

prod_config = db_template.evaluate(
    host="prod-db.example.com",
    port=5432,
    database="myapp_prod",
    username="prod_user",
    password="super_secure_password"
)

print(dev_config)
print(prod_config)
```

### Logging Templates

```python
# Logging templates
log_template = t"[{timestamp}] {level}: {message} (user: {user_id})"

def log_message(level, message, user_id):
    import datetime
    timestamp = datetime.datetime.now().isoformat()
    return log_template.evaluate(
        timestamp=timestamp,
        level=level,
        message=message,
        user_id=user_id
    )

# Usage
info_log = log_message("INFO", "User logged in", "user123")
error_log = log_message("ERROR", "Database connection failed", "user456")

print(info_log)
print(error_log)
```

### API Response Templates

```python
# API response templates
api_response_template = t"""
{{
  "status": "{status}",
  "message": "{message}",
  "data": {{
    "user_id": "{user_id}",
    "timestamp": "{timestamp}",
    "request_id": "{request_id}"
  }}
}}
"""

def create_api_response(status, message, user_id, request_id):
    import datetime
    timestamp = datetime.datetime.now().isoformat()

    return api_response_template.evaluate(
        status=status,
        message=message,
        user_id=user_id,
        timestamp=timestamp,
        request_id=request_id
    )

# Usage
success_response = create_api_response(
    "success", "User created", "user789", "req_123"
)
error_response = create_api_response(
    "error", "Invalid input", "user789", "req_124"
)

print(success_response)
print(error_response)
```

## Template Methods and Properties

### Template Object API

```python
template = t"Hello {name}, you are {age} years old"

# Get template source
print(template.source)  # "Hello {name}, you are {age} years old"

# Get variable names
print(template.variables)  # {'name', 'age'}

# Check if template has variables
print(template.has_variables)  # True

# Evaluate with partial context
result = template.evaluate(name="Alice")  # age will be undefined
print(result)  # "Hello Alice, you are {age} years old"

# Safe evaluation (handles missing variables)
result = template.evaluate_safe(name="Alice", age=30)
print(result)  # "Hello Alice, you are 30 years old"
```

### Template Validation

```python
# Validate template before evaluation
template = t"Hello {name}, you are {age} years old"

# Check if all required variables are provided
required_vars = template.variables
provided_vars = {"name": "Alice", "age": 30}

missing_vars = required_vars - set(provided_vars.keys())
if missing_vars:
    print(f"Missing variables: {missing_vars}")
else:
    result = template.evaluate(**provided_vars)
    print(result)
```

## Advanced Patterns

### Template Inheritance

```python
# Base template
base_template = t"""
<!DOCTYPE html>
<html>
<head>
    <title>{title}</title>
</head>
<body>
    {content}
</body>
</html>
"""

# Page-specific templates
home_template = t"""
<h1>Welcome to {site_name}</h1>
<p>Current time: {current_time}</p>
"""

about_template = t"""
<h1>About {site_name}</h1>
<p>We are a {company_type} company.</p>
"""

def render_page(page_template, title, **context):
    # Compose templates
    content = page_template.evaluate(**context)
    return base_template.evaluate(title=title, content=content)

# Usage
site_name = "My Website"
current_time = "2024-01-15 10:30:00"

home_page = render_page(
    home_template,
    "Home",
    site_name=site_name,
    current_time=current_time
)

about_page = render_page(
    about_template,
    "About",
    site_name=site_name,
    company_type="technology"
)

print(home_page)
print(about_page)
```

### Template Caching

```python
from functools import lru_cache

# Cache template creation
@lru_cache(maxsize=128)
def get_template(template_string):
    return t(template_string)

# Usage
template1 = get_template("Hello {name}")
template2 = get_template("Hello {name}")  # Same object (cached)

print(template1 is template2)  # True
```

## Migration Guide

### From F-Strings

```python
# Old: F-strings (immediate evaluation)
def create_message(name, age):
    return f"Hello {name}, you are {age} years old"

# New: Template strings (deferred evaluation)
def create_message_template():
    return t"Hello {name}, you are {age} years old"

# Usage
template = create_message_template()
message = template.evaluate(name="Alice", age=30)
```

### From String Templates

```python
# Old: string.Template
from string import Template

old_template = Template("Hello $name, you are $age years old")
message = old_template.substitute(name="Alice", age=30)

# New: Template strings
new_template = t"Hello {name}, you are {age} years old"
message = new_template.evaluate(name="Alice", age=30)
```

## Best Practices

### 1. Use for Reusable Templates

```python
# Good: Reusable template
email_template = t"""
Dear {customer_name},

Your order #{order_id} has been {status}.

Total: ${total:.2f}
Items: {item_count}

Thank you for your business!
"""

# Bad: One-time use (f-string is better)
def create_simple_message(name):
    return f"Hello {name}"  # Use f-string for simple cases
```

### 2. Validate Template Variables

```python
def safe_template_evaluation(template, **kwargs):
    """Safely evaluate template with validation"""
    required_vars = template.variables
    provided_vars = set(kwargs.keys())

    missing_vars = required_vars - provided_vars
    if missing_vars:
        raise ValueError(f"Missing required variables: {missing_vars}")

    return template.evaluate(**kwargs)
```

### 3. Use for Configuration

```python
# Good: Configuration templates
config_template = t"""
[Database]
host = {db_host}
port = {db_port}
database = {db_name}
username = {db_user}
password = {db_password}

[Redis]
host = {redis_host}
port = {redis_port}
"""

# Generate configs for different environments
dev_config = config_template.evaluate(
    db_host="localhost",
    db_port=5432,
    db_name="myapp_dev",
    db_user="dev_user",
    db_password="dev_password",
    redis_host="localhost",
    redis_port=6379
)
```

## Common Pitfalls

### 1. Overusing Templates

```python
# Bad: Unnecessary template for simple cases
simple_template = t"Hello {name}"
message = simple_template.evaluate(name="Alice")

# Good: Use f-string for simple cases
message = f"Hello Alice"
```

### 2. Missing Variable Validation

```python
# Bad: No validation
template = t"Hello {name}, you are {age} years old"
result = template.evaluate(name="Alice")  # age is undefined

# Good: Validate variables
template = t"Hello {name}, you are {age} years old"
if "age" not in locals():
    raise ValueError("age variable is required")
result = template.evaluate(name="Alice", age=30)
```

## Conclusion

PEP 750 introduces a powerful new feature for creating reusable string templates with deferred evaluation. Template strings provide:

- **Deferred Evaluation**: Expressions are evaluated only when needed
- **Reusability**: Same template can be used with different contexts
- **Performance**: No evaluation overhead during template creation
- **Flexibility**: Support for complex expressions and formatting
- **Clean Syntax**: Intuitive `t""` prefix similar to f-strings

This enhancement makes Python's string formatting system more powerful and efficient, particularly useful for configuration management, logging, and template-based code generation.

## References

- [PEP 750: Template Strings](https://peps.python.org/pep-0750/)
- [Python 3.14 What's New](https://docs.python.org/3.14/whatsnew/3.14.html)
- [String Template Documentation](https://docs.python.org/3.14/library/string.html#template-strings)
