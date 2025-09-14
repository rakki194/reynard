# Code Structure Issues Guide

*Simplifying control flow and eliminating unnecessary complexity*

## Overview

Code structure issues refer to problems with how code is organized and
flows. These include unnecessary else blocks, complex conditional logic, and
overly nested structures. Poor code structure makes code harder to read, understand, and
maintain. This guide shows how to simplify and improve code structure.

## Unnecessary Else Blocks

### The Problem: Redundant Structure

**❌ Unnecessary Else:**

```python
def verify_password(password: str, hashed_password: str) -> bool:
    if self.is_argon2_hash(hashed_password):
        try:
            password_hasher = self.get_password_hasher()
            password_hasher.verify(hashed_password, password)
            return True
        except VerificationError:
            return False
        except Exception as e:
            logger.warning("Error verifying Argon2 hash: %s", e)
            return False

    # This else is unnecessary after return statements
    else:
        logger.warning("Unknown hash format encountered: %s...", hashed_password[:20])
        return False
```

**Problems:**

- Redundant code structure
- Unnecessary nesting
- Harder to read and understand
- Violates the principle of early returns

### The Solution: Early Returns

**✅ Cleaner Structure:**

```python
def verify_password(password: str, hashed_password: str) -> bool:
    if self.is_argon2_hash(hashed_password):
        try:
            password_hasher = self.get_password_hasher()
            password_hasher.verify(hashed_password, password)
            return True
        except VerificationError:
            return False
        except Exception as e:
            logger.warning("Error verifying Argon2 hash: %s", e)
            return False

    # No else needed - code flows naturally
    logger.warning("Unknown hash format encountered: %s...", hashed_password[:20])
    return False
```

## Return Conditions Directly

### The Problem: Verbose Logic

**❌ Verbose:**

```python
def needs_update(self, hash_params: dict) -> bool:
    needs_update = (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
    return needs_update
```

**Problems:**

- Unnecessary intermediate variable
- Extra line of code
- Less direct and clear

### The Solution: Direct Returns

**✅ Direct:**

```python
def needs_update(self, hash_params: dict) -> bool:
    return (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
```

## Complex Conditional Logic

### The Problem: Nested Conditions

**❌ Complex Nested Conditions:**

```python
def process_user_data(user_data: dict) -> bool:
    if user_data:
        if 'email' in user_data:
            if user_data['email']:
                if '@' in user_data['email']:
                    if 'name' in user_data:
                        if user_data['name']:
                            if len(user_data['name']) > 0:
                                return True
    return False
```

**Problems:**

- Deep nesting (7 levels!)
- Hard to read and understand
- Difficult to test all branches
- Prone to logical errors

### The Solution: Simplified Logic

**✅ Simplified Logic:**

```python
def process_user_data(user_data: dict) -> bool:
    """Process user data with simplified validation."""
    if not user_data:
        return False

    email = user_data.get('email', '')
    name = user_data.get('name', '')

    return (
        email and '@' in email and
        name and len(name) > 0
    )
```

## Advanced Structure Patterns

### 1. Guard Clauses

```python
# ❌ Nested validation
def process_order(order: dict) -> dict:
    if order:
        if order.get('items'):
            if len(order['items']) > 0:
                if order.get('customer_id'):
                    if order.get('total'):
                        if order['total'] > 0:
                            # Process order
                            return {"status": "processed", "order_id": "123"}
                        else:
                            return {"error": "Invalid total"}
                    else:
                        return {"error": "Missing total"}
                else:
                    return {"error": "Missing customer ID"}
            else:
                return {"error": "No items"}
        else:
            return {"error": "Missing items"}
    else:
        return {"error": "No order data"}

# ✅ Guard clauses
def process_order(order: dict) -> dict:
    """Process order with guard clauses."""
    if not order:
        return {"error": "No order data"}
    
    if not order.get('items'):
        return {"error": "Missing items"}
    
    if len(order['items']) == 0:
        return {"error": "No items"}
    
    if not order.get('customer_id'):
        return {"error": "Missing customer ID"}
    
    if not order.get('total'):
        return {"error": "Missing total"}
    
    if order['total'] <= 0:
        return {"error": "Invalid total"}
    
    # Process order
    return {"status": "processed", "order_id": "123"}
```

### 2. Extract Complex Conditions

```python
# ❌ Complex inline conditions
def can_access_resource(user: dict, resource: dict) -> bool:
    if (user.get('role') == 'admin' or 
        (user.get('role') == 'user' and user.get('permissions', {}).get('read') and 
         resource.get('owner_id') == user.get('id')) or
        (user.get('role') == 'guest' and resource.get('public'))):
        return True
    return False

# ✅ Extracted conditions
def can_access_resource(user: dict, resource: dict) -> bool:
    """Check if user can access resource."""
    if is_admin(user):
        return True
    
    if is_owner(user, resource):
        return True
    
    if is_public_resource(resource):
        return True
    
    return False

def is_admin(user: dict) -> bool:
    """Check if user is admin."""
    return user.get('role') == 'admin'

def is_owner(user: dict, resource: dict) -> bool:
    """Check if user owns resource."""
    return (user.get('role') == 'user' and 
            user.get('permissions', {}).get('read') and
            resource.get('owner_id') == user.get('id'))

def is_public_resource(resource: dict) -> bool:
    """Check if resource is public."""
    return resource.get('public', False)
```

### 3. Strategy Pattern for Complex Logic

```python
# ❌ Complex if-elif chain
def calculate_shipping_cost(order: dict) -> float:
    weight = order.get('weight', 0)
    distance = order.get('distance', 0)
    priority = order.get('priority', 'standard')
    
    if priority == 'express':
        if weight <= 1:
            return 15.0 + (distance * 0.5)
        elif weight <= 5:
            return 25.0 + (distance * 0.8)
        else:
            return 35.0 + (distance * 1.2)
    elif priority == 'standard':
        if weight <= 1:
            return 8.0 + (distance * 0.3)
        elif weight <= 5:
            return 15.0 + (distance * 0.5)
        else:
            return 25.0 + (distance * 0.8)
    else:  # economy
        if weight <= 1:
            return 5.0 + (distance * 0.2)
        elif weight <= 5:
            return 10.0 + (distance * 0.3)
        else:
            return 18.0 + (distance * 0.5)

# ✅ Strategy pattern
from abc import ABC, abstractmethod
from typing import Dict, Any

class ShippingStrategy(ABC):
    """Abstract shipping strategy."""
    
    @abstractmethod
    def calculate_cost(self, weight: float, distance: float) -> float:
        """Calculate shipping cost."""
        pass

class ExpressShipping(ShippingStrategy):
    """Express shipping strategy."""
    
    def calculate_cost(self, weight: float, distance: float) -> float:
        if weight <= 1:
            return 15.0 + (distance * 0.5)
        elif weight <= 5:
            return 25.0 + (distance * 0.8)
        else:
            return 35.0 + (distance * 1.2)

class StandardShipping(ShippingStrategy):
    """Standard shipping strategy."""
    
    def calculate_cost(self, weight: float, distance: float) -> float:
        if weight <= 1:
            return 8.0 + (distance * 0.3)
        elif weight <= 5:
            return 15.0 + (distance * 0.5)
        else:
            return 25.0 + (distance * 0.8)

class EconomyShipping(ShippingStrategy):
    """Economy shipping strategy."""
    
    def calculate_cost(self, weight: float, distance: float) -> float:
        if weight <= 1:
            return 5.0 + (distance * 0.2)
        elif weight <= 5:
            return 10.0 + (distance * 0.3)
        else:
            return 18.0 + (distance * 0.5)

class ShippingCalculator:
    """Shipping cost calculator."""
    
    def __init__(self):
        self.strategies = {
            'express': ExpressShipping(),
            'standard': StandardShipping(),
            'economy': EconomyShipping()
        }
    
    def calculate_shipping_cost(self, order: dict) -> float:
        """Calculate shipping cost for order."""
        weight = order.get('weight', 0)
        distance = order.get('distance', 0)
        priority = order.get('priority', 'standard')
        
        strategy = self.strategies.get(priority, self.strategies['standard'])
        return strategy.calculate_cost(weight, distance)
```

## Common Structure Anti-patterns

### 1. The Arrow Anti-pattern

```python
# ❌ Arrow anti-pattern
def process_data(data: dict) -> dict:
    if data:
        if data.get('type'):
            if data['type'] == 'user':
                if data.get('email'):
                    if '@' in data['email']:
                        if data.get('name'):
                            if len(data['name']) > 0:
                                # Process user data
                                return {"status": "success"}
                            else:
                                return {"error": "Empty name"}
                        else:
                            return {"error": "Missing name"}
                    else:
                        return {"error": "Invalid email"}
                else:
                    return {"error": "Missing email"}
            else:
                return {"error": "Invalid type"}
        else:
            return {"error": "Missing type"}
    else:
        return {"error": "No data"}

# ✅ Flattened structure
def process_data(data: dict) -> dict:
    """Process data with flattened structure."""
    if not data:
        return {"error": "No data"}
    
    if not data.get('type'):
        return {"error": "Missing type"}
    
    if data['type'] != 'user':
        return {"error": "Invalid type"}
    
    if not data.get('email'):
        return {"error": "Missing email"}
    
    if '@' not in data['email']:
        return {"error": "Invalid email"}
    
    if not data.get('name'):
        return {"error": "Missing name"}
    
    if len(data['name']) == 0:
        return {"error": "Empty name"}
    
    # Process user data
    return {"status": "success"}
```

### 2. The Switch Statement Anti-pattern

```python
# ❌ Long if-elif chain
def get_status_message(status: str) -> str:
    if status == 'pending':
        return "Your request is pending approval"
    elif status == 'approved':
        return "Your request has been approved"
    elif status == 'rejected':
        return "Your request has been rejected"
    elif status == 'processing':
        return "Your request is being processed"
    elif status == 'completed':
        return "Your request has been completed"
    elif status == 'failed':
        return "Your request has failed"
    elif status == 'cancelled':
        return "Your request has been cancelled"
    else:
        return "Unknown status"

# ✅ Dictionary lookup
def get_status_message(status: str) -> str:
    """Get status message for given status."""
    messages = {
        'pending': "Your request is pending approval",
        'approved': "Your request has been approved",
        'rejected': "Your request has been rejected",
        'processing': "Your request is being processed",
        'completed': "Your request has been completed",
        'failed': "Your request has failed",
        'cancelled': "Your request has been cancelled"
    }
    
    return messages.get(status, "Unknown status")
```

### 3. The Boolean Trap

```python
# ❌ Boolean trap
def create_user(name: str, email: str, is_admin: bool, is_active: bool, 
                send_welcome: bool, create_profile: bool) -> dict:
    user = {"name": name, "email": email}
    
    if is_admin:
        user["role"] = "admin"
    else:
        user["role"] = "user"
    
    if is_active:
        user["status"] = "active"
    else:
        user["status"] = "inactive"
    
    if send_welcome:
        send_welcome_email(email)
    
    if create_profile:
        create_user_profile(user)
    
    return user

# ✅ Enum or named constants
from enum import Enum

class UserRole(Enum):
    ADMIN = "admin"
    USER = "user"

class UserStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

def create_user(name: str, email: str, role: UserRole, status: UserStatus,
                send_welcome: bool = True, create_profile: bool = True) -> dict:
    """Create user with clear parameters."""
    user = {
        "name": name,
        "email": email,
        "role": role.value,
        "status": status.value
    }
    
    if send_welcome:
        send_welcome_email(email)
    
    if create_profile:
        create_user_profile(user)
    
    return user
```

## Refactoring Techniques

### 1. Extract Method

```python
# Before: Long method with mixed concerns
def process_order(order: dict) -> dict:
    # Validate order
    if not order:
        return {"error": "No order"}
    
    if not order.get('items'):
        return {"error": "No items"}
    
    # Calculate total
    total = 0
    for item in order['items']:
        total += item.get('price', 0) * item.get('quantity', 0)
    
    # Apply discounts
    if total > 100:
        total *= 0.9  # 10% discount
    elif total > 50:
        total *= 0.95  # 5% discount
    
    # Calculate shipping
    weight = sum(item.get('weight', 0) for item in order['items'])
    if weight > 10:
        shipping = 15.0
    elif weight > 5:
        shipping = 10.0
    else:
        shipping = 5.0
    
    return {"total": total, "shipping": shipping, "final": total + shipping}

# After: Extracted methods
def process_order(order: dict) -> dict:
    """Process order with extracted methods."""
    validation_result = validate_order(order)
    if not validation_result['valid']:
        return {"error": validation_result['message']}
    
    subtotal = calculate_subtotal(order['items'])
    discount = calculate_discount(subtotal)
    shipping = calculate_shipping(order['items'])
    
    final_total = subtotal - discount + shipping
    
    return {
        "subtotal": subtotal,
        "discount": discount,
        "shipping": shipping,
        "final": final_total
    }

def validate_order(order: dict) -> dict:
    """Validate order data."""
    if not order:
        return {"valid": False, "message": "No order"}
    
    if not order.get('items'):
        return {"valid": False, "message": "No items"}
    
    return {"valid": True, "message": "Valid"}

def calculate_subtotal(items: list) -> float:
    """Calculate order subtotal."""
    return sum(item.get('price', 0) * item.get('quantity', 0) for item in items)

def calculate_discount(subtotal: float) -> float:
    """Calculate discount based on subtotal."""
    if subtotal > 100:
        return subtotal * 0.1  # 10% discount
    elif subtotal > 50:
        return subtotal * 0.05  # 5% discount
    return 0

def calculate_shipping(items: list) -> float:
    """Calculate shipping cost."""
    weight = sum(item.get('weight', 0) for item in items)
    
    if weight > 10:
        return 15.0
    elif weight > 5:
        return 10.0
    else:
        return 5.0
```

### 2. Replace Conditional with Polymorphism

```python
# Before: Type checking with conditionals
class OrderProcessor:
    def process_order(self, order: dict) -> dict:
        order_type = order.get('type')
        
        if order_type == 'physical':
            return self.process_physical_order(order)
        elif order_type == 'digital':
            return self.process_digital_order(order)
        elif order_type == 'subscription':
            return self.process_subscription_order(order)
        else:
            return {"error": "Unknown order type"}

# After: Polymorphic approach
from abc import ABC, abstractmethod

class Order(ABC):
    """Abstract order class."""
    
    def __init__(self, data: dict):
        self.data = data
    
    @abstractmethod
    def process(self) -> dict:
        """Process the order."""
        pass

class PhysicalOrder(Order):
    """Physical order processing."""
    
    def process(self) -> dict:
        # Process physical order
        return {"type": "physical", "status": "processed"}

class DigitalOrder(Order):
    """Digital order processing."""
    
    def process(self) -> dict:
        # Process digital order
        return {"type": "digital", "status": "processed"}

class SubscriptionOrder(Order):
    """Subscription order processing."""
    
    def process(self) -> dict:
        # Process subscription order
        return {"type": "subscription", "status": "processed"}

class OrderFactory:
    """Factory for creating order objects."""
    
    @staticmethod
    def create_order(order_data: dict) -> Order:
        """Create appropriate order type."""
        order_type = order_data.get('type')
        
        if order_type == 'physical':
            return PhysicalOrder(order_data)
        elif order_type == 'digital':
            return DigitalOrder(order_data)
        elif order_type == 'subscription':
            return SubscriptionOrder(order_data)
        else:
            raise ValueError(f"Unknown order type: {order_type}")

class OrderProcessor:
    """Order processor using polymorphism."""
    
    def process_order(self, order_data: dict) -> dict:
        """Process order using appropriate handler."""
        try:
            order = OrderFactory.create_order(order_data)
            return order.process()
        except ValueError as e:
            return {"error": str(e)}
```

## Tools and Analysis

### Cyclomatic Complexity Analysis

```python
import ast
from typing import List, Dict, Any

class ComplexityAnalyzer(ast.NodeVisitor):
    """Analyze cyclomatic complexity of Python code."""
    
    def __init__(self):
        self.complexity = 1  # Base complexity
        self.complex_nodes = []
    
    def visit_If(self, node):
        """Count if statements."""
        self.complexity += 1
        self.complex_nodes.append(("if", node.lineno))
        self.generic_visit(node)
    
    def visit_For(self, node):
        """Count for loops."""
        self.complexity += 1
        self.complex_nodes.append(("for", node.lineno))
        self.generic_visit(node)
    
    def visit_While(self, node):
        """Count while loops."""
        self.complexity += 1
        self.complex_nodes.append(("while", node.lineno))
        self.generic_visit(node)
    
    def visit_ExceptHandler(self, node):
        """Count exception handlers."""
        self.complexity += 1
        self.complex_nodes.append(("except", node.lineno))
        self.generic_visit(node)
    
    def visit_BoolOp(self, node):
        """Count boolean operations."""
        self.complexity += len(node.values) - 1
        self.complex_nodes.append(("bool_op", node.lineno))
        self.generic_visit(node)

def analyze_complexity(file_path: str) -> Dict[str, Any]:
    """Analyze cyclomatic complexity of a file."""
    with open(file_path, 'r') as f:
        tree = ast.parse(f.read())
    
    analyzer = ComplexityAnalyzer()
    analyzer.visit(tree)
    
    return {
        'complexity': analyzer.complexity,
        'complex_nodes': analyzer.complex_nodes,
        'recommendation': get_complexity_recommendation(analyzer.complexity)
    }

def get_complexity_recommendation(complexity: int) -> str:
    """Get recommendation based on complexity."""
    if complexity <= 10:
        return "Good complexity"
    elif complexity <= 20:
        return "Consider refactoring"
    else:
        return "High complexity - refactor required"
```

## Best Practices

### 1. Prefer Early Returns

```python
# ✅ Good: Early returns
def process_data(data: dict) -> dict:
    if not data:
        return {"error": "No data"}
    
    if not data.get('required_field'):
        return {"error": "Missing required field"}
    
    # Main processing logic
    return {"result": "processed"}

# ❌ Bad: Nested structure
def process_data(data: dict) -> dict:
    if data:
        if data.get('required_field'):
            # Main processing logic
            return {"result": "processed"}
        else:
            return {"error": "Missing required field"}
    else:
        return {"error": "No data"}
```

### 2. Extract Complex Conditions

```python
# ✅ Good: Extracted conditions
def can_edit_post(user: dict, post: dict) -> bool:
    return (is_post_owner(user, post) or 
            is_admin(user) or 
            is_moderator(user))

# ❌ Bad: Complex inline condition
def can_edit_post(user: dict, post: dict) -> bool:
    return (user.get('id') == post.get('author_id') or 
            user.get('role') == 'admin' or 
            (user.get('role') == 'moderator' and user.get('permissions', {}).get('edit')))
```

### 3. Use Guard Clauses

```python
# ✅ Good: Guard clauses
def validate_user(user_data: dict) -> dict:
    if not user_data:
        return {"valid": False, "error": "No data"}
    
    if not user_data.get('email'):
        return {"valid": False, "error": "Missing email"}
    
    if not user_data.get('name'):
        return {"valid": False, "error": "Missing name"}
    
    # Validation passed
    return {"valid": True}
```

## Conclusion

🦊 *Mastering code structure requires the cunning of a fox - knowing when to simplify, how to flatten complexity, and
where to extract meaningful abstractions.*

Improving code structure provides:

- **Readability**: Code becomes easier to understand
- **Maintainability**: Changes are easier to make
- **Testability**: Individual components can be tested
- **Debugging**: Problems are easier to locate
- **Performance**: Simpler code often runs faster

Key principles:

- **Use early returns** to reduce nesting
- **Extract complex conditions** into named functions
- **Apply guard clauses** for validation
- **Prefer composition** over complex conditionals
- **Use polymorphism** instead of type checking
- **Keep functions focused** on single responsibilities

*Build code that flows like a fox through the forest - elegant, direct, and purposeful.* 🦊
