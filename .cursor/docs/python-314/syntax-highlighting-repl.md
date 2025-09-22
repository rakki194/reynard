# Syntax Highlighting in REPL

## Overview

Python 3.14 introduces syntax highlighting in the Read-Eval-Print Loop (REPL), significantly improving the interactive development experience. This enhancement makes code more readable, helps identify syntax errors, and provides a more professional development environment.

## The Problem with Plain Text REPL

### Poor Readability

```python
# Python 3.13 - Plain text REPL
>>> def calculate_fibonacci(n):
...     if n <= 1:
...         return n
...     return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
...
>>> result = calculate_fibonacci(10)
>>> print(f"Fibonacci(10) = {result}")
```

### Difficult Error Identification

```python
# Python 3.13 - Hard to spot syntax errors
>>> def broken_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> result = broken_function()
>>> print(result)
```

### Poor Code Structure Visibility

```python
# Python 3.13 - Hard to see code structure
>>> class DataProcessor:
...     def __init__(self, data):
...         self.data = data
...
...     def process(self):
...         return [x * 2 for x in self.data if x > 0]
...
>>> processor = DataProcessor([1, 2, 3, 4, 5])
>>> result = processor.process()
>>> print(result)
```

## Python 3.14 Solution: Syntax Highlighting

### Enhanced Readability

```python
# Python 3.14 - Syntax highlighted REPL
>>> def calculate_fibonacci(n):
...     if n <= 1:
...         return n
...     return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)
...
>>> result = calculate_fibonacci(10)
>>> print(f"Fibonacci(10) = {result}")
```

### Better Error Identification

```python
# Python 3.14 - Syntax errors are highlighted
>>> def broken_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> result = broken_function()
>>> print(result)
```

### Improved Code Structure

```python
# Python 3.14 - Code structure is clearly visible
>>> class DataProcessor:
...     def __init__(self, data):
...         self.data = data
...
...     def process(self):
...         return [x * 2 for x in self.data if x > 0]
...
>>> processor = DataProcessor([1, 2, 3, 4, 5])
>>> result = processor.process()
>>> print(result)
```

## Syntax Highlighting Features

### Color Scheme

```python
# Python 3.14 - Color scheme for different elements
>>> # Keywords (blue)
>>> def function_name():
...     # Strings (green)
...     message = "Hello, World!"
...     # Numbers (red)
...     count = 42
...     # Comments (gray)
...     # This is a comment
...     return message, count
...
>>> # Function calls (yellow)
>>> result = function_name()
>>> # Variables (white)
>>> print(result)
```

### Error Highlighting

```python
# Python 3.14 - Error highlighting
>>> def test_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # Syntax errors are highlighted in red
>>> def broken_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # Indentation errors are highlighted
>>> def indentation_error():
...     x = 1
...   y = 2  # This line is highlighted as an error
...     return x + y
...
>>> # Missing colons are highlighted
>>> def missing_colon()
...     return "This will cause an error"
...
>>> # Missing parentheses are highlighted
>>> def missing_paren():
...     return "This will also cause an error"
...
>>> # Missing quotes are highlighted
>>> def missing_quote():
...     return This will cause an error
...
>>> # Invalid operators are highlighted
>>> def invalid_operator():
...     x = 1
...     y = 2
...     z = x ** y  # This is valid
...     w = x ^^ y  # This is invalid and highlighted
...     return z
```

### Code Completion Highlighting

```python
# Python 3.14 - Code completion with highlighting
>>> import os
>>> # Available methods are highlighted
>>> os.path.  # Shows available methods with highlighting
>>> os.path.join  # Method names are highlighted
>>> os.path.join("home", "user")  # Arguments are highlighted
>>>
>>> # Built-in functions are highlighted
>>> len  # Built-in function is highlighted
>>> len([1, 2, 3])  # Function call is highlighted
>>>
>>> # Module imports are highlighted
>>> import sys  # Import statement is highlighted
>>> from os import path  # From import is highlighted
>>>
>>> # Class definitions are highlighted
>>> class MyClass:
...     def __init__(self):
...         self.value = 42
...
...     def method(self):
...         return self.value
...
>>> # Class instantiation is highlighted
>>> obj = MyClass()  # Class name is highlighted
>>> obj.method()  # Method call is highlighted
```

## Advanced Features

### Multi-line Input Highlighting

```python
# Python 3.14 - Multi-line input highlighting
>>> def complex_function(data):
...     # Function definition is highlighted
...     result = []
...     for item in data:
...         # Loop structure is highlighted
...         if isinstance(item, int):
...             # Conditional structure is highlighted
...             result.append(item * 2)
...         elif isinstance(item, str):
...             # String handling is highlighted
...             result.append(item.upper())
...         else:
...             # Error handling is highlighted
...             result.append(None)
...     return result
...
>>> # Function call is highlighted
>>> data = [1, "hello", 3.14, "world"]
>>> result = complex_function(data)
>>> print(result)
```

### Error Recovery Highlighting

```python
# Python 3.14 - Error recovery highlighting
>>> def test_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # Syntax error is highlighted
>>> def broken_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # After fixing the error, highlighting returns to normal
>>> def fixed_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> result = fixed_function()
>>> print(result)
```

### Interactive Debugging

```python
# Python 3.14 - Interactive debugging with highlighting
>>> def debug_function(x, y):
...     # Variables are highlighted
...     result = x + y
...     # Debug statements are highlighted
...     print(f"x = {x}, y = {y}, result = {result}")
...     return result
...
>>> # Function call with arguments is highlighted
>>> result = debug_function(10, 20)
>>> print(f"Final result: {result}")
>>>
>>> # Exception handling is highlighted
>>> try:
...     result = debug_function(10, "20")
... except TypeError as e:
...     print(f"Error: {e}")
...
>>> # Finally block is highlighted
>>> try:
...     result = debug_function(10, 20)
... except Exception as e:
...     print(f"Error: {e}")
... finally:
...     print("Cleanup completed")
```

## Configuration Options

### Color Scheme Customization

```python
# Python 3.14 - Color scheme customization
>>> import sys
>>>
>>> # Check current color scheme
>>> print(sys.ps1)  # Primary prompt
>>> print(sys.ps2)  # Secondary prompt
>>>
>>> # Customize color scheme
>>> sys.ps1 = "\033[1;32m>>> \033[0m"  # Green prompt
>>> sys.ps2 = "\033[1;34m... \033[0m"  # Blue prompt
>>>
>>> # Test custom colors
>>> def test_function():
...     return "Hello, World!"
...
>>> result = test_function()
>>> print(result)
```

### Highlighting Preferences

```python
# Python 3.14 - Highlighting preferences
>>> import readline
>>>
>>> # Enable syntax highlighting
>>> readline.parse_and_bind("set editing-mode emacs")
>>> readline.parse_and_bind("set show-all-if-ambiguous on")
>>> readline.parse_and_bind("set completion-query-items 100")
>>>
>>> # Test highlighting
>>> def test_function():
...     x = 1
...     y = 2
...     return x + y
...
>>> result = test_function()
>>> print(result)
```

## Real-World Examples

### Data Analysis

```python
# Python 3.14 - Data analysis with highlighting
>>> import pandas as pd
>>> import numpy as np
>>>
>>> # Data creation is highlighted
>>> data = {
...     'name': ['Alice', 'Bob', 'Charlie'],
...     'age': [25, 30, 35],
...     'salary': [50000, 60000, 70000]
... }
>>>
>>> # DataFrame creation is highlighted
>>> df = pd.DataFrame(data)
>>> print(df)
>>>
>>> # Data manipulation is highlighted
>>> df['bonus'] = df['salary'] * 0.1
>>> df['total'] = df['salary'] + df['bonus']
>>> print(df)
>>>
>>> # Data filtering is highlighted
>>> filtered_df = df[df['age'] > 25]
>>> print(filtered_df)
>>>
>>> # Statistical operations are highlighted
>>> mean_salary = df['salary'].mean()
>>> max_age = df['age'].max()
>>> print(f"Mean salary: {mean_salary}, Max age: {max_age}")
```

### Web Development

```python
# Python 3.14 - Web development with highlighting
>>> from flask import Flask, request, jsonify
>>>
>>> # Flask app creation is highlighted
>>> app = Flask(__name__)
>>>
>>> # Route definition is highlighted
>>> @app.route('/api/users', methods=['GET'])
... def get_users():
...     users = [
...         {'id': 1, 'name': 'Alice', 'email': 'alice@example.com'},
...         {'id': 2, 'name': 'Bob', 'email': 'bob@example.com'}
...     ]
...     return jsonify(users)
...
>>> # Route with parameters is highlighted
>>> @app.route('/api/users/<int:user_id>', methods=['GET'])
... def get_user(user_id):
...     user = {'id': user_id, 'name': 'Alice', 'email': 'alice@example.com'}
...     return jsonify(user)
...
>>> # Error handling is highlighted
>>> @app.route('/api/users', methods=['POST'])
... def create_user():
...     try:
...         data = request.get_json()
...         if not data or 'name' not in data:
...             return jsonify({'error': 'Name is required'}), 400
...         return jsonify({'message': 'User created', 'user': data}), 201
...     except Exception as e:
...         return jsonify({'error': str(e)}), 500
...
>>> # App run is highlighted
>>> if __name__ == '__main__':
...     app.run(debug=True)
```

### Machine Learning

```python
# Python 3.14 - Machine learning with highlighting
>>> import numpy as np
>>> from sklearn.model_selection import train_test_split
>>> from sklearn.linear_model import LinearRegression
>>> from sklearn.metrics import mean_squared_error
>>>
>>> # Data generation is highlighted
>>> np.random.seed(42)
>>> X = np.random.randn(100, 1)
>>> y = 2 * X.flatten() + 1 + np.random.randn(100) * 0.1
>>>
>>> # Data splitting is highlighted
>>> X_train, X_test, y_train, y_test = train_test_split(
...     X, y, test_size=0.2, random_state=42
... )
>>>
>>> # Model training is highlighted
>>> model = LinearRegression()
>>> model.fit(X_train, y_train)
>>>
>>> # Model prediction is highlighted
>>> y_pred = model.predict(X_test)
>>>
>>> # Model evaluation is highlighted
>>> mse = mean_squared_error(y_test, y_pred)
>>> print(f"Mean Squared Error: {mse}")
>>>
>>> # Model coefficients are highlighted
>>> print(f"Intercept: {model.intercept_}")
>>> print(f"Coefficient: {model.coef_[0]}")
```

## Best Practices

### 1. Use Clear Variable Names

```python
# Good: Clear variable names with highlighting
>>> def calculate_compound_interest(principal, rate, time):
...     # Variables are clearly highlighted
...     compound_amount = principal * (1 + rate) ** time
...     interest_earned = compound_amount - principal
...     return compound_amount, interest_earned
...
>>> # Function call is highlighted
>>> principal = 1000
>>> rate = 0.05
>>> time = 10
>>> amount, interest = calculate_compound_interest(principal, rate, time)
>>> print(f"Amount: {amount}, Interest: {interest}")
```

### 2. Use Descriptive Function Names

```python
# Good: Descriptive function names with highlighting
>>> def process_user_registration(user_data):
...     # Function name is clearly highlighted
...     if not user_data.get('email'):
...         raise ValueError("Email is required")
...
...     if not user_data.get('password'):
...         raise ValueError("Password is required")
...
...     # Process registration
...     user_id = generate_user_id()
...     save_user_to_database(user_data, user_id)
...     send_welcome_email(user_data['email'])
...
...     return user_id
...
>>> # Function call is highlighted
>>> user_data = {
...     'email': 'user@example.com',
...     'password': 'secure_password',
...     'name': 'John Doe'
... }
>>> user_id = process_user_registration(user_data)
>>> print(f"User registered with ID: {user_id}")
```

### 3. Use Type Hints

```python
# Good: Type hints with highlighting
>>> from typing import List, Dict, Optional
>>>
>>> def process_data(data: List[Dict[str, any]]) -> List[Dict[str, any]]:
...     # Type hints are highlighted
...     processed_data = []
...     for item in data:
...         if item.get('status') == 'active':
...             processed_item = {
...                 'id': item['id'],
...                 'name': item['name'],
...                 'processed': True
...             }
...             processed_data.append(processed_item)
...     return processed_data
...
>>> # Function call with type hints is highlighted
>>> data = [
...     {'id': 1, 'name': 'Alice', 'status': 'active'},
...     {'id': 2, 'name': 'Bob', 'status': 'inactive'},
...     {'id': 3, 'name': 'Charlie', 'status': 'active'}
... ]
>>> result = process_data(data)
>>> print(result)
```

## Common Pitfalls

### 1. Over-relying on Highlighting

```python
# Bad: Over-relying on highlighting for code structure
>>> def bad_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # Good: Use proper indentation and structure
>>> def good_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
```

### 2. Ignoring Error Highlighting

```python
# Bad: Ignoring error highlighting
>>> def broken_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
...
>>> # Good: Fix highlighted errors
>>> def fixed_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
```

### 3. Inconsistent Code Style

```python
# Bad: Inconsistent code style
>>> def inconsistent_function():
...     x=1
...     y=2
...     z=x+y
...     return z
...
>>> # Good: Consistent code style
>>> def consistent_function():
...     x = 1
...     y = 2
...     z = x + y
...     return z
```

## Migration Guide

### From Plain Text REPL

```python
# Old: Plain text REPL
>>> def old_function():
...     x = 1
...     y = 2
...     return x + y
...
>>> # New: Syntax highlighted REPL
>>> def new_function():
...     x = 1
...     y = 2
...     return x + y
...
>>> result = new_function()
>>> print(result)
```

### Customizing Highlighting

```python
# Python 3.14 - Customizing highlighting
>>> import sys
>>>
>>> # Set custom prompt colors
>>> sys.ps1 = "\033[1;36m>>> \033[0m"  # Cyan prompt
>>> sys.ps2 = "\033[1;33m... \033[0m"  # Yellow prompt
>>>
>>> # Test custom highlighting
>>> def test_function():
...     return "Hello, World!"
...
>>> result = test_function()
>>> print(result)
```

## Conclusion

Python 3.14's syntax highlighting in REPL provides:

- **Better Readability**: Code is easier to read and understand
- **Error Identification**: Syntax errors are clearly highlighted
- **Professional Experience**: More polished development environment
- **Faster Debugging**: Issues are identified more quickly
- **Improved Productivity**: Better code structure visibility

This enhancement makes Python's interactive development experience more modern and user-friendly, bringing it in line with other professional development environments.

## References

- [Python 3.14 What's New](https://docs.python.org/3.14/whatsnew/3.14.html)
- [Python REPL Documentation](https://docs.python.org/3.14/library/readline.html)
- [Syntax Highlighting Best Practices](https://docs.python.org/3.14/tutorial/interactive.html)
