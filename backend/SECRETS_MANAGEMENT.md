# Secrets Management Guide

This guide outlines best practices for managing secrets in the Reynard Backend, particularly for database credentials and authentication tokens.

## 🔐 Security Principles

### 1. Environment Variables

- **Never hardcode secrets** in source code
- Use environment variables for all sensitive configuration
- Store secrets in `.env` files (never commit to version control)

### 2. Database Credentials

- Use dedicated database users with minimal required permissions
- Rotate passwords regularly
- Use different credentials for different environments (dev/staging/prod)

### 3. Authentication Tokens

- Use strong, randomly generated secret keys
- Set appropriate expiration times for tokens
- Implement token refresh mechanisms

## 🗄️ Database Configuration

### Current Database Setup

The Reynard Backend uses multiple PostgreSQL databases:

1. **`reynard`** - Main application database (RAG/Vector store)
2. **`reynard_auth`** - Authentication database (Gatekeeper)
3. **`reynard_ecs`** - ECS world simulation database
4. **`reynard_e2e`** - E2E testing database
5. **`reynard_ecs_e2e`** - ECS E2E testing database

### Environment Variables

```bash
# Main Database
DATABASE_URL=postgresql://username:password@localhost:5432/reynard
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=reynard
POSTGRES_USER=username
POSTGRES_PASSWORD=password

# Auth Database (Gatekeeper)
AUTH_DATABASE_URL=postgresql://username:password@localhost:5432/reynard_auth
AUTH_POSTGRES_HOST=localhost
AUTH_POSTGRES_PORT=5432
AUTH_POSTGRES_DB=reynard_auth
AUTH_POSTGRES_USER=username
AUTH_POSTGRES_PASSWORD=password

# ECS Database
ECS_DATABASE_URL=postgresql://username:password@localhost:5432/reynard_ecs
ECS_POSTGRES_HOST=localhost
ECS_POSTGRES_PORT=5432
ECS_POSTGRES_DB=reynard_ecs
ECS_POSTGRES_USER=username
ECS_POSTGRES_PASSWORD=password

# E2E Test Databases
E2E_DATABASE_URL=postgresql://username:password@localhost:5432/reynard_e2e
E2E_ECS_DATABASE_URL=postgresql://username:password@localhost:5432/reynard_ecs_e2e
```

## 🛡️ Gatekeeper Authentication

### Configuration

Gatekeeper is configured to use the dedicated `reynard_auth` database:

```python
# app/gatekeeper_config.py
self.database_url = os.getenv("AUTH_DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard_auth")
```

### Security Features

- **Password Hashing**: Uses secure password hashing algorithms
- **Token Management**: JWT tokens with configurable expiration
- **Role-Based Access**: Admin, regular, and guest user roles
- **Session Management**: Secure session tracking and refresh tokens

### Environment Variables

```bash
# Gatekeeper Configuration
GATEKEEPER_ACCESS_TOKEN_EXPIRE_MINUTES=30
GATEKEEPER_REFRESH_TOKEN_EXPIRE_DAYS=7
GATEKEEPER_ISSUER=reynard-backend
GATEKEEPER_AUDIENCE=reynard-users
GATEKEEPER_PASSWORD_SECURITY_LEVEL=MEDIUM
GATEKEEPER_USE_MEMORY_BACKEND=false
GATEKEEPER_BACKEND_POOL_SIZE=5
GATEKEEPER_BACKEND_MAX_OVERFLOW=10
```

## 🔧 Setup and Migration

### Database Setup

Use the comprehensive setup script to initialize all databases:

```bash
cd backend
python scripts/setup_all_databases.py
```

This script will:

1. Test database connections
2. Enable pgvector extension where needed
3. Run appropriate migrations (SQL or Alembic)
4. Initialize Gatekeeper authentication system

### Migration Management

Use the migration script for ongoing database management:

```bash
# View migration history
python scripts/migrate.py history auth

# Create new migration
python scripts/migrate.py create auth "description"

# Apply migrations
python scripts/migrate.py upgrade auth
```

## 🚨 Security Best Practices

### 1. Production Deployment

- Use strong, unique passwords for each database
- Enable SSL/TLS for database connections
- Use connection pooling with appropriate limits
- Implement database access logging

### 2. Development Environment

- Use separate credentials for development
- Never use production credentials in development
- Use `.env` files for local configuration
- Add `.env` to `.gitignore`

### 3. Secret Rotation

- Regularly rotate database passwords
- Update JWT secret keys periodically
- Monitor for compromised credentials
- Implement automated secret rotation where possible

### 4. Access Control

- Grant minimal required permissions to database users
- Use separate users for different applications
- Implement IP whitelisting for database access
- Monitor and audit database access

## 📋 Checklist

### Initial Setup

- [ ] Create dedicated database users with minimal permissions
- [ ] Set strong, unique passwords for each database
- [ ] Configure environment variables in `.env` file
- [ ] Test database connections
- [ ] Run database setup script
- [ ] Verify Gatekeeper initialization

### Ongoing Maintenance

- [ ] Monitor database access logs
- [ ] Rotate passwords regularly
- [ ] Update JWT secret keys
- [ ] Review and audit permissions
- [ ] Test backup and recovery procedures

## 🔍 Troubleshooting

### Common Issues

1. **Connection Refused**: Check PostgreSQL service status
2. **Authentication Failed**: Verify username/password
3. **Permission Denied**: Check user permissions
4. **Migration Errors**: Review Alembic configuration

### Debug Commands

```bash
# Test database connection
psql -h localhost -U postgres -d reynard_auth

# Check Gatekeeper tables
psql -h localhost -U postgres -d reynard_auth -c "\dt"

# View migration history
python scripts/migrate.py history auth
```

## 📚 Additional Resources

- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/security.html)
- [Gatekeeper Library Documentation](https://github.com/your-org/gatekeeper)
- [Alembic Migration Guide](https://alembic.sqlalchemy.org/en/latest/)
- [Environment Variables Best Practices](https://12factor.net/config)
