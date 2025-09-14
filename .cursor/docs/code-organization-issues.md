# Code Organization Issues Guide

*Structuring code for maintainability, readability, and scalability*

## Overview

Code organization issues include long functions, mixed concerns, poor separation of responsibilities, and
inadequate modularization. Poor code organization makes applications difficult to understand, maintain, and
extend. This guide shows how to structure code effectively using proven organizational patterns and principles.

## Long Functions

### The Problem: Monolithic Functions

**❌ Long Function:**

```python
def process_user_registration(user_data: dict) -> dict:
    # 50+ lines of mixed concerns
    if not user_data:
        return {"error": "No user data provided"}

    # Validation logic (20 lines)
    if not user_data.get('email'):
        return {"error": "Email required"}

    # Email validation (10 lines)
    if '@' not in user_data['email']:
        return {"error": "Invalid email format"}

    # Password validation (15 lines)
    password = user_data.get('password', '')
    if len(password) < 8:
        return {"error": "Password too short"}

    # Database operations (20 lines)
    # ... more code

    return {"success": True, "user_id": "123"}
```

**Problems:**

- Multiple responsibilities in one function
- Difficult to test individual components
- Hard to understand and maintain
- Violates Single Responsibility Principle
- Difficult to reuse parts of the logic

### The Solution: Modular Functions

**✅ Modular Functions:**

```python
def process_user_registration(user_data: dict) -> dict:
    """Process user registration with modular validation."""
    # Validate input
    validation_result = validate_user_data(user_data)
    if not validation_result['valid']:
        return {"error": validation_result['message']}

    # Create user
    try:
        user = create_user(user_data)
        return {"success": True, "user_id": user.id}
    except DatabaseError as e:
        logger.error("Failed to create user: %s", e)
        return {"error": "Registration failed"}

def validate_user_data(user_data: dict) -> dict:
    """Validate user registration data."""
    if not user_data:
        return {"valid": False, "message": "No user data provided"}

    if not user_data.get('email'):
        return {"valid": False, "message": "Email required"}

    if not is_valid_email(user_data['email']):
        return {"valid": False, "message": "Invalid email format"}

    if not is_valid_password(user_data.get('password', '')):
        return {"valid": False, "message": "Password does not meet requirements"}

    return {"valid": True, "message": "Valid"}

def is_valid_email(email: str) -> bool:
    """Validate email format."""
    return '@' in email and '.' in email.split('@')[1]

def is_valid_password(password: str) -> bool:
    """Validate password strength."""
    return len(password) >= 8 and any(c.isdigit() for c in password)

def create_user(user_data: dict) -> User:
    """Create user in database."""
    # Database creation logic
    pass
```

## Mixed Concerns

### The Problem: Single Class Doing Everything

**❌ Mixed Concerns:**

```python
class UserManager:
    def __init__(self):
        self.database = Database()
        self.email_service = EmailService()
        self.logger = Logger()

    def create_user(self, user_data: dict) -> dict:
        # Database operations
        user = self.database.create_user(user_data)

        # Email operations
        self.email_service.send_welcome_email(user.email)

        # Logging operations
        self.logger.info(f"User {user.id} created")

        # Validation operations
        if not self.validate_user_data(user_data):
            raise ValueError("Invalid user data")

        return user.to_dict()
```

**Problems:**

- Single class handles multiple responsibilities
- Difficult to test individual components
- Tight coupling between different concerns
- Violates Single Responsibility Principle
- Hard to modify one aspect without affecting others

### The Solution: Separated Concerns

**✅ Separated Concerns:**

```python
class UserRepository:
    """Handles database operations for users."""
    def __init__(self, database: Database):
        self.database = database

    def create_user(self, user_data: dict) -> User:
        return self.database.create_user(user_data)

    def get_user(self, user_id: str) -> User:
        return self.database.get_user(user_id)

    def update_user(self, user_id: str, user_data: dict) -> User:
        return self.database.update_user(user_id, user_data)

class UserValidator:
    """Handles user data validation."""
    def validate_user_data(self, user_data: dict) -> bool:
        # Validation logic
        return True

    def validate_email(self, email: str) -> bool:
        return '@' in email and '.' in email.split('@')[1]

    def validate_password(self, password: str) -> bool:
        return len(password) >= 8

class UserNotificationService:
    """Handles user notifications."""
    def __init__(self, email_service: EmailService):
        self.email_service = email_service

    def send_welcome_email(self, user: User) -> None:
        self.email_service.send_welcome_email(user.email)

    def send_password_reset(self, user: User) -> None:
        self.email_service.send_password_reset(user.email)

class UserService:
    """Orchestrates user operations."""
    def __init__(
        self,
        repository: UserRepository,
        validator: UserValidator,
        notification_service: UserNotificationService,
        logger: Logger
    ):
        self.repository = repository
        self.validator = validator
        self.notification_service = notification_service
        self.logger = logger

    def create_user(self, user_data: dict) -> dict:
        if not self.validator.validate_user_data(user_data):
            raise ValueError("Invalid user data")

        user = self.repository.create_user(user_data)

        self.notification_service.send_welcome_email(user)
        self.logger.info("User %s created", user.id)

        return user.to_dict()
```

## Advanced Organization Patterns

### 1. Layered Architecture

```python
# Presentation Layer
class UserController:
    """Handles HTTP requests for user operations."""
    
    def __init__(self, user_service: UserService):
        self.user_service = user_service
    
    def create_user(self, request_data: dict) -> dict:
        """Handle user creation request."""
        try:
            result = self.user_service.create_user(request_data)
            return {"status": "success", "data": result}
        except ValidationError as e:
            return {"status": "error", "message": str(e)}
        except Exception as e:
            logger.error("Unexpected error: %s", e)
            return {"status": "error", "message": "Internal server error"}

# Business Logic Layer
class UserService:
    """Contains business logic for user operations."""
    
    def __init__(self, repository: UserRepository, validator: UserValidator):
        self.repository = repository
        self.validator = validator
    
    def create_user(self, user_data: dict) -> dict:
        """Create user with business logic."""
        if not self.validator.validate_user_data(user_data):
            raise ValidationError("Invalid user data")
        
        # Business logic: check for duplicate emails
        if self.repository.email_exists(user_data['email']):
            raise ValidationError("Email already exists")
        
        user = self.repository.create_user(user_data)
        return user.to_dict()

# Data Access Layer
class UserRepository:
    """Handles data persistence for users."""
    
    def __init__(self, database: Database):
        self.database = database
    
    def create_user(self, user_data: dict) -> User:
        """Create user in database."""
        return self.database.create_user(user_data)
    
    def email_exists(self, email: str) -> bool:
        """Check if email already exists."""
        return self.database.email_exists(email)
```

### 2. Domain-Driven Design

```python
# Domain Models
class User:
    """User domain model."""
    
    def __init__(self, email: str, name: str, password_hash: str):
        self.email = email
        self.name = name
        self.password_hash = password_hash
        self.created_at = datetime.now()
        self.is_active = True
    
    def activate(self) -> None:
        """Activate user account."""
        self.is_active = True
    
    def deactivate(self) -> None:
        """Deactivate user account."""
        self.is_active = False
    
    def change_password(self, new_password_hash: str) -> None:
        """Change user password."""
        self.password_hash = new_password_hash

class UserFactory:
    """Factory for creating user objects."""
    
    @staticmethod
    def create_user(email: str, name: str, password: str) -> User:
        """Create new user with hashed password."""
        password_hash = hash_password(password)
        return User(email, name, password_hash)

# Domain Services
class UserDomainService:
    """Domain service for user operations."""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def register_user(self, email: str, name: str, password: str) -> User:
        """Register new user with domain logic."""
        if self.user_repository.email_exists(email):
            raise DomainError("Email already registered")
        
        user = UserFactory.create_user(email, name, password)
        self.user_repository.save(user)
        return user
    
    def authenticate_user(self, email: str, password: str) -> User:
        """Authenticate user with domain logic."""
        user = self.user_repository.find_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise DomainError("Invalid credentials")
        
        if not user.is_active:
            raise DomainError("Account is deactivated")
        
        return user
```

### 3. Command and Query Separation (CQRS)

```python
from abc import ABC, abstractmethod
from typing import Any, Dict

# Commands (Write Operations)
class Command(ABC):
    """Base class for commands."""
    pass

class CreateUserCommand(Command):
    """Command to create a user."""
    
    def __init__(self, email: str, name: str, password: str):
        self.email = email
        self.name = name
        self.password = password

class UpdateUserCommand(Command):
    """Command to update a user."""
    
    def __init__(self, user_id: str, updates: Dict[str, Any]):
        self.user_id = user_id
        self.updates = updates

# Queries (Read Operations)
class Query(ABC):
    """Base class for queries."""
    pass

class GetUserQuery(Query):
    """Query to get a user."""
    
    def __init__(self, user_id: str):
        self.user_id = user_id

class GetUsersByRoleQuery(Query):
    """Query to get users by role."""
    
    def __init__(self, role: str):
        self.role = role

# Command Handlers
class CommandHandler(ABC):
    """Base class for command handlers."""
    
    @abstractmethod
    def handle(self, command: Command) -> Any:
        """Handle a command."""
        pass

class CreateUserCommandHandler(CommandHandler):
    """Handler for create user command."""
    
    def __init__(self, user_service: UserService):
        self.user_service = user_service
    
    def handle(self, command: CreateUserCommand) -> Dict[str, Any]:
        """Handle create user command."""
        return self.user_service.create_user({
            'email': command.email,
            'name': command.name,
            'password': command.password
        })

# Query Handlers
class QueryHandler(ABC):
    """Base class for query handlers."""
    
    @abstractmethod
    def handle(self, query: Query) -> Any:
        """Handle a query."""
        pass

class GetUserQueryHandler(QueryHandler):
    """Handler for get user query."""
    
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository
    
    def handle(self, query: GetUserQuery) -> Dict[str, Any]:
        """Handle get user query."""
        user = self.user_repository.get_user(query.user_id)
        return user.to_dict() if user else None
```

### 4. Dependency Injection

```python
from abc import ABC, abstractmethod
from typing import Protocol

# Interfaces/Protocols
class UserRepositoryProtocol(Protocol):
    """Protocol for user repository."""
    
    def create_user(self, user_data: dict) -> User:
        """Create user."""
        ...
    
    def get_user(self, user_id: str) -> User:
        """Get user by ID."""
        ...

class EmailServiceProtocol(Protocol):
    """Protocol for email service."""
    
    def send_email(self, to: str, subject: str, body: str) -> bool:
        """Send email."""
        ...

# Dependency Injection Container
class DIContainer:
    """Simple dependency injection container."""
    
    def __init__(self):
        self._services = {}
        self._singletons = {}
    
    def register(self, interface: type, implementation: type, singleton: bool = False):
        """Register a service."""
        self._services[interface] = implementation
        if singleton:
            self._singletons[interface] = None
    
    def get(self, interface: type):
        """Get service instance."""
        if interface in self._singletons:
            if self._singletons[interface] is None:
                self._singletons[interface] = self._create_instance(interface)
            return self._singletons[interface]
        
        return self._create_instance(interface)
    
    def _create_instance(self, interface: type):
        """Create instance of service."""
        implementation = self._services[interface]
        return implementation()

# Usage
container = DIContainer()
container.register(UserRepositoryProtocol, UserRepository, singleton=True)
container.register(EmailServiceProtocol, EmailService, singleton=True)

# Service with injected dependencies
class UserService:
    """User service with injected dependencies."""
    
    def __init__(self, container: DIContainer):
        self.user_repository = container.get(UserRepositoryProtocol)
        self.email_service = container.get(EmailServiceProtocol)
    
    def create_user(self, user_data: dict) -> dict:
        """Create user using injected services."""
        user = self.user_repository.create_user(user_data)
        self.email_service.send_email(user.email, "Welcome", "Welcome to our service")
        return user.to_dict()
```

## File and Module Organization

### 1. Package Structure

```python
# Project structure:
# user_management/
#   __init__.py
#   models/
#       __init__.py
#       user.py
#       role.py
#   repositories/
#       __init__.py
#       user_repository.py
#       role_repository.py
#   services/
#       __init__.py
#       user_service.py
#       auth_service.py
#   controllers/
#       __init__.py
#       user_controller.py
#   utils/
#       __init__.py
#       validators.py
#       helpers.py

# user_management/__init__.py
from .models import User, Role
from .services import UserService, AuthService
from .controllers import UserController

__all__ = ['User', 'Role', 'UserService', 'AuthService', 'UserController']

# user_management/models/__init__.py
from .user import User
from .role import Role

__all__ = ['User', 'Role']

# user_management/services/__init__.py
from .user_service import UserService
from .auth_service import AuthService

__all__ = ['UserService', 'AuthService']
```

### 2. Module Imports

```python
# ✅ Good: Clear, organized imports
# Standard library imports
import os
import sys
from typing import Dict, List, Optional
from datetime import datetime

# Third-party imports
import requests
from sqlalchemy import create_engine
from flask import Flask, request, jsonify

# Local imports
from .models import User, Role
from .services import UserService, AuthService
from .utils import validate_email, hash_password

# ❌ Bad: Mixed, unclear imports
import os, sys, requests
from typing import Dict, List, Optional
from .models import User, Role
from sqlalchemy import create_engine
from .services import UserService, AuthService
from flask import Flask, request, jsonify
from .utils import validate_email, hash_password
from datetime import datetime
```

### 3. Configuration Management

```python
# config/
#   __init__.py
#   base.py
#   development.py
#   production.py
#   testing.py

# config/base.py
import os
from typing import Dict, Any

class BaseConfig:
    """Base configuration class."""
    
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')
    DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///app.db')
    DEBUG = False
    TESTING = False
    
    # Email settings
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS', 'true').lower() in ['true', 'on', '1']
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')

# config/development.py
from .base import BaseConfig

class DevelopmentConfig(BaseConfig):
    """Development configuration."""
    
    DEBUG = True
    DATABASE_URL = 'sqlite:///dev.db'

# config/production.py
from .base import BaseConfig

class ProductionConfig(BaseConfig):
    """Production configuration."""
    
    DEBUG = False
    DATABASE_URL = os.environ.get('DATABASE_URL')

# config/__init__.py
import os
from .base import BaseConfig
from .development import DevelopmentConfig
from .production import ProductionConfig
from .testing import TestingConfig

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Get configuration based on environment."""
    config_name = os.environ.get('FLASK_ENV', 'default')
    return config[config_name]
```

## Best Practices

### 1. Single Responsibility Principle

```python
# ✅ Good: Single responsibility
class EmailValidator:
    """Validates email addresses."""
    
    def is_valid(self, email: str) -> bool:
        return '@' in email and '.' in email.split('@')[1]

class PasswordHasher:
    """Handles password hashing."""
    
    def hash(self, password: str) -> str:
        # Hashing logic
        pass
    
    def verify(self, password: str, hash: str) -> bool:
        # Verification logic
        pass

# ❌ Bad: Multiple responsibilities
class UserManager:
    """Manages users, validates emails, hashes passwords, sends emails..."""
    
    def validate_email(self, email: str) -> bool:
        # Email validation
        pass
    
    def hash_password(self, password: str) -> str:
        # Password hashing
        pass
    
    def send_email(self, to: str, message: str) -> None:
        # Email sending
        pass
```

### 2. Dependency Inversion

```python
# ✅ Good: Depend on abstractions
class UserService:
    """User service depending on abstractions."""
    
    def __init__(self, repository: UserRepositoryProtocol, validator: UserValidatorProtocol):
        self.repository = repository
        self.validator = validator
    
    def create_user(self, user_data: dict) -> User:
        if not self.validator.validate(user_data):
            raise ValidationError("Invalid user data")
        
        return self.repository.create_user(user_data)

# ❌ Bad: Depend on concrete implementations
class UserService:
    """User service depending on concrete implementations."""
    
    def __init__(self):
        self.repository = DatabaseUserRepository()  # Concrete dependency
        self.validator = EmailUserValidator()       # Concrete dependency
```

### 3. Interface Segregation

```python
# ✅ Good: Focused interfaces
class ReadableRepository(Protocol):
    """Interface for read operations."""
    
    def get(self, id: str) -> Any:
        """Get entity by ID."""
        ...
    
    def find_all(self) -> List[Any]:
        """Find all entities."""
        ...

class WritableRepository(Protocol):
    """Interface for write operations."""
    
    def save(self, entity: Any) -> Any:
        """Save entity."""
        ...
    
    def delete(self, id: str) -> None:
        """Delete entity by ID."""
        ...

# ❌ Bad: Fat interface
class Repository(Protocol):
    """Interface with too many responsibilities."""
    
    def get(self, id: str) -> Any:
        """Get entity by ID."""
        ...
    
    def find_all(self) -> List[Any]:
        """Find all entities."""
        ...
    
    def save(self, entity: Any) -> Any:
        """Save entity."""
        ...
    
    def delete(self, id: str) -> None:
        """Delete entity by ID."""
        ...
    
    def send_email(self, to: str, message: str) -> None:
        """Send email - not repository responsibility!"""
        ...
```

## Conclusion

🦊 *Code organization requires the cunning of a fox - knowing how to structure complexity, separate concerns, and
create maintainable architectures.*

Proper code organization provides:

- **Maintainability**: Easy to understand and modify
- **Testability**: Individual components can be tested
- **Reusability**: Components can be reused in different contexts
- **Scalability**: Easy to extend and add new features
- **Collaboration**: Multiple developers can work on different parts

Key principles:

- **Single Responsibility**: Each class/function has one reason to change
- **Separation of Concerns**: Different aspects handled by different components
- **Dependency Inversion**: Depend on abstractions, not concretions
- **Interface Segregation**: Keep interfaces focused and cohesive
- **Layered Architecture**: Organize code into logical layers
- **Modular Design**: Break large systems into smaller, manageable modules

*Build code that flows like a well-organized fox den - every entrance has a purpose, every chamber serves a function,
and the whole structure supports the pack's success.* 🦊
