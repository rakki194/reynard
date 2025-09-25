# PostgreSQL Database Naming Convention

## Overview

This document defines the standardized naming convention for PostgreSQL database connection variables across the Reynard backend. All database-related environment variables follow a consistent pattern to improve maintainability and reduce confusion.

## Standardized Naming Convention

### Core Principle

All PostgreSQL database connection variables follow the pattern: `{SERVICE}_DATABASE_URL`

### Standardized Variables

| Variable Name              | Purpose                              | Database          | Example                                                         |
| -------------------------- | ------------------------------------ | ----------------- | --------------------------------------------------------------- |
| `DATABASE_URL`             | Main application database            | `reynard`         | `postgresql://postgres:password@localhost:5432/reynard`         |
| `AUTH_DATABASE_URL`        | Authentication & authorization       | `reynard_auth`    | `postgresql://postgres:password@localhost:5432/reynard_auth`    |
| `ECS_DATABASE_URL`         | Entity Component System              | `reynard_ecs`     | `postgresql://postgres:password@localhost:5432/reynard_ecs`     |
| `RAG_DATABASE_URL`         | RAG (Retrieval-Augmented Generation) | `reynard_rag`     | `postgresql://postgres:password@localhost:5432/reynard_rag`     |
| `KEY_STORAGE_DATABASE_URL` | Security key storage                 | `reynard_keys`    | `postgresql://postgres:password@localhost:5432/reynard_keys`    |
| `E2E_DATABASE_URL`         | End-to-end testing                   | `reynard_e2e`     | `postgresql://postgres:password@localhost:5432/reynard_e2e`     |
| `E2E_ECS_DATABASE_URL`     | ECS end-to-end testing               | `reynard_ecs_e2e` | `postgresql://postgres:password@localhost:5432/reynard_ecs_e2e` |

## Migration History

### Changes Made

- **Removed**: `PG_DSN` → **Replaced with**: `RAG_DATABASE_URL`
- **Removed**: `RAG_BACKEND_URL` (unused variable)
- **Standardized**: All database variables now follow `{SERVICE}_DATABASE_URL` pattern

### Files Updated

- `backend/.env` - Updated variable names
- `backend/env.example` - Updated example configuration
- `backend/rag_config_example.env` - Updated RAG example
- `backend/README.md` - Updated documentation
- All test files - Updated test configurations
- All script files - Updated script configurations
- All documentation files - Updated examples and references

## Configuration Files

### backend/.env

```bash
# Main application database
DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard

# Authentication & authorization database
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_auth

# Entity Component System database
ECS_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_ecs

# RAG (Retrieval-Augmented Generation) database
RAG_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_rag

# Security key storage database
KEY_STORAGE_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_keys

# End-to-end testing databases
E2E_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_e2e
E2E_ECS_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_ecs_e2e
```

## Code Usage Examples

### Python Configuration

```python
import os

# RAG Configuration
rag_database_url = os.getenv("RAG_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_rag")

# ECS Configuration
ecs_database_url = os.getenv("ECS_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_ecs")

# Authentication Configuration
auth_database_url = os.getenv("AUTH_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_auth")
```

### Service Configuration

```python
# RAG Service Configuration
rag_config = {
    "rag_enabled": True,
    "rag_database_url": os.getenv("RAG_DATABASE_URL"),
    "ollama_base_url": "http://localhost:11434",
    # ... other config
}

# ECS Service Configuration
ecs_config = {
    "ecs_enabled": True,
    "ecs_database_url": os.getenv("ECS_DATABASE_URL"),
    # ... other config
}
```

## Database Setup

### Creating Databases

```bash
# Create all databases
createdb reynard
createdb reynard_auth
createdb reynard_ecs
createdb reynard_rag
createdb reynard_keys
createdb reynard_e2e
createdb reynard_ecs_e2e
```

### Environment Setup

```bash
# Copy example configuration
cp env.example .env

# Update with your actual database credentials
# Edit .env file with your PostgreSQL connection details
```

## Testing Configuration

### Test Database URLs

```python
# Test configuration
test_config = {
    "rag_database_url": "postgresql://test:test@localhost:5432/test_db",
    "ecs_database_url": "postgresql://test:test@localhost:5432/test_ecs_db",
    "auth_database_url": "postgresql://test:test@localhost:5432/test_auth_db",
}
```

## Docker Configuration

### docker-compose.yml

```yaml
services:
  backend:
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/reynard
      - AUTH_DATABASE_URL=postgresql://user:pass@db:5432/reynard_auth
      - ECS_DATABASE_URL=postgresql://user:pass@db:5432/reynard_ecs
      - RAG_DATABASE_URL=postgresql://user:pass@db:5432/reynard_rag
      - KEY_STORAGE_DATABASE_URL=postgresql://user:pass@db:5432/reynard_keys
```

## Security Considerations

### Production Environment

- Use strong, unique passwords for each database
- Use different database users for different services
- Enable SSL connections in production
- Regularly rotate database credentials

### Development Environment

- Use separate databases for development and testing
- Use different credentials for different environments
- Never commit real credentials to version control

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if PostgreSQL is running
2. **Authentication Failed**: Verify username and password
3. **Database Not Found**: Ensure database exists
4. **Permission Denied**: Check user permissions

### Debug Commands

```bash
# Test database connection
psql $RAG_DATABASE_URL -c "SELECT 1;"

# List all databases
psql $DATABASE_URL -c "\l"

# Check database size
psql $RAG_DATABASE_URL -c "SELECT pg_size_pretty(pg_database_size(current_database()));"
```

## Best Practices

1. **Consistent Naming**: Always use the standardized `{SERVICE}_DATABASE_URL` pattern
2. **Environment Separation**: Use different databases for different environments
3. **Security**: Never hardcode credentials in code
4. **Documentation**: Always document database schema changes
5. **Backup**: Regular backups of all databases
6. **Monitoring**: Monitor database performance and connections

## Future Considerations

- Consider using connection pooling for high-traffic services
- Implement database migration system for schema changes
- Add database health checks and monitoring
- Consider using read replicas for read-heavy workloads

---

_This document is maintained by the Reynard Development Team. Last updated: 2025-01-15_
