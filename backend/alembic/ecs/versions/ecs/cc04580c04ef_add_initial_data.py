"""add_initial_data

Revision ID: cc04580c04ef
Revises: 02688a8589a7
Create Date: 2025-09-20 22:02:02.853279

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cc04580c04ef"
down_revision: Union[str, Sequence[str], None] = "b16020be0286"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add initial data."""
    import uuid
    from datetime import datetime

    # Get table references
    naming_components = sa.table(
        "naming_components",
        sa.column("id", sa.UUID),
        sa.column("component_type", sa.String),
        sa.column("component_name", sa.String),
        sa.column("component_value", sa.String),
        sa.column("enabled", sa.Boolean),
        sa.column("weight", sa.Float),
        sa.column("component_metadata", sa.JSON),
        sa.column("created_at", sa.DateTime),
        sa.column("updated_at", sa.DateTime),
    )

    naming_config = sa.table(
        "naming_config",
        sa.column("id", sa.UUID),
        sa.column("config_key", sa.String),
        sa.column("config_value", sa.JSON),
        sa.column("description", sa.Text),
        sa.column("enabled", sa.Boolean),
        sa.column("created_at", sa.DateTime),
        sa.column("updated_at", sa.DateTime),
    )

    now = datetime.utcnow()

    # Insert naming components data
    components_data = [
        {
            "id": str(uuid.uuid4()),
            "component_type": "suffix",
            "component_name": "foundation",
            "component_value": "Prime",
            "enabled": True,
            "weight": 1.0,
            "component_metadata": {
                "style": "foundation",
                "description": "Strategic, intellectual suffixes",
            },
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "component_type": "suffix",
            "component_name": "exo",
            "component_value": "Guard",
            "enabled": True,
            "weight": 1.0,
            "component_metadata": {
                "style": "exo",
                "description": "Combat/technical operational names",
            },
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "component_type": "suffix",
            "component_name": "hybrid",
            "component_value": "Quantum",
            "enabled": True,
            "weight": 1.0,
            "component_metadata": {
                "style": "hybrid",
                "description": "Mythological/historical references",
            },
            "created_at": now,
            "updated_at": now,
        },
    ]

    # Insert naming config data
    config_data = [
        {
            "id": str(uuid.uuid4()),
            "config_key": "default_style",
            "config_value": "foundation",
            "description": "Default naming style for new agents",
            "enabled": True,
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "config_key": "generation_sequence",
            "config_value": {
                "fox": [3, 7, 13, 21, 34, 55, 89],
                "wolf": [8, 16, 24, 32, 40, 48, 56],
            },
            "description": "Generation number sequences for different spirits",
            "enabled": True,
            "created_at": now,
            "updated_at": now,
        },
    ]

    # Insert the data
    op.bulk_insert(naming_components, components_data)
    op.bulk_insert(naming_config, config_data)


def downgrade() -> None:
    """Remove initial data."""
    # Clear the data tables
    op.execute("DELETE FROM naming_config")
    op.execute("DELETE FROM naming_components")
    op.execute("DELETE FROM naming_spirits")
