"""Add SSH key management tables

Revision ID: caa8578f93f6
Revises: ba21208304a0
Create Date: 2025-09-25 13:02:51.714015

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'caa8578f93f6'
down_revision = 'ba21208304a0'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create SSH key management tables."""
    
    # Create SSH key types enum
    ssh_key_type_enum = postgresql.ENUM(
        'rsa', 'ed25519', 'ecdsa', 'dsa',
        name='sshkeytype',
        create_type=False
    )
    ssh_key_type_enum.create(op.get_bind(), checkfirst=True)
    
    # Create SSH key status enum
    ssh_key_status_enum = postgresql.ENUM(
        'active', 'inactive', 'revoked', 'expired', 'pending',
        name='sshkeystatus',
        create_type=False
    )
    ssh_key_status_enum.create(op.get_bind(), checkfirst=True)
    
    # Create SSH key usage enum
    ssh_key_usage_enum = postgresql.ENUM(
        'authentication', 'signing', 'encryption', 'multipurpose',
        name='sshkeyusage',
        create_type=False
    )
    ssh_key_usage_enum.create(op.get_bind(), checkfirst=True)
    
    # Create ssh_keys table
    op.create_table(
        'ssh_keys',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key_id', sa.String(length=255), nullable=False),
        sa.Column('fingerprint', sa.String(length=255), nullable=False),
        sa.Column('public_key_hash', sa.String(length=64), nullable=False),
        sa.Column('key_type', ssh_key_type_enum, nullable=False),
        sa.Column('key_length', sa.Integer(), nullable=False),
        sa.Column('algorithm', sa.String(length=50), nullable=False),
        sa.Column('comment', sa.String(length=255), nullable=True),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('public_key_openssh', sa.Text(), nullable=False),
        sa.Column('private_key_openssh', sa.Text(), nullable=True),
        sa.Column('passphrase_hash', sa.String(length=255), nullable=True),
        sa.Column('status', ssh_key_status_enum, nullable=False),
        sa.Column('usage', ssh_key_usage_enum, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
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
        sa.Column('allowed_hosts', sa.Text(), nullable=True),
        sa.Column('allowed_commands', sa.Text(), nullable=True),
        sa.Column('source_restrictions', sa.Text(), nullable=True),
        sa.Column('force_command', sa.String(length=255), nullable=True),
        sa.Column('key_metadata', sa.Text(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('fingerprint'),
        sa.UniqueConstraint('key_id')
    )
    
    # Create indexes for ssh_keys table
    op.create_index(op.f('ix_ssh_keys_fingerprint'), 'ssh_keys', ['fingerprint'], unique=False)
    op.create_index(op.f('ix_ssh_keys_is_primary'), 'ssh_keys', ['is_primary'], unique=False)
    op.create_index(op.f('ix_ssh_keys_is_revoked'), 'ssh_keys', ['is_revoked'], unique=False)
    op.create_index(op.f('ix_ssh_keys_key_id'), 'ssh_keys', ['key_id'], unique=False)
    op.create_index(op.f('ix_ssh_keys_public_key_hash'), 'ssh_keys', ['public_key_hash'], unique=False)
    op.create_index(op.f('ix_ssh_keys_status'), 'ssh_keys', ['status'], unique=False)
    op.create_index(op.f('ix_ssh_keys_user_id'), 'ssh_keys', ['user_id'], unique=False)
    op.create_index(op.f('ix_ssh_keys_email'), 'ssh_keys', ['email'], unique=False)
    
    # Create ssh_key_access_logs table
    op.create_table(
        'ssh_key_access_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('key_id', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('operation', sa.String(length=100), nullable=False),
        sa.Column('success', sa.Boolean(), nullable=False),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.Text(), nullable=True),
        sa.Column('request_id', sa.String(length=255), nullable=True),
        sa.Column('target_host', sa.String(length=255), nullable=True),
        sa.Column('target_user', sa.String(length=255), nullable=True),
        sa.Column('command_executed', sa.Text(), nullable=True),
        sa.Column('admin_action', sa.Boolean(), nullable=True),
        sa.Column('admin_user_id', sa.String(length=255), nullable=True),
        sa.Column('target_user_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for ssh_key_access_logs table
    op.create_index(op.f('ix_ssh_key_access_logs_key_id'), 'ssh_key_access_logs', ['key_id'], unique=False)
    op.create_index(op.f('ix_ssh_key_access_logs_operation'), 'ssh_key_access_logs', ['operation'], unique=False)
    op.create_index(op.f('ix_ssh_key_access_logs_success'), 'ssh_key_access_logs', ['success'], unique=False)
    op.create_index(op.f('ix_ssh_key_access_logs_user_id'), 'ssh_key_access_logs', ['user_id'], unique=False)
    
    # Create ssh_key_rotation_logs table
    op.create_table(
        'ssh_key_rotation_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('old_key_id', sa.String(length=255), nullable=True),
        sa.Column('new_key_id', sa.String(length=255), nullable=False),
        sa.Column('user_id', sa.String(length=255), nullable=False),
        sa.Column('rotation_type', sa.String(length=50), nullable=False),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('initiated_by', sa.String(length=255), nullable=False),
        sa.Column('old_key_expired', sa.Boolean(), nullable=True),
        sa.Column('old_key_revoked', sa.Boolean(), nullable=True),
        sa.Column('migration_completed', sa.Boolean(), nullable=True),
        sa.Column('authorized_keys_updated', sa.Boolean(), nullable=True),
        sa.Column('target_hosts', sa.Text(), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('rotation_metadata', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for ssh_key_rotation_logs table
    op.create_index(op.f('ix_ssh_key_rotation_logs_new_key_id'), 'ssh_key_rotation_logs', ['new_key_id'], unique=False)
    op.create_index(op.f('ix_ssh_key_rotation_logs_old_key_id'), 'ssh_key_rotation_logs', ['old_key_id'], unique=False)
    op.create_index(op.f('ix_ssh_key_rotation_logs_user_id'), 'ssh_key_rotation_logs', ['user_id'], unique=False)


def downgrade() -> None:
    """Drop SSH key management tables."""
    
    # Drop tables
    op.drop_table('ssh_key_rotation_logs')
    op.drop_table('ssh_key_access_logs')
    op.drop_table('ssh_keys')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS sshkeyusage')
    op.execute('DROP TYPE IF EXISTS sshkeystatus')
    op.execute('DROP TYPE IF EXISTS sshkeytype')
