"""Add notes and todos tables to ECS database

Revision ID: notes_todos_001
Revises: b16020be0286
Create Date: 2025-01-27 20:15:00.000000

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "notes_todos_001"
down_revision = "b16020be0286"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add notes and todos tables to the ECS database."""
    # Create notebooks table
    op.create_table(
        "notebooks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "color", sa.String(7), nullable=False, default="#3b82f6",
        ),  # Hex color
        sa.Column("is_public", sa.Boolean(), nullable=False, default=False),
        sa.Column("is_archived", sa.Boolean(), nullable=False, default=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notebooks_agent_id", "notebooks", ["agent_id"])
    op.create_index("ix_notebooks_created_at", "notebooks", ["created_at"])
    op.create_index("ix_notebooks_is_public", "notebooks", ["is_public"])
    op.create_index("ix_notebooks_is_archived", "notebooks", ["is_archived"])

    # Create notes table
    op.create_table(
        "notes",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False, default=""),
        sa.Column(
            "content_type", sa.String(20), nullable=False, default="markdown",
        ),  # markdown, rich-text, code
        sa.Column("is_favorite", sa.Boolean(), nullable=False, default=False),
        sa.Column("is_archived", sa.Boolean(), nullable=False, default=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("notebook_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["notebook_id"], ["notebooks.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_notes_notebook_id", "notes", ["notebook_id"])
    op.create_index("ix_notes_agent_id", "notes", ["agent_id"])
    op.create_index("ix_notes_created_at", "notes", ["created_at"])
    op.create_index("ix_notes_updated_at", "notes", ["updated_at"])
    op.create_index("ix_notes_is_favorite", "notes", ["is_favorite"])
    op.create_index("ix_notes_is_archived", "notes", ["is_archived"])
    op.create_index("ix_notes_content_type", "notes", ["content_type"])

    # Create todos table
    op.create_table(
        "todos",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False, default=False),
        sa.Column(
            "priority", sa.String(10), nullable=False, default="medium",
        ),  # low, medium, high, urgent
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_todos_agent_id", "todos", ["agent_id"])
    op.create_index("ix_todos_created_at", "todos", ["created_at"])
    op.create_index("ix_todos_updated_at", "todos", ["updated_at"])
    op.create_index("ix_todos_completed", "todos", ["completed"])
    op.create_index("ix_todos_priority", "todos", ["priority"])
    op.create_index("ix_todos_due_date", "todos", ["due_date"])

    # Create tags table
    op.create_table(
        "tags",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column(
            "color", sa.String(7), nullable=False, default="#6b7280",
        ),  # Hex color
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name", "agent_id", name="uq_tag_name_agent"),
    )
    op.create_index("ix_tags_agent_id", "tags", ["agent_id"])
    op.create_index("ix_tags_name", "tags", ["name"])

    # Create note_tags junction table
    op.create_table(
        "note_tags",
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("note_id", "tag_id"),
    )

    # Create todo_tags junction table
    op.create_table(
        "todo_tags",
        sa.Column("todo_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["todo_id"], ["todos.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("todo_id", "tag_id"),
    )

    # Create note_attachments table
    op.create_table(
        "note_attachments",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_note_attachments_note_id", "note_attachments", ["note_id"])

    # Create note_collaborations table
    op.create_table(
        "note_collaborations",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column(
            "permission", sa.String(20), nullable=False, default="read",
        ),  # read, write, admin
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("collaborator_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["collaborator_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("note_id", "collaborator_id", name="uq_note_collaboration"),
    )
    op.create_index(
        "ix_note_collaborations_note_id", "note_collaborations", ["note_id"],
    )
    op.create_index(
        "ix_note_collaborations_collaborator_id",
        "note_collaborations",
        ["collaborator_id"],
    )

    # Create note_versions table for history tracking
    op.create_table(
        "note_versions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("change_summary", sa.String(500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("note_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["note_id"], ["notes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_note_versions_note_id", "note_versions", ["note_id"])
    op.create_index(
        "ix_note_versions_version_number", "note_versions", ["version_number"],
    )
    op.create_index("ix_note_versions_created_at", "note_versions", ["created_at"])

    # Create ai_metadata table for AI features
    op.create_table(
        "ai_metadata",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            nullable=False,
            default=sa.text("uuid_generate_v4()"),
        ),
        sa.Column("entity_type", sa.String(20), nullable=False),  # note, todo, notebook
        sa.Column("entity_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "ai_type", sa.String(50), nullable=False,
        ),  # summary, tags, categorization, etc.
        sa.Column("ai_data", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=True),
        sa.Column("model_used", sa.String(100), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("agent_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.ForeignKeyConstraint(["agent_id"], ["agents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_metadata_entity_type", "ai_metadata", ["entity_type"])
    op.create_index("ix_ai_metadata_entity_id", "ai_metadata", ["entity_id"])
    op.create_index("ix_ai_metadata_ai_type", "ai_metadata", ["ai_type"])
    op.create_index("ix_ai_metadata_agent_id", "ai_metadata", ["agent_id"])


def downgrade() -> None:
    """Remove notes and todos tables from the ECS database."""
    # Drop tables in reverse order to handle foreign key constraints
    op.drop_table("ai_metadata")
    op.drop_table("note_versions")
    op.drop_table("note_collaborations")
    op.drop_table("note_attachments")
    op.drop_table("todo_tags")
    op.drop_table("note_tags")
    op.drop_table("tags")
    op.drop_table("todos")
    op.drop_table("notes")
    op.drop_table("notebooks")
