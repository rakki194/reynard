#!/usr/bin/env python3
"""
Reynard Auth App Backend
FastAPI server with Gatekeeper authentication integration
"""

import asyncio
import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Add the gatekeeper library to the path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / "libraries" / "gatekeeper"))

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Optional

from gatekeeper import (
    AuthManager,
    TokenConfig,
    UserCreate,
    UserRole,
    UserPublic,
    UserUpdate,
)
from gatekeeper.backends.postgresql import PostgreSQLBackend


# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://yipyap:yipyap@localhost:5432/yipyap"
)

# Token configuration
TOKEN_CONFIG = TokenConfig(
    secret_key=os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production"),
    algorithm="HS256",
    access_token_expire_minutes=30,
    refresh_token_expire_days=7,
)

# Global auth manager
auth_manager: Optional[AuthManager] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    global auth_manager
    
    print("🚀 Starting Reynard Auth Backend...")
    print(f"📊 Using database: {DATABASE_URL}")
    
    # Initialize PostgreSQL backend
    print("🔧 Initializing PostgreSQL backend...")
    backend = PostgreSQLBackend(
        database_url=DATABASE_URL,
        echo=False  # Set to True for SQL logging
    )
    
    # Test database connection
    print("🏥 Testing database connection...")
    is_healthy = await backend.health_check()
    if not is_healthy:
        print("❌ Database connection failed!")
        print("💡 Make sure PostgreSQL is running and accessible.")
        print("   Database URL:", DATABASE_URL)
        raise RuntimeError("Database connection failed")
    
    print("✅ Database connection successful!")
    
    # Initialize authentication manager
    print("🔐 Initializing authentication manager...")
    auth_manager = AuthManager(backend=backend, token_config=TOKEN_CONFIG)
    
    print("✅ Reynard Auth Backend started successfully!")
    
    yield
    
    # Cleanup
    print("🧹 Cleaning up...")
    if auth_manager:
        await auth_manager.close()
    print("✅ Cleanup completed")


# Create FastAPI app
app = FastAPI(
    title="Reynard Auth API",
    description="Authentication API for Reynard Auth Demo App",
    version="1.0.0",
    lifespan=lifespan
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
    full_name: Optional[str] = None
    role: str = "regular"


class LogoutRequest(BaseModel):
    token: str


class RefreshRequest(BaseModel):
    refresh_token: str


# Dependency to get auth manager
def get_auth_manager() -> AuthManager:
    if auth_manager is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service not available"
        )
    return auth_manager


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "reynard-auth-backend"}


# Authentication endpoints
@app.post("/auth/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """Authenticate user and return access/refresh tokens"""
    try:
        tokens = await auth_mgr.authenticate(
            username=form_data.username,
            password=form_data.password
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return tokens
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@app.post("/auth/register")
async def register(
    user_data: RegisterRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """Register a new user"""
    try:
        # Convert role string to UserRole enum
        role = UserRole.REGULAR
        if user_data.role.lower() == "admin":
            role = UserRole.ADMIN
        
        user_create = UserCreate(
            username=user_data.username,
            password=user_data.password,
            email=user_data.email,
            full_name=user_data.full_name,
            role=role,
        )
        
        user = await auth_mgr.create_user(user_create)
        return UserPublic.from_user(user)
    except Exception as e:
        print(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@app.post("/auth/refresh")
async def refresh_tokens(
    request: RefreshRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """Refresh access token using refresh token"""
    try:
        tokens = await auth_mgr.refresh_tokens(
            refresh_token=request.refresh_token
        )
        
        if not tokens:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        return tokens
    except Exception as e:
        print(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )


@app.post("/auth/logout")
async def logout(
    request: LogoutRequest,
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """Logout user by revoking token"""
    try:
        success = await auth_mgr.logout(request.token)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to logout"
            )
        
        return {"message": "Successfully logged out"}
    except Exception as e:
        print(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logout failed"
        )


@app.get("/auth/me")
async def get_current_user(
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """Get current user information"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authorization header"
            )
        
        token = authorization.split(" ")[1]
        user = await auth_mgr.get_current_user(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        return UserPublic.from_user(user)
    except Exception as e:
        print(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )


@app.get("/auth/users")
async def list_users(
    authorization: str = None,
    auth_mgr: AuthManager = Depends(get_auth_manager)
):
    """List all users (admin only)"""
    try:
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )
        
        token = authorization.split(" ")[1]
        current_user = await auth_mgr.get_current_user(token)
        
        if not current_user or current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        users = await auth_mgr.list_users()
        return [UserPublic.from_user(user) for user in users]
    except Exception as e:
        print(f"List users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list users"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("🦊 Starting Reynard Auth Backend Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📚 API documentation at: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


