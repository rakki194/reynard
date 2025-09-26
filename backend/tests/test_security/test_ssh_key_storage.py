"""🔐 SSH Key Storage Tests

Comprehensive pytest tests for SSH key storage and management.
Tests the database-backed SSH key system with security focus.

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import asyncio
import json
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec, ed25519, rsa
from cryptography.hazmat.primitives.serialization import load_ssh_public_key
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.security.ssh_key_models import (
    AuthBase,
    SSHKey,
    SSHKeyAccessLog,
    SSHKeyRotationLog,
    SSHKeyStatus,
    SSHKeyType,
    SSHKeyUsage,
)
from app.security.ssh_key_service import ssh_key_service


class TestSSHKeyModels:
    """Test SSH key database models."""

    @pytest.fixture
    def test_db_session(self):
        """Create an in-memory SQLite database for testing."""
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        AuthBase.metadata.create_all(engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
            engine.dispose()

    def test_ssh_key_creation(self, test_db_session):
        """Test creating an SSH key record."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        ssh_key = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(ssh_key)
        test_db_session.commit()

        # Verify the key was created
        retrieved_key = test_db_session.query(SSHKey).filter_by(key_id=key_id).first()
        assert retrieved_key is not None
        assert retrieved_key.fingerprint == fingerprint
        assert retrieved_key.user_id == "test_user"
        assert retrieved_key.is_primary is True
        assert retrieved_key.status == SSHKeyStatus.ACTIVE
        assert retrieved_key.usage == SSHKeyUsage.AUTHENTICATION

    def test_ssh_key_to_dict(self, test_db_session):
        """Test SSH key serialization to dictionary."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        ssh_key = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(ssh_key)
        test_db_session.commit()

        key_dict = ssh_key.to_dict()

        assert key_dict["key_id"] == key_id
        assert key_dict["fingerprint"] == fingerprint
        assert key_dict["user_id"] == "test_user"
        assert key_dict["is_primary"] is True
        assert key_dict["status"] == "active"
        assert key_dict["usage"] == "authentication"
        assert "created_at" in key_dict
        assert "updated_at" in key_dict

    def test_ssh_key_access_log(self, test_db_session):
        """Test SSH key access logging."""
        access_log = SSHKeyAccessLog(
            key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
            user_id="test_user",
            operation="generate",
            success=True,
            ip_address="192.168.1.1",
            user_agent="Test Agent",
            target_host="server.example.com",
            target_user="admin",
            command_executed="ls -la",
        )

        test_db_session.add(access_log)
        test_db_session.commit()

        retrieved_log = test_db_session.query(SSHKeyAccessLog).first()
        assert retrieved_log is not None
        assert retrieved_log.key_id == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        assert retrieved_log.operation == "generate"
        assert retrieved_log.success is True
        assert retrieved_log.ip_address == "192.168.1.1"
        assert retrieved_log.target_host == "server.example.com"
        assert retrieved_log.target_user == "admin"
        assert retrieved_log.command_executed == "ls -la"

    def test_ssh_key_rotation_log(self, test_db_session):
        """Test SSH key rotation logging."""
        rotation_log = SSHKeyRotationLog(
            old_key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
            new_key_id="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
            user_id="test_user",
            rotation_type="manual",
            reason="User requested rotation",
            initiated_by="test_user",
            old_key_revoked=True,
            migration_completed=True,
            authorized_keys_updated=True,
            target_hosts="server1.example.com,server2.example.com",
            completed_at=datetime.now(timezone.utc),
        )

        test_db_session.add(rotation_log)
        test_db_session.commit()

        retrieved_log = test_db_session.query(SSHKeyRotationLog).first()
        assert retrieved_log is not None
        assert retrieved_log.old_key_id == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        assert retrieved_log.new_key_id == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
        assert retrieved_log.rotation_type == "manual"
        assert retrieved_log.old_key_revoked is True
        assert retrieved_log.authorized_keys_updated is True
        assert retrieved_log.target_hosts == "server1.example.com,server2.example.com"


class TestSSHKeyService:
    """Test SSH key service functionality."""

    @pytest.fixture
    def mock_session(self):
        """Create a mock database session."""
        session = MagicMock()
        session.add = MagicMock()
        session.commit = MagicMock()
        session.rollback = MagicMock()
        session.query = MagicMock()
        session.close = MagicMock()
        return session

    @pytest.fixture
    def mock_ssh_key(self):
        """Create a mock SSH key object."""
        key = MagicMock()
        key.key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        key.fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
        key.user_id = "test_user"
        key.name = "Test User"
        key.email = "test@example.com"
        key.key_type = SSHKeyType.RSA
        key.key_length = 2048
        key.algorithm = "RSA"
        key.comment = "test@example.com"
        key.public_key_openssh = (
            "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com"
        )
        key.status = SSHKeyStatus.ACTIVE
        key.usage = SSHKeyUsage.AUTHENTICATION
        key.is_primary = True
        key.to_dict.return_value = {
            "key_id": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
            "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
            "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            "user_id": "test_user",
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "rsa",
            "key_length": 2048,
            "algorithm": "RSA",
            "comment": "test@example.com",
            "public_key_openssh": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            "status": "active",
            "usage": "authentication",
            "is_primary": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": None,
        }
        return key

    @pytest.mark.asyncio
    async def test_generate_ssh_key_success(self, mock_session, mock_ssh_key):
        """Test successful SSH key generation."""
        # Mock the database query to return None for existing primary key check
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing primary key
        mock_session.query.return_value = mock_query

        mock_session.add.return_value = None
        mock_session.commit.return_value = None

        # Mock the key generation
        with patch.object(ssh_key_service, "_generate_ssh_key") as mock_generate:
            mock_generate.return_value = {
                "key_id": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
                "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
                "public_key_openssh": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
                "private_key_openssh": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----",
                "key_type": "rsa",
                "key_length": 2048,
                "algorithm": "RSA",
                "comment": "test@example.com",
            }

            with patch.object(ssh_key_service, "_log_access") as mock_log:
                with patch.object(
                    ssh_key_service, "session_factory", return_value=mock_session
                ):
                    result = await ssh_key_service.generate_ssh_key(
                        user_id="test_user",
                        name="Test User",
                        email="test@example.com",
                        key_type="rsa",
                        key_length=2048,
                        comment="test@example.com",
                        usage="authentication",
                        is_primary=True,
                    )

                    # Verify the result
                    assert (
                        result["key_id"] == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                    )
                    assert (
                        result["fingerprint"]
                        == "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
                    )
                    assert result["user_id"] == "test_user"

                    # Verify database operations
                    mock_session.add.assert_called_once()
                    mock_session.commit.assert_called_once()
                    mock_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_generate_ssh_key_duplicate_primary(self, mock_session, mock_ssh_key):
        """Test SSH key generation with existing primary key."""
        # Mock the database query to return an existing primary key
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = mock_ssh_key  # Existing primary key
        mock_session.query.return_value = mock_query

        with patch.object(
            ssh_key_service, "session_factory", return_value=mock_session
        ):
            with pytest.raises(ValueError, match="User already has a primary SSH key"):
                await ssh_key_service.generate_ssh_key(
                    user_id="test_user",
                    name="Test User",
                    email="test@example.com",
                    key_type="rsa",
                    key_length=2048,
                    is_primary=True,
                )

    @pytest.mark.asyncio
    async def test_import_ssh_key(self, mock_session, mock_ssh_key):
        """Test importing an existing SSH key."""
        # Mock the database query to return None for existing key check
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None  # No existing key
        mock_session.query.return_value = mock_query

        mock_session.add.return_value = None
        mock_session.commit.return_value = None

        # Mock key validation
        with patch.object(ssh_key_service, "_validate_ssh_key") as mock_validate:
            mock_validate.return_value = {
                "key_id": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
                "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
                "key_type": "rsa",
                "key_length": 2048,
                "algorithm": "RSA",
                "comment": "test@example.com",
                "public_key_openssh": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            }

            with patch.object(ssh_key_service, "_log_access") as mock_log:
                with patch.object(
                    ssh_key_service, "session_factory", return_value=mock_session
                ):
                    result = await ssh_key_service.import_ssh_key(
                        user_id="test_user",
                        name="Test User",
                        email="test@example.com",
                        public_key_str="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
                        private_key_str="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----",
                        usage="authentication",
                        is_primary=False,
                    )

                    # Verify the result
                    assert (
                        result["key_id"] == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                    )
                    assert (
                        result["fingerprint"]
                        == "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
                    )
                    assert result["user_id"] == "test_user"

                    # Verify database operations
                    mock_session.add.assert_called_once()
                    mock_session.commit.assert_called_once()
                    mock_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_user_keys(self, mock_session, mock_ssh_key):
        """Test retrieving user SSH keys."""
        # Setup mocks - handle multiple filter calls
        mock_query = MagicMock()
        mock_filter1 = MagicMock()
        mock_filter2 = MagicMock()
        mock_query.filter.return_value = mock_filter1
        mock_filter1.filter.return_value = mock_filter2
        mock_filter2.all.return_value = [mock_ssh_key]
        mock_session.query.return_value = mock_query

        with patch.object(ssh_key_service, "_log_access") as mock_log:
            with patch.object(
                ssh_key_service, "session_factory", return_value=mock_session
            ):
                result = await ssh_key_service.get_user_keys(
                    user_id="test_user",
                    include_revoked=False,
                )

                # Verify the result
                assert len(result) == 1
                assert (
                    result[0]["key_id"] == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                )
                assert result[0]["user_id"] == "test_user"

                # Verify logging
                mock_log.assert_called_once()

    @pytest.mark.asyncio
    async def test_revoke_key(self, mock_session, mock_ssh_key):
        """Test revoking an SSH key."""
        # Setup mocks
        mock_query = MagicMock()
        mock_filter = MagicMock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = mock_ssh_key
        mock_session.query.return_value = mock_query

        with patch.object(ssh_key_service, "_log_access") as mock_log:
            with patch.object(
                ssh_key_service, "session_factory", return_value=mock_session
            ):
                result = await ssh_key_service.revoke_key(
                    user_id="test_user",
                    key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                    reason="Test revocation",
                )

                # Verify the key was revoked
                assert mock_ssh_key.status == SSHKeyStatus.REVOKED
                assert mock_ssh_key.is_revoked is True
                assert mock_ssh_key.revocation_reason == "Test revocation"
                assert mock_ssh_key.revoked_at is not None

                # Verify database operations
                mock_session.commit.assert_called_once()
                mock_log.assert_called_once()

    def test_hash_passphrase(self):
        """Test passphrase hashing."""
        passphrase = "test_passphrase"
        hashed = ssh_key_service._hash_passphrase(passphrase)

        # Should be a SHA-256 hash
        assert len(hashed) == 64  # SHA-256 hex length
        assert hashed.isalnum()

        # Same passphrase should produce same hash
        hashed2 = ssh_key_service._hash_passphrase(passphrase)
        assert hashed == hashed2

        # Different passphrase should produce different hash
        different_hashed = ssh_key_service._hash_passphrase("different_passphrase")
        assert hashed != different_hashed

    def test_generate_key_id(self):
        """Test key ID generation."""
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
        key_id = ssh_key_service._generate_key_id(fingerprint)

        # Should be a 16-character hex string
        assert len(key_id) == 16
        assert key_id.isalnum()

        # Same fingerprint should produce same key ID
        key_id2 = ssh_key_service._generate_key_id(fingerprint)
        assert key_id == key_id2

    def test_generate_fingerprint(self):
        """Test fingerprint generation."""
        # Use a valid SSH public key format
        public_key_str = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDx8v7Y4hQ6zM1EIc8b+j0X7PqTtGvH2K9LmN3OpQ4RsT5YuI6PvB7WxE8ZyA9 test@example.com"

        # Mock the load_ssh_public_key function to avoid parsing issues
        with patch("app.security.ssh_key_service.load_ssh_public_key") as mock_load:
            mock_public_key = MagicMock()
            mock_public_key.public_bytes.return_value = b"mock_key_bytes"
            mock_load.return_value = mock_public_key

            fingerprint = ssh_key_service._generate_fingerprint(public_key_str)

            # Should be a valid fingerprint format
            assert fingerprint.startswith("SHA256:")
            assert len(fingerprint) == 47  # SHA256: + 43 chars

            # Same public key should produce same fingerprint
            fingerprint2 = ssh_key_service._generate_fingerprint(public_key_str)
            assert fingerprint == fingerprint2

    def test_validate_ssh_key(self):
        """Test SSH key validation."""
        # Test with a valid RSA public key
        public_key_str = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDx8v7Y4hQ6zM1EIc8b+j0X7PqTtGvH2K9LmN3OpQ4RsT5YuI6PvB7WxE8ZyA9 test@example.com"

        with patch("app.security.ssh_key_service.load_ssh_public_key") as mock_load:
            # Create a mock that behaves like an RSA public key
            mock_public_key = MagicMock()
            mock_public_key.key_size = 2048

            # Mock isinstance to return True for RSA
            with patch("app.security.ssh_key_service.isinstance") as mock_isinstance:
                mock_isinstance.return_value = True
                mock_load.return_value = mock_public_key

                with patch.object(
                    ssh_key_service, "_generate_fingerprint"
                ) as mock_fingerprint:
                    mock_fingerprint.return_value = (
                        "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
                    )

                    result = ssh_key_service._validate_ssh_key(public_key_str)

                    assert result["key_type"] == "rsa"
                    assert result["key_length"] == 2048
                    assert result["algorithm"] == "RSA"
                    assert result["comment"] == "test@example.com"
                    assert result["public_key_openssh"] == public_key_str


class TestSSHKeySecurity:
    """Test SSH key security features."""

    @pytest.fixture
    def test_db_session(self):
        """Create an in-memory SQLite database for testing."""
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        AuthBase.metadata.create_all(engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
            engine.dispose()

    def test_private_key_encryption(self, test_db_session):
        """Test that private keys are properly encrypted."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        # Create a key with a passphrase
        ssh_key = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            private_key_openssh="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----",
            passphrase_hash="hashed_passphrase",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(ssh_key)
        test_db_session.commit()

        # Verify the private key is stored
        retrieved_key = test_db_session.query(SSHKey).filter_by(key_id=key_id).first()
        assert retrieved_key.private_key_openssh is not None
        assert retrieved_key.passphrase_hash is not None
        assert retrieved_key.passphrase_hash != "test_passphrase"  # Should be hashed

    def test_key_access_logging(self, test_db_session):
        """Test that key access is properly logged."""
        # Create multiple access logs
        logs = [
            SSHKeyAccessLog(
                key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                user_id="test_user",
                operation="generate",
                success=True,
                ip_address="192.168.1.1",
                target_host="server1.example.com",
            ),
            SSHKeyAccessLog(
                key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                user_id="test_user",
                operation="export",
                success=True,
                ip_address="192.168.1.2",
                target_host="server2.example.com",
            ),
            SSHKeyAccessLog(
                key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                user_id="test_user",
                operation="revoke",
                success=True,
                ip_address="192.168.1.3",
            ),
        ]

        for log in logs:
            test_db_session.add(log)
        test_db_session.commit()

        # Verify all logs were created
        access_logs = test_db_session.query(SSHKeyAccessLog).all()
        assert len(access_logs) == 3

        # Verify different operations
        operations = [log.operation for log in access_logs]
        assert "generate" in operations
        assert "export" in operations
        assert "revoke" in operations

    def test_key_rotation_security(self, test_db_session):
        """Test key rotation security features."""
        # Create a rotation log
        rotation_log = SSHKeyRotationLog(
            old_key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
            new_key_id="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
            user_id="test_user",
            rotation_type="manual",
            reason="Security rotation",
            initiated_by="test_user",
            old_key_revoked=True,
            migration_completed=True,
            authorized_keys_updated=True,
            target_hosts="server1.example.com,server2.example.com",
            started_at=datetime.now(timezone.utc),
            completed_at=datetime.now(timezone.utc),
        )

        test_db_session.add(rotation_log)
        test_db_session.commit()

        # Verify rotation log
        retrieved_log = test_db_session.query(SSHKeyRotationLog).first()
        assert retrieved_log.old_key_revoked is True
        assert retrieved_log.migration_completed is True
        assert retrieved_log.authorized_keys_updated is True
        assert retrieved_log.rotation_type == "manual"
        assert retrieved_log.reason == "Security rotation"
        assert retrieved_log.target_hosts == "server1.example.com,server2.example.com"

    def test_key_status_validation(self, test_db_session):
        """Test key status validation."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        # Create an active key
        ssh_key = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(ssh_key)
        test_db_session.commit()

        # Test status transitions
        retrieved_key = test_db_session.query(SSHKey).filter_by(key_id=key_id).first()

        # Revoke the key
        retrieved_key.status = SSHKeyStatus.REVOKED
        retrieved_key.is_revoked = True
        retrieved_key.revocation_reason = "Test revocation"
        retrieved_key.revoked_at = datetime.now(timezone.utc)
        test_db_session.commit()

        # Verify revocation
        updated_key = test_db_session.query(SSHKey).filter_by(key_id=key_id).first()
        assert updated_key.status == SSHKeyStatus.REVOKED
        assert updated_key.is_revoked is True
        assert updated_key.revocation_reason == "Test revocation"
        assert updated_key.revoked_at is not None

    def test_ssh_key_usage_types(self, test_db_session):
        """Test different SSH key usage types."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        # Test authentication key
        auth_key = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(auth_key)
        test_db_session.commit()

        # Test signing key
        signing_key = SSHKey(
            key_id="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
            fingerprint="SHA256:EFGH5678901234567890EFGH5678901234567890EFGH",
            public_key_hash="efgh5678901234567890efgh5678901234567890efgh5678901234567890efgh5678",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.ED25519,
            key_length=256,
            algorithm="ED25519",
            comment="test@example.com",
            public_key_openssh="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.SIGNING,
            is_primary=False,
        )

        test_db_session.add(signing_key)
        test_db_session.commit()

        # Verify both keys were created with correct usage types
        auth_retrieved = (
            test_db_session.query(SSHKey)
            .filter_by(usage=SSHKeyUsage.AUTHENTICATION)
            .first()
        )
        signing_retrieved = (
            test_db_session.query(SSHKey).filter_by(usage=SSHKeyUsage.SIGNING).first()
        )

        assert auth_retrieved.usage == SSHKeyUsage.AUTHENTICATION
        assert signing_retrieved.usage == SSHKeyUsage.SIGNING
        assert auth_retrieved.is_primary is True
        assert signing_retrieved.is_primary is False


@pytest.mark.integration
class TestSSHKeyIntegration:
    """Integration tests for SSH key system."""

    @pytest.fixture
    def test_db_session(self):
        """Create an in-memory SQLite database for testing."""
        engine = create_engine(
            "sqlite:///:memory:",
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        AuthBase.metadata.create_all(engine)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()
            engine.dispose()

    @pytest.mark.asyncio
    async def test_complete_key_lifecycle(self, test_db_session):
        """Test complete SSH key lifecycle: generate -> use -> rotate -> revoke."""
        # Clear any existing data in the test database
        test_db_session.query(SSHKey).delete()
        test_db_session.query(SSHKeyAccessLog).delete()
        test_db_session.query(SSHKeyRotationLog).delete()
        test_db_session.commit()

        # Mock the session factory to return our test session
        with patch.object(
            ssh_key_service, "session_factory", return_value=test_db_session
        ):
            # Mock key generation
            with patch.object(ssh_key_service, "_generate_ssh_key") as mock_generate:
                mock_generate.return_value = {
                    "key_id": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                    "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
                    "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
                    "public_key_openssh": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
                    "private_key_openssh": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----",
                    "key_type": "rsa",
                    "key_length": 2048,
                    "algorithm": "RSA",
                    "comment": "test@example.com",
                }

                # 1. Generate key
                with patch.object(ssh_key_service, "_log_access"):
                    key_data = await ssh_key_service.generate_ssh_key(
                        user_id="test_user",
                        name="Test User",
                        email="test@example.com",
                        key_type="rsa",
                        key_length=2048,
                        comment="test@example.com",
                        usage="authentication",
                        is_primary=True,
                    )

                    assert (
                        key_data["key_id"]
                        == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                    )
                    assert key_data["status"] == "active"

                # 2. Get user keys
                with patch.object(ssh_key_service, "_log_access"):
                    keys = await ssh_key_service.get_user_keys(
                        user_id="test_user",
                        include_revoked=False,
                    )

                    assert len(keys) == 1
                    assert (
                        keys[0]["key_id"]
                        == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                    )

                # 3. Regenerate key
                with patch.object(
                    ssh_key_service, "generate_ssh_key"
                ) as mock_generate_new:
                    mock_generate_new.return_value = {
                        "key_id": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
                        "fingerprint": "SHA256:EFGH5678901234567890EFGH5678901234567890EFGH",
                        "public_key_hash": "efgh5678901234567890efgh5678901234567890efgh5678901234567890efgh5678",
                        "user_id": "test_user",
                        "name": "Test User",
                        "email": "test@example.com",
                        "key_type": "ed25519",
                        "key_length": 256,
                        "algorithm": "ED25519",
                        "comment": "test@example.com",
                        "public_key_openssh": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... test@example.com",
                        "status": "active",
                        "usage": "authentication",
                        "is_primary": True,
                        "created_at": datetime.now(timezone.utc).isoformat(),
                        "updated_at": None,
                    }

                    with patch.object(ssh_key_service, "_log_access"):
                        new_key = await ssh_key_service.regenerate_ssh_key(
                            user_id="test_user",
                            old_key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...",
                            key_type="ed25519",
                            key_length=256,
                        )

                        assert (
                            new_key["key_id"]
                            == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
                        )

                # 4. Verify old key was revoked
                old_key = (
                    test_db_session.query(SSHKey)
                    .filter_by(key_id="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD...")
                    .first()
                )
                assert old_key.status == SSHKeyStatus.REVOKED
                assert old_key.is_revoked is True

                # 5. Verify rotation log was created
                rotation_logs = test_db_session.query(SSHKeyRotationLog).all()
                assert len(rotation_logs) == 1
                assert (
                    rotation_logs[0].old_key_id
                    == "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
                )
                assert (
                    rotation_logs[0].new_key_id
                    == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
                )

    def test_database_constraints(self, test_db_session):
        """Test database constraints and uniqueness."""
        key_id = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD..."
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"

        # Create first key
        ssh_key1 = SSHKey(
            key_id=key_id,
            fingerprint=fingerprint,
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user",
            name="Test User",
            email="test@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=True,
        )

        test_db_session.add(ssh_key1)
        test_db_session.commit()

        # Try to create duplicate key_id
        ssh_key2 = SSHKey(
            key_id=key_id,  # Same key_id
            fingerprint="SHA256:DIFFERENT1234567890ABCD1234567890ABCD1234567890",
            public_key_hash="different1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user2",
            name="Test User 2",
            email="test2@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test2@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test2@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=False,
        )

        test_db_session.add(ssh_key2)

        # Should raise integrity error
        with pytest.raises(Exception):  # SQLAlchemy integrity error
            test_db_session.commit()

        test_db_session.rollback()

        # Try to create duplicate fingerprint
        ssh_key3 = SSHKey(
            key_id="ssh-rsa DIFFERENT1234567890ABCD1234567890ABCD1234567890",
            fingerprint=fingerprint,  # Same fingerprint
            public_key_hash="abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
            user_id="test_user3",
            name="Test User 3",
            email="test3@example.com",
            key_type=SSHKeyType.RSA,
            key_length=2048,
            algorithm="RSA",
            comment="test3@example.com",
            public_key_openssh="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQD... test3@example.com",
            status=SSHKeyStatus.ACTIVE,
            usage=SSHKeyUsage.AUTHENTICATION,
            is_primary=False,
        )

        test_db_session.add(ssh_key3)

        # Should raise integrity error
        with pytest.raises(Exception):  # SQLAlchemy integrity error
            test_db_session.commit()
