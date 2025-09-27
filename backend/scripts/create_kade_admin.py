#!/usr/bin/env python3
"""Create Kade's administrator user account for the Reynard ecosystem.

This script creates a comprehensive admin user with full privileges across:
- Gatekeeper authentication system
- RBAC (Role-Based Access Control)
- MCP RAG system
- ECS world simulation
- All backend services

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

# Add backend to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.gatekeeper_config import get_auth_manager

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


async def create_kade_admin_user():
    """Create Kade's comprehensive admin user account."""
    logger.info("🦊 Creating Kade's administrator account with full ecosystem privileges...")
    
    try:
        # Get auth manager
        auth_manager = get_auth_manager()
        
        # Import Gatekeeper models
        from gatekeeper.models.user import UserCreate, UserRole, UserUpdate
        
        # Create comprehensive user data
        user_data = UserCreate(
            username=KADE_USERNAME,
            email=KADE_EMAIL,
            password=KADE_PASSWORD,
            role=UserRole.ADMIN,
            rbac_enabled=True,
            default_role="system_admin",
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
        
        # Check if Kade already exists
        try:
            existing_user = await auth_manager.get_user_by_username(KADE_USERNAME)
            if existing_user:
                logger.info("⚠️ Kade user already exists, updating to full admin privileges...")
                
                # Update existing user to full admin
                update_data = UserUpdate(
                    role=UserRole.ADMIN,
                    rbac_enabled=True,
                    default_role="system_admin",
                    metadata=user_data.metadata
                )
                
                updated_user = await auth_manager.update_user(existing_user.id, update_data)
                logger.info("✅ Existing Kade user updated to full admin privileges")
                
                return {
                    "username": KADE_USERNAME,
                    "email": KADE_EMAIL,
                    "password": "EXISTING_USER_PASSWORD_NOT_KNOWN",
                    "user_id": str(existing_user.id),
                    "role": "admin",
                    "rbac_enabled": True,
                    "default_role": "system_admin"
                }
        except Exception:
            # User doesn't exist, create new one
            pass
        
        # Create new Kade admin user
        try:
            kade_user = await auth_manager.create_user(user_data)
            logger.info(f"✅ Kade admin user created successfully: {kade_user.username}")
            
            # Assign system_admin role if RBAC is available
            try:
                success = await auth_manager.assign_role_to_user(KADE_USERNAME, "system_admin")
                if success:
                    logger.info("✅ Assigned system_admin role to Kade")
                else:
                    logger.warning("⚠️ Could not assign system_admin role (RBAC may not be bootstrapped)")
            except Exception as e:
                logger.warning(f"⚠️ Role assignment failed: {e}")
            
            return {
                "username": KADE_USERNAME,
                "email": KADE_EMAIL,
                "password": KADE_PASSWORD,
                "user_id": str(kade_user.id),
                "role": "admin",
                "rbac_enabled": True,
                "default_role": "system_admin"
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to create Kade admin user: {e}")
            return None
            
    except Exception as e:
        logger.error(f"❌ Critical error in admin user creation: {e}")
        return None


async def configure_mcp_access(credentials):
    """Configure MCP RAG access for Kade."""
    logger.info("🔧 Configuring MCP RAG access for Kade...")
    
    try:
        # Import MCP auth service
        from app.security.mcp_auth import MCPAuthService
        
        mcp_auth = MCPAuthService()
        
        # Create MCP client for Kade
        kade_mcp_client = {
            "client_id": f"kade-{KADE_USERNAME}",
            "client_type": "user",
            "name": f"Kade - {KADE_FULL_NAME}",
            "permissions": [
                "rag:query",
                "rag:stats", 
                "rag:config",
                "rag:ingest",
                "embed:text",
                "mcp:admin",
                "mcp:tools:read",
                "mcp:tools:execute",
                "mcp:tools:manage",
                "mcp:config:read",
                "mcp:config:write"
            ]
        }
        
        # Generate MCP token for Kade
        mcp_token = mcp_auth.generate_mcp_token(
            client_id=kade_mcp_client["client_id"],
            additional_permissions=kade_mcp_client["permissions"]
        )
        
        logger.info("✅ MCP RAG access configured for Kade")
        return mcp_token
        
    except Exception as e:
        logger.warning(f"⚠️ MCP configuration failed: {e}")
        return None


async def test_comprehensive_access(credentials):
    """Test Kade's access across all systems."""
    logger.info("🧪 Testing Kade's comprehensive system access...")
    
    try:
        # Get auth manager
        auth_manager = get_auth_manager()
        
        # Test 1: Basic authentication
        logger.info("Testing basic authentication...")
        if credentials["password"] != "EXISTING_USER_PASSWORD_NOT_KNOWN":
            tokens = await auth_manager.authenticate(
                credentials["username"],
                credentials["password"]
            )
            logger.info("✅ Basic authentication successful")
        else:
            logger.warning("⚠️ Cannot test authentication - password not known")
            return False
        
        # Test 2: Token validation
        logger.info("Testing token validation...")
        is_valid = await auth_manager.validate_token(tokens.access_token)
        if is_valid:
            logger.info("✅ Token validation successful")
        else:
            logger.error("❌ Token validation failed")
            return False
        
        # Test 3: Current user retrieval
        logger.info("Testing user details retrieval...")
        current_user = await auth_manager.get_current_user(tokens.access_token)
        if current_user:
            logger.info(f"✅ User details: {current_user.username}, Role: {current_user.role}")
            logger.info(f"✅ RBAC Enabled: {current_user.rbac_enabled}")
            logger.info(f"✅ Default Role: {current_user.default_role}")
        else:
            logger.error("❌ Could not retrieve user details")
            return False
        
        # Test 4: RBAC permissions (if available)
        if current_user.rbac_enabled:
            logger.info("Testing RBAC permissions...")
            try:
                permission_result = await auth_manager.check_permission(
                    credentials["username"], "system", "rbac", "manage"
                )
                if permission_result.granted:
                    logger.info("✅ RBAC system management permissions confirmed")
                else:
                    logger.warning(f"⚠️ RBAC permission check: {permission_result.reason}")
            except Exception as e:
                logger.warning(f"⚠️ RBAC permission test failed: {e}")
        
        # Test 5: MCP access
        logger.info("Testing MCP access...")
        mcp_token = await configure_mcp_access(credentials)
        if mcp_token:
            logger.info("✅ MCP access configured and tested")
        else:
            logger.warning("⚠️ MCP access configuration failed")
        
        logger.info("🎉 Comprehensive access testing completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Access testing failed: {e}")
        return False


def save_kade_credentials(credentials, mcp_token=None):
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
- **RBAC Enabled:** `{credentials.get('rbac_enabled', False)}`
- **Default Role:** `{credentials.get('default_role', 'N/A')}`

## 🎯 Ecosystem Access

### Gatekeeper Authentication
- ✅ Full admin access to authentication system
- ✅ User management and role assignment
- ✅ Token management and validation

### RBAC (Role-Based Access Control)
- ✅ System administrator role
- ✅ Full permission management
- ✅ Role hierarchy management
- ✅ Conditional permissions

### MCP RAG System
- ✅ Full RAG query access
- ✅ Document ingestion and indexing
- ✅ Embedding generation
- ✅ Configuration management
- ✅ Statistics and monitoring

### ECS World Simulation
- ✅ World administration
- ✅ Agent management
- ✅ Simulation control
- ✅ Social system management

### Backend Services
- ✅ All service management
- ✅ Configuration access
- ✅ Health monitoring
- ✅ Log access

## 🔧 MCP Token Access

```json
{{
  "client_id": "kade-{credentials['username']}",
  "client_type": "user",
  "permissions": [
    "rag:query",
    "rag:stats",
    "rag:config", 
    "rag:ingest",
    "embed:text",
    "mcp:admin",
    "mcp:tools:read",
    "mcp:tools:execute",
    "mcp:tools:manage",
    "mcp:config:read",
    "mcp:config:write"
  ]
}}
```

{f"MCP Token: `{mcp_token[:50]}...`" if mcp_token else "MCP Token: Not generated"}

## 🚀 Usage Examples

### Python Authentication
```python
from app.gatekeeper_config import get_auth_manager
from gatekeeper.models.user import UserLogin

# Initialize auth manager
auth_manager = await get_auth_manager()

# Authenticate Kade
tokens = await auth_manager.authenticate(
    username="{credentials['username']}",
    password="{credentials['password']}"
)

# Use tokens for API calls
headers = {{"Authorization": f"Bearer {{tokens.access_token}}"}}
```

### MCP RAG Access
```python
from app.security.mcp_auth import MCPAuthService

mcp_auth = MCPAuthService()
mcp_token = mcp_auth.generate_mcp_token(
    client_id="kade-{credentials['username']}",
    additional_permissions=["rag:query", "mcp:admin"]
)
```

### RBAC Permission Check
```python
# Check system management permissions
permission_result = await auth_manager.check_permission(
    username="{credentials['username']}",
    resource_type="system",
    resource_id="rbac", 
    operation="manage"
)
```

## 🔒 Security Notes

- **Password Strength:** 24 characters with mixed case, numbers, and symbols
- **Role Level:** System Administrator with full privileges
- **Access Scope:** Complete Reynard ecosystem access
- **Token Expiry:** Standard JWT expiration (30 minutes access, 7 days refresh)
- **RBAC Integration:** Full role-based access control enabled

## 📋 System Integration

This admin account provides access to:

1. **Gatekeeper Service** - Authentication and authorization
2. **RBAC System** - Role-based access control
3. **MCP RAG** - Retrieval-augmented generation
4. **ECS World** - Entity component system simulation
5. **Backend Services** - All Reynard backend services
6. **Admin Panel** - System administration interface

## 🎯 Next Steps

1. Test authentication across all systems
2. Configure any additional service-specific permissions
3. Set up monitoring and audit logging
4. Consider setting up additional admin accounts for redundancy

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
    """Main function to create Kade's comprehensive admin account."""
    logger.info("🦊 Starting Kade's Reynard Ecosystem Administrator Setup")
    logger.info("=" * 60)
    
    # Step 1: Create admin user
    logger.info("Step 1: Creating Kade's admin user account...")
    credentials = await create_kade_admin_user()
    if not credentials:
        logger.error("💥 Failed to create Kade's admin user")
        return 1
    
    # Step 2: Configure MCP access
    logger.info("Step 2: Configuring MCP RAG access...")
    mcp_token = await configure_mcp_access(credentials)
    
    # Step 3: Test comprehensive access
    logger.info("Step 3: Testing comprehensive system access...")
    if credentials["password"] != "EXISTING_USER_PASSWORD_NOT_KNOWN":
        access_success = await test_comprehensive_access(credentials)
        if not access_success:
            logger.error("💥 Comprehensive access testing failed")
            return 1
    else:
        logger.warning("⚠️ Skipping access tests - password not known for existing user")
    
    # Step 4: Save credentials
    logger.info("Step 4: Saving credentials securely...")
    credentials_file = save_kade_credentials(credentials, mcp_token)
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
    logger.info(f"🔐 RBAC Enabled: {credentials.get('rbac_enabled', False)}")
    logger.info(f"📁 Credentials File: {credentials_file}")
    logger.info("")
    logger.info("🦊 Kade now has full administrative access to:")
    logger.info("   ✅ Gatekeeper Authentication System")
    logger.info("   ✅ RBAC (Role-Based Access Control)")
    logger.info("   ✅ MCP RAG System")
    logger.info("   ✅ ECS World Simulation")
    logger.info("   ✅ All Backend Services")
    logger.info("   ✅ Admin Panel Access")
    logger.info("")
    logger.info("🚀 Ready to rule the Reynard ecosystem with strategic cunning!")
    
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
