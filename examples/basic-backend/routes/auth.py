"""
Authentication routes for Reynard Basic Backend
Provides authentication and authorization endpoints
"""

import hashlib
import secrets
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from pydantic import BaseModel, EmailStr

from database import DatabaseService
from services import CacheService


router = APIRouter()


class LoginRequest(BaseModel):
    """Login request model"""
    username: str
    password: str


class RegisterRequest(BaseModel):
    """Registration request model"""
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response model"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600


class UserResponse(BaseModel):
    """User response model"""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: float


# In-memory user storage (for demo purposes)
# Note: This gets reset on reload, so we'll use cache service for persistence
users_db: Dict[str, Dict[str, Any]] = {}
sessions_db: Dict[str, Dict[str, Any]] = {}


# Dependency functions (will be overridden in main.py)
def get_database_service() -> DatabaseService:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Database service not available"
    )


def get_cache_service() -> CacheService:
    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Cache service not available"
    )


def hash_password(password: str) -> str:
    """Hash password using SHA-256 (for demo purposes)"""
    salt = secrets.token_hex(16)
    password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
    return f"{salt}:{password_hash}"


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    try:
        salt, password_hash = hashed_password.split(":")
        return hashlib.sha256((password + salt).encode()).hexdigest() == password_hash
    except ValueError:
        return False


def generate_token() -> str:
    """Generate a simple token (for demo purposes)"""
    return secrets.token_urlsafe(32)


async def load_users_from_cache(cache_service: CacheService):
    """Load users from cache service into users_db"""
    try:
        cached_users = await cache_service.get("users_db")
        if cached_users:
            users_db.update(cached_users)
            print(f"🔐 Loaded {len(users_db)} users from cache")
    except Exception as e:
        print(f"⚠️  Could not load users from cache: {e}")


async def save_users_to_cache(cache_service: CacheService):
    """Save users_db to cache service"""
    try:
        await cache_service.set("users_db", users_db, ttl=86400)  # 24 hours
    except Exception as e:
        print(f"⚠️  Could not save users to cache: {e}")


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Authenticate user and return access token"""
    
    print(f"🔐 Login attempt for user: {request.username}")
    
    # Get user from database
    user = await db_service.get_user_by_username(request.username)
    if not user:
        print(f"❌ User {request.username} not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Verify password
    if not verify_password(request.password, user.password_hash):
        print(f"❌ Invalid password for user {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate token
    token = generate_token()
    expires_at = datetime.utcnow() + timedelta(seconds=3600)
    
    # Create session in database
    await db_service.create_session(user.id, token, expires_at)
    
    # Update user last login
    await db_service.update_user_last_login(user.id)
    
    print(f"✅ User {request.username} logged in successfully")
    
    return TokenResponse(
        access_token=token,
        expires_in=3600
    )


@router.post("/register", response_model=UserResponse)
async def register(
    request: RegisterRequest,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Register a new user"""
    
    # Check if username already exists
    existing_user = await db_service.get_user_by_username(request.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    # Note: We'd need to add a get_user_by_email method to the database service
    # For now, we'll let the database handle the unique constraint
    
    # Create new user
    hashed_password = hash_password(request.password)
    
    try:
        user = await db_service.create_user(
            username=request.username,
            email=request.email,
            password_hash=hashed_password,
            full_name=request.full_name
        )
        
        print(f"🔐 User registered: {request.username} (ID: {user.id})")
        
        return UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at.timestamp()
        )
        
    except Exception as e:
        if "UNIQUE constraint failed" in str(e):
            if "username" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
            elif "email" in str(e):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )


@router.post("/logout")
async def logout(
    token: str,
    cache_service: CacheService = Depends(get_cache_service)
):
    """Logout user by invalidating token"""
    
    # Remove session from cache
    await cache_service.delete(f"session:{token}")
    
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    authorization: str = Header(None),
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Get current user information"""
    
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )
    
    # Extract token from authorization header
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    token = authorization.split(" ")[1]
    
    # Get session from database
    session = await db_service.get_session_by_token(token)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Get user data
    user = await db_service.get_user_by_id(session.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at.timestamp()
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    token: str,
    cache_service: CacheService = Depends(get_cache_service)
):
    """Refresh access token"""
    
    # Get session from cache
    session_data = await cache_service.get(f"session:{token}")
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Check if session is expired
    if time.time() > session_data["expires_at"]:
        await cache_service.delete(f"session:{token}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    
    # Generate new token
    new_token = generate_token()
    
    # Update session with new token
    session_data["created_at"] = time.time()
    session_data["expires_at"] = time.time() + 3600
    
    # Store new session and remove old one
    await cache_service.set(f"session:{new_token}", session_data, ttl=3600)
    await cache_service.delete(f"session:{token}")
    
    return TokenResponse(
        access_token=new_token,
        expires_in=3600
    )


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    authorization: str = None,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """List all users (admin only - for demo purposes)"""
    
    # For demo purposes, return all users without auth check
    if not authorization:
        # Get all users from database
        db_users = await db_service.get_all_users()
        users = []
        for user in db_users:
            users.append(UserResponse(
                id=user.id,
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                created_at=user.created_at.timestamp()
            ))
        return users
    
    # Extract token from authorization header
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    # Get session from cache
    session_data = await cache_service.get(f"session:{token}")
    
    if not session_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    # Check if session is expired
    if time.time() > session_data["expires_at"]:
        await cache_service.delete(f"session:{token}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired"
        )
    
    # Return all users (in a real app, you'd check permissions)
    users = []
    for user_data in users_db.values():
        users.append(UserResponse(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            created_at=user_data["created_at"]
        ))
    
    return users
