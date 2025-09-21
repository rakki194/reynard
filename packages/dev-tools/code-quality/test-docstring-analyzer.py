"""
Test file for docstring analyzer - this module has good documentation.
"""

def documented_function(param1: str, param2: int) -> str:
    """
    This is a well-documented function with proper docstring.
    
    Args:
        param1: A string parameter
        param2: An integer parameter
        
    Returns:
        A formatted string combining both parameters
        
    Example:
        >>> result = documented_function("hello", 42)
        >>> print(result)
        "hello-42"
    """
    return f"{param1}-{param2}"

def undocumented_function():
    return "no docstring"

class DocumentedClass:
    """
    A well-documented class with proper docstring.
    
    This class demonstrates proper documentation practices
    with detailed explanations of its purpose and usage.
    """
    
    def __init__(self, value: int):
        """Initialize the class with a value."""
        self.value = value
    
    def method_without_docstring(self):
        return self.value * 2

class UndocumentedClass:
    def __init__(self):
        self.value = 0
