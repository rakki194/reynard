"""Migrate email system to RBAC

Revision ID: 20250926_171719
Revises: 20250926_170405
Create Date: 2025-09-26 17:17:19.000000

"""

import json
import os
from pathlib import Path

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '20250926_171719'
down_revision = '20250926_170405'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Migrate email system from boolean permissions to RBAC."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Check if resource_access_control table exists before proceeding
    rbac_table_exists = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'resource_access_control'
        );
    """
        )
    ).scalar()

    if not rbac_table_exists:
        print(
            "Resource access control table doesn't exist, skipping email RBAC migration"
        )
        return

    # First, let's migrate existing email account permissions to RBAC
    # We need to read the existing permissions from the file system

    # Path to the multi-account data directory
    data_dir = Path("data/multi_account")
    permissions_file = data_dir / "permissions.json"
    accounts_file = data_dir / "accounts.json"

    if permissions_file.exists() and accounts_file.exists():
        # Load existing permissions and accounts
        with open(permissions_file, 'r') as f:
            permissions_data = json.load(f)

        with open(accounts_file, 'r') as f:
            accounts_data = json.load(f)

        # Create ResourceAccessControl entries for each account
        for account_id, perm_data in permissions_data.items():
            if account_id in accounts_data:
                account_data = accounts_data[account_id]
                email_address = account_data.get('email_address', '')
                account_type = account_data.get('account_type', 'user')
                created_at = account_data.get('created_at', '2025-01-01T00:00:00')

                # Create owner permission for the account creator
                connection.execute(
                    sa.text(
                        """
                    INSERT INTO resource_access_control (
                        id, resource_type, resource_id, subject_type, subject_id,
                        permission_level, granted_at, is_active, conditions, metadata
                    ) VALUES (
                        gen_random_uuid(), 'email_account', :resource_id, 'user', :subject_id,
                        'owner', :granted_at, true, '{}', :metadata
                    )
                """
                    ),
                    {
                        'resource_id': account_id,
                        'subject_id': account_id,  # For now, assume account owner is same as account ID
                        'granted_at': created_at,
                        'metadata': json.dumps(
                            {
                                'migrated': True,
                                'source': 'email_account_owner',
                                'email_address': email_address,
                                'account_type': account_type,
                            }
                        ),
                    },
                )

                # Create specific permissions based on boolean flags
                permissions_to_create = []

                if perm_data.get('can_send_emails', True):
                    permissions_to_create.append(
                        {
                            'operation': 'send',
                            'level': 'editor',
                            'description': 'Can send emails',
                        }
                    )

                if perm_data.get('can_receive_emails', True):
                    permissions_to_create.append(
                        {
                            'operation': 'receive',
                            'level': 'viewer',
                            'description': 'Can receive emails',
                        }
                    )

                if perm_data.get('can_use_encryption', True):
                    permissions_to_create.append(
                        {
                            'operation': 'encrypt',
                            'level': 'editor',
                            'description': 'Can use encryption',
                        }
                    )

                if perm_data.get('can_schedule_meetings', True):
                    permissions_to_create.append(
                        {
                            'operation': 'schedule',
                            'level': 'editor',
                            'description': 'Can schedule meetings',
                        }
                    )

                if perm_data.get('can_use_ai_responses', True):
                    permissions_to_create.append(
                        {
                            'operation': 'ai_responses',
                            'level': 'editor',
                            'description': 'Can use AI responses',
                        }
                    )

                if perm_data.get('can_access_analytics', True):
                    permissions_to_create.append(
                        {
                            'operation': 'analytics',
                            'level': 'viewer',
                            'description': 'Can access analytics',
                        }
                    )

                if perm_data.get('can_manage_other_accounts', False):
                    permissions_to_create.append(
                        {
                            'operation': 'manage',
                            'level': 'owner',
                            'description': 'Can manage other accounts',
                        }
                    )

                # Create specific permissions for each capability
                for perm in permissions_to_create:
                    connection.execute(
                        sa.text(
                            """
                        INSERT INTO resource_access_control (
                            id, resource_type, resource_id, subject_type, subject_id,
                            permission_level, granted_at, is_active, conditions, metadata
                        ) VALUES (
                            gen_random_uuid(), 'email_account', :resource_id, 'user', :subject_id,
                            :permission_level, :granted_at, true, :conditions, :metadata
                        )
                    """
                        ),
                        {
                            'resource_id': account_id,
                            'subject_id': account_id,
                            'permission_level': perm['level'],
                            'granted_at': created_at,
                            'conditions': json.dumps(
                                {
                                    'operation': perm['operation'],
                                    'max_emails_per_day': perm_data.get(
                                        'max_emails_per_day', 1000
                                    ),
                                    'max_storage_mb': perm_data.get(
                                        'max_storage_mb', 1000
                                    ),
                                    'allowed_domains': perm_data.get(
                                        'allowed_domains', []
                                    ),
                                    'blocked_domains': perm_data.get(
                                        'blocked_domains', []
                                    ),
                                }
                            ),
                            'metadata': json.dumps(
                                {
                                    'migrated': True,
                                    'source': 'email_permission',
                                    'operation': perm['operation'],
                                    'description': perm['description'],
                                }
                            ),
                        },
                    )

    # Check if resource_access_control table exists before creating indexes
    rbac_table_exists = connection.execute(
        sa.text(
            """
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'resource_access_control'
        );
    """
        )
    ).scalar()

    if not rbac_table_exists:
        print(
            "Resource access control table doesn't exist, skipping RBAC index creation"
        )
        return

    # Create indexes for better performance on email RBAC queries
    connection.execute(
        sa.text(
            """
        CREATE INDEX IF NOT EXISTS idx_email_rbac_resource_lookup 
        ON resource_access_control (resource_type, resource_id, is_active)
        WHERE resource_type = 'email_account'
    """
        )
    )

    connection.execute(
        sa.text(
            """
        CREATE INDEX IF NOT EXISTS idx_email_rbac_operation_lookup 
        ON resource_access_control (resource_type, conditions, is_active)
        WHERE resource_type = 'email_account'
    """
        )
    )

    # Add a comment to indicate the migration
    connection.execute(
        sa.text(
            """
        COMMENT ON TABLE resource_access_control IS 'RBAC table - includes migrated email account permissions'
    """
        )
    )


def downgrade() -> None:
    """Downgrade email system from RBAC to boolean permissions."""

    # Create a connection to execute raw SQL
    connection = op.get_bind()

    # Remove the email-specific indexes
    connection.execute(sa.text("DROP INDEX IF EXISTS idx_email_rbac_operation_lookup"))
    connection.execute(sa.text("DROP INDEX IF EXISTS idx_email_rbac_resource_lookup"))

    # Remove migrated email RBAC entries
    connection.execute(
        sa.text(
            """
        DELETE FROM resource_access_control 
        WHERE resource_type = 'email_account' 
        AND metadata->>'migrated' = 'true'
    """
        )
    )

    # Remove comment
    connection.execute(sa.text("COMMENT ON TABLE resource_access_control IS NULL"))
