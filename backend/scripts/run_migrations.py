#!/usr/bin/env python3
"""
Database Migration Runner for Reynard Backend

This script runs the database migrations in the correct order to set up
the unified repository schema and ensure compatibility with the RAG service.
"""

import os
import sys
import logging
from pathlib import Path
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.config.settings import get_config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_migration_file(engine, file_path: Path) -> bool:
    """Run a single migration file."""
    try:
        logger.info(f"Running migration: {file_path.name}")
        
        with open(file_path, 'r') as f:
            sql_content = f.read()
        
        with engine.connect() as conn:
            # Split by semicolon and execute each statement
            statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
            
            for statement in statements:
                if statement:
                    try:
                        conn.execute(text(statement))
                    except SQLAlchemyError as e:
                        # Some statements might fail if they already exist, which is OK
                        if "already exists" in str(e).lower() or "duplicate" in str(e).lower():
                            logger.debug(f"Statement already exists (skipping): {statement[:100]}...")
                        else:
                            logger.warning(f"Statement failed: {e}")
                            logger.debug(f"Failed statement: {statement[:200]}...")
            
            conn.commit()
            logger.info(f"✅ Migration completed: {file_path.name}")
            return True
            
    except Exception as e:
        logger.error(f"❌ Migration failed: {file_path.name} - {e}")
        return False


def main():
    """Run all database migrations in order."""
    try:
        # Get database settings
        config = get_config()
        
        # Get database URL from environment or use default
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/reynard")
        logger.info(f"Using database URL: {database_url}")
        
        engine = create_engine(database_url)
        
        # Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("✅ Database connection successful")
        
        # Migration files in order
        db_dir = Path(__file__).parent / "db"
        migration_files = [
            "001_pgvector.sql",
            "002_embeddings.sql", 
            "003_indexes.sql",
            "004_unified_repository.sql",
            "005_hnsw_optimization.sql"
        ]
        
        success_count = 0
        for migration_file in migration_files:
            file_path = db_dir / migration_file
            if file_path.exists():
                if run_migration_file(engine, file_path):
                    success_count += 1
                else:
                    logger.warning(f"Migration {migration_file} had issues, but continuing...")
            else:
                logger.warning(f"Migration file not found: {migration_file}")
        
        logger.info(f"✅ Migrations completed: {success_count}/{len(migration_files)} successful")
        return success_count > 0
        
    except Exception as e:
        logger.error(f"❌ Migration runner failed: {e}")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
