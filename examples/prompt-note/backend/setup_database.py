#!/usr/bin/env python3
"""
Database setup script for Prompt Note application
Creates PostgreSQL database, user, and initial schema
"""

import asyncio
import logging
import os
import sys

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "promptnote_db")
DB_USER = os.getenv("DB_USER", "promptnote_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "promptnote_password")
ADMIN_USER = os.getenv("POSTGRES_ADMIN_USER", "postgres")
ADMIN_PASSWORD = os.getenv("POSTGRES_ADMIN_PASSWORD", "")


def create_database_and_user():
    """Create database and user for Prompt Note application"""
    try:
        # Connect to PostgreSQL as admin
        logger.info(f"Connecting to PostgreSQL as {ADMIN_USER}...")
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=ADMIN_USER,
            password=ADMIN_PASSWORD,
            database="postgres",
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Create user if it doesn't exist
        logger.info(f"Creating user {DB_USER}...")
        cursor.execute(
            f"""
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '{DB_USER}') THEN
                    CREATE ROLE {DB_USER} WITH LOGIN PASSWORD '{DB_PASSWORD}';
                END IF;
            END
            $$;
        """
        )

        # Create database if it doesn't exist
        logger.info(f"Creating database {DB_NAME}...")
        cursor.execute(
            f"""
            SELECT 1 FROM pg_database WHERE datname = '{DB_NAME}'
        """
        )
        if not cursor.fetchone():
            cursor.execute(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER}")

        # Grant privileges
        logger.info("Granting privileges...")
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}")
        cursor.execute(f"GRANT ALL ON SCHEMA public TO {DB_USER}")
        cursor.execute(
            f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {DB_USER}"
        )
        cursor.execute(
            f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {DB_USER}"
        )

        cursor.close()
        conn.close()

        logger.info("✅ Database and user created successfully!")
        return True

    except psycopg2.Error as e:
        logger.error(f"❌ PostgreSQL error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False


def create_tables():
    """Create initial tables for the application"""
    try:
        # Create database URL
        database_url = (
            f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )

        logger.info("Connecting to database to create tables...")
        engine = create_engine(database_url)

        with engine.connect() as conn:
            # Create users table (for Gatekeeper)
            logger.info("Creating users table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    is_verified BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
            )

            # Create notebooks table
            logger.info("Creating notebooks table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS notebooks (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    description TEXT,
                    color VARCHAR(7) DEFAULT '#0078D4',
                    is_public BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
            )

            # Create pages table
            logger.info("Creating pages table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS pages (
                    id SERIAL PRIMARY KEY,
                    notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
                    title VARCHAR(200) NOT NULL,
                    content TEXT,
                    content_type VARCHAR(50) DEFAULT 'markdown',
                    is_favorite BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
            )

            # Create collaborations table
            logger.info("Creating collaborations table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS collaborations (
                    id SERIAL PRIMARY KEY,
                    notebook_id INTEGER REFERENCES notebooks(id) ON DELETE CASCADE,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    permission VARCHAR(20) DEFAULT 'read',
                    invited_by INTEGER REFERENCES users(id),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(notebook_id, user_id)
                )
            """
                )
            )

            # Create user_stats table for gamification
            logger.info("Creating user_stats table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS user_stats (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
                    level INTEGER DEFAULT 1,
                    experience_points INTEGER DEFAULT 0,
                    notes_created INTEGER DEFAULT 0,
                    notes_shared INTEGER DEFAULT 0,
                    ai_features_used INTEGER DEFAULT 0,
                    login_streak INTEGER DEFAULT 0,
                    last_login DATE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
            )

            # Create achievements table
            logger.info("Creating achievements table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS achievements (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                    achievement_type VARCHAR(50) NOT NULL,
                    achievement_name VARCHAR(100) NOT NULL,
                    description TEXT,
                    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE(user_id, achievement_type)
                )
            """
                )
            )

            # Create file_attachments table
            logger.info("Creating file_attachments table...")
            conn.execute(
                text(
                    """
                CREATE TABLE IF NOT EXISTS file_attachments (
                    id SERIAL PRIMARY KEY,
                    page_id INTEGER REFERENCES pages(id) ON DELETE CASCADE,
                    filename VARCHAR(255) NOT NULL,
                    original_filename VARCHAR(255) NOT NULL,
                    file_size INTEGER,
                    mime_type VARCHAR(100),
                    file_path VARCHAR(500),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """
                )
            )

            # Create indexes for better performance
            logger.info("Creating indexes...")
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_notebooks_user_id ON notebooks(user_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_pages_notebook_id ON pages(notebook_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_collaborations_notebook_id ON collaborations(notebook_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_collaborations_user_id ON collaborations(user_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)"
                )
            )
            conn.execute(
                text(
                    "CREATE INDEX IF NOT EXISTS idx_file_attachments_page_id ON file_attachments(page_id)"
                )
            )

            conn.commit()

        logger.info("✅ Tables created successfully!")
        return True

    except SQLAlchemyError as e:
        logger.error(f"❌ Database error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        return False


def main():
    """Main setup function"""
    logger.info("🚀 Setting up Prompt Note database...")

    # Step 1: Create database and user
    if not create_database_and_user():
        logger.error("Failed to create database and user")
        sys.exit(1)

    # Step 2: Create tables
    if not create_tables():
        logger.error("Failed to create tables")
        sys.exit(1)

    logger.info("🎉 Database setup completed successfully!")
    logger.info(f"Database: {DB_NAME}")
    logger.info(f"User: {DB_USER}")
    logger.info(f"Host: {DB_HOST}:{DB_PORT}")

    print("\n" + "=" * 50)
    print("🎯 Next Steps:")
    print("1. Update your .env file with the database credentials")
    print("2. Run the backend: python main.py")
    print("3. Start the frontend: npm run dev")
    print("=" * 50)


if __name__ == "__main__":
    main()
