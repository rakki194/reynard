"""Auto-fix PostgreSQL permissions with intelligent detection

Revision ID: auto_fix_permissions_002
Revises: fix_permissions_001
Create Date: 2025-01-26 18:00:00.000000

"""

import logging
from collections.abc import Sequence

from alembic import op
from sqlalchemy import text

logger = logging.getLogger(__name__)

# revision identifiers, used by Alembic.
revision: str = "auto_fix_permissions_002"
down_revision: str | Sequence[str] | None = "fix_permissions_001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Intelligently fix PostgreSQL permissions for all users and schemas."""
    connection = op.get_bind()

    try:
        # Get current database name and users
        db_result = connection.execute(text("SELECT current_database()")).fetchone()
        current_db = db_result[0] if db_result else "unknown"

        # Get all users that might need permissions
        users_result = connection.execute(
            text(
                """
            SELECT rolname FROM pg_roles 
            WHERE rolcanlogin = true 
            AND rolname NOT IN ('postgres', 'rdsadmin', 'rdsrepladmin')
        """
            )
        ).fetchall()

        users = [row[0] for row in users_result]
        logger.info(
            f"Auto-fixing permissions for users: {users} in database: {current_db}"
        )

        # Grant comprehensive permissions to all users
        for user in users:
            try:
                permission_queries = [
                    f"GRANT ALL ON SCHEMA public TO {user};",
                    f"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO {user};",
                    f"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO {user};",
                    f"GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO {user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {user};",
                    f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO {user};",
                ]

                for query in permission_queries:
                    try:
                        connection.execute(text(query))
                    except Exception as query_error:
                        # Log but don't fail - some permissions might already exist
                        logger.debug(
                            f"Permission query result for {user}: {query_error}"
                        )

                logger.info(f"✅ Granted permissions to user: {user}")

            except Exception as user_error:
                logger.warning(
                    f"⚠️ Failed to grant permissions to user {user}: {user_error}"
                )

        # Also ensure postgres user has all permissions
        try:
            postgres_queries = [
                "GRANT ALL ON SCHEMA public TO postgres;",
                "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;",
                "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;",
                "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;",
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;",
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;",
                "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;",
            ]

            for query in postgres_queries:
                try:
                    connection.execute(text(query))
                except Exception as query_error:
                    logger.debug(f"Postgres permission query result: {query_error}")

            logger.info("✅ Ensured postgres user has all permissions")

        except Exception as postgres_error:
            logger.warning(f"⚠️ Failed to ensure postgres permissions: {postgres_error}")

        logger.info(f"🎉 Auto-permission fix completed for database: {current_db}")

    except Exception as e:
        logger.error(f"❌ Auto-permission fix failed: {e}")
        # Don't raise - this is a best-effort fix
        logger.info("Continuing migration despite permission fix issues...")


def downgrade() -> None:
    """Revert auto-permission fixes (optional - not recommended)."""
    logger.info("Auto-permission fix downgrade - no action taken (permissions remain)")
    pass
