# Python Code Structure Issues

Guide to code structure warnings and errors in Python development.

## Overview

This document covers common code structure issues encountered during Python development, particularly when
working with modern Python codebases. Each issue includes the error message, explanation, and
practical solutions with real-world examples from the Reynard project.

## Unnecessary Else Blocks

### Warning Message

```text
Consider moving this statement to an `else` block`
```

### Problem

Code after `return` statements in `if` blocks can be moved to `else` blocks for clarity, or
the `else` can be removed entirely since the code will only execute if the condition is false.

### ❌ Unnecessary Structure

```python
if self.is_argon2_hash(hashed_password):
    try:
        # ... verification logic
        return True
    except VerificationError:
        return False

# This else is unnecessary
else:
    logger.warning("Unknown hash format")
    return False
```

### ✅ Cleaner Structure

```python
if self.is_argon2_hash(hashed_password):
    try:
        # ... verification logic
        return True
    except VerificationError:
        return False

# No else needed - code flows naturally
logger.warning("Unknown hash format")
return False
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
async def authenticate(
    self, username: str, password: str, client_ip: str | None = None
) -> TokenResponse | None:
    # Rate limiting check
    if client_ip and not self.token_manager.check_rate_limit(client_ip):
        logger.warning("Rate limit exceeded for IP: %s", client_ip)
        return None

    # Get user from backend
    user = await self.backend.get_user_by_username(username)
    if not user:
        logger.warning("Authentication failed: user '%s' not found", username)
        return None

    # Check if user is active
    if not user.is_active:
        logger.warning("Authentication failed: user '%s' is inactive", username)
        return None

    # Verify password
    is_valid, updated_hash = self.password_manager.verify_and_update_password(
        password, user.password_hash
    )

    if not is_valid:
        logger.warning(
            "Authentication failed: invalid password for user '%s'", username
        )
        return None

    # Create tokens - no else needed, code flows naturally
    token_data: dict[str, Any] = {
        "sub": user.username,
        "role": user.role.value,
        "permissions": user.permissions or [],
        "user_id": str(user.id),
    }

    tokens = self.token_manager.create_tokens(token_data)
    logger.info("User '%s' authenticated successfully", username)
    return tokens
```

### When Else Blocks Are Appropriate

```python
# When you need to handle both cases explicitly
if user.is_admin:
    logger.info("Admin user %s accessed admin panel", user.username)
    return admin_dashboard()
else:
    logger.info("Regular user %s accessed user panel", user.username)
    return user_dashboard()

# When the else provides different logic
if request.method == "GET":
    return handle_get_request(request)
else:
    return handle_post_request(request)
```

## Return Condition Directly

### Warning Message

```text
Return the condition directly
```

### Problem

Unnecessary intermediate variables for boolean conditions make code more verbose and harder to read.

### ❌ Verbose

```python
def needs_update(self, hash_params: dict) -> bool:
    needs_update = (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
    return needs_update
```

### ✅ Direct

```python
def needs_update(self, hash_params: dict) -> bool:
    return (
        memory_cost != current_params["memory_cost"]
        or time_cost != current_params["time_cost"]
        or parallelism != current_params["parallelism"]
    )
```

### Real-World Example from Reynard

```python
# libraries/gatekeeper/gatekeeper/core/auth_manager.py
def verify_token(self, token: str) -> bool:
    """Verify if a token is valid."""
    result = self.token_manager.verify_token(token, "access")
    return result.is_valid

# Could be simplified to:
def verify_token(self, token: str) -> bool:
    """Verify if a token is valid."""
    return self.token_manager.verify_token(token, "access").is_valid
```

### When Intermediate Variables Are Appropriate

```python
# When the condition is complex and benefits from explanation
def is_valid_user_session(self, user: User, session: Session) -> bool:
    # Check if user is active
    user_is_active = user.is_active and not user.is_locked

    # Check if session is valid
    session_is_valid = (
        session.is_valid
        and not session.is_expired
        and session.user_id == user.id
    )

    # Both conditions must be true
    return user_is_active and session_is_valid

# When you need to use the result multiple times
def process_data(self, data: list[str]) -> dict[str, int]:
    is_valid = self.validate_data(data)
    if not is_valid:
        return {}

    # Use is_valid again later
    result = self.transform_data(data, is_valid)
    return result
```

## Method Complexity

### Warning Message

```text
'AuthManager.reset_password_with_token' is too complex (18)
```

### Problem

Methods that are too complex are hard to understand, test, and
maintain. They often violate the single responsibility principle.

### ❌ Complex Method

```python
async def reset_password_with_token(
    self, reset_token: str, new_password: str
) -> bool:
    """Reset a user's password using a valid reset token."""
    try:
        # Verify the reset token format
        if not reset_token.startswith("reset_"):
            logger.warning("Invalid reset token format")
            return False

        # Find user by searching for the reset token in metadata
        user = None
        try:
            all_users = await self.backend.get_all_users()
            for u in all_users:
                if u.metadata and u.metadata.get("reset_token") == reset_token:
                    user = await self.backend.get_user_by_username(u.username)
                    break
        except Exception:
            pass

        if not user:
            logger.warning("User not found for reset token")
            return False

        if not user.is_active:
            logger.warning("Password reset attempted for inactive user: %s", user.username)
            return False

        # Verify the token matches what's stored in user metadata
        if not user.metadata or user.metadata.get("reset_token") != reset_token:
            logger.warning("Reset token mismatch for user: %s", user.username)
            return False

        # Check if token has expired (24 hours)
        token_expires = user.metadata.get("reset_token_expires")
        if token_expires:
            try:
                expires_dt = datetime.fromisoformat(token_expires)
                if datetime.now(timezone.utc) > expires_dt:
                    logger.warning("Reset token expired for user: %s", user.username)
                    return False
            except Exception as e:
                logger.warning("Error parsing token expiration: %s", e)
                return False

        # Validate new password strength
        is_strong, reason = self.password_manager.validate_password_strength(new_password)
        if not is_strong:
            logger.warning("Password reset failed - weak password: %s", reason)
            return False

        # Hash the new password
        new_password_hash = self.password_manager.hash_password(new_password)

        # Update the password
        success = await self.backend.update_user_password(user.username, new_password_hash)
        if not success:
            logger.error("Failed to update password for user: %s", user.username)
            return False

        # Clear the reset token from metadata
        if user.metadata:
            user.metadata.pop("reset_token", None)
            user.metadata.pop("reset_token_expires", None)
            user_update = UserUpdate(metadata=user.metadata)
            await self.backend.update_user(user.username, user_update)

        logger.info("Password reset successful for user: %s", user.username)
        return True

    except Exception as e:
        logger.error("Error resetting password with token: %s", e)
        return False
```

### ✅ Refactored Method

```python
async def reset_password_with_token(
    self, reset_token: str, new_password: str
) -> bool:
    """Reset a user's password using a valid reset token."""
    try:
        # Validate reset token format
        if not self._is_valid_reset_token_format(reset_token):
            return False

        # Find user by reset token
        user = await self._find_user_by_reset_token(reset_token)
        if not user:
            return False

        # Validate user and token
        if not self._validate_user_and_token(user, reset_token):
            return False

        # Validate new password
        if not self._validate_new_password(new_password):
            return False

        # Update password and clear reset token
        return await self._update_password_and_clear_token(user, new_password)

    except Exception as e:
        logger.error("Error resetting password with token: %s", e)
        return False

def _is_valid_reset_token_format(self, reset_token: str) -> bool:
    """Validate reset token format."""
    if not reset_token.startswith("reset_"):
        logger.warning("Invalid reset token format")
        return False
    return True

async def _find_user_by_reset_token(self, reset_token: str) -> User | None:
    """Find user by reset token."""
    try:
        all_users = await self.backend.get_all_users()
        for u in all_users:
            if u.metadata and u.metadata.get("reset_token") == reset_token:
                return await self.backend.get_user_by_username(u.username)
    except Exception as e:
        logger.warning("Error finding user by reset token: %s", e)
    return None

def _validate_user_and_token(self, user: User, reset_token: str) -> bool:
    """Validate user and reset token."""
    if not user.is_active:
        logger.warning("Password reset attempted for inactive user: %s", user.username)
        return False

    if not user.metadata or user.metadata.get("reset_token") != reset_token:
        logger.warning("Reset token mismatch for user: %s", user.username)
        return False

    return self._check_token_expiration(user)

def _check_token_expiration(self, user: User) -> bool:
    """Check if reset token has expired."""
    token_expires = user.metadata.get("reset_token_expires")
    if not token_expires:
        return True

    try:
        expires_dt = datetime.fromisoformat(token_expires)
        if datetime.now(timezone.utc) > expires_dt:
            logger.warning("Reset token expired for user: %s", user.username)
            return False
    except Exception as e:
        logger.warning("Error parsing token expiration: %s", e)
        return False

    return True

def _validate_new_password(self, new_password: str) -> bool:
    """Validate new password strength."""
    is_strong, reason = self.password_manager.validate_password_strength(new_password)
    if not is_strong:
        logger.warning("Password reset failed - weak password: %s", reason)
        return False
    return True

async def _update_password_and_clear_token(self, user: User, new_password: str) -> bool:
    """Update password and clear reset token."""
    new_password_hash = self.password_manager.hash_password(new_password)

    success = await self.backend.update_user_password(user.username, new_password_hash)
    if not success:
        logger.error("Failed to update password for user: %s", user.username)
        return False

    # Clear the reset token from metadata
    if user.metadata:
        user.metadata.pop("reset_token", None)
        user.metadata.pop("reset_token_expires", None)
        user_update = UserUpdate(metadata=user.metadata)
        await self.backend.update_user(user.username, user_update)

    logger.info("Password reset successful for user: %s", user.username)
    return True
```

## Code Structure Best Practices

### 1. Single Responsibility Principle

```python
# ✅ Each method has a single responsibility
class PasswordManager:
    def hash_password(self, password: str) -> str:
        """Hash a password using Argon2."""
        pass

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        pass

    def validate_password_strength(self, password: str) -> tuple[bool, str]:
        """Validate password strength."""
        pass

# ❌ Method with multiple responsibilities
class PasswordManager:
    def process_password(self, password: str, action: str) -> str | bool:
        """Hash or verify password based on action."""
        pass
```

### 2. Early Returns

```python
# ✅ Early returns for error cases
async def authenticate_user(self, username: str, password: str) -> User | None:
    if not username or not password:
        logger.warning("Missing username or password")
        return None

    user = await self.get_user(username)
    if not user:
        logger.warning("User not found: %s", username)
        return None

    if not user.is_active:
        logger.warning("User is inactive: %s", username)
        return None

    if not self.verify_password(password, user.password_hash):
        logger.warning("Invalid password for user: %s", username)
        return None

    # Success case
    logger.info("User authenticated successfully: %s", username)
    return user

# ❌ Nested conditions
async def authenticate_user(self, username: str, password: str) -> User | None:
    if username and password:
        user = await self.get_user(username)
        if user:
            if user.is_active:
                if self.verify_password(password, user.password_hash):
                    logger.info("User authenticated successfully: %s", username)
                    return user
                else:
                    logger.warning("Invalid password for user: %s", username)
            else:
                logger.warning("User is inactive: %s", username)
        else:
            logger.warning("User not found: %s", username)
    else:
        logger.warning("Missing username or password")
    return None
```

### 3. Guard Clauses

```python
# ✅ Guard clauses for validation
def process_user_data(self, user_data: dict) -> User | None:
    # Guard clauses
    if not user_data:
        logger.warning("No user data provided")
        return None

    if "username" not in user_data:
        logger.warning("Username is required")
        return None

    if "email" not in user_data:
        logger.warning("Email is required")
        return None

    # Main logic
    try:
        user = User(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=user_data.get("password_hash", "")
        )
        logger.info("User created successfully: %s", user.username)
        return user
    except Exception as e:
        logger.error("Failed to create user: %s", e)
        return None
```

### 4. Method Extraction

```python
# ✅ Extract complex logic into separate methods
class AuthManager:
    async def authenticate(self, username: str, password: str) -> TokenResponse | None:
        # Validate input
        if not self._validate_credentials(username, password):
            return None

        # Get user
        user = await self._get_user_for_authentication(username)
        if not user:
            return None

        # Verify password
        if not self._verify_user_password(user, password):
            return None

        # Create tokens
        return self._create_authentication_tokens(user)

    def _validate_credentials(self, username: str, password: str) -> bool:
        """Validate input credentials."""
        if not username or not password:
            logger.warning("Missing username or password")
            return False
        return True

    async def _get_user_for_authentication(self, username: str) -> User | None:
        """Get user for authentication."""
        user = await self.backend.get_user_by_username(username)
        if not user:
            logger.warning("Authentication failed: user '%s' not found", username)
            return None

        if not user.is_active:
            logger.warning("Authentication failed: user '%s' is inactive", username)
            return None

        return user

    def _verify_user_password(self, user: User, password: str) -> bool:
        """Verify user password."""
        is_valid, updated_hash = self.password_manager.verify_and_update_password(
            password, user.password_hash
        )

        if not is_valid:
            logger.warning(
                "Authentication failed: invalid password for user '%s'", user.username
            )
            return False

        # Update password hash if needed
        if updated_hash:
            asyncio.create_task(
                self.backend.update_user_password(user.username, updated_hash)
            )
            logger.info("Password hash updated for user '%s'", user.username)

        return True

    def _create_authentication_tokens(self, user: User) -> TokenResponse:
        """Create authentication tokens."""
        token_data: dict[str, Any] = {
            "sub": user.username,
            "role": user.role.value,
            "permissions": user.permissions or [],
            "user_id": str(user.id),
        }

        tokens = self.token_manager.create_tokens(token_data)
        logger.info("User '%s' authenticated successfully", user.username)
        return tokens
```

## Tools and Configuration

### Pylint Configuration

```toml
# pyproject.toml
[tool.pylint.design]
max-args = 5
max-locals = 15
max-returns = 6
max-branches = 12
max-statements = 50
max-attributes = 10
max-public-methods = 20
max-bool-expr = 5

[tool.pylint.messages_control]
disable = [
    "too-few-public-methods",  # Allow for utility classes
    "missing-module-docstring",  # Not required for all modules
]
```

### Flake8 Configuration

```toml
# pyproject.toml
[tool.flake8]
max-line-length = 88
extend-ignore = ["E203", "W503"]
max-complexity = 10
```

## Troubleshooting

### Common Issues

#### Issue: Method Still Too Complex After Refactoring

**Symptoms**: Refactored method still triggers complexity warnings
**Causes**: Method still has too many responsibilities
**Solutions**:

```python
# Use strategy pattern for complex logic
class PasswordResetStrategy:
    def execute(self, reset_token: str, new_password: str) -> bool:
        pass

class TokenValidationStrategy(PasswordResetStrategy):
    def execute(self, reset_token: str, new_password: str) -> bool:
        # Token validation logic
        pass

class UserValidationStrategy(PasswordResetStrategy):
    def execute(self, reset_token: str, new_password: str) -> bool:
        # User validation logic
        pass

class PasswordUpdateStrategy(PasswordResetStrategy):
    def execute(self, reset_token: str, new_password: str) -> bool:
        # Password update logic
        pass
```

#### Issue: Too Many Early Returns

**Symptoms**: Method has many early returns making it hard to follow
**Causes**: Over-optimization for early returns
**Solutions**:

```python
# Use validation method instead of many early returns
def validate_request(self, request: Request) -> tuple[bool, str]:
    """Validate request and return (is_valid, error_message)."""
    if not request.username:
        return False, "Username is required"

    if not request.password:
        return False, "Password is required"

    if len(request.username) < 3:
        return False, "Username must be at least 3 characters"

    return True, ""

async def process_request(self, request: Request) -> Response:
    """Process a request."""
    is_valid, error_message = self.validate_request(request)
    if not is_valid:
        return Response(error=error_message, status=400)

    # Process valid request
    return Response(success=True)
```

## Conclusion

🦊 _Code structure requires the precision of a fox - knowing exactly how to organize code for maximum clarity and
maintainability._

Good code structure is essential for maintainable Python applications. The key principles are:

- **Remove unnecessary else blocks** for cleaner control flow
- **Return conditions directly** instead of intermediate variables
- **Break down complex methods** into smaller, focused functions
- **Use early returns** for error handling
- **Apply single responsibility principle** to methods and classes
- **Extract complex logic** into separate methods

By following these guidelines and using the provided examples, you can create Python code that is both readable and
maintainable.

_Build code structure that outfoxes complexity and maintains clarity._ 🦊
