# 🔐 Authentication System Documentation

**Author:** Strategic-Prime-13 (Fox Specialist)  
**Version:** 1.0.0  
**Last Updated:** 2025-09-27

## Overview

The Reynard ecosystem uses a comprehensive authentication and authorization system built on the Gatekeeper library with PostgreSQL backend. This document covers how to create admin users, configure authentication, and manage access across all system components.

## Architecture

### Core Components

- **Gatekeeper Service** - Primary authentication and authorization system
- **PostgreSQL Backend** - Secure user data storage in `reynard_auth` database
- **RBAC System** - Role-based access control with hierarchical permissions
- **MCP RAG Integration** - Authentication for retrieval-augmented generation
- **ECS World Integration** - Agent authentication and social system access
- **JWT Tokens** - Secure token-based authentication

### Database Schema

The authentication system uses the following PostgreSQL database structure:

```sql
-- Users table in reynard_auth database
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'regular',
    email VARCHAR(255) UNIQUE,
    profile_picture_url VARCHAR(500),
    yapcoin_balance INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    user_metadata JSON,
    rbac_enabled BOOLEAN DEFAULT false,
    default_role VARCHAR(50),
    last_rbac_sync TIMESTAMP
);
```

## Environment Configuration

### Required Environment Variables

```bash
# Database Configuration
AUTH_DATABASE_URL=postgresql://user:password@localhost:5432/reynard_auth

# JWT Configuration
JWT_SECRET_KEY=your-secure-jwt-secret-key
GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES=30
GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS=7

# Gatekeeper Settings
GATEKEEPER_ISSUER=reynard-backend
GATEKEEPER_AUDIENCE=reynard-users
GATEKEEPER_PASSWORD_SECURITY_LEVEL=MEDIUM
GATEKEEPER_USE_MEMORY_BACKEND=false
```

### Database Setup

1. **Create the auth database:**
```sql
CREATE DATABASE reynard_auth;
```

2. **Run database migrations:**
```bash
cd backend
export AUTH_DATABASE_URL="postgresql://user:password@localhost:5432/reynard_auth"
alembic -c alembic_auth.ini upgrade head
```

## Creating Admin Users

### Method 1: Using Backend Configuration

For integration with the full backend system:

```python
from app.gatekeeper_config import get_auth_manager
from gatekeeper.models.user import UserCreate, UserRole

async def create_admin_user():
    auth_manager = await get_auth_manager()
    
    user_data = UserCreate(
        username="admin_username",
        email="admin@example.com",
        password="secure_password_here",
        role=UserRole.ADMIN,
        metadata={
            "full_name": "Admin User",
            "ecosystem_access": [
                "gatekeeper", "rbac", "mcp_rag", 
                "ecs_world", "backend_services", "admin_panel"
            ],
            "privileges": [
                "system_admin", "rag_restricted_admin",
                "ecs_world_admin", "mcp_admin", "gatekeeper_admin"
            ]
        }
    )
    
    user = await auth_manager.create_user(user_data)
    return user
```

### Method 2: Manual Database Insert

For direct database manipulation:

```sql
INSERT INTO users (
    id, username, password_hash, role, email, 
    is_active, created_at, updated_at, user_metadata,
    rbac_enabled, default_role
) VALUES (
    gen_random_uuid(),
    'admin_username',
    'hashed_password_here',
    'admin',
    'admin@example.com',
    true,
    NOW(),
    NOW(),
    '{"full_name": "Admin User", "privileges": ["system_admin"]}',
    true,
    'system_admin'
);
```

## User Roles and Permissions

### Role Hierarchy

1. **admin** - Full system access
2. **regular** - Standard user access
3. **guest** - Limited access

### RBAC Permissions

The system supports granular permissions through RBAC:

- **system_admin** - Full system management
- **rag_restricted_admin** - RAG system administration
- **ecs_world_admin** - ECS world management
- **mcp_admin** - MCP tool administration
- **gatekeeper_admin** - Authentication system management

### Ecosystem Access Levels

- **gatekeeper** - Authentication system access
- **rbac** - Role-based access control
- **mcp_rag** - Retrieval-augmented generation
- **ecs_world** - Entity component system
- **backend_services** - All backend services
- **admin_panel** - Administrative interface

## Authentication Flow

### 1. User Login

```python
from app.gatekeeper_config import get_auth_manager

async def authenticate_user(username: str, password: str):
    auth_manager = await get_auth_manager()
    tokens = await auth_manager.authenticate(username, password)
    return tokens
```

### 2. Token Validation

```python
async def validate_token(token: str):
    auth_manager = await get_auth_manager()
    is_valid = await auth_manager.validate_token(token)
    return is_valid
```

### 3. Permission Checking

```python
async def check_permissions(username: str, resource: str, operation: str):
    auth_manager = await get_auth_manager()
    result = await auth_manager.check_permission(
        username, "system", resource, operation
    )
    return result.granted
```

## MCP Integration

### MCP Client Configuration

Admin users automatically receive MCP client access with the following permissions:

```json
{
  "client_id": "admin-username",
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
}
```

### MCP Authentication

```python
from app.security.mcp_auth import MCPAuthService

mcp_auth = MCPAuthService()
mcp_token = mcp_auth.generate_mcp_token(
    client_id="admin-username",
    additional_permissions=["rag:query", "mcp:admin"]
)
```

## Security Best Practices

### Password Requirements

- **Minimum Length:** 24 characters
- **Character Types:** Mixed case, numbers, symbols
- **Storage:** Argon2 hashing with medium security level
- **Rotation:** Regular password updates recommended

### Token Security

- **Access Tokens:** 30-minute expiration
- **Refresh Tokens:** 7-day expiration
- **Algorithm:** HS256
- **Storage:** Secure HTTP-only cookies recommended

### Database Security

- **Connection:** Encrypted PostgreSQL connections
- **Access Control:** Database user with minimal required permissions
- **Backup:** Regular encrypted backups
- **Monitoring:** Audit logging for all authentication events

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `AUTH_DATABASE_URL` is correct
   - Check PostgreSQL service is running
   - Ensure database exists and user has permissions

2. **Schema Issues**
   - Run database migrations: `alembic -c alembic_auth.ini upgrade head`
   - Check for missing columns in users table
   - Verify RBAC tables are created

3. **Authentication Failures**
   - Check password hashing algorithm
   - Verify JWT secret key is consistent
   - Ensure user is active (`is_active = true`)

4. **Permission Denied**
   - Verify user role is set to 'admin'
   - Check RBAC is enabled (`rbac_enabled = true`)
   - Confirm default_role is set to 'system_admin'

### Debug Commands

```bash
# Check database connection
psql $AUTH_DATABASE_URL -c "SELECT version();"

# Verify user exists
psql $AUTH_DATABASE_URL -c "SELECT username, role, rbac_enabled FROM users WHERE username = 'admin_username';"

# Check database schema
psql $AUTH_DATABASE_URL -c "\d users"
```

## API Endpoints

### Authentication Endpoints

- `POST /api/login` - User authentication
- `POST /api/refresh-token` - Token refresh
- `POST /api/logout` - User logout
- `GET /api/me` - Current user information

### Admin Endpoints

- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{user_id}` - Update user
- `DELETE /api/admin/users/{user_id}` - Delete user

### RBAC Endpoints

- `GET /api/rbac/roles` - List available roles
- `POST /api/rbac/check` - Check permissions
- `GET /api/rbac/user/{username}/roles` - Get user roles

## Integration Examples

### Frontend Integration

```typescript
// Login function
async function login(username: string, password: string) {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  
  const tokens = await response.json();
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
}

// Authenticated API calls
async function apiCall(endpoint: string) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

### Backend Service Integration

```python
from fastapi import Depends, HTTPException
from app.gatekeeper_config import get_auth_manager

async def get_current_admin_user(
    current_user: dict = Depends(get_current_user)
) -> dict:
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

@app.get("/api/admin/users")
async def list_users(
    admin_user: dict = Depends(get_current_admin_user)
):
    auth_manager = await get_auth_manager()
    users = await auth_manager.list_users()
    return users
```

## Monitoring and Auditing

### Audit Logging

All authentication events are logged with:
- Timestamp
- User ID
- Action performed
- IP address
- Success/failure status

### Health Checks

```python
async def auth_health_check():
    auth_manager = await get_auth_manager()
    return {
        "status": "healthy",
        "database_connected": True,
        "rbac_enabled": True,
        "active_users": await auth_manager.count_active_users()
    }
```

## Migration and Upgrades

### Database Migrations

```bash
# Create new migration
alembic -c alembic_auth.ini revision --autogenerate -m "Description"

# Apply migrations
alembic -c alembic_auth.ini upgrade head

# Rollback migration
alembic -c alembic_auth.ini downgrade -1
```

### User Data Migration

When upgrading the authentication system:

1. Backup existing user data
2. Run database migrations
3. Update user metadata if schema changes
4. Verify all users can authenticate
5. Test RBAC permissions

## Conclusion

The Reynard authentication system provides enterprise-grade security with comprehensive RBAC support. By following this documentation, administrators can create secure admin accounts, configure proper permissions, and maintain system security across all ecosystem components.

For additional support or questions, refer to the Gatekeeper library documentation or contact the development team.

---

*Generated by Strategic-Prime-13 (Fox Specialist) for the Reynard ecosystem*
