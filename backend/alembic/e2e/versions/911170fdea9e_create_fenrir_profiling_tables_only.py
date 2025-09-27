"""create_fenrir_profiling_tables_only

Revision ID: 911170fdea9e
Revises: 087c4e8d53a6
Create Date: 2025-09-27 14:35:12.123456

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '911170fdea9e'
down_revision = '087c4e8d53a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create Fenrir profiling tables
    op.create_table('fenrir_profiling_sessions',
    sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('session_id', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('session_type', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('environment', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('started_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=False),
    sa.Column('completed_at', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=True),
    sa.Column('status', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('duration_seconds', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('total_snapshots', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('issues_found', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('peak_memory_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('final_memory_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('memory_delta_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=True),
    sa.Column('backend_analysis', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('database_analysis', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('service_analysis', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.Column('updated_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.PrimaryKeyConstraint('id', name='fenrir_profiling_sessions_pkey'),
    sa.UniqueConstraint('session_id', name='fenrir_profiling_sessions_session_id_key', postgresql_include=[], postgresql_nulls_not_distinct=False),
    postgresql_ignore_search_path=False
    )
    op.create_index(op.f('idx_profiling_sessions_type_status'), 'fenrir_profiling_sessions', ['session_type', 'status'], unique=False)
    op.create_index(op.f('idx_profiling_sessions_started_at'), 'fenrir_profiling_sessions', ['started_at'], unique=False)
    op.create_index(op.f('idx_profiling_sessions_environment'), 'fenrir_profiling_sessions', ['environment'], unique=False)
    
    op.create_table('fenrir_memory_snapshots',
    sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('profiling_session_id', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('timestamp', postgresql.TIMESTAMP(timezone=True), autoincrement=False, nullable=False),
    sa.Column('context', sa.VARCHAR(length=100), autoincrement=False, nullable=False),
    sa.Column('rss_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('vms_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('percent', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('available_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('tracemalloc_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('gc_objects', sa.INTEGER(), autoincrement=False, nullable=False),
    sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['profiling_session_id'], ['fenrir_profiling_sessions.id'], name=op.f('fenrir_memory_snapshots_profiling_session_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('fenrir_memory_snapshots_pkey'))
    )
    op.create_index(op.f('idx_memory_snapshots_timestamp'), 'fenrir_memory_snapshots', ['timestamp'], unique=False)
    op.create_index(op.f('idx_memory_snapshots_session_id'), 'fenrir_memory_snapshots', ['profiling_session_id'], unique=False)
    op.create_index(op.f('idx_memory_snapshots_context'), 'fenrir_memory_snapshots', ['context'], unique=False)
    
    op.create_table('fenrir_profiling_results',
    sa.Column('id', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('profiling_session_id', sa.UUID(), autoincrement=False, nullable=False),
    sa.Column('category', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('severity', sa.VARCHAR(length=20), autoincrement=False, nullable=False),
    sa.Column('issue', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('recommendation', sa.TEXT(), autoincrement=False, nullable=False),
    sa.Column('memory_impact_mb', sa.DOUBLE_PRECISION(precision=53), autoincrement=False, nullable=False),
    sa.Column('performance_impact', sa.VARCHAR(length=50), autoincrement=False, nullable=False),
    sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), autoincrement=False, nullable=True),
    sa.Column('created_at', postgresql.TIMESTAMP(timezone=True), server_default=sa.text('now()'), autoincrement=False, nullable=False),
    sa.ForeignKeyConstraint(['profiling_session_id'], ['fenrir_profiling_sessions.id'], name=op.f('fenrir_profiling_results_profiling_session_id_fkey'), ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id', name=op.f('fenrir_profiling_results_pkey'))
    )
    op.create_index(op.f('idx_profiling_results_severity'), 'fenrir_profiling_results', ['severity'], unique=False)
    op.create_index(op.f('idx_profiling_results_session_id'), 'fenrir_profiling_results', ['profiling_session_id'], unique=False)
    op.create_index(op.f('idx_profiling_results_category'), 'fenrir_profiling_results', ['category'], unique=False)


def downgrade() -> None:
    # Drop Fenrir profiling tables
    op.drop_table('fenrir_profiling_results')
    op.drop_table('fenrir_memory_snapshots')
    op.drop_table('fenrir_profiling_sessions')