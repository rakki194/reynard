"""Add RBAC tables and fields to Gatekeeper

Revision ID: 20250926_162815
Revises: caa8578f93f6
Create Date: 2025-09-26 16:28:15.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250926_162815'
down_revision = 'caa8578f93f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add RBAC tables and fields to Gatekeeper."""

    # Add RBAC fields to existing users table
    op.add_column(
        'users',
        sa.Column('rbac_enabled', sa.Boolean(), nullable=False, server_default='false'),
    )
    op.add_column(
        'users', sa.Column('default_role', sa.String(length=50), nullable=True)
    )
    op.add_column(
        'users', sa.Column('last_rbac_sync', sa.DateTime(timezone=True), nullable=True)
    )

    # Create indexes for RBAC fields
    op.create_index('ix_users_rbac_enabled', 'users', ['rbac_enabled'])
    op.create_index('ix_users_default_role', 'users', ['default_role'])

    # Create roles table
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('level', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('parent_role_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            'is_system_role', sa.Boolean(), nullable=False, server_default='false'
        ),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['parent_role_id'],
            ['roles.id'],
        ),
    )

    # Create indexes for roles table
    op.create_index('ix_roles_name', 'roles', ['name'], unique=True)
    op.create_index('ix_roles_level', 'roles', ['level'])
    op.create_index('ix_roles_is_system_role', 'roles', ['is_system_role'])
    op.create_index('ix_roles_is_active', 'roles', ['is_active'])

    # Create permissions table
    op.create_table(
        'permissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('operation', sa.String(length=50), nullable=False),
        sa.Column('scope', sa.String(length=50), nullable=False, server_default='own'),
        sa.Column('conditions', sa.JSON(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for permissions table
    op.create_index('ix_permissions_name', 'permissions', ['name'], unique=True)
    op.create_index('ix_permissions_resource_type', 'permissions', ['resource_type'])
    op.create_index('ix_permissions_operation', 'permissions', ['operation'])
    op.create_index('ix_permissions_scope', 'permissions', ['scope'])
    op.create_index('ix_permissions_is_active', 'permissions', ['is_active'])

    # Create role_permissions table
    op.create_table(
        'role_permissions',
        sa.Column('role_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('permission_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            'granted_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('conditions', sa.JSON(), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('role_id', 'permission_id'),
        sa.ForeignKeyConstraint(
            ['role_id'],
            ['roles.id'],
        ),
        sa.ForeignKeyConstraint(
            ['permission_id'],
            ['permissions.id'],
        ),
        sa.ForeignKeyConstraint(
            ['granted_by'],
            ['users.id'],
        ),
    )

    # Create indexes for role_permissions table
    op.create_index('ix_role_permissions_is_active', 'role_permissions', ['is_active'])
    op.create_index(
        'ix_role_permissions_expires_at', 'role_permissions', ['expires_at']
    )

    # Create user_roles table
    op.create_table(
        'user_roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('context_type', sa.String(length=50), nullable=True),
        sa.Column('context_id', sa.String(length=255), nullable=True),
        sa.Column(
            'assigned_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column('assigned_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('conditions', sa.JSON(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['user_id'],
            ['users.id'],
        ),
        sa.ForeignKeyConstraint(
            ['role_id'],
            ['roles.id'],
        ),
        sa.ForeignKeyConstraint(
            ['assigned_by'],
            ['users.id'],
        ),
    )

    # Create indexes for user_roles table
    op.create_index('ix_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('ix_user_roles_role_id', 'user_roles', ['role_id'])
    op.create_index('ix_user_roles_context_type', 'user_roles', ['context_type'])
    op.create_index('ix_user_roles_context_id', 'user_roles', ['context_id'])
    op.create_index('ix_user_roles_is_active', 'user_roles', ['is_active'])
    op.create_index('ix_user_roles_expires_at', 'user_roles', ['expires_at'])

    # Create resource_access_control table
    op.create_table(
        'resource_access_control',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('resource_type', sa.String(length=50), nullable=False),
        sa.Column('resource_id', sa.String(length=255), nullable=False),
        sa.Column(
            'subject_type', sa.String(length=50), nullable=False, server_default='user'
        ),
        sa.Column('subject_id', sa.String(length=255), nullable=False),
        sa.Column('permission_level', sa.String(length=50), nullable=False),
        sa.Column(
            'granted_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.Column('granted_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('conditions', sa.JSON(), nullable=True),
        sa.Column('metadata', sa.JSON(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(
            ['granted_by'],
            ['users.id'],
        ),
    )

    # Create indexes for resource_access_control table
    op.create_index(
        'ix_resource_access_control_resource_type',
        'resource_access_control',
        ['resource_type'],
    )
    op.create_index(
        'ix_resource_access_control_resource_id',
        'resource_access_control',
        ['resource_id'],
    )
    op.create_index(
        'ix_resource_access_control_subject_type',
        'resource_access_control',
        ['subject_type'],
    )
    op.create_index(
        'ix_resource_access_control_subject_id',
        'resource_access_control',
        ['subject_id'],
    )
    op.create_index(
        'ix_resource_access_control_permission_level',
        'resource_access_control',
        ['permission_level'],
    )
    op.create_index(
        'ix_resource_access_control_is_active', 'resource_access_control', ['is_active']
    )
    op.create_index(
        'ix_resource_access_control_expires_at',
        'resource_access_control',
        ['expires_at'],
    )


def downgrade() -> None:
    """Remove RBAC tables and fields from Gatekeeper."""

    # Drop resource_access_control table
    op.drop_index(
        'ix_resource_access_control_expires_at', table_name='resource_access_control'
    )
    op.drop_index(
        'ix_resource_access_control_is_active', table_name='resource_access_control'
    )
    op.drop_index(
        'ix_resource_access_control_permission_level',
        table_name='resource_access_control',
    )
    op.drop_index(
        'ix_resource_access_control_subject_id', table_name='resource_access_control'
    )
    op.drop_index(
        'ix_resource_access_control_subject_type', table_name='resource_access_control'
    )
    op.drop_index(
        'ix_resource_access_control_resource_id', table_name='resource_access_control'
    )
    op.drop_index(
        'ix_resource_access_control_resource_type', table_name='resource_access_control'
    )
    op.drop_table('resource_access_control')

    # Drop user_roles table
    op.drop_index('ix_user_roles_expires_at', table_name='user_roles')
    op.drop_index('ix_user_roles_is_active', table_name='user_roles')
    op.drop_index('ix_user_roles_context_id', table_name='user_roles')
    op.drop_index('ix_user_roles_context_type', table_name='user_roles')
    op.drop_index('ix_user_roles_role_id', table_name='user_roles')
    op.drop_index('ix_user_roles_user_id', table_name='user_roles')
    op.drop_table('user_roles')

    # Drop role_permissions table
    op.drop_index('ix_role_permissions_expires_at', table_name='role_permissions')
    op.drop_index('ix_role_permissions_is_active', table_name='role_permissions')
    op.drop_table('role_permissions')

    # Drop permissions table
    op.drop_index('ix_permissions_is_active', table_name='permissions')
    op.drop_index('ix_permissions_scope', table_name='permissions')
    op.drop_index('ix_permissions_operation', table_name='permissions')
    op.drop_index('ix_permissions_resource_type', table_name='permissions')
    op.drop_index('ix_permissions_name', table_name='permissions')
    op.drop_table('permissions')

    # Drop roles table
    op.drop_index('ix_roles_is_active', table_name='roles')
    op.drop_index('ix_roles_is_system_role', table_name='roles')
    op.drop_index('ix_roles_level', table_name='roles')
    op.drop_index('ix_roles_name', table_name='roles')
    op.drop_table('roles')

    # Remove RBAC fields from users table
    op.drop_index('ix_users_default_role', table_name='users')
    op.drop_index('ix_users_rbac_enabled', table_name='users')
    op.drop_column('users', 'last_rbac_sync')
    op.drop_column('users', 'default_role')
    op.drop_column('users', 'rbac_enabled')
