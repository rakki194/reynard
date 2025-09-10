# PostgreSQL Integration for Reynard Gatekeeper

This document explains how to set up PostgreSQL for persistent user storage in
Reynard's Gatekeeper authentication system.

## Overview

By default, Reynard uses an in-memory backend for user storage, which means all
users are lost when the application restarts. This PostgreSQL integration
provides persistent user storage, ensuring your users remain available across
application restarts.

## Features

- **Persistent User Storage**: Users are stored in PostgreSQL and persist across
  application restarts
- **Automatic Table Creation**: Database tables are created automatically when
  the application starts
- **Connection Pooling**: Efficient database connection management
- **Health Checks**: Built-in database health monitoring
- **Docker Support**: Easy setup with Docker Compose

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Start PostgreSQL**:

   ```bash
   cd reynard
   docker-compose -f docker-compose.postgres.yml up -d
   ```

2. **Set Environment Variables** (optional, defaults are provided):

   ```bash
   export DATABASE_URL="postgresql://reynard:reynard@localhost:5432/reynard"
   ```

3. **Start Reynard**:

   ```bash
   python -m app.main
   ```

### Option 2: Manual PostgreSQL Setup

1. **Install PostgreSQL** on your system
2. **Create Database and User**:

   ```bash
   # Connect to PostgreSQL as superuser
   sudo -u postgres psql

   # Create database and user
   CREATE DATABASE reynard;
   CREATE USER reynard WITH PASSWORD 'reynard';
   GRANT ALL PRIVILEGES ON DATABASE reynard TO reynard;
   \q
   ```

3. **Set Environment Variables**:

   ```bash
   export DATABASE_URL="postgresql://reynard:reynard@localhost:5432/reynard"
   ```

4. **Start Reynard**:

   ```bash
   python -m app.main
   ```

### Option 3: Using the Setup Script

1. **Run the setup script**:

   ```bash
   cd reynard
   python scripts/setup_postgres.py --all
   ```

2. **Start Reynard**:

   ```bash
   python -m app.main
   ```

## Configuration

### Environment Variables

You can configure the PostgreSQL connection using environment variables:

| Variable                | Default     | Description                     |
| ----------------------- | ----------- | ------------------------------- |
| `DATABASE_URL`          | `None`      | Full PostgreSQL connection URL  |
| `POSTGRES_HOST`         | `localhost` | PostgreSQL host                 |
| `POSTGRES_PORT`         | `5432`      | PostgreSQL port                 |
| `POSTGRES_USER`         | `reynard`   | PostgreSQL username             |
| `POSTGRES_PASSWORD`     | `reynard`   | PostgreSQL password             |
| `POSTGRES_DB`           | `reynard`   | PostgreSQL database name        |
| `POSTGRES_POOL_SIZE`    | `10`        | Connection pool size            |
| `POSTGRES_MAX_OVERFLOW` | `20`        | Max overflow connections        |
| `POSTGRES_ECHO`         | `false`     | Echo SQL statements (debugging) |

### Example Configuration

```bash
# Using DATABASE_URL (recommended)
export DATABASE_URL="postgresql://username:password@host:5432/database"

# Or using individual settings
export POSTGRES_HOST="localhost"
export POSTGRES_PORT="5432"
export POSTGRES_USER="reynard"
export POSTGRES_PASSWORD="secure_password"
export POSTGRES_DB="reynard"
```

## Database Schema

The PostgreSQL backend automatically creates the following table:

### Users Table

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'regular',
    email VARCHAR(255) UNIQUE,
    profile_picture_url VARCHAR(500),
    yapcoin_balance INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

## Migration from Memory Backend

If you're currently using the memory backend and want to migrate to PostgreSQL:

1. **Start PostgreSQL** (see Quick Start above)
2. **Restart Reynard** with PostgreSQL configuration
3. **Re-register your users** through the API
4. **Your users will now persist** across application restarts

## Troubleshooting

### Common Issues

1. **Connection Refused**:
   - Ensure PostgreSQL is running
   - Check host and port settings
   - Verify firewall settings

2. **Authentication Failed**:
   - Verify username and password
   - Check user permissions
   - Ensure user has access to the database

3. **Database Not Found**:
   - Create the database manually or use the setup script
   - Check database name in connection string

### Debug Mode

Enable SQL statement logging for debugging:

```bash
export POSTGRES_ECHO=true
```

### Health Check

Test the database connection:

```bash
python scripts/setup_postgres.py --test
```

## Performance Considerations

- **Connection Pooling**: The backend uses SQLAlchemy connection pooling for
  efficient database connections
- **Indexes**: Automatic indexes are created on username and email fields
- **JSONB**: User metadata is stored as JSONB for efficient querying
- **UUIDs**: User IDs use UUIDs for better distribution and security

## Security Notes

- **Password Hashing**: Passwords are hashed using Argon2 before storage
- **Connection Security**: Use SSL connections in production
- **Environment Variables**: Store sensitive configuration in environment
  variables, not in code
- **Database Permissions**: Limit database user permissions to only what's
  necessary

## Production Deployment

For production deployment:

1. **Use a managed PostgreSQL service** (AWS RDS, Google Cloud SQL, etc.)
2. **Enable SSL connections**
3. **Use strong passwords**
4. **Set up automated backups**
5. **Monitor database performance**
6. **Use connection pooling** (already configured)

## Support

If you encounter issues:

1. Check the application logs for error messages
2. Verify PostgreSQL is running and accessible
3. Test the connection using the setup script
4. Check the troubleshooting section above
5. Review the Gatekeeper library documentation
