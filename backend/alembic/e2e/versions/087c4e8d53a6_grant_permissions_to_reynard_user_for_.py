"""grant_permissions_to_reynard_user_for_fenrir_tables

Revision ID: 087c4e8d53a6
Revises: 117fee1fb663
Create Date: 2025-09-27 13:23:39.610026

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '087c4e8d53a6'
down_revision = '117fee1fb663'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Grant permissions to reynard user for all fenrir tables
    fenrir_tables = [
        'fenrir_profiling_sessions',
        'fenrir_memory_snapshots', 
        'fenrir_profiling_results',
        'fenrir_exploit_sessions',
        'fenrir_exploit_attempts',
        'fenrir_database_connection_logs',
        'fenrir_service_startup_logs'
    ]
    
    for table in fenrir_tables:
        # Grant SELECT, INSERT, UPDATE, DELETE permissions
        op.execute(f"GRANT SELECT, INSERT, UPDATE, DELETE ON {table} TO reynard;")
        # Grant USAGE on sequences (for auto-incrementing IDs)
        op.execute(f"GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO reynard;")
    
    # Grant USAGE on the public schema
    op.execute("GRANT USAGE ON SCHEMA public TO reynard;")


def downgrade() -> None:
    # Revoke permissions from reynard user for all fenrir tables
    fenrir_tables = [
        'fenrir_profiling_sessions',
        'fenrir_memory_snapshots', 
        'fenrir_profiling_results',
        'fenrir_exploit_sessions',
        'fenrir_exploit_attempts',
        'fenrir_database_connection_logs',
        'fenrir_service_startup_logs'
    ]
    
    for table in fenrir_tables:
        # Revoke permissions
        op.execute(f"REVOKE SELECT, INSERT, UPDATE, DELETE ON {table} FROM reynard;")
    
    # Revoke USAGE on sequences
    op.execute("REVOKE USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public FROM reynard;")
    # Revoke USAGE on the public schema
    op.execute("REVOKE USAGE ON SCHEMA public FROM reynard;")
