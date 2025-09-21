# Reynard Backend Database Setup Guide

This document provides a comprehensive guide to the database architecture and setup for the Reynard Backend system.

## Database Architecture Overview

The Reynard Backend uses a multi-database architecture with five distinct PostgreSQL databases:

### 1. **Main Database (`reynard`)**

- **Purpose**: RAG/Vector store
- **Migration System**: SQL migrations (`scripts/run_migrations.py`)
- **Key Features**:
  - Vector embeddings for semantic search
  - Document storage and retrieval
  - HNSW indexes for fast similarity search

### 2. **Auth Database (`reynard_auth`)**

- **Purpose**: Authentication system (Gatekeeper)
- **Migration System**: Custom initialization (`scripts/init_auth_database.py`)
- **Key Features**:
  - User management and authentication
  - JWT token management
  - Role-based access control
  - Session management

### 3. **ECS Database (`reynard_ecs`)**

- **Purpose**: ECS world simulation system
- **Migration System**: Alembic migrations (`alembic_ecs.ini`)
- **Key Features**:
  - Agent management and traits
  - Personality, physical, and ability traits
  - Agent interactions and relationships
  - Naming system configuration
  - Performance metrics tracking

### 4. **E2E Testing Database (`reynard_e2e`)**

- **Purpose**: End-to-end testing mirror of main database
- **Migration System**: SQL migrations (same as main)
- **Key Features**:
  - Identical schema to main database
  - Isolated testing environment
  - Vector embeddings for testing

### 5. **ECS E2E Testing Database (`reynard_ecs_e2e`)**

- **Purpose**: E2E testing mirror of ECS database
- **Migration System**: Alembic migrations (`alembic_ecs_e2e.ini`)
- **Key Features**:
  - Identical schema to ECS database
  - Isolated testing environment
  - Agent simulation testing

## Database Configuration Files

### Alembic Directory Structure

The Alembic configuration is organized in a clean directory structure:

```text
alembic/
├── ecs/                    # ECS production database
│   ├── versions/
│   │   ├── ecs/           # ECS-specific migrations
│   │   ├── naming/        # Naming system migrations
│   │   └── agents/        # Agent-related migrations
│   ├── env.py
│   └── script.py.mako
├── main/                   # Main database (placeholder)
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── auth/                   # Auth database (Gatekeeper)
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── e2e/                    # E2E testing database
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
└── ecs_e2e/               # ECS E2E testing database
    ├── versions/
    │   ├── ecs/
    │   ├── naming/
    │   └── agents/
    ├── env.py
    └── script.py.mako
```

### Alembic Configuration Files

1. **`alembic_ecs.ini`** - ECS production database
2. **`alembic_main.ini`** - Main database (placeholder for future models)
3. **`alembic_auth.ini`** - Auth database (Gatekeeper)
4. **`alembic_e2e.ini`** - E2E testing database (placeholder)
5. **`alembic_ecs_e2e.ini`** - ECS E2E testing database

### Environment Variables

```bash
# Main database
DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard

# Auth database (Gatekeeper)
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_auth

# ECS database
ECS_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_ecs

# E2E databases
E2E_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_e2e
ECS_E2E_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_ecs_e2e
```

## Setup Scripts

### 1. **Comprehensive Setup Script**

```bash
# Run all database setup
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/setup_all_databases.py
```

### 2. **Migration Management Script**

```bash
# Upgrade a specific database
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py upgrade ecs

# Create a new migration
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py create ecs --message "Add new feature"

# Show migration history
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py history ecs

# Copy migrations between databases
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py copy
```

### 3. **Individual Database Setup**

#### Main Database (SQL Migrations)

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard \
PYTHONPATH=/home/kade/runeset/reynard/backend \
python3 scripts/run_migrations.py
```

#### Auth Database (Gatekeeper)

```bash
AUTH_DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_auth \
PYTHONPATH=/home/kade/runeset/reynard/backend \
python3 scripts/init_auth_database.py
```

#### ECS Database (Alembic Migrations)

```bash
PYTHONPATH=/home/kade/runeset/reynard/backend \
alembic -c alembic_ecs.ini upgrade head
```

#### E2E Databases

```bash
# E2E Main Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/reynard_e2e \
PYTHONPATH=/home/kade/runeset/reynard/backend \
python3 scripts/run_migrations.py

# E2E ECS Database
PYTHONPATH=/home/kade/runeset/reynard/backend \
alembic -c alembic_ecs_e2e.ini upgrade head
```

## Database Schema Details

### Main Database Tables

- `rag_documents` - Document storage
- `rag_document_chunks` - Document chunking
- `rag_document_embeddings` - Document vector embeddings
- `rag_code_embeddings` - Code vector embeddings
- `rag_caption_embeddings` - Caption vector embeddings
- `rag_image_embeddings` - Image vector embeddings
- `rag_performance_metrics` - Performance tracking

### ECS Database Tables

- `agents` - Agent entities
- `personality_traits` - Agent personality characteristics
- `physical_traits` - Agent physical characteristics
- `ability_traits` - Agent ability characteristics
- `agent_positions` - Spatial positioning
- `agent_interactions` - Agent communication
- `agent_achievements` - Achievement tracking
- `agent_specializations` - Specialization areas
- `agent_domain_expertise` - Domain expertise
- `agent_workflow_preferences` - Workflow preferences
- `knowledge_base_entries` - Knowledge storage
- `performance_metrics` - Performance tracking
- `naming_spirits` - Naming system spirits
- `naming_components` - Naming components
- `naming_config` - Naming configuration

## Migration Management

### Creating New Migrations

#### For ECS Database (Alembic)

```bash
# Create new migration using the migration manager
PYTHONPATH=/home/kade/runeset/reynard/backend \
python3 scripts/migrate.py create ecs --message "description"

# Or using Alembic directly
PYTHONPATH=/home/kade/runeset/reynard/backend \
alembic -c alembic_ecs.ini revision --autogenerate -m "description"

# Apply migration
PYTHONPATH=/home/kade/runeset/reynard/backend \
python3 scripts/migrate.py upgrade ecs
```

#### For Main Database (SQL)

1. Create new SQL file in `scripts/db/`
2. Add to migration list in `scripts/run_migrations.py`
3. Run migrations using the migration manager:

   ```bash
   PYTHONPATH=/home/kade/runeset/reynard/backend \
   python3 scripts/migrate.py upgrade main
   ```

### Migration History

#### ECS Database Migrations

- `183c8980160f` - Add naming configuration tables
- `b16020be0286` - Initial ECS schema
- `cc04580c04ef` - Add initial data
- `9f94d908afb9` - Add complete race data
- `22ebdcff71c4` - Populate base names

#### Main Database Migrations

- `001_pgvector.sql` - Enable pgvector extension
- `002_embeddings.sql` - Create embedding tables
- `003_indexes.sql` - Create performance indexes
- `004_unified_repository.sql` - Unified repository schema
- `005_hnsw_optimization.sql` - HNSW optimization

## Database Maintenance

### Health Checks

```bash
# Test all database connections
sudo -u postgres psql -c "\\l" | grep reynard

# Check ECS database tables
sudo -u postgres psql -d reynard_ecs -c "\\dt"

# Check main database tables
sudo -u postgres psql -d reynard -c "\\dt"
```

### Backup and Restore

```bash
# Backup all databases
pg_dump -h localhost -U postgres reynard > reynard_backup.sql
pg_dump -h localhost -U postgres reynard_ecs > reynard_ecs_backup.sql
pg_dump -h localhost -U postgres reynard_e2e > reynard_e2e_backup.sql
pg_dump -h localhost -U postgres reynard_ecs_e2e > reynard_ecs_e2e_backup.sql

# Restore databases
psql -h localhost -U postgres reynard < reynard_backup.sql
psql -h localhost -U postgres reynard_ecs < reynard_ecs_backup.sql
psql -h localhost -U postgres reynard_e2e < reynard_e2e_backup.sql
psql -h localhost -U postgres reynard_ecs_e2e < reynard_ecs_e2e_backup.sql
```

## Troubleshooting

### Common Issues

1. **pgvector Extension Missing**

   ```bash
   sudo -u postgres psql -d database_name -c "CREATE EXTENSION IF NOT EXISTS vector;"
   ```

2. **Migration Failures**
   - Check database connection
   - Verify pgvector extension is installed
   - Check migration file syntax

3. **Permission Issues**

   ```bash
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE database_name TO postgres;"
   ```

### Performance Optimization

1. **HNSW Indexes**: Optimized for vector similarity search
2. **Connection Pooling**: Configured in application
3. **Query Optimization**: Use EXPLAIN ANALYZE for slow queries

## Development Workflow

1. **Local Development**: Use all four databases
2. **Testing**: Use E2E databases for isolated testing
3. **Production**: Use main and ECS databases
4. **Migration**: Always test migrations on E2E databases first

## Security Considerations

1. **Database Access**: Restricted to application user
2. **Connection Security**: Use SSL in production
3. **Backup Security**: Encrypt backup files
4. **Access Logging**: Monitor database access

## Monitoring and Metrics

1. **Performance Metrics**: Tracked in `rag_performance_metrics`
2. **Agent Metrics**: Tracked in `performance_metrics`
3. **Database Health**: Monitor connection pools and query performance
4. **Migration Status**: Track Alembic version history

---

_This document is maintained as part of the Reynard Backend system. For updates or questions, refer to the development team._
