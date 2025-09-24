#!/usr/bin/env python3
"""Create an administrator user account for the AI agent.

This script creates a new admin user in the Gatekeeper authentication system
and saves the credentials securely.
"""

import logging
import os
import secrets
import string
import sys
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

import asyncio

from app.gatekeeper_config import get_auth_manager

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def generate_secure_password(length=16):
    """Generate a secure random password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = "".join(secrets.choice(alphabet) for _ in range(length))
    return password


async def create_admin_user():
    """Create an admin user account."""
    try:
        # Get auth manager
        auth_manager = await get_auth_manager()

        # Generate secure credentials
        username = "reynard-ai-admin-2025"
        email = "ai-admin-2025@reynard.dev"
        password = generate_secure_password(20)

        logger.info(f"Creating admin user: {username}")
        logger.info(f"Email: {email}")

        # Create user data using Gatekeeper models
        # Import from the Gatekeeper library
        import sys

        sys.path.append("/home/kade/runeset/reynard/services/gatekeeper")
        from gatekeeper.models.user import UserCreate, UserRole

        user_data = UserCreate(
            username=username, email=email, password=password, role=UserRole.ADMIN,
        )

        # Create the user
        try:
            user = await auth_manager.create_user(user_data)
            logger.info("✅ Admin user created successfully")

            # User is already created with admin role, no need to update
            logger.info("✅ User created with admin role")

            return {
                "username": username,
                "email": email,
                "password": password,
                "user_id": str(user.id),
                "role": "admin",
            }

        except Exception as e:
            if "already exists" in str(e).lower():
                logger.warning("⚠️ User already exists, attempting to update role")
                # Try to get existing user and update role
                existing_user = await auth_manager.get_user_by_username(username)
                if existing_user:
                    from gatekeeper.models.user import UserRole, UserUpdate

                    update_data = UserUpdate(role=UserRole.ADMIN)
                    updated_user = await auth_manager.update_user(
                        existing_user.id, update_data,
                    )
                    logger.info("✅ Existing user role updated to admin")
                    return {
                        "username": username,
                        "email": email,
                        "password": "EXISTING_USER_PASSWORD_NOT_KNOWN",
                        "user_id": str(existing_user.id),
                        "role": "admin",
                    }
            raise e

    except Exception as e:
        logger.error(f"❌ Failed to create admin user: {e}")
        return None


async def test_authentication(credentials):
    """Test authentication with the created credentials."""
    try:
        logger.info("Testing authentication...")

        # Get auth manager
        auth_manager = await get_auth_manager()

        # Test login
        from gatekeeper.models.user import UserLogin

        login_data = UserLogin(
            username=credentials["username"], password=credentials["password"],
        )

        if credentials["password"] == "EXISTING_USER_PASSWORD_NOT_KNOWN":
            logger.warning(
                "⚠️ Cannot test authentication - password not known for existing user",
            )
            return False

        # Attempt login
        tokens = await auth_manager.authenticate(
            login_data.username, login_data.password,
        )
        logger.info("✅ Authentication successful")
        logger.info(f"Access token: {tokens.access_token[:20]}...")
        logger.info(f"Refresh token: {tokens.refresh_token[:20]}...")

        # Test token validation
        is_valid = await auth_manager.validate_token(tokens.access_token)
        if is_valid:
            logger.info("✅ Token validation successful")

            # Get current user to verify details
            current_user = await auth_manager.get_current_user(tokens.access_token)
            if current_user:
                logger.info(
                    f"✅ Current user: {current_user.username}, Role: {current_user.role}",
                )
            else:
                logger.warning("⚠️ Could not retrieve current user details")
        else:
            logger.error("❌ Token validation failed")
            return False

        return True

    except Exception as e:
        logger.error(f"❌ Authentication test failed: {e}")
        return False


def save_credentials(credentials, file_path):
    """Save credentials to a secure file."""
    try:
        # Ensure directory exists
        file_path.parent.mkdir(parents=True, exist_ok=True)

        # Create credentials content
        content = f"""# Reynard AI Administrator Credentials
# Generated on: {asyncio.get_event_loop().time()}
# DO NOT COMMIT TO VERSION CONTROL

## Admin User Account
- **Username**: {credentials['username']}
- **Email**: {credentials['email']}
- **Password**: {credentials['password']}
- **User ID**: {credentials['user_id']}
- **Role**: {credentials['role']}

## Database Information
- **Auth Database**: reynard_auth
- **Connection**: postgresql://postgres:password@localhost:5432/reynard_auth

## Security Notes
- This is a development/admin account
- Password is randomly generated and secure
- Store this file securely and do not share
- Consider rotating credentials regularly

## Usage
```python
from app.auth.user_models import UserLogin
from app.gatekeeper_config import get_auth_manager

auth_manager = await get_auth_manager()
login_data = UserLogin(username="{credentials['username']}", password="{credentials['password']}")
tokens = await auth_manager.authenticate_user(login_data)
```
"""

        # Write to file
        with open(file_path, "w") as f:
            f.write(content)

        # Set secure permissions (readable only by owner)
        os.chmod(file_path, 0o600)

        logger.info(f"✅ Credentials saved to: {file_path}")
        return True

    except Exception as e:
        logger.error(f"❌ Failed to save credentials: {e}")
        return False


async def main():
    """Main function."""
    logger.info("🚀 Creating Reynard AI Administrator Account")

    # Create admin user
    credentials = await create_admin_user()
    if not credentials:
        logger.error("💥 Failed to create admin user")
        return 1

    # Test authentication
    auth_success = await test_authentication(credentials)
    if (
        not auth_success
        and credentials["password"] != "EXISTING_USER_PASSWORD_NOT_KNOWN"
    ):
        logger.error("💥 Authentication test failed")
        return 1

    # Save credentials
    credentials_file = Path("/home/kade/runeset/reynard/.cursor/rules/private.mdc")
    if not save_credentials(credentials, credentials_file):
        logger.error("💥 Failed to save credentials")
        return 1

    logger.info("🎉 Admin account setup completed successfully!")
    logger.info(f"📁 Credentials saved to: {credentials_file}")

    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
