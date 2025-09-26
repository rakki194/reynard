"""Populate default RBAC roles and permissions

Revision ID: 20250926_165024
Revises: 20250926_162815
Create Date: 2025-09-26 16:50:24.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250926_165024'
down_revision = '20250926_162815'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Populate default RBAC roles and permissions."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Insert default roles
    roles_data = [
        {
            'id': '00000000-0000-0000-0000-000000000001',
            'name': 'system_admin',
            'description': 'System administrator with full access to all resources and operations',
            'level': 100,
            'is_system_role': True,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000002',
            'name': 'admin',
            'description': 'Administrator with full access to most resources',
            'level': 90,
            'is_system_role': True,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000003',
            'name': 'manager',
            'description': 'Manager with access to team resources and user management',
            'level': 70,
            'is_system_role': True,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000004',
            'name': 'user',
            'description': 'Regular user with access to own resources and shared content',
            'level': 50,
            'is_system_role': True,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000005',
            'name': 'guest',
            'description': 'Guest user with limited read-only access',
            'level': 10,
            'is_system_role': True,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000006',
            'name': 'project_admin',
            'description': 'Project administrator with full access to specific project resources',
            'level': 80,
            'is_system_role': False,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000007',
            'name': 'project_member',
            'description': 'Project member with access to project resources',
            'level': 60,
            'is_system_role': False,
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000008',
            'name': 'project_viewer',
            'description': 'Project viewer with read-only access to project resources',
            'level': 40,
            'is_system_role': False,
            'is_active': True,
        },
    ]

    # Insert roles
    for role_data in roles_data:
        connection.execute(
            sa.text(
                """
                INSERT INTO roles (id, name, description, level, is_system_role, is_active, created_at, updated_at, metadata)
                VALUES (:id, :name, :description, :level, :is_system_role, :is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{}')
                ON CONFLICT (name) DO NOTHING
            """
            ),
            role_data,
        )

    # Insert default permissions
    permissions_data = [
        # System permissions
        {
            'id': '00000000-0000-0000-0000-000000000101',
            'name': 'system:manage:global',
            'resource_type': 'system',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000102',
            'name': 'user:manage:global',
            'resource_type': 'user',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000103',
            'name': 'rbac:manage:global',
            'resource_type': 'system',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # Note permissions
        {
            'id': '00000000-0000-0000-0000-000000000201',
            'name': 'note:create:own',
            'resource_type': 'note',
            'operation': 'create',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000202',
            'name': 'note:read:own',
            'resource_type': 'note',
            'operation': 'read',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000203',
            'name': 'note:update:own',
            'resource_type': 'note',
            'operation': 'update',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000204',
            'name': 'note:delete:own',
            'resource_type': 'note',
            'operation': 'delete',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000205',
            'name': 'note:read:team',
            'resource_type': 'note',
            'operation': 'read',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000206',
            'name': 'note:manage:team',
            'resource_type': 'note',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000207',
            'name': 'note:manage:global',
            'resource_type': 'note',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # Todo permissions
        {
            'id': '00000000-0000-0000-0000-000000000301',
            'name': 'todo:create:own',
            'resource_type': 'todo',
            'operation': 'create',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000302',
            'name': 'todo:read:own',
            'resource_type': 'todo',
            'operation': 'read',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000303',
            'name': 'todo:update:own',
            'resource_type': 'todo',
            'operation': 'update',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000304',
            'name': 'todo:delete:own',
            'resource_type': 'todo',
            'operation': 'delete',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000305',
            'name': 'todo:read:team',
            'resource_type': 'todo',
            'operation': 'read',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000306',
            'name': 'todo:manage:team',
            'resource_type': 'todo',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000307',
            'name': 'todo:manage:global',
            'resource_type': 'todo',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # Email permissions
        {
            'id': '00000000-0000-0000-0000-000000000401',
            'name': 'email:read:own',
            'resource_type': 'email',
            'operation': 'read',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000402',
            'name': 'email:create:own',
            'resource_type': 'email',
            'operation': 'create',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000403',
            'name': 'email:manage:team',
            'resource_type': 'email',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000404',
            'name': 'email:manage:global',
            'resource_type': 'email',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # RAG Document permissions
        {
            'id': '00000000-0000-0000-0000-000000000501',
            'name': 'rag_document:read:own',
            'resource_type': 'rag_document',
            'operation': 'read',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000502',
            'name': 'rag_document:create:own',
            'resource_type': 'rag_document',
            'operation': 'create',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000503',
            'name': 'rag_document:manage:team',
            'resource_type': 'rag_document',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000504',
            'name': 'rag_document:manage:global',
            'resource_type': 'rag_document',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # ECS World permissions
        {
            'id': '00000000-0000-0000-0000-000000000601',
            'name': 'ecs_world:read:own',
            'resource_type': 'ecs_world',
            'operation': 'read',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000602',
            'name': 'ecs_world:manage:team',
            'resource_type': 'ecs_world',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000603',
            'name': 'ecs_world:manage:global',
            'resource_type': 'ecs_world',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
        # MCP Tool permissions
        {
            'id': '00000000-0000-0000-0000-000000000701',
            'name': 'mcp_tool:execute:own',
            'resource_type': 'mcp_tool',
            'operation': 'execute',
            'scope': 'own',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000702',
            'name': 'mcp_tool:manage:team',
            'resource_type': 'mcp_tool',
            'operation': 'manage',
            'scope': 'team',
            'is_active': True,
        },
        {
            'id': '00000000-0000-0000-0000-000000000703',
            'name': 'mcp_tool:manage:global',
            'resource_type': 'mcp_tool',
            'operation': 'manage',
            'scope': 'global',
            'is_active': True,
        },
    ]

    # Insert permissions
    for perm_data in permissions_data:
        connection.execute(
            sa.text(
                """
                INSERT INTO permissions (id, name, resource_type, operation, scope, is_active, created_at, updated_at, conditions, metadata)
                VALUES (:id, :name, :resource_type, :operation, :scope, :is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{}', '{}')
                ON CONFLICT (name) DO NOTHING
            """
            ),
            perm_data,
        )

    # Assign permissions to roles
    role_permissions = [
        # System admin gets all permissions
        ('system_admin', 'system:manage:global'),
        ('system_admin', 'user:manage:global'),
        ('system_admin', 'rbac:manage:global'),
        ('system_admin', 'note:manage:global'),
        ('system_admin', 'todo:manage:global'),
        ('system_admin', 'email:manage:global'),
        ('system_admin', 'rag_document:manage:global'),
        ('system_admin', 'ecs_world:manage:global'),
        ('system_admin', 'mcp_tool:manage:global'),
        # Admin gets most permissions
        ('admin', 'user:manage:global'),
        ('admin', 'note:manage:global'),
        ('admin', 'todo:manage:global'),
        ('admin', 'email:manage:global'),
        ('admin', 'rag_document:manage:global'),
        ('admin', 'ecs_world:manage:global'),
        ('admin', 'mcp_tool:manage:global'),
        # Manager gets team-level permissions
        ('manager', 'note:manage:team'),
        ('manager', 'todo:manage:team'),
        ('manager', 'email:manage:team'),
        ('manager', 'rag_document:manage:team'),
        ('manager', 'ecs_world:manage:team'),
        ('manager', 'mcp_tool:manage:team'),
        # User gets own and team read permissions
        ('user', 'note:create:own'),
        ('user', 'note:read:own'),
        ('user', 'note:update:own'),
        ('user', 'note:delete:own'),
        ('user', 'note:read:team'),
        ('user', 'todo:create:own'),
        ('user', 'todo:read:own'),
        ('user', 'todo:update:own'),
        ('user', 'todo:delete:own'),
        ('user', 'todo:read:team'),
        ('user', 'email:read:own'),
        ('user', 'email:create:own'),
        ('user', 'rag_document:read:own'),
        ('user', 'rag_document:create:own'),
        ('user', 'ecs_world:read:own'),
        ('user', 'mcp_tool:execute:own'),
        # Guest gets limited read permissions
        ('guest', 'note:read:own'),
        ('guest', 'todo:read:own'),
        ('guest', 'email:read:own'),
        ('guest', 'rag_document:read:own'),
        ('guest', 'ecs_world:read:own'),
        # Project roles get project-level permissions
        ('project_admin', 'note:manage:team'),
        ('project_admin', 'todo:manage:team'),
        ('project_admin', 'email:manage:team'),
        ('project_admin', 'rag_document:manage:team'),
        ('project_admin', 'ecs_world:manage:team'),
        ('project_admin', 'mcp_tool:manage:team'),
        ('project_member', 'note:create:own'),
        ('project_member', 'note:read:own'),
        ('project_member', 'note:update:own'),
        ('project_member', 'note:read:team'),
        ('project_member', 'todo:create:own'),
        ('project_member', 'todo:read:own'),
        ('project_member', 'todo:update:own'),
        ('project_member', 'todo:read:team'),
        ('project_member', 'email:read:own'),
        ('project_member', 'email:create:own'),
        ('project_member', 'rag_document:read:own'),
        ('project_member', 'rag_document:create:own'),
        ('project_member', 'ecs_world:read:own'),
        ('project_member', 'mcp_tool:execute:own'),
        ('project_viewer', 'note:read:own'),
        ('project_viewer', 'note:read:team'),
        ('project_viewer', 'todo:read:own'),
        ('project_viewer', 'todo:read:team'),
        ('project_viewer', 'email:read:own'),
        ('project_viewer', 'rag_document:read:own'),
        ('project_viewer', 'ecs_world:read:own'),
    ]

    # Insert role-permission assignments
    for role_name, permission_name in role_permissions:
        connection.execute(
            sa.text(
                """
                INSERT INTO role_permissions (role_id, permission_id, granted_at, is_active, conditions)
                SELECT r.id, p.id, CURRENT_TIMESTAMP, true, '{}'
                FROM roles r, permissions p
                WHERE r.name = :role_name AND p.name = :permission_name
                ON CONFLICT (role_id, permission_id) DO NOTHING
            """
            ),
            {'role_name': role_name, 'permission_name': permission_name},
        )


def downgrade() -> None:
    """Remove default RBAC roles and permissions."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Remove role-permission assignments
    connection.execute(sa.text("DELETE FROM role_permissions"))

    # Remove permissions
    connection.execute(sa.text("DELETE FROM permissions WHERE name LIKE '%:%:%'"))

    # Remove roles
    connection.execute(
        sa.text(
            "DELETE FROM roles WHERE name IN ('system_admin', 'admin', 'manager', 'user', 'guest', 'project_admin', 'project_member', 'project_viewer')"
        )
    )
