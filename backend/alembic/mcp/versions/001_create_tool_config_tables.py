"""Create tool configuration tables

Revision ID: 001_create_tool_config_tables
Revises: 
Create Date: 2025-01-15 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_create_tool_config_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create tool configuration tables."""
    
    # Create tool_categories table
    op.create_table('tool_categories',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Enum('AGENT', 'CHARACTER', 'ECS', 'SOCIAL', 'LINTING', 'FORMATTING', 'SEARCH', 'VISUALIZATION', 'SECURITY', 'UTILITY', 'VERSION', 'VSCODE', 'PLAYWRIGHT', 'MONOLITH', 'MANAGEMENT', 'SECRETS', 'RESEARCH', 'EMAIL', 'GIT', name='toolcategoryenum'), nullable=False),
        sa.Column('display_name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('sort_order', sa.Integer(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_tool_categories_name'), 'tool_categories', ['name'], unique=False)

    # Create tools table
    op.create_table('tools',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('category_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('enabled', sa.Boolean(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('dependencies', sa.JSON(), nullable=True),
        sa.Column('config', sa.JSON(), nullable=True),
        sa.Column('version', sa.String(length=20), nullable=False),
        sa.Column('is_system_tool', sa.Boolean(), nullable=False),
        sa.Column('execution_type', sa.String(length=20), nullable=False),
        sa.Column('timeout_seconds', sa.Integer(), nullable=True),
        sa.Column('max_concurrent', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['tool_categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('idx_tools_category_enabled', 'tools', ['category_id', 'enabled'], unique=False)
    op.create_index('idx_tools_name_enabled', 'tools', ['name', 'enabled'], unique=False)
    op.create_index(op.f('ix_tools_enabled'), 'tools', ['enabled'], unique=False)
    op.create_index(op.f('ix_tools_name'), 'tools', ['name'], unique=False)

    # Create tool_config_history table
    op.create_table('tool_config_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tool_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('change_type', sa.String(length=20), nullable=False),
        sa.Column('old_values', sa.JSON(), nullable=True),
        sa.Column('new_values', sa.JSON(), nullable=True),
        sa.Column('changed_by', sa.String(length=100), nullable=True),
        sa.Column('change_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['tool_id'], ['tools.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_tool_history_change_type', 'tool_config_history', ['change_type'], unique=False)
    op.create_index('idx_tool_history_tool_created', 'tool_config_history', ['tool_id', 'created_at'], unique=False)

    # Create tool_configuration table
    op.create_table('tool_configuration',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version', sa.String(length=20), nullable=False),
        sa.Column('last_updated', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('auto_sync_enabled', sa.Boolean(), nullable=False),
        sa.Column('default_timeout', sa.Integer(), nullable=False),
        sa.Column('max_concurrent_tools', sa.Integer(), nullable=False),
        sa.Column('cache_ttl_seconds', sa.Integer(), nullable=False),
        sa.Column('settings', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Insert default tool categories
    op.execute("""
        INSERT INTO tool_categories (id, name, display_name, description, icon, color, sort_order, is_active) VALUES
        (gen_random_uuid(), 'AGENT', 'Agent Tools', 'Tools for agent management and naming', '🤖', '#FF6B6B', 1, true),
        (gen_random_uuid(), 'CHARACTER', 'Character Tools', 'Tools for character creation and management', '👤', '#4ECDC4', 2, true),
        (gen_random_uuid(), 'ECS', 'ECS World Tools', 'Entity Component System world simulation tools', '🌍', '#45B7D1', 3, true),
        (gen_random_uuid(), 'SOCIAL', 'Social Tools', 'Tools for agent social interactions', '👥', '#96CEB4', 4, true),
        (gen_random_uuid(), 'LINTING', 'Linting Tools', 'Code quality and linting tools', '🔍', '#FFEAA7', 5, true),
        (gen_random_uuid(), 'FORMATTING', 'Formatting Tools', 'Code formatting and style tools', '✨', '#DDA0DD', 6, true),
        (gen_random_uuid(), 'SEARCH', 'Search Tools', 'Code and content search tools', '🔎', '#98D8C8', 7, true),
        (gen_random_uuid(), 'VISUALIZATION', 'Visualization Tools', 'Diagram and image visualization tools', '📊', '#F7DC6F', 8, true),
        (gen_random_uuid(), 'SECURITY', 'Security Tools', 'Security scanning and analysis tools', '🔒', '#BB8FCE', 9, true),
        (gen_random_uuid(), 'UTILITY', 'Utility Tools', 'General utility and helper tools', '🛠️', '#85C1E9', 10, true),
        (gen_random_uuid(), 'VERSION', 'Version Tools', 'Version and environment information tools', '📋', '#F8C471', 11, true),
        (gen_random_uuid(), 'VSCODE', 'VS Code Tools', 'VS Code integration and task tools', '💻', '#82E0AA', 12, true),
        (gen_random_uuid(), 'PLAYWRIGHT', 'Playwright Tools', 'Browser automation and testing tools', '🎭', '#F1948A', 13, true),
        (gen_random_uuid(), 'MONOLITH', 'Monolith Detection', 'Code complexity and monolith detection tools', '🏗️', '#D7BDE2', 14, true),
        (gen_random_uuid(), 'MANAGEMENT', 'Management Tools', 'System and configuration management tools', '⚙️', '#A9DFBF', 15, true),
        (gen_random_uuid(), 'SECRETS', 'Secrets Tools', 'Secret and credential management tools', '🔐', '#F9E79F', 16, true),
        (gen_random_uuid(), 'RESEARCH', 'Research Tools', 'Academic and research paper tools', '📚', '#AED6F1', 17, true),
        (gen_random_uuid(), 'EMAIL', 'Email Tools', 'Email and communication tools', '📧', '#D5DBDB', 18, true),
        (gen_random_uuid(), 'GIT', 'Git Tools', 'Version control and Git tools', '🌿', '#FADBD8', 19, true);
    """)

    # Insert default tool configuration
    op.execute("""
        INSERT INTO tool_configuration (id, version, auto_sync_enabled, default_timeout, max_concurrent_tools, cache_ttl_seconds, settings) VALUES
        (gen_random_uuid(), '1.0.0', true, 30, 10, 300, '{}');
    """)


def downgrade() -> None:
    """Drop tool configuration tables."""
    op.drop_table('tool_configuration')
    op.drop_table('tool_config_history')
    op.drop_table('tools')
    op.drop_table('tool_categories')
    op.execute("DROP TYPE IF EXISTS toolcategoryenum")
