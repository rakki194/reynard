#!/usr/bin/env python3
"""
Database Configuration and Connection Management
===============================================

Centralized database configuration and connection management for the Reynard backend.
Provides SQLAlchemy engine, session management, and base model class.

Author: Reynard Development Team
Version: 1.0.0
"""

import logging
import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base

logger = logging.getLogger(__name__)

# Database configuration
DATABASE_URL = os.getenv("MCP_DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("MCP_DATABASE_URL environment variable is required")

# SQLAlchemy setup
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG_SQL_QUERIES", "false").lower() == "true",
    pool_size=int(os.getenv("DATABASE_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", "10")),
    pool_timeout=int(os.getenv("DATABASE_POOL_TIMEOUT", "30")),
    pool_recycle=int(os.getenv("DATABASE_POOL_RECYCLE", "3600")),
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db_session() -> Generator:
    """Get database session dependency for FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db() -> Generator:
    """Alias for get_db_session for backward compatibility."""
    return get_db_session()


def create_tables() -> None:
    """Create all tables in the database."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def drop_tables() -> None:
    """Drop all tables in the database."""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {e}")
        raise


def test_connection() -> bool:
    """Test database connection."""
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
        logger.info("Database connection test successful")
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False
