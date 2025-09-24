"""fix_success_advisor_8_spirit_to_lion

Revision ID: fc949a6025ca
Revises: fix_permissions_001
Create Date: 2025-09-21 17:12:00.334928

"""

# pylint: disable=no-member
from collections.abc import Sequence

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "fc949a6025ca"
down_revision: str | Sequence[str] | None = "fix_permissions_001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Fix Success-Advisor-8 spirit from lizard to lion."""
    # Update Success-Advisor-8's spirit to lion (correcting the lizard assignment)
    op.execute(
        """
        UPDATE agents
        SET spirit = 'lion'
        WHERE agent_id = 'permanent-release-manager-success-advisor-8'
        AND spirit = 'lizard';
    """,
    )

    # Also update any agent with the name 'Success-Advisor-8' to ensure consistency
    op.execute(
        """
        UPDATE agents
        SET spirit = 'lion'
        WHERE name = 'Success-Advisor-8'
        AND spirit != 'lion';
    """,
    )


def downgrade() -> None:
    """Revert Success-Advisor-8 spirit back to lizard (if needed)."""
    # Revert Success-Advisor-8's spirit back to lizard
    op.execute(
        """
        UPDATE agents
        SET spirit = 'lizard'
        WHERE agent_id = 'permanent-release-manager-success-advisor-8'
        AND spirit = 'lion';
    """,
    )

    # Also revert any agent with the name 'Success-Advisor-8'
    op.execute(
        """
        UPDATE agents
        SET spirit = 'lizard'
        WHERE name = 'Success-Advisor-8'
        AND spirit = 'lion';
    """,
    )
