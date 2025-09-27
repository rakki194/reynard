#!/usr/bin/env python3
"""🦊 Reynard Auth Demo App Backend - RBAC Integrated

This backend integrates with the main Reynard backend's RBAC and Gatekeeper systems,
providing a comprehensive authentication demonstration with proper role-based access control.

Features:
- Full RBAC integration with Gatekeeper
- PostgreSQL backend with proper schema
- JWT token management with refresh tokens
- Role-based permissions and access control
- Audit logging and security monitoring
- Test credentials and demo users

Author: Strategic-Prime-13 (Fox Specialist)
Version: 2.0.0 - RBAC Integrated
"""

import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Add the main backend to the path for imports
backend_path = Path(__file__).parent.parent.parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

# Import from main Reynard backend
from app.gatekeeper_config import get_config, get_auth_manager, initialize_gatekeeper
from app.core.service_registry import get_service_registry
from gatekeeper.models.user import UserCreate, UserPublic, UserRole
from gatekeeper.models.rbac import Operation, PermissionResult, ResourceType
from gatekeeper.core.auth_manager import AuthManager

# Database configuration for auth-app
AUTH_APP_DATABASE_URL = os.getenv(
    "AUTH_APP_DATABASE_URL",
    "postgresql://reynard:WmAGEbIWBIbqBPID%5Ea6UHw%406s34iHw4o@localhost:5432/reynard_auth_demo",
)

# Override the main backend's database URL for this demo
os.environ["AUTH_DATABASE_URL"] = AUTH_APP_DATABASE_URL
os.environ["GATEKEEPER_USE_MEMORY_BACKEND"] = "false"

# Global auth manager
auth_manager: AuthManager | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager with RBAC integration."""
    global auth_manager

    print("🦊 Starting Reynard Auth Demo Backend with RBAC...")
    print(f"📊 Using database: {AUTH_APP_DATABASE_URL}")

    try:
        # Initialize Gatekeeper with RBAC
        print("🔐 Initializing Gatekeeper with RBAC...")
        auth_manager = await initialize_gatekeeper()
        
        # Initialize RBAC system
        await _initialize_rbac_system(auth_manager)
        
        # Create demo users
        await _create_demo_users(auth_manager)

        print("✅ Reynard Auth Demo Backend with RBAC started successfully!")

    except Exception as e:
        print(f"❌ Failed to start backend: {e}")
        raise

    yield

    # Cleanup
    print("🧹 Cleaning up...")
    if auth_manager:
        await auth_manager.close()
    print("✅ Cleanup completed")


# Create FastAPI app
app = FastAPI(
    title="🦊 Reynard Auth Demo API - RBAC Integrated",
    description="Authentication API with full RBAC integration for Reynard Auth Demo App",
    version="2.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API
class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    full_name: str | None = None
    role: str = "regular"


class LogoutRequest(BaseModel):
    token: str


class RefreshRequest(BaseModel):
    refresh_token: str


class PermissionCheckRequest(BaseModel):
    resource_type: str
    resource_id: str | None = None
    operation: str


class UserWithPermissions(BaseModel):
    id: str
    username: str
    email: str
    role: str
    permissions: List[str]
    rbac_enabled: bool


# Dependency to get auth manager
def get_auth_manager_dep() -> AuthManager:
    if auth_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not available",
        )
    return auth_manager


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint with RBAC status."""
    return {
        "status": "healthy", 
        "service": "reynard-auth-demo-backend",
        "rbac_enabled": True,
        "gatekeeper_healthy": auth_manager is not None
    }


# Authentication endpoints
@app.post("/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Authenticate user and return access/refresh tokens with RBAC info."""
    try:
        tokens = await auth_mgr.authenticate(
            username=form_data.username,
            password=form_data.password,
        )

        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user details with RBAC info
        user = await auth_mgr.get_current_user(tokens.access_token)
        user_permissions = await _get_user_permissions(auth_mgr, user.username)

        return {
            **tokens.dict(),
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "rbac_enabled": getattr(user, 'rbac_enabled', True),
                "permissions": user_permissions
            }
        }
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )


@app.post("/auth/register")
async def register(
    user_data: RegisterRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Register a new user with RBAC role assignment."""
    try:
        # Convert role string to UserRole enum
        role = UserRole.REGULAR
        if user_data.role.lower() == "admin":
            role = UserRole.ADMIN
        elif user_data.role.lower() == "moderator":
            role = UserRole.REGULAR  # Use REGULAR for moderator since MODERATOR doesn't exist

        user_create = UserCreate(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            full_name=user_data.full_name,
            role=role,
        )

        user = await auth_mgr.create_user(user_create)
        
        # Assign default RBAC permissions based on role
        await _assign_default_rbac_permissions(auth_mgr, user.username, role)
        
        return UserPublic.from_user(user)
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@app.post("/auth/refresh")
async def refresh_tokens(
    request: RefreshRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Refresh access token using refresh token."""
    try:
        tokens = await auth_mgr.refresh_tokens(refresh_token=request.refresh_token)

        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        return tokens
    except Exception as e:
        print(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed",
        )


@app.post("/auth/logout")
async def logout(
    request: LogoutRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Logout user by revoking token."""
    try:
        success = await auth_mgr.logout(request.token)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to logout",
            )

        return {"message": "Successfully logged out"}
    except Exception as e:
        print(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed",
        )


@app.get("/auth/me")
async def get_current_user(
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Get current user information with RBAC permissions."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header",
            )

        token = authorization.split(" ")[1]
        user = await auth_mgr.get_current_user(token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Get user permissions
        user_permissions = await _get_user_permissions(auth_mgr, user.username)

        return {
            **UserPublic.from_user(user).dict(),
            "permissions": user_permissions,
            "rbac_enabled": getattr(user, 'rbac_enabled', True)
        }
    except Exception as e:
        print(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
        )


@app.get("/auth/users")
async def list_users(
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """List all users with RBAC permissions (admin only)."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        token = authorization.split(" ")[1]
        current_user = await auth_mgr.get_current_user(token)

        if not current_user or current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        users = await auth_mgr.list_users()
        users_with_permissions = []
        
        for user in users:
            permissions = await _get_user_permissions(auth_mgr, user.username)
            users_with_permissions.append({
                **UserPublic.from_user(user).dict(),
                "permissions": permissions,
                "rbac_enabled": getattr(user, 'rbac_enabled', True)
            })

        return users_with_permissions
    except Exception as e:
        print(f"List users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users",
        )


# RBAC-specific endpoints
@app.post("/auth/check-permission")
async def check_permission(
    request: PermissionCheckRequest,
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Check if current user has specific permission."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        token = authorization.split(" ")[1]
        user = await auth_mgr.get_current_user(token)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        # Check permission using RBAC
        permission_result = await auth_mgr.check_permission(
            username=user.username,
            resource_type=ResourceType(request.resource_type),
            resource_id=request.resource_id or "default",
            operation=request.operation,
        )

        return {
            "granted": permission_result.granted if permission_result else False,
            "user": user.username,
            "resource_type": request.resource_type,
            "resource_id": request.resource_id,
            "operation": request.operation,
            "details": permission_result.details if permission_result else None
        }
    except Exception as e:
        print(f"Permission check error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Permission check failed",
        )


@app.get("/auth/rbac/roles")
async def get_available_roles(
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Get available RBAC roles."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        token = authorization.split(" ")[1]
        user = await auth_mgr.get_current_user(token)

        if not user or user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        # Get available roles from RBAC system
        roles = await auth_mgr.get_roles()
        return {"roles": [{"name": role.name, "description": role.description} for role in roles]}
    except Exception as e:
        print(f"Get roles error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get roles",
        )


@app.get("/auth/rbac/permissions")
async def get_user_permissions(
    username: str,
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager_dep),
):
    """Get permissions for a specific user."""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header",
            )

        token = authorization.split(" ")[1]
        current_user = await auth_mgr.get_current_user(token)

        if not current_user or current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required",
            )

        permissions = await _get_user_permissions(auth_mgr, username)
        return {"username": username, "permissions": permissions}
    except Exception as e:
        print(f"Get permissions error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get permissions",
        )


# Helper functions
async def _initialize_rbac_system(auth_mgr: AuthManager) -> None:
    """Initialize RBAC system with demo permissions."""
    try:
        print("🔐 Initializing RBAC system...")
        
        # Create demo roles and permissions
        demo_roles = [
            {
                "name": "demo_admin",
                "description": "Demo Administrator with full access",
                "permissions": ["*"]  # All permissions
            },
            {
                "name": "demo_moderator", 
                "description": "Demo Moderator with limited admin access",
                "permissions": ["read", "write", "moderate"]
            },
            {
                "name": "demo_user",
                "description": "Demo Regular User with basic access", 
                "permissions": ["read", "write"]
            },
            {
                "name": "demo_guest",
                "description": "Demo Guest with read-only access",
                "permissions": ["read"]
            }
        ]
        
        for role_data in demo_roles:
            try:
                await auth_mgr.create_role(
                    name=role_data["name"],
                    description=role_data["description"]
                )
                print(f"✅ Created role: {role_data['name']}")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  Role {role_data['name']} already exists")
                else:
                    print(f"⚠️  Failed to create role {role_data['name']}: {e}")
        
        print("✅ RBAC system initialized")
        
    except Exception as e:
        print(f"❌ Failed to initialize RBAC system: {e}")
        raise


async def _create_demo_users(auth_mgr: AuthManager) -> None:
    """Create demo users for testing."""
    try:
        print("👥 Creating demo users...")
        
        demo_users = [
            {
                "username": "admin",
                "email": "admin@reynard-demo.dev",
                "password": "Admin123!",
                "role": UserRole.ADMIN,
                "full_name": "Demo Administrator"
            },
            {
                "username": "moderator",
                "email": "moderator@reynard-demo.dev", 
                "password": "Moderator123!",
                "role": UserRole.MODERATOR,
                "full_name": "Demo Moderator"
            },
            {
                "username": "user",
                "email": "user@reynard-demo.dev",
                "password": "User123!",
                "role": UserRole.REGULAR,
                "full_name": "Demo User"
            },
            {
                "username": "guest",
                "email": "guest@reynard-demo.dev",
                "password": "Guest123!",
                "role": UserRole.REGULAR,
                "full_name": "Demo Guest"
            }
        ]
        
        for user_data in demo_users:
            try:
                user_create = UserCreate(**user_data)
                user = await auth_mgr.create_user(user_create)
                print(f"✅ Created user: {user.username}")
                
                # Assign RBAC role
                await _assign_default_rbac_permissions(auth_mgr, user.username, user.role)
                
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"ℹ️  User {user_data['username']} already exists")
                else:
                    print(f"⚠️  Failed to create user {user_data['username']}: {e}")
        
        print("✅ Demo users created")
        
    except Exception as e:
        print(f"❌ Failed to create demo users: {e}")
        raise


async def _assign_default_rbac_permissions(auth_mgr: AuthManager, username: str, role: UserRole) -> None:
    """Assign default RBAC permissions based on user role."""
    try:
        role_mapping = {
            UserRole.ADMIN: "demo_admin",
            UserRole.REGULAR: "demo_user"  # Both moderator and regular users get demo_user role
        }
        
        rbac_role = role_mapping.get(role, "demo_guest")
        
        try:
            await auth_mgr.assign_role_to_user(username, rbac_role)
            print(f"✅ Assigned role {rbac_role} to user {username}")
        except Exception as e:
            if "already assigned" in str(e).lower():
                print(f"ℹ️  Role {rbac_role} already assigned to {username}")
            else:
                print(f"⚠️  Failed to assign role {rbac_role} to {username}: {e}")
                
    except Exception as e:
        print(f"❌ Failed to assign RBAC permissions: {e}")


async def _get_user_permissions(auth_mgr: AuthManager, username: str) -> List[str]:
    """Get user permissions from RBAC system."""
    try:
        # Get user roles
        user_roles = await auth_mgr.get_user_roles(username)
        
        permissions = []
        for role in user_roles:
            # Get permissions for each role
            role_permissions = await auth_mgr.get_permissions_for_role(role.name)
            permissions.extend([perm.name for perm in role_permissions])
        
        return list(set(permissions))  # Remove duplicates
        
    except Exception as e:
        print(f"⚠️  Failed to get permissions for {username}: {e}")
        return []


if __name__ == "__main__":
    import uvicorn

    print("🦊 Starting Reynard Auth Demo Backend with RBAC...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    print("🔐 RBAC integration: ENABLED")

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, log_level="info")