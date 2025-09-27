"""Create quality gates tables

Revision ID: 20250127_000000
Revises: 
Create Date: 2025-01-27 12:54:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250127_000000'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create quality gates tables."""
    
    # Create enum types (if they don't exist)
    op.execute("DO $$ BEGIN CREATE TYPE environmenttype AS ENUM ('development', 'staging', 'production', 'all'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE operatortype AS ENUM ('GT', 'LT', 'EQ', 'NE', 'GTE', 'LTE'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    op.execute("DO $$ BEGIN CREATE TYPE gatestatus AS ENUM ('PASSED', 'FAILED', 'WARN'); EXCEPTION WHEN duplicate_object THEN null; END $$;")
    
    # Quality Gates - Core table for quality gate definitions
    op.create_table('quality_gates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('gate_id', sa.String(100), nullable=False, unique=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('environment', postgresql.ENUM('development', 'staging', 'production', 'all', name='environmenttype'), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now(), onupdate=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('gate_id')
    )
    
    # Quality Gate Conditions - Individual conditions for each gate
    op.create_table('quality_gate_conditions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('gate_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric', sa.String(100), nullable=False),
        sa.Column('operator', postgresql.ENUM('GT', 'LT', 'EQ', 'NE', 'GTE', 'LTE', name='operatortype'), nullable=False),
        sa.Column('threshold', sa.Numeric(10, 2), nullable=False),
        sa.Column('error_threshold', sa.Numeric(10, 2), nullable=True),
        sa.Column('warning_threshold', sa.Numeric(10, 2), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['gate_id'], ['quality_gates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Quality Gate Evaluations - History of evaluations
    op.create_table('quality_gate_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('evaluation_id', sa.String(100), nullable=True),
        sa.Column('gate_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('environment', postgresql.ENUM('development', 'staging', 'production', 'all', name='environmenttype'), nullable=False),
        sa.Column('status', postgresql.ENUM('PASSED', 'FAILED', 'WARN', name='gatestatus'), nullable=False),
        sa.Column('overall_score', sa.Numeric(5, 2), nullable=False),
        sa.Column('passed_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('total_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('failed_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('warning_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('metrics_snapshot', postgresql.JSONB(), nullable=True),
        sa.Column('quality_gate_snapshot', postgresql.JSONB(), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.ForeignKeyConstraint(['gate_id'], ['quality_gates.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Quality Gate Condition Results - Individual condition results for each evaluation
    op.create_table('quality_gate_condition_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('evaluation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('condition_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', postgresql.ENUM('PASSED', 'FAILED', 'WARN', name='gatestatus'), nullable=False),
        sa.Column('actual_value', sa.Numeric(10, 2), nullable=False),
        sa.Column('threshold', sa.Numeric(10, 2), nullable=False),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.ForeignKeyConstraint(['evaluation_id'], ['quality_gate_evaluations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['condition_id'], ['quality_gate_conditions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Quality Gate Environments - Environment-specific configurations
    op.create_table('quality_gate_environments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('environment', postgresql.ENUM('development', 'staging', 'production', 'all', name='environmenttype'), nullable=False, unique=True),
        sa.Column('default_gate_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now(), onupdate=sa.func.now()),
        sa.ForeignKeyConstraint(['default_gate_id'], ['quality_gates.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('environment')
    )
    
    # Create indexes for better performance
    op.create_index('idx_quality_gates_environment', 'quality_gates', ['environment'])
    op.create_index('idx_quality_gates_enabled', 'quality_gates', ['enabled'])
    op.create_index('idx_quality_gates_is_default', 'quality_gates', ['is_default'])
    op.create_index('idx_quality_gate_conditions_gate_id', 'quality_gate_conditions', ['gate_id'])
    op.create_index('idx_quality_gate_conditions_enabled', 'quality_gate_conditions', ['enabled'])
    op.create_index('idx_quality_gate_evaluations_gate_id', 'quality_gate_evaluations', ['gate_id'])
    op.create_index('idx_quality_gate_evaluations_environment', 'quality_gate_evaluations', ['environment'])
    op.create_index('idx_quality_gate_evaluations_evaluated_at', 'quality_gate_evaluations', ['evaluated_at'])
    op.create_index('idx_quality_gate_condition_results_evaluation_id', 'quality_gate_condition_results', ['evaluation_id'])


def downgrade():
    """Drop quality gates tables."""
    
    # Drop indexes
    op.drop_index('idx_quality_gate_condition_results_evaluation_id', table_name='quality_gate_condition_results')
    op.drop_index('idx_quality_gate_evaluations_evaluated_at', table_name='quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_environment', table_name='quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_gate_id', table_name='quality_gate_evaluations')
    op.drop_index('idx_quality_gate_conditions_enabled', table_name='quality_gate_conditions')
    op.drop_index('idx_quality_gate_conditions_gate_id', table_name='quality_gate_conditions')
    op.drop_index('idx_quality_gates_is_default', table_name='quality_gates')
    op.drop_index('idx_quality_gates_enabled', table_name='quality_gates')
    op.drop_index('idx_quality_gates_environment', table_name='quality_gates')
    
    # Drop tables
    op.drop_table('quality_gate_environments')
    op.drop_table('quality_gate_condition_results')
    op.drop_table('quality_gate_evaluations')
    op.drop_table('quality_gate_conditions')
    op.drop_table('quality_gates')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS gatestatus")
    op.execute("DROP TYPE IF EXISTS operatortype")
    op.execute("DROP TYPE IF EXISTS environmenttype")
