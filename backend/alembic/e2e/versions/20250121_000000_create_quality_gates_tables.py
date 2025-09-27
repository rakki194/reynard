"""Create quality gates tables

Revision ID: 20250121_000000
Revises: 20250115_000000
Create Date: 2025-01-21 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250121_000000'
down_revision = '20250115_000000'
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
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('environment', sa.Enum('development', 'staging', 'production', 'all', name='environmenttype'), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('is_default', sa.Boolean(), nullable=False, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Quality Gate Conditions - Individual conditions within gates
    op.create_table('quality_gate_conditions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('quality_gate_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('metric', sa.String(100), nullable=False),
        sa.Column('operator', sa.Enum('GT', 'LT', 'EQ', 'NE', 'GTE', 'LTE', name='operatortype'), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('error_threshold', sa.Float(), nullable=True),
        sa.Column('warning_threshold', sa.Float(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['quality_gate_id'], ['quality_gates.id'], ondelete='CASCADE'),
    )
    
    # Quality Gate Evaluations - Evaluation results and history
    op.create_table('quality_gate_evaluations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('quality_gate_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('evaluation_id', sa.String(100), nullable=False),
        sa.Column('environment', sa.String(50), nullable=False),
        sa.Column('status', sa.Enum('PASSED', 'FAILED', 'WARN', name='gatestatus'), nullable=False),
        sa.Column('overall_score', sa.Float(), nullable=False),
        sa.Column('passed_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('total_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('failed_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('warning_conditions', sa.Integer(), nullable=False, default=0),
        sa.Column('metrics_data', postgresql.JSONB(), nullable=True),
        sa.Column('evaluated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['quality_gate_id'], ['quality_gates.id'], ondelete='CASCADE'),
    )
    
    # Quality Gate Condition Results - Individual condition evaluation results
    op.create_table('quality_gate_condition_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('evaluation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('condition_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Enum('PASSED', 'FAILED', 'WARN', name='gatestatus'), nullable=False),
        sa.Column('actual_value', sa.Float(), nullable=False),
        sa.Column('threshold', sa.Float(), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['evaluation_id'], ['quality_gate_evaluations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['condition_id'], ['quality_gate_conditions.id'], ondelete='CASCADE'),
    )
    
    # Quality Gate Environments - Environment-specific gate assignments
    op.create_table('quality_gate_environments',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, primary_key=True),
        sa.Column('environment', sa.String(50), nullable=False, unique=True),
        sa.Column('default_gate_id', sa.String(100), nullable=True),
        sa.Column('enabled', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    
    # Create indexes for performance
    op.create_index('idx_quality_gates_gate_id', 'quality_gates', ['gate_id'])
    op.create_index('idx_quality_gates_environment_enabled', 'quality_gates', ['environment', 'enabled'])
    op.create_index('idx_quality_gates_default', 'quality_gates', ['is_default'])
    
    op.create_index('idx_quality_gate_conditions_gate_id', 'quality_gate_conditions', ['quality_gate_id'])
    op.create_index('idx_quality_gate_conditions_metric', 'quality_gate_conditions', ['metric'])
    
    op.create_index('idx_quality_gate_evaluations_gate_id', 'quality_gate_evaluations', ['quality_gate_id'])
    op.create_index('idx_quality_gate_evaluations_evaluation_id', 'quality_gate_evaluations', ['evaluation_id'])
    op.create_index('idx_quality_gate_evaluations_environment', 'quality_gate_evaluations', ['environment'])
    op.create_index('idx_quality_gate_evaluations_status', 'quality_gate_evaluations', ['status'])
    op.create_index('idx_quality_gate_evaluations_evaluated_at', 'quality_gate_evaluations', ['evaluated_at'])
    
    op.create_index('idx_quality_gate_condition_results_evaluation_id', 'quality_gate_condition_results', ['evaluation_id'])
    op.create_index('idx_quality_gate_condition_results_condition_id', 'quality_gate_condition_results', ['condition_id'])
    op.create_index('idx_quality_gate_condition_results_status', 'quality_gate_condition_results', ['status'])
    
    op.create_index('idx_quality_gate_environments_environment', 'quality_gate_environments', ['environment'])
    
    # Add check constraints
    op.create_check_constraint(
        'ck_quality_gate_evaluations_score',
        'quality_gate_evaluations',
        'overall_score >= 0 AND overall_score <= 100'
    )
    
    # Insert default environment configurations
    op.execute("""
        INSERT INTO quality_gate_environments (environment, default_gate_id, enabled) VALUES
        ('development', 'reynard-development', true),
        ('staging', 'reynard-development', true),
        ('production', 'reynard-production', true)
    """)


def downgrade():
    """Drop quality gates tables."""
    
    # Drop indexes
    op.drop_index('idx_quality_gate_environments_environment', 'quality_gate_environments')
    op.drop_index('idx_quality_gate_condition_results_status', 'quality_gate_condition_results')
    op.drop_index('idx_quality_gate_condition_results_condition_id', 'quality_gate_condition_results')
    op.drop_index('idx_quality_gate_condition_results_evaluation_id', 'quality_gate_condition_results')
    op.drop_index('idx_quality_gate_evaluations_evaluated_at', 'quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_status', 'quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_environment', 'quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_evaluation_id', 'quality_gate_evaluations')
    op.drop_index('idx_quality_gate_evaluations_gate_id', 'quality_gate_evaluations')
    op.drop_index('idx_quality_gate_conditions_metric', 'quality_gate_conditions')
    op.drop_index('idx_quality_gate_conditions_gate_id', 'quality_gate_conditions')
    op.drop_index('idx_quality_gates_default', 'quality_gates')
    op.drop_index('idx_quality_gates_environment_enabled', 'quality_gates')
    op.drop_index('idx_quality_gates_gate_id', 'quality_gates')
    
    # Drop tables
    op.drop_table('quality_gate_condition_results')
    op.drop_table('quality_gate_evaluations')
    op.drop_table('quality_gate_conditions')
    op.drop_table('quality_gate_environments')
    op.drop_table('quality_gates')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS gatestatus")
    op.execute("DROP TYPE IF EXISTS operatortype")
    op.execute("DROP TYPE IF EXISTS environmenttype")
