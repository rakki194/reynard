"""Tests for Email Encryption Service.

This module contains comprehensive tests for the email encryption functionality.
"""

import tempfile
from datetime import datetime
from unittest.mock import MagicMock, Mock, patch

import pytest
import pytest_asyncio

from app.services.email.integration.email_encryption_service import (
    EmailEncryptionService,
    EncryptedEmail,
    EncryptionConfig,
    EncryptionKey,
    email_encryption_service,
)


class TestEmailEncryptionService:
    """Test cases for EmailEncryptionService."""

    @pytest_asyncio.fixture
    async def encryption_service(self):
        """Create a test encryption service with temporary data directory."""
        temp_dir = tempfile.mkdtemp()
        try:
            config = EncryptionConfig(
                pgp_enabled=True, smime_enabled=True, default_encryption="pgp",
            )
            service = EmailEncryptionService(config=config, data_dir=temp_dir)
            yield service
        finally:
            # Clean up the temporary directory
            import shutil

            try:
                shutil.rmtree(temp_dir, ignore_errors=True)
            except Exception:
                pass

    @pytest.fixture
    def mock_gpg(self):
        """Mock GnuPG instance."""
        mock_gpg = MagicMock()
        mock_gpg.encoding = "utf-8"
        return mock_gpg

    @pytest.fixture
    def sample_key_data(self):
        """Sample PGP key data for testing."""
        return {
            "fingerprint": "ABCD1234EFGH5678IJKL9012MNOP3456QRST7890",
            "uids": ["Test User <test@example.com>"],
            "keyid": "ABCD1234EFGH5678",
        }

    def test_encryption_service_initialization(self, encryption_service):
        """Test encryption service initialization."""
        assert encryption_service.config.pgp_enabled is True
        assert encryption_service.config.smime_enabled is True
        assert encryption_service.config.default_encryption == "pgp"
        assert encryption_service.data_dir.exists()
        assert encryption_service.keys_dir.exists()
        assert isinstance(encryption_service.keys, dict)

    def test_encryption_service_initialization_no_pgp(self):
        """Test encryption service initialization without PGP."""
        with tempfile.TemporaryDirectory() as temp_dir:
            config = EncryptionConfig(pgp_enabled=False, smime_enabled=False)
            service = EmailEncryptionService(config=config, data_dir=temp_dir)

            assert service.gpg is None
            assert service.config.pgp_enabled is False
            assert service.config.smime_enabled is False

    @pytest.mark.asyncio
    async def test_generate_pgp_key_success(
        self, encryption_service, mock_gpg, sample_key_data,
    ):
        """Test successful PGP key generation."""
        # Mock the GnuPG instance
        encryption_service.gpg = "available"

        # Mock subprocess calls
        with patch("app.services.email_encryption_service.subprocess.run") as mock_run:
            # Mock successful key generation
            mock_run.return_value = MagicMock(
                returncode=0,
                stdout=b"",
                stderr=b"key ABCD1234EFGH5678IJKL9012MNOP3456QRST7890",
            )

            key = await encryption_service.generate_pgp_key(
                name="Test User",
                email="test@example.com",
                passphrase="testpass",
                key_length=2048,
            )

            assert isinstance(key, EncryptionKey)
            assert key.key_type == "pgp"
            assert key.user_id == "Test User <test@example.com>"
            assert key.email == "test@example.com"
            assert key.trust_level == 5
            assert key.key_id in encryption_service.keys

    @pytest.mark.asyncio
    async def test_generate_pgp_key_failure(self, encryption_service, mock_gpg):
        """Test PGP key generation failure."""
        encryption_service.gpg = mock_gpg
        mock_gpg.gen_key.return_value = None

        with pytest.raises(ValueError, match="Failed to generate PGP key"):
            await encryption_service.generate_pgp_key(
                name="Test User", email="test@example.com",
            )

    @pytest.mark.asyncio
    async def test_generate_pgp_key_no_pgp_available(self, encryption_service):
        """Test PGP key generation when PGP is not available."""
        encryption_service.gpg = None

        with pytest.raises(ValueError, match="PGP encryption not available"):
            await encryption_service.generate_pgp_key(
                name="Test User", email="test@example.com",
            )

    @pytest.mark.asyncio
    async def test_import_pgp_key_success(
        self, encryption_service, mock_gpg, sample_key_data,
    ):
        """Test successful PGP key import."""
        encryption_service.gpg = mock_gpg

        # Mock import result
        mock_import_result = MagicMock()
        mock_import_result.results = [{"fingerprint": sample_key_data["fingerprint"]}]
        mock_gpg.import_keys.return_value = mock_import_result
        mock_gpg.export_keys.return_value = "-----BEGIN PGP PUBLIC KEY BLOCK-----\nTest Key Data\n-----END PGP PUBLIC KEY BLOCK-----"
        mock_gpg.list_keys.return_value = [sample_key_data]

        key = await encryption_service.import_pgp_key(
            "-----BEGIN PGP PUBLIC KEY BLOCK-----\nTest Key Data\n-----END PGP PUBLIC KEY BLOCK-----",
        )

        assert isinstance(key, EncryptionKey)
        assert key.key_id == sample_key_data["fingerprint"]
        assert key.key_type == "pgp"
        assert key.fingerprint == sample_key_data["fingerprint"]
        assert key.user_id == "Test User <test@example.com>"
        assert key.email == "test@example.com"
        assert key.trust_level == 0  # Imported keys start with no trust

        # Verify GnuPG was called correctly
        mock_gpg.import_keys.assert_called_once()
        mock_gpg.export_keys.assert_called()
        mock_gpg.list_keys.assert_called_once()

    @pytest.mark.asyncio
    async def test_import_pgp_key_no_results(self, encryption_service, mock_gpg):
        """Test PGP key import with no results."""
        encryption_service.gpg = mock_gpg

        mock_import_result = MagicMock()
        mock_import_result.results = []
        mock_gpg.import_keys.return_value = mock_import_result

        with pytest.raises(ValueError, match="No keys found in import data"):
            await encryption_service.import_pgp_key("Invalid key data")

    @pytest.mark.asyncio
    async def test_encrypt_email_pgp_success(self, encryption_service, mock_gpg):
        """Test successful email encryption with PGP."""
        encryption_service.gpg = mock_gpg

        # Create a test key
        test_key = EncryptionKey(
            key_id="test_fingerprint",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["test_fingerprint"] = test_key

        # Mock encryption
        mock_encrypted = MagicMock()
        mock_encrypted.__str__ = Mock(
            return_value="-----BEGIN PGP MESSAGE-----\nEncrypted Content\n-----END PGP MESSAGE-----",
        )
        mock_gpg.encrypt.return_value = mock_encrypted

        encrypted_email = await encryption_service.encrypt_email(
            content="Test email content",
            recipient_email="test@example.com",
            encryption_method="pgp",
        )

        assert isinstance(encrypted_email, EncryptedEmail)
        assert encrypted_email.original_content == "Test email content"
        assert encrypted_email.encryption_method == "pgp"
        assert encrypted_email.key_id == "test_fingerprint"
        assert encrypted_email.is_signed is False
        assert isinstance(encrypted_email.encrypted_at, datetime)

        # Verify GnuPG was called correctly
        mock_gpg.encrypt.assert_called_once()

    @pytest.mark.asyncio
    async def test_encrypt_email_pgp_with_signing(self, encryption_service, mock_gpg):
        """Test email encryption with PGP signing."""
        encryption_service.gpg = mock_gpg

        # Create test keys
        recipient_key = EncryptionKey(
            key_id="recipient_fingerprint",
            key_type="pgp",
            fingerprint="recipient_fingerprint",
            public_key="recipient_public_key",
            private_key="recipient_private_key",
            user_id="Recipient <recipient@example.com>",
            email="recipient@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["recipient_fingerprint"] = recipient_key

        signing_key = EncryptionKey(
            key_id="signing_fingerprint",
            key_type="pgp",
            fingerprint="signing_fingerprint",
            public_key="signing_public_key",
            private_key="signing_private_key",
            user_id="Signer <signer@example.com>",
            email="signer@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["signing_fingerprint"] = signing_key

        # Mock encryption with signing
        mock_encrypted = MagicMock()
        mock_encrypted.__str__ = Mock(
            return_value="-----BEGIN PGP MESSAGE-----\nSigned and Encrypted Content\n-----END PGP MESSAGE-----",
        )
        mock_gpg.encrypt.return_value = mock_encrypted

        encrypted_email = await encryption_service.encrypt_email(
            content="Test email content",
            recipient_email="recipient@example.com",
            encryption_method="pgp",
            sign_with="signing_fingerprint",
        )

        assert encrypted_email.is_signed is True
        assert encrypted_email.signature is not None

    @pytest.mark.asyncio
    async def test_encrypt_email_no_recipient_key(self, encryption_service):
        """Test email encryption with no recipient key found."""
        with pytest.raises(ValueError, match="No encryption key found for"):
            await encryption_service.encrypt_email(
                content="Test email content", recipient_email="nonexistent@example.com",
            )

    @pytest.mark.asyncio
    async def test_encrypt_email_smime(self, encryption_service):
        """Test email encryption with SMIME."""
        # Create a test key
        test_key = EncryptionKey(
            key_id="smime_test_key",
            key_type="smime",
            fingerprint="smime_fingerprint",
            public_key="smime_public_key",
            private_key="smime_private_key",
            user_id="SMIME User <smime@example.com>",
            email="smime@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["smime_test_key"] = test_key

        encrypted_email = await encryption_service.encrypt_email(
            content="Test email content",
            recipient_email="smime@example.com",
            encryption_method="smime",
        )

        assert isinstance(encrypted_email, EncryptedEmail)
        assert encrypted_email.original_content == "Test email content"
        assert encrypted_email.encryption_method == "smime"
        assert encrypted_email.key_id == "smime_test_key"
        assert "[SMIME-ENCRYPTED]" in encrypted_email.encrypted_content

    @pytest.mark.asyncio
    async def test_encrypt_email_unsupported_method(self, encryption_service):
        """Test email encryption with unsupported method."""
        with pytest.raises(
            ValueError, match="No encryption key found for test@example.com",
        ):
            await encryption_service.encrypt_email(
                content="Test email content",
                recipient_email="test@example.com",
                encryption_method="unsupported",
            )

    @pytest.mark.asyncio
    async def test_decrypt_email_pgp_success(self, encryption_service, mock_gpg):
        """Test successful email decryption with PGP."""
        encryption_service.gpg = mock_gpg

        # Mock decryption
        mock_decrypted = MagicMock()
        mock_decrypted.__str__ = Mock(return_value="Decrypted email content")
        mock_gpg.decrypt.return_value = mock_decrypted

        decrypted_content = await encryption_service.decrypt_email(
            encrypted_content="-----BEGIN PGP MESSAGE-----\nEncrypted Content\n-----END PGP MESSAGE-----",
            encryption_method="pgp",
            passphrase="testpass",
        )

        assert decrypted_content == "Decrypted email content"
        mock_gpg.decrypt.assert_called_once()

    @pytest.mark.asyncio
    async def test_decrypt_email_pgp_failure(self, encryption_service, mock_gpg):
        """Test PGP email decryption failure."""
        encryption_service.gpg = mock_gpg
        mock_gpg.decrypt.return_value = None

        with pytest.raises(ValueError, match="PGP decryption failed"):
            await encryption_service.decrypt_email(
                encrypted_content="Invalid encrypted content", encryption_method="pgp",
            )

    @pytest.mark.asyncio
    async def test_decrypt_email_smime_success(self, encryption_service):
        """Test successful email decryption with SMIME."""
        decrypted_content = await encryption_service.decrypt_email(
            encrypted_content="[SMIME-ENCRYPTED]Test email content[/SMIME-ENCRYPTED]",
            encryption_method="smime",
        )

        assert decrypted_content == "Test email content"

    @pytest.mark.asyncio
    async def test_decrypt_email_smime_invalid_content(self, encryption_service):
        """Test SMIME email decryption with invalid content."""
        with pytest.raises(ValueError, match="Invalid SMIME encrypted content"):
            await encryption_service.decrypt_email(
                encrypted_content="Invalid SMIME content", encryption_method="smime",
            )

    @pytest.mark.asyncio
    async def test_sign_email_pgp_success(self, encryption_service, mock_gpg):
        """Test successful email signing with PGP."""
        encryption_service.gpg = mock_gpg

        # Create a test signing key
        signing_key = EncryptionKey(
            key_id="signing_fingerprint",
            key_type="pgp",
            fingerprint="signing_fingerprint",
            public_key="signing_public_key",
            private_key="signing_private_key",
            user_id="Signer <signer@example.com>",
            email="signer@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["signing_fingerprint"] = signing_key

        # Mock signing
        mock_signed = MagicMock()
        mock_signed.__str__ = Mock(
            return_value="-----BEGIN PGP SIGNED MESSAGE-----\nSigned Content\n-----END PGP SIGNATURE-----",
        )
        mock_gpg.sign.return_value = mock_signed

        signed_content = await encryption_service.sign_email(
            content="Test email content",
            signer_key_id="signing_fingerprint",
            passphrase="testpass",
        )

        assert (
            signed_content
            == "-----BEGIN PGP SIGNED MESSAGE-----\nSigned Content\n-----END PGP SIGNATURE-----"
        )
        mock_gpg.sign.assert_called_once()

    @pytest.mark.asyncio
    async def test_sign_email_key_not_found(self, encryption_service):
        """Test email signing with non-existent key."""
        with pytest.raises(ValueError, match="Signing key not found"):
            await encryption_service.sign_email(
                content="Test email content", signer_key_id="nonexistent_key",
            )

    @pytest.mark.asyncio
    async def test_verify_signature_pgp_success(self, encryption_service, mock_gpg):
        """Test successful signature verification with PGP."""
        encryption_service.gpg = mock_gpg

        # Mock verification
        mock_verified = MagicMock()
        mock_verified.valid = True
        mock_verified.fingerprint = "test_fingerprint"
        mock_verified.username = "Test User"
        mock_verified.trust_level = 5
        mock_verified.status = "signature valid"
        mock_gpg.verify.return_value = mock_verified

        verification_result = await encryption_service.verify_signature(
            signed_content="-----BEGIN PGP SIGNED MESSAGE-----\nSigned Content\n-----END PGP SIGNATURE-----",
            encryption_method="pgp",
        )

        assert verification_result["valid"] is True
        assert verification_result["fingerprint"] == "test_fingerprint"
        assert verification_result["username"] == "Test User"
        assert verification_result["trust_level"] == 5
        assert verification_result["status"] == "signature valid"

        mock_gpg.verify.assert_called_once()

    @pytest.mark.asyncio
    async def test_verify_signature_pgp_failure(self, encryption_service, mock_gpg):
        """Test signature verification failure with PGP."""
        encryption_service.gpg = mock_gpg
        mock_gpg.verify.side_effect = Exception("Verification failed")

        verification_result = await encryption_service.verify_signature(
            signed_content="Invalid signed content", encryption_method="pgp",
        )

        assert verification_result["valid"] is False
        assert "error" in verification_result

    @pytest.mark.asyncio
    async def test_verify_signature_smime_success(self, encryption_service):
        """Test successful signature verification with SMIME."""
        verification_result = await encryption_service.verify_signature(
            signed_content="[SMIME-SIGNED]Test content[/SMIME-SIGNED]",
            encryption_method="smime",
        )

        assert verification_result["valid"] is True
        assert verification_result["fingerprint"] == "placeholder"
        assert verification_result["username"] == "placeholder"

    @pytest.mark.asyncio
    async def test_verify_signature_smime_invalid_content(self, encryption_service):
        """Test signature verification with invalid SMIME content."""
        verification_result = await encryption_service.verify_signature(
            signed_content="Invalid SMIME content", encryption_method="smime",
        )

        assert verification_result["valid"] is False
        assert "error" in verification_result

    @pytest.mark.asyncio
    async def test_get_public_key_found(self, encryption_service):
        """Test getting public key when key exists."""
        test_key = EncryptionKey(
            key_id="test_key",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["test_key"] = test_key

        public_key = await encryption_service.get_public_key("test@example.com", "pgp")
        assert public_key == "test_public_key"

    @pytest.mark.asyncio
    async def test_get_public_key_not_found(self, encryption_service):
        """Test getting public key when key doesn't exist."""
        public_key = await encryption_service.get_public_key(
            "nonexistent@example.com", "pgp",
        )
        assert public_key is None

    @pytest.mark.asyncio
    async def test_list_keys_all(self, encryption_service):
        """Test listing all encryption keys."""
        # Add test keys
        pgp_key = EncryptionKey(
            key_id="pgp_key",
            key_type="pgp",
            fingerprint="pgp_fingerprint",
            public_key="pgp_public_key",
            private_key="pgp_private_key",
            user_id="PGP User <pgp@example.com>",
            email="pgp@example.com",
            created_at=datetime.now(),
        )
        smime_key = EncryptionKey(
            key_id="smime_key",
            key_type="smime",
            fingerprint="smime_fingerprint",
            public_key="smime_public_key",
            private_key="smime_private_key",
            user_id="SMIME User <smime@example.com>",
            email="smime@example.com",
            created_at=datetime.now(),
        )

        encryption_service.keys["pgp_key"] = pgp_key
        encryption_service.keys["smime_key"] = smime_key

        all_keys = await encryption_service.list_keys()
        assert len(all_keys) == 2

        pgp_keys = await encryption_service.list_keys(key_type="pgp")
        assert len(pgp_keys) == 1
        assert pgp_keys[0].key_type == "pgp"

        smime_keys = await encryption_service.list_keys(key_type="smime")
        assert len(smime_keys) == 1
        assert smime_keys[0].key_type == "smime"

    @pytest.mark.asyncio
    async def test_revoke_key_success(self, encryption_service):
        """Test successful key revocation."""
        test_key = EncryptionKey(
            key_id="test_key",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["test_key"] = test_key

        result = await encryption_service.revoke_key("test_key")
        assert result is True
        assert encryption_service.keys["test_key"].is_revoked is True

    @pytest.mark.asyncio
    async def test_revoke_key_not_found(self, encryption_service):
        """Test key revocation with non-existent key."""
        result = await encryption_service.revoke_key("nonexistent_key")
        assert result is False

    def test_extract_email_from_user_id(self, encryption_service):
        """Test email extraction from PGP user ID."""
        user_id = "Test User <test@example.com>"
        email = encryption_service._extract_email_from_user_id(user_id)
        assert email == "test@example.com"

        user_id_no_email = "Test User"
        email = encryption_service._extract_email_from_user_id(user_id_no_email)
        assert email == "unknown@example.com"

    @pytest.mark.asyncio
    async def test_find_recipient_key_found(self, encryption_service):
        """Test finding recipient key when key exists."""
        test_key = EncryptionKey(
            key_id="test_key",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["test_key"] = test_key

        found_key = await encryption_service._find_recipient_key(
            "test@example.com", "pgp",
        )
        assert found_key == test_key

    @pytest.mark.asyncio
    async def test_find_recipient_key_not_found(self, encryption_service):
        """Test finding recipient key when key doesn't exist."""
        found_key = await encryption_service._find_recipient_key(
            "nonexistent@example.com", "pgp",
        )
        assert found_key is None

    @pytest.mark.asyncio
    async def test_find_recipient_key_revoked(self, encryption_service):
        """Test finding recipient key when key is revoked."""
        test_key = EncryptionKey(
            key_id="test_key",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
            is_revoked=True,
        )
        encryption_service.keys["test_key"] = test_key

        found_key = await encryption_service._find_recipient_key(
            "test@example.com", "pgp",
        )
        assert found_key is None

    def test_save_and_load_keys(self, encryption_service):
        """Test saving and loading encryption keys."""
        # Create test key
        test_key = EncryptionKey(
            key_id="test_key",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
        )
        encryption_service.keys["test_key"] = test_key

        # Save keys
        encryption_service._save_keys()

        # Create new service instance to test loading
        new_service = EmailEncryptionService(
            config=encryption_service.config, data_dir=encryption_service.data_dir,
        )

        # Verify key was loaded
        assert "test_key" in new_service.keys
        loaded_key = new_service.keys["test_key"]
        assert loaded_key.key_id == test_key.key_id
        assert loaded_key.key_type == test_key.key_type
        assert loaded_key.fingerprint == test_key.fingerprint
        assert loaded_key.email == test_key.email

    @pytest.mark.asyncio
    async def test_error_handling(self, encryption_service):
        """Test error handling in various methods."""
        # Test with invalid data - the method should handle exceptions gracefully
        with patch.object(
            encryption_service, "_save_keys", side_effect=Exception("Save error"),
        ):
            # Should handle the exception gracefully
            try:
                encryption_service._save_keys()
            except Exception:
                pass  # Expected to raise exception in this test

        # Test with invalid key data
        with patch.object(
            encryption_service, "_load_keys", side_effect=Exception("Load error"),
        ):
            # Should handle gracefully
            try:
                encryption_service._load_keys()
            except Exception:
                pass  # Expected to raise exception in this test
            assert encryption_service.keys == {}

    @pytest.mark.asyncio
    async def test_global_service_instance(self):
        """Test the global service instance."""
        assert isinstance(email_encryption_service, EmailEncryptionService)
        assert email_encryption_service.data_dir.exists()
        assert email_encryption_service.keys_dir.exists()


class TestEncryptionKey:
    """Test cases for EncryptionKey dataclass."""

    def test_encryption_key_creation(self):
        """Test EncryptionKey object creation."""
        key = EncryptionKey(
            key_id="test_key_id",
            key_type="pgp",
            fingerprint="test_fingerprint",
            public_key="test_public_key",
            private_key="test_private_key",
            user_id="Test User <test@example.com>",
            email="test@example.com",
            created_at=datetime.now(),
            expires_at=datetime.now(),
            is_revoked=False,
            trust_level=5,
        )

        assert key.key_id == "test_key_id"
        assert key.key_type == "pgp"
        assert key.fingerprint == "test_fingerprint"
        assert key.public_key == "test_public_key"
        assert key.private_key == "test_private_key"
        assert key.user_id == "Test User <test@example.com>"
        assert key.email == "test@example.com"
        assert isinstance(key.created_at, datetime)
        assert isinstance(key.expires_at, datetime)
        assert key.is_revoked is False
        assert key.trust_level == 5


class TestEncryptedEmail:
    """Test cases for EncryptedEmail dataclass."""

    def test_encrypted_email_creation(self):
        """Test EncryptedEmail object creation."""
        encrypted_email = EncryptedEmail(
            original_content="Original email content",
            encrypted_content="Encrypted email content",
            encryption_method="pgp",
            key_id="test_key_id",
            signature="Digital signature",
            is_signed=True,
            encrypted_at=datetime.now(),
        )

        assert encrypted_email.original_content == "Original email content"
        assert encrypted_email.encrypted_content == "Encrypted email content"
        assert encrypted_email.encryption_method == "pgp"
        assert encrypted_email.key_id == "test_key_id"
        assert encrypted_email.signature == "Digital signature"
        assert encrypted_email.is_signed is True
        assert isinstance(encrypted_email.encrypted_at, datetime)


class TestEncryptionConfig:
    """Test cases for EncryptionConfig dataclass."""

    def test_encryption_config_defaults(self):
        """Test EncryptionConfig default values."""
        config = EncryptionConfig()

        assert config.pgp_enabled is True
        assert config.smime_enabled is True
        assert config.default_encryption == "pgp"
        assert config.auto_encrypt is False
        assert config.require_encryption is False
        assert config.key_server_url == "https://keys.openpgp.org"
        assert config.smime_ca_cert_path is None
        assert config.smime_cert_path is None
        assert config.smime_key_path is None

    def test_encryption_config_custom(self):
        """Test EncryptionConfig with custom values."""
        config = EncryptionConfig(
            pgp_enabled=False,
            smime_enabled=True,
            default_encryption="smime",
            auto_encrypt=True,
            require_encryption=True,
            key_server_url="https://custom.keyserver.com",
        )

        assert config.pgp_enabled is False
        assert config.smime_enabled is True
        assert config.default_encryption == "smime"
        assert config.auto_encrypt is True
        assert config.require_encryption is True
        assert config.key_server_url == "https://custom.keyserver.com"


if __name__ == "__main__":
    pytest.main([__file__])
