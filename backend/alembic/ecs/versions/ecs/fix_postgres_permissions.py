"""fix_postgres_permissions

Revision ID: fix_permissions_001
Revises: 22ebdcff71c4
Create Date: 2025-01-15 12:00:00.000000

"""

from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fix_permissions_001"
down_revision: str | Sequence[str] | None = "22ebdcff71c4"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Fix PostgreSQL permissions for public schema."""
    # Grant permissions to postgres user on public schema
    op.execute("GRANT ALL ON SCHEMA public TO postgres;")
    op.execute("GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;")
    op.execute("GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;")
    op.execute("GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres;")
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;",
    )
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;",
    )
    op.execute(
        "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;",
    )


def downgrade() -> None:
    """Revert PostgreSQL permissions (optional - not recommended)."""
    # Note: We don't actually revoke permissions in downgrade as this could break the system
    # This is a safety measure to prevent accidental permission removal
