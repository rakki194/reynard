"""
User management routes for Reynard Basic Backend
Provides user CRUD operations and management endpoints
"""

import time
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from database import DatabaseService
from services import CacheService


router = APIRouter()


class UserCreate(BaseModel):
    """User creation model"""
    username: str
    email: EmailStr
    full_name: Optional[str] = None


class UserUpdate(BaseModel):
    """User update model"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    """User response model"""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    created_at: float
    last_login: Optional[float] = None


class UserStats(BaseModel):
    """User statistics model"""
    total_users: int
    active_users: int
    new_users_today: int
    last_activity: Optional[float] = None


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


def get_current_user_id(authorization: str) -> int:
    """Extract user ID from authorization token (simplified)"""
    # In a real app, you'd validate the token properly
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header"
        )
    
    # For demo purposes, return a mock user ID
    return 1


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """List users with pagination"""
    
    # Check cache first
    cache_key = f"users:list:{skip}:{limit}"
    cached_users = await cache_service.get(cache_key)
    
    if cached_users:
        return cached_users
    
    # Get users from database
    db_users = await db_service.get_all_users(skip=skip, limit=limit)
    
    # Convert to response models
    users = []
    for user in db_users:
        users.append(UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at.timestamp(),
            last_login=user.last_login.timestamp() if user.last_login else None
        ))
    
    # Cache the result
    await cache_service.set(cache_key, users, ttl=300)  # 5 minutes
    
    return users


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Get user by ID"""
    
    # Check cache first
    cache_key = f"user:{user_id}"
    cached_user = await cache_service.get(cache_key)
    
    if cached_user:
        return cached_user
    
    # Get user from database
    user = await db_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        created_at=user.created_at.timestamp(),
        last_login=user.last_login.timestamp() if user.last_login else None
    )
    
    # Cache the result
    await cache_service.set(cache_key, user_response, ttl=600)  # 10 minutes
    
    return user_response


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Create a new user"""
    
    # Check if username already exists
    query = "SELECT id FROM users WHERE username = ?"
    existing_users = await db_service.execute_query(query, {"username": user_data.username})
    
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    query = "SELECT id FROM users WHERE email = ?"
    existing_users = await db_service.execute_query(query, {"email": user_data.email})
    
    if existing_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Create user
    current_time = time.time()
    query = """
        INSERT INTO users (username, email, full_name, created_at)
        VALUES (?, ?, ?, ?)
    """
    
    # In a real app, you'd use proper database operations
    # For demo purposes, we'll simulate the creation
    user_id = int(time.time())  # Mock user ID
    
    user = UserResponse(
        id=user_id,
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        created_at=current_time,
        last_login=None
    )
    
    # Cache the new user
    await cache_service.set(f"user:{user_id}", user, ttl=600)
    
    # Invalidate user list cache
    await cache_service.delete("users:list:0:100")
    
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    authorization: str,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Update user information"""
    
    # Get current user ID (for authorization check)
    current_user_id = get_current_user_id(authorization)
    
    # Check if user exists
    query = "SELECT * FROM users WHERE id = ?"
    users_data = await db_service.execute_query(query, {"id": user_id})
    
    if not users_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    existing_user = users_data[0]
    
    # Check if user is updating their own profile or is admin
    if user_id != current_user_id:
        # In a real app, you'd check admin permissions here
        pass
    
    # Update user data
    update_fields = []
    update_values = {}
    
    if user_data.email is not None:
        # Check if email already exists for another user
        query = "SELECT id FROM users WHERE email = ? AND id != ?"
        existing_users = await db_service.execute_query(query, {
            "email": user_data.email,
            "id": user_id
        })
        
        if existing_users:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        
        update_fields.append("email = ?")
        update_values["email"] = user_data.email
    
    if user_data.full_name is not None:
        update_fields.append("full_name = ?")
        update_values["full_name"] = user_data.full_name
    
    if not update_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # In a real app, you'd execute the update query
    # For demo purposes, we'll simulate the update
    updated_user = UserResponse(
        id=user_id,
        username=existing_user["username"],
        email=user_data.email or existing_user["email"],
        full_name=user_data.full_name or existing_user.get("full_name"),
        created_at=existing_user["created_at"],
        last_login=existing_user.get("last_login")
    )
    
    # Update cache
    await cache_service.set(f"user:{user_id}", updated_user, ttl=600)
    
    # Invalidate user list cache
    await cache_service.delete("users:list:0:100")
    
    return updated_user


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    authorization: str,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Delete user"""
    
    # Get current user ID (for authorization check)
    current_user_id = get_current_user_id(authorization)
    
    # Check if user exists
    query = "SELECT id FROM users WHERE id = ?"
    users_data = await db_service.execute_query(query, {"id": user_id})
    
    if not users_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is deleting their own account or is admin
    if user_id != current_user_id:
        # In a real app, you'd check admin permissions here
        pass
    
    # In a real app, you'd execute the delete query
    # For demo purposes, we'll simulate the deletion
    
    # Remove from cache
    await cache_service.delete(f"user:{user_id}")
    
    # Invalidate user list cache
    await cache_service.delete("users:list:0:100")
    
    return {"message": "User deleted successfully"}


@router.get("/stats/overview", response_model=UserStats)
async def get_user_stats(
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Get user statistics overview"""
    
    # Check cache first
    cache_key = "users:stats"
    cached_stats = await cache_service.get(cache_key)
    
    if cached_stats:
        return cached_stats
    
    # Query database for statistics
    total_users_query = "SELECT COUNT(*) as count FROM users"
    active_users_query = "SELECT COUNT(*) as count FROM users WHERE last_login > ?"
    new_users_query = "SELECT COUNT(*) as count FROM users WHERE created_at > ?"
    last_activity_query = "SELECT MAX(last_login) as last_activity FROM users"
    
    # Calculate time thresholds
    now = time.time()
    today_start = now - (24 * 60 * 60)  # 24 hours ago
    week_ago = now - (7 * 24 * 60 * 60)  # 7 days ago
    
    # Execute queries (simulated)
    total_users = 42  # Mock data
    active_users = 28  # Mock data
    new_users_today = 3  # Mock data
    last_activity = now - 3600  # Mock data (1 hour ago)
    
    stats = UserStats(
        total_users=total_users,
        active_users=active_users,
        new_users_today=new_users_today,
        last_activity=last_activity
    )
    
    # Cache the result
    await cache_service.set(cache_key, stats, ttl=300)  # 5 minutes
    
    return stats


@router.get("/search/{query}")
async def search_users(
    query: str,
    limit: int = 20,
    db_service: DatabaseService = Depends(get_database_service),
    cache_service: CacheService = Depends(get_cache_service)
):
    """Search users by username or email"""
    
    if len(query) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query must be at least 2 characters long"
        )
    
    # Check cache first
    cache_key = f"users:search:{query}:{limit}"
    cached_results = await cache_service.get(cache_key)
    
    if cached_results:
        return cached_results
    
    # Search query
    search_query = """
        SELECT * FROM users 
        WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
        ORDER BY username
        LIMIT ?
    """
    
    search_pattern = f"%{query}%"
    
    # Execute search (simulated)
    users_data = [
        {
            "id": 1,
            "username": "john_doe",
            "email": "john@example.com",
            "full_name": "John Doe",
            "created_at": time.time() - 86400,
            "last_login": time.time() - 3600
        }
    ]
    
    # Convert to response models
    users = []
    for user_data in users_data:
        users.append(UserResponse(
            id=user_data["id"],
            username=user_data["username"],
            email=user_data["email"],
            full_name=user_data.get("full_name"),
            created_at=user_data["created_at"],
            last_login=user_data.get("last_login")
        ))
    
    # Cache the result
    await cache_service.set(cache_key, users, ttl=180)  # 3 minutes
    
    return users
