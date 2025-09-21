# Alembic Migration Structure

This directory contains the Alembic migration configurations for all databases in the Reynard Backend system.

## Directory Structure

```text
alembic/
├── ecs/                    # ECS production database
│   ├── versions/
│   │   ├── ecs/           # ECS-specific migrations
│   │   ├── naming/        # Naming system migrations
│   │   └── agents/        # Agent-related migrations
│   ├── env.py             # Alembic environment configuration
│   └── script.py.mako     # Migration template
├── main/                   # Main database (placeholder)
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

## Database Configurations

### ECS Database (`ecs/`)

- **Purpose**: ECS world simulation system
- **Config File**: `alembic_ecs.ini`
- **Database**: `reynard_ecs`
- **Migration Types**:
  - ECS-specific migrations in `versions/ecs/`
  - Naming system migrations in `versions/naming/`
  - Agent-related migrations in `versions/agents/`

### Main Database (`main/`)

- **Purpose**: Main application database (placeholder)
- **Config File**: `alembic_main.ini`
- **Database**: `reynard`
- **Migration Types**: Currently uses SQL migrations, Alembic is placeholder

### E2E Database (`e2e/`)

- **Purpose**: E2E testing database (mirror of main)
- **Config File**: `alembic_e2e.ini`
- **Database**: `reynard_e2e`
- **Migration Types**: Currently uses SQL migrations, Alembic is placeholder

### ECS E2E Database (`ecs_e2e/`)

- **Purpose**: ECS E2E testing database (mirror of ECS)
- **Config File**: `alembic_ecs_e2e.ini`
- **Database**: `reynard_ecs_e2e`
- **Migration Types**: Mirrors ECS database structure

## Usage

### Using the Migration Manager Script

```bash
# Upgrade a database
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py upgrade ecs

# Create a new migration
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py create ecs --message "Add new feature"

# Show migration history
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py history ecs

# Copy migrations between databases
PYTHONPATH=/home/kade/runeset/reynard/backend python3 scripts/migrate.py copy
```

### Using Alembic Directly

```bash
# ECS Database
PYTHONPATH=/home/kade/runeset/reynard/backend alembic -c alembic_ecs.ini upgrade head
PYTHONPATH=/home/kade/runeset/reynard/backend alembic -c alembic_ecs.ini revision --autogenerate -m "description"

# ECS E2E Database
PYTHONPATH=/home/kade/runeset/reynard/backend alembic -c alembic_ecs_e2e.ini upgrade head
PYTHONPATH=/home/kade/runeset/reynard/backend alembic -c alembic_ecs_e2e.ini revision --autogenerate -m "description"
```

## Migration Workflow

1. **Development**: Make changes to SQLAlchemy models
2. **Create Migration**: Use the migration manager to create a new migration
3. **Review**: Check the generated migration file
4. **Test**: Apply migration to E2E database first
5. **Deploy**: Apply migration to production database

## Best Practices

1. **Always test migrations on E2E databases first**
2. **Use descriptive migration messages**
3. **Review auto-generated migrations before applying**
4. **Keep migrations small and focused**
5. **Use the migration manager script for consistency**

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure `PYTHONPATH` is set correctly
2. **Database Connection**: Check database URLs in configuration files
3. **Migration Conflicts**: Use `alembic merge` to resolve conflicts
4. **Version Mismatches**: Check `alembic_version` table in database

### Getting Help

- Check the main `DATABASE_SETUP.md` file for comprehensive documentation
- Use `python3 scripts/migrate.py history <database>` to see migration history
- Check database logs for detailed error messages

---

_This structure provides a clean, organized approach to managing database migrations across multiple databases in the Reynard Backend system._
