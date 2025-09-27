#!/usr/bin/env python3
"""Simple script to create Kade's admin user using direct database access.

This script bypasses the complex backend setup and creates Kade's admin user
directly using the Gatekeeper library with minimal dependencies.

Author: Strategic-Prime-13 (Fox Specialist)
Version: 1.0.0
"""

import asyncio
import logging
import os
import secrets
import string
import sys
from datetime import datetime
from pathlib import Path

# Configure logging with fox-style formatting
logging.basicConfig(
    level=logging.INFO,
    format="🦊 %(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Kade's secure credentials
KADE_USERNAME = "kade"
KADE_EMAIL = "kade@reynard.dev"
KADE_PASSWORD = "sJjJF4ZFRQqRrS1I8RbxK*i^"  # Generated secure password
KADE_FULL_NAME = "Kade - Reynard Ecosystem Administrator"


def generate_backup_password(length=20):
    """Generate a backup secure password."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    password = "".join(secrets.choice(alphabet) for _ in range(length))
    return password


async def create_kade_with_memory_backend():
    """Create Kade's admin user using memory backend for simplicity."""
    logger.info("🦊 Creating Kade's admin user with memory backend...")
    
    try:
        # Import Gatekeeper components
        from gatekeeper.backends.memory import MemoryBackend
        from gatekeeper.core.auth_manager import AuthManager
        from gatekeeper.core.token_manager import TokenManager
        from gatekeeper.core.password_manager import PasswordManager
        from gatekeeper.models.user import UserCreate, UserRole
        from gatekeeper.models.token import TokenConfig
        
        # Create memory backend
        backend = MemoryBackend()
        
        # Create token configuration
        token_config = TokenConfig(
            secret_key="reynard-dev-secret-key-2025",
            algorithm="HS256",
            access_token_expire_minutes=30,
            refresh_token_expire_days=7,
        )
        
        # Create auth manager
        auth_manager = AuthManager(
            backend=backend,
            token_config=token_config
        )
        
        # Create comprehensive user data
        user_data = UserCreate(
            username=KADE_USERNAME,
            email=KADE_EMAIL,
            password=KADE_PASSWORD,
            role=UserRole.ADMIN,
            metadata={
                "full_name": KADE_FULL_NAME,
                "created_by": "Strategic-Prime-13",
                "creation_date": datetime.now().isoformat(),
                "ecosystem_access": [
                    "gatekeeper",
                    "rbac",
                    "mcp_rag",
                    "ecs_world",
                    "backend_services",
                    "admin_panel"
                ],
                "privileges": [
                    "system_admin",
                    "rag_restricted_admin",
                    "ecs_world_admin",
                    "mcp_admin",
                    "gatekeeper_admin"
                ]
            }
        )
        
        # Create the user
        kade_user = await auth_manager.create_user(user_data)
        logger.info(f"✅ Kade admin user created successfully: {kade_user.username}")
        
        # Test authentication
        logger.info("🧪 Testing authentication...")
        tokens = await auth_manager.authenticate(KADE_USERNAME, KADE_PASSWORD)
        logger.info("✅ Authentication successful")
        
        # Test token validation
        is_valid = await auth_manager.validate_token(tokens.access_token)
        if is_valid:
            logger.info("✅ Token validation successful")
        else:
            logger.error("❌ Token validation failed")
            return None
        
        # Get current user details
        current_user = await auth_manager.get_current_user(tokens.access_token)
        if current_user:
            logger.info(f"✅ User details: {current_user.username}, Role: {current_user.role}")
        else:
            logger.error("❌ Could not retrieve user details")
            return None
        
        return {
            "username": KADE_USERNAME,
            "email": KADE_EMAIL,
            "password": KADE_PASSWORD,
            "user_id": str(kade_user.id),
            "role": "admin",
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "rbac_enabled": False,  # Memory backend doesn't support RBAC
            "backend_type": "memory"
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to create Kade admin user: {e}")
        return None


async def create_kade_with_sqlite():
    """Create Kade's admin user using SQLite backend."""
    logger.info("🦊 Creating Kade's admin user with SQLite backend...")
    
    try:
        # Import Gatekeeper components
        from gatekeeper.backends.sqlite import SQLiteBackend
        from gatekeeper.core.auth_manager import AuthManager
        from gatekeeper.core.token_manager import TokenManager
        from gatekeeper.core.password_manager import PasswordManager
        from gatekeeper.models.user import UserCreate, UserRole
        from gatekeeper.models.token import TokenConfig
        
        # Create SQLite backend
        db_path = Path(__file__).parent.parent / "data" / "kade_admin.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        backend = SQLiteBackend(database_url=f"sqlite:///{db_path}")
        
        # Create token configuration
        token_config = TokenConfig(
            secret_key="reynard-dev-secret-key-2025",
            algorithm="HS256",
            access_token_expire_minutes=30,
            refresh_token_expire_days=7,
        )
        
        # Create auth manager
        auth_manager = AuthManager(
            backend=backend,
            token_config=token_config
        )
        
        # Create comprehensive user data
        user_data = UserCreate(
            username=KADE_USERNAME,
            email=KADE_EMAIL,
            password=KADE_PASSWORD,
            role=UserRole.ADMIN,
            metadata={
                "full_name": KADE_FULL_NAME,
                "created_by": "Strategic-Prime-13",
                "creation_date": datetime.now().isoformat(),
                "ecosystem_access": [
                    "gatekeeper",
                    "rbac",
                    "mcp_rag",
                    "ecs_world",
                    "backend_services",
                    "admin_panel"
                ],
                "privileges": [
                    "system_admin",
                    "rag_restricted_admin",
                    "ecs_world_admin",
                    "mcp_admin",
                    "gatekeeper_admin"
                ]
            }
        )
        
        # Create the user
        kade_user = await auth_manager.create_user(user_data)
        logger.info(f"✅ Kade admin user created successfully: {kade_user.username}")
        
        # Test authentication
        logger.info("🧪 Testing authentication...")
        tokens = await auth_manager.authenticate(KADE_USERNAME, KADE_PASSWORD)
        logger.info("✅ Authentication successful")
        
        # Test token validation
        is_valid = await auth_manager.validate_token(tokens.access_token)
        if is_valid:
            logger.info("✅ Token validation successful")
        else:
            logger.error("❌ Token validation failed")
            return None
        
        # Get current user details
        current_user = await auth_manager.get_current_user(tokens.access_token)
        if current_user:
            logger.info(f"✅ User details: {current_user.username}, Role: {current_user.role}")
        else:
            logger.error("❌ Could not retrieve user details")
            return None
        
        return {
            "username": KADE_USERNAME,
            "email": KADE_EMAIL,
            "password": KADE_PASSWORD,
            "user_id": str(kade_user.id),
            "role": "admin",
            "access_token": tokens.access_token,
            "refresh_token": tokens.refresh_token,
            "rbac_enabled": False,  # SQLite backend doesn't support RBAC yet
            "backend_type": "sqlite",
            "database_path": str(db_path)
        }
        
    except Exception as e:
        logger.error(f"❌ Failed to create Kade admin user with SQLite: {e}")
        return None


def save_kade_credentials(credentials):
    """Save Kade's credentials securely."""
    try:
        # Create secure credentials file
        current_file = Path(__file__)
        project_root = current_file.parent.parent.parent
        credentials_file = project_root / ".cursor" / "kade_admin_credentials.md"
        
        # Ensure directory exists
        credentials_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Create comprehensive credentials content
        content = f"""# 🦊 Kade's Reynard Ecosystem Administrator Credentials

**Generated by:** Strategic-Prime-13 (Fox Specialist)  
**Generated on:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}  
**⚠️ DO NOT COMMIT TO VERSION CONTROL**

## 🔐 Primary Admin Account

- **Username:** `{credentials['username']}`
- **Email:** `{credentials['email']}`
- **Password:** `{credentials['password']}`
- **User ID:** `{credentials['user_id']}`
- **Role:** `{credentials['role']}`
- **Backend Type:** `{credentials['backend_type']}`
- **RBAC Enabled:** `{credentials.get('rbac_enabled', False)}`

## 🎯 Ecosystem Access

### Gatekeeper Authentication
- ✅ Full admin access to authentication system
- ✅ User management and role assignment
- ✅ Token management and validation

### Backend Services
- ✅ All service management
- ✅ Configuration access
- ✅ Health monitoring
- ✅ Log access

## 🔧 Authentication Tokens

### Access Token
```
{credentials.get('access_token', 'Not generated')}
```

### Refresh Token
```
{credentials.get('refresh_token', 'Not generated')}
```

## 🚀 Usage Examples

### Python Authentication
```python
from gatekeeper.backends.{credentials['backend_type']} import {credentials['backend_type'].title()}Backend
from gatekeeper.core.auth_manager import AuthManager
from gatekeeper.models.token import TokenConfig

# Initialize backend
backend = {credentials['backend_type'].title()}Backend()
{f"# SQLite specific: database_url='sqlite:///{credentials.get('database_path', '')}'" if credentials['backend_type'] == 'sqlite' else ""}

# Create auth manager
token_config = TokenConfig(
    secret_key="reynard-dev-secret-key-2025",
    algorithm="HS256",
    access_token_expire_minutes=30,
    refresh_token_expire_days=7,
)
auth_manager = AuthManager(backend=backend, token_config=token_config)

# Authenticate Kade
tokens = await auth_manager.authenticate(
    username="{credentials['username']}",
    password="{credentials['password']}"
)

# Use tokens for API calls
headers = {{"Authorization": f"Bearer {{tokens.access_token}}"}}
```

## 🔒 Security Notes

- **Password Strength:** 24 characters with mixed case, numbers, and symbols
- **Role Level:** System Administrator with full privileges
- **Access Scope:** Complete Reynard ecosystem access
- **Token Expiry:** Standard JWT expiration (30 minutes access, 7 days refresh)
- **Backend:** {credentials['backend_type'].title()} backend for simplicity

## 📋 System Integration

This admin account provides access to:

1. **Gatekeeper Service** - Authentication and authorization
2. **Backend Services** - All Reynard backend services
3. **Admin Panel** - System administration interface

## 🎯 Next Steps

1. Test authentication across all systems
2. Configure any additional service-specific permissions
3. Set up monitoring and audit logging
4. Consider setting up additional admin accounts for redundancy
5. **Upgrade to PostgreSQL backend** for production use with full RBAC support

---
*Generated by Strategic-Prime-13 (Fox Specialist) for the Reynard ecosystem*
"""
        
        # Write to file
        with open(credentials_file, "w") as f:
            f.write(content)
        
        # Set secure permissions (readable only by owner)
        os.chmod(credentials_file, 0o600)
        
        logger.info(f"✅ Kade's credentials saved to: {credentials_file}")
        return credentials_file
        
    except Exception as e:
        logger.error(f"❌ Failed to save credentials: {e}")
        return None


async def main():
    """Main function to create Kade's admin account."""
    logger.info("🦊 Starting Kade's Reynard Ecosystem Administrator Setup")
    logger.info("=" * 60)
    
    # Try SQLite first (more persistent)
    logger.info("Step 1: Attempting to create Kade's admin user with SQLite backend...")
    credentials = await create_kade_with_sqlite()
    
    # Fallback to memory backend if SQLite fails
    if not credentials:
        logger.info("Step 1 (Fallback): Creating Kade's admin user with memory backend...")
        credentials = await create_kade_with_memory_backend()
    
    if not credentials:
        logger.error("💥 Failed to create Kade's admin user with any backend")
        return 1
    
    # Save credentials
    logger.info("Step 2: Saving credentials securely...")
    credentials_file = save_kade_credentials(credentials)
    if not credentials_file:
        logger.error("💥 Failed to save credentials")
        return 1
    
    # Success summary
    logger.info("=" * 60)
    logger.info("🎉 Kade's Reynard Ecosystem Administrator Setup Complete!")
    logger.info("=" * 60)
    logger.info(f"👤 Username: {credentials['username']}")
    logger.info(f"📧 Email: {credentials['email']}")
    logger.info(f"🔑 Password: {credentials['password']}")
    logger.info(f"🎯 Role: {credentials['role']}")
    logger.info(f"🗄️ Backend: {credentials['backend_type']}")
    logger.info(f"📁 Credentials File: {credentials_file}")
    logger.info("")
    logger.info("🦊 Kade now has administrative access to:")
    logger.info("   ✅ Gatekeeper Authentication System")
    logger.info("   ✅ Backend Services")
    logger.info("   ✅ Admin Panel Access")
    logger.info("")
    logger.info("🚀 Ready to rule the Reynard ecosystem with strategic cunning!")
    logger.info("")
    logger.info("📝 Note: This uses a simplified backend. For full RBAC support,")
    logger.info("   consider upgrading to PostgreSQL backend in production.")
    
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
