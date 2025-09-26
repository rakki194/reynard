"""Add PGP key management tables

Revision ID: ba21208304a0
Revises:
Create Date: 2025-09-25 12:48:47.150005

"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'ba21208304a0'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create PGP key management tables."""

    # Create PGP key types enum
    pgp_key_type_enum = postgresql.ENUM(
        'rsa', 'dsa', 'elgamal', 'ecdsa', 'eddsa', name='pgpkeytype', create_type=False
    )
    pgp_key_type_enum.create(op.get_bind(), checkfirst=True)

    # Create PGP key status enum
    pgp_key_status_enum = postgresql.ENUM(
        'active',
        'inactive',
        'revoked',
        'expired',
        'pending',
        name='pgpkeystatus',
        create_type=False,
    )
    pgp_key_status_enum.create(op.get_bind(), checkfirst=True)

    # Create pgp_keys table
    op.create_table(
        'pgp_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key_id', sa.String(length=16), nullable=False),
        sa.Column('fingerprint', sa.String(length=40), nullable=False),
        sa.Column('short_fingerprint', sa.String(length=8), nullable=False),
        sa.Column('key_type', pgp_key_type_enum, nullable=False),
        sa.Column('key_length', sa.Integer(), nullable=False),
        sa.Column('algorithm', sa.String(length=50), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('public_key_armored', sa.Text(), nullable=False),
        sa.Column('private_key_armored', sa.Text(), nullable=True),
        sa.Column('passphrase_hash', sa.String(length=255), nullable=True),
        sa.Column('status', pgp_key_status_enum, nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used', sa.DateTime(timezone=True), nullable=True),
        sa.Column('usage_count', sa.Integer(), nullable=True),
        sa.Column('is_primary', sa.Boolean(), nullable=True),
        sa.Column('auto_rotate', sa.Boolean(), nullable=True),
        sa.Column('rotation_schedule_days', sa.Integer(), nullable=True),
        sa.Column('trust_level', sa.Integer(), nullable=True),
        sa.Column('is_revoked', sa.Boolean(), nullable=True),
        sa.Column('revocation_reason', sa.Text(), nullable=True),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('revoked_by', sa.String(length=255), nullable=True),
        sa.Column('key_metadata', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('fingerprint'),
        sa.UniqueConstraint('key_id'),
    )

    # Create indexes for pgp_keys table
    op.create_index(
        op.f('ix_pgp_keys_fingerprint'), 'pgp_keys', ['fingerprint'], unique=False
    )
    op.create_index(
        op.f('ix_pgp_keys_is_primary'), 'pgp_keys', ['is_primary'], unique=False
    )
    op.create_index(
        op.f('ix_pgp_keys_is_revoked'), 'pgp_keys', ['is_revoked'], unique=False
    )
    op.create_index(op.f('ix_pgp_keys_key_id'), 'pgp_keys', ['key_id'], unique=False)
    op.create_index(
        op.f('ix_pgp_keys_short_fingerprint'),
        'pgp_keys',
        ['short_fingerprint'],
        unique=False,
    )
    op.create_index(op.f('ix_pgp_keys_status'), 'pgp_keys', ['status'], unique=False)
    op.create_index(op.f('ix_pgp_keys_user_id'), 'pgp_keys', ['user_id'], unique=False)
    op.create_index(op.f('ix_pgp_keys_email'), 'pgp_keys', ['email'], unique=False)

    # Create pgp_key_access_logs table
    op.create_table(
        'pgp_key_access_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key_id', sa.String(length=16), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('operation', sa.String(length=100), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_id', sa.String(length=255), nullable=True),
        sa.Column('admin_action', sa.Boolean(), nullable=True),
        sa.Column('admin_user_id', sa.String(length=255), nullable=True),
        sa.Column('target_user_id', sa.String(length=255), nullable=True),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for pgp_key_access_logs table
    op.create_index(
        op.f('ix_pgp_key_access_logs_key_id'),
        'pgp_key_access_logs',
        ['key_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pgp_key_access_logs_operation'),
        'pgp_key_access_logs',
        ['operation'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pgp_key_access_logs_success'),
        'pgp_key_access_logs',
        ['success'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pgp_key_access_logs_user_id'),
        'pgp_key_access_logs',
        ['user_id'],
        unique=False,
    )

    # Create pgp_key_rotation_logs table
    op.create_table(
        'pgp_key_rotation_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('old_key_id', sa.String(length=16), nullable=True),
        sa.Column('new_key_id', sa.String(length=16), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('rotation_type', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('initiated_by', sa.String(length=255), nullable=False),
        sa.Column('old_key_expired', sa.Boolean(), nullable=True),
        sa.Column('old_key_revoked', sa.Boolean(), nullable=True),
        sa.Column('migration_completed', sa.Boolean(), nullable=True),
        sa.Column(
            'started_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('CURRENT_TIMESTAMP'),
            nullable=False,
        ),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rotation_metadata', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )

    # Create indexes for pgp_key_rotation_logs table
    op.create_index(
        op.f('ix_pgp_key_rotation_logs_new_key_id'),
        'pgp_key_rotation_logs',
        ['new_key_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pgp_key_rotation_logs_old_key_id'),
        'pgp_key_rotation_logs',
        ['old_key_id'],
        unique=False,
    )
    op.create_index(
        op.f('ix_pgp_key_rotation_logs_user_id'),
        'pgp_key_rotation_logs',
        ['user_id'],
        unique=False,
    )


def downgrade() -> None:
    """Drop PGP key management tables."""

    # Drop tables
    op.drop_table('pgp_key_rotation_logs')
    op.drop_table('pgp_key_access_logs')
    op.drop_table('pgp_keys')

    # Drop enums
    op.execute('DROP TYPE IF EXISTS pgpkeystatus')
    op.execute('DROP TYPE IF EXISTS pgpkeytype')
