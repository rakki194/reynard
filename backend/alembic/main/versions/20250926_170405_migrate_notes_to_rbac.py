"""Migrate notes system to RBAC

Revision ID: 20250926_170405
Revises: notes_todos_schema
Create Date: 2025-09-26 17:04:05.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250926_170405'
down_revision = '755416c2fdcb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Migrate notes system from simple permissions to RBAC."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Check if note_collaborations table exists before trying to migrate data
    table_exists = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'note_collaborations'
        );
    """
        )
    ).scalar()

    if not table_exists:
        print("Note collaborations table doesn't exist, skipping data migration")
        return

    # First, migrate existing note collaborations to RBAC
    # We'll create ResourceAccessControl entries for existing collaborations

    # Get all existing note collaborations
    collaborations = connection.execute(
        sa.text(
            """
        SELECT nc.id, nc.note_id, nc.collaborator_id, nc.permission, nc.created_at
        FROM note_collaborations nc
    """
        )
    ).fetchall()

    # Create ResourceAccessControl entries for each collaboration
    for collab in collaborations:
        # Map old permission strings to RBAC permission levels
        permission_mapping = {'read': 'viewer', 'write': 'editor', 'admin': 'owner'}

        permission_level = permission_mapping.get(collab.permission, 'viewer')

        # Create ResourceAccessControl entry
        connection.execute(
            sa.text(
                """
            INSERT INTO resource_access_control (
                id, resource_type, resource_id, subject_type, subject_id, 
                permission_level, granted_at, is_active, conditions, metadata
            ) VALUES (
                gen_random_uuid(), 'note', :resource_id, 'user', :subject_id,
                :permission_level, :granted_at, true, '{}', '{}'
            )
        """
            ),
            {
                'resource_id': str(collab.note_id),
                'subject_id': str(collab.collaborator_id),
                'permission_level': permission_level,
                'granted_at': collab.created_at,
            },
        )

    # Also create owner permissions for note creators
    # Check if notes table exists
    notes_table_exists = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'notes'
        );
    """
        )
    ).scalar()

    if not notes_table_exists:
        print("Notes table doesn't exist, skipping note owner permission migration")
        return

    # Get all notes and create owner permissions for their creators
    notes = connection.execute(
        sa.text(
            """
        SELECT id, agent_id, created_at
        FROM notes
    """
        )
    ).fetchall()

    for note in notes:
        # Create owner permission for note creator
        connection.execute(
            sa.text(
                """
            INSERT INTO resource_access_control (
                id, resource_type, resource_id, subject_type, subject_id,
                permission_level, granted_at, is_active, conditions, metadata
            ) VALUES (
                gen_random_uuid(), 'note', :resource_id, 'user', :subject_id,
                'owner', :granted_at, true, '{}', '{"migrated": true, "source": "note_creator"}'
            )
        """
            ),
            {
                'resource_id': str(note.id),
                'subject_id': str(note.agent_id),
                'granted_at': note.created_at,
            },
        )

    # Create owner permissions for notebook creators
    notebooks = connection.execute(
        sa.text(
            """
        SELECT id, agent_id, created_at
        FROM notebooks
    """
        )
    ).fetchall()

    for notebook in notebooks:
        # Create owner permission for notebook creator
        connection.execute(
            sa.text(
                """
            INSERT INTO resource_access_control (
                id, resource_type, resource_id, subject_type, subject_id,
                permission_level, granted_at, is_active, conditions, metadata
            ) VALUES (
                gen_random_uuid(), 'notebook', :resource_id, 'user', :subject_id,
                'owner', :granted_at, true, '{}', '{"migrated": true, "source": "notebook_creator"}'
            )
        """
            ),
            {
                'resource_id': str(notebook.id),
                'subject_id': str(notebook.agent_id),
                'granted_at': notebook.created_at,
            },
        )

    # Create owner permissions for todo creators
    todos = connection.execute(
        sa.text(
            """
        SELECT id, agent_id, created_at
        FROM todos
    """
        )
    ).fetchall()

    for todo in todos:
        # Create owner permission for todo creator
        connection.execute(
            sa.text(
                """
            INSERT INTO resource_access_control (
                id, resource_type, resource_id, subject_type, subject_id,
                permission_level, granted_at, is_active, conditions, metadata
            ) VALUES (
                gen_random_uuid(), 'todo', :resource_id, 'user', :subject_id,
                'owner', :granted_at, true, '{}', '{"migrated": true, "source": "todo_creator"}'
            )
        """
            ),
            {
                'resource_id': str(todo.id),
                'subject_id': str(todo.agent_id),
                'granted_at': todo.created_at,
            },
        )

    # Now remove the permission field from note_collaborations
    # We'll keep the table for now but remove the permission column
    # The collaborations will be managed through RBAC going forward

    # Add a comment to indicate the table is now managed by RBAC
    connection.execute(
        sa.text(
            """
        COMMENT ON TABLE note_collaborations IS 'Legacy table - permissions now managed by RBAC system'
    """
        )
    )

    # Add a comment to the permission column
    connection.execute(
        sa.text(
            """
        COMMENT ON COLUMN note_collaborations.permission IS 'Legacy field - permissions now managed by RBAC system'
    """
        )
    )

    # Create indexes for better performance on RBAC queries
    connection.execute(
        sa.text(
            """
        CREATE INDEX IF NOT EXISTS idx_resource_access_control_resource_lookup 
        ON resource_access_control (resource_type, resource_id, is_active)
    """
        )
    )

    connection.execute(
        sa.text(
            """
        CREATE INDEX IF NOT EXISTS idx_resource_access_control_subject_lookup 
        ON resource_access_control (subject_type, subject_id, is_active)
    """
        )
    )

    connection.execute(
        sa.text(
            """
        CREATE INDEX IF NOT EXISTS idx_resource_access_control_permission_lookup 
        ON resource_access_control (resource_type, permission_level, is_active)
    """
        )
    )


def downgrade() -> None:
    """Downgrade notes system from RBAC to simple permissions."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Remove the RBAC indexes
    connection.execute(
        sa.text("DROP INDEX IF EXISTS idx_resource_access_control_permission_lookup")
    )
    connection.execute(
        sa.text("DROP INDEX IF EXISTS idx_resource_access_control_subject_lookup")
    )
    connection.execute(
        sa.text("DROP INDEX IF EXISTS idx_resource_access_control_resource_lookup")
    )

    # Remove comments
    connection.execute(
        sa.text("COMMENT ON COLUMN note_collaborations.permission IS NULL")
    )
    connection.execute(sa.text("COMMENT ON TABLE note_collaborations IS NULL"))

    # Remove migrated RBAC entries
    connection.execute(
        sa.text(
            """
        DELETE FROM resource_access_control 
        WHERE metadata->>'migrated' = 'true'
    """
        )
    )

    # Note: We don't restore the old permission values since they were migrated
    # The downgrade assumes the system is being rolled back before the migration
