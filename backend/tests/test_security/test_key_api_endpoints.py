"""🔐 Key Storage API Endpoint Tests

Comprehensive pytest tests for PGP and SSH key API endpoints.
Tests the FastAPI routes with authentication and authorization.

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import json
from unittest.mock import MagicMock, patch
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI

from app.api.pgp_key_routes import router as pgp_router
from app.api.ssh_key_routes import router as ssh_router
from app.auth.dependencies import get_current_active_user, get_current_admin_user


class TestPGPKeyAPIEndpoints:
    """Test PGP key API endpoints."""

    @pytest.fixture
    def app(self):
        """Create FastAPI app for testing."""
        app = FastAPI()
        app.include_router(pgp_router)
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_user(self):
        """Mock authenticated user."""
        return {
            "username": "test_user",
            "email": "test@example.com",
            "is_active": True,
            "is_admin": False,
        }

    @pytest.fixture
    def mock_admin(self):
        """Mock admin user."""
        return {
            "username": "admin_user",
            "email": "admin@example.com",
            "is_active": True,
            "is_admin": True,
        }

    @pytest.fixture
    def sample_pgp_key_request(self):
        """Sample PGP key generation request."""
        return {
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "RSA",
            "key_length": 2048,
            "passphrase": "test_passphrase",
            "is_primary": True,
            "auto_rotate": False,
            "rotation_schedule_days": 365,
        }

    @pytest.fixture
    def sample_pgp_key_response(self):
        """Sample PGP key generation response."""
        return {
            "key_id": "1234567890ABCDEF",
            "fingerprint": "ABCD1234567890ABCD1234567890ABCD12345678",
            "user_id": "test_user",
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "rsa",
            "key_length": 2048,
            "algorithm": "RSA",
            "public_key_armored": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----",
            "status": "active",
            "is_primary": True,
            "auto_rotate": False,
            "rotation_schedule_days": 365,
            "trust_level": 0,
            "is_revoked": False,
            "revocation_reason": None,
            "revoked_at": None,
            "revoked_by": None,
            "created_at": "2025-01-15T10:30:00Z",
            "updated_at": None,
        }

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.pgp_key_routes.get_current_active_user")
    def test_generate_pgp_key_success(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_pgp_key_request,
        sample_pgp_key_response,
    ):
        """Test successful PGP key generation."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.generate_pgp_key.return_value = sample_pgp_key_response

        # Make request
        response = client.post("/pgp-keys/generate", json=sample_pgp_key_request)

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "1234567890ABCDEF"
        assert data["user_id"] == "test_user"
        assert data["is_primary"] is True

        # Verify service was called
        mock_service.generate_pgp_key.assert_called_once()

    @patch("app.api.pgp_key_routes.get_current_active_user")
    def test_generate_pgp_key_unauthorized(self, mock_get_user, client, sample_pgp_key_request):
        """Test PGP key generation without authentication."""
        # Setup mock to raise exception
        mock_get_user.side_effect = Exception("Unauthorized")

        # Make request
        response = client.post("/pgp-keys/generate", json=sample_pgp_key_request)

        # Verify response
        assert response.status_code == 500  # FastAPI will handle the exception

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.pgp_key_routes.get_current_active_user")
    def test_generate_pgp_key_validation_error(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
    ):
        """Test PGP key generation with validation error."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.generate_pgp_key.side_effect = ValueError("Invalid key type")

        # Make request with invalid data
        invalid_request = {
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "INVALID",
            "key_length": 2048,
        }

        response = client.post("/pgp-keys/generate", json=invalid_request)

        # Verify response
        assert response.status_code == 400
        assert "Invalid key type" in response.json()["detail"]

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.pgp_key_routes.get_current_active_user")
    def test_get_user_pgp_keys(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_pgp_key_response,
    ):
        """Test getting user PGP keys."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.get_user_keys.return_value = [sample_pgp_key_response]

        # Make request
        response = client.get("/pgp-keys/")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["key_id"] == "1234567890ABCDEF"

        # Verify service was called
        mock_service.get_user_keys.assert_called_once()

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.pgp_key_routes.get_current_active_user")
    def test_revoke_pgp_key(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_pgp_key_response,
    ):
        """Test revoking a PGP key."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.revoke_key.return_value = sample_pgp_key_response

        # Make request
        response = client.post(
            "/pgp-keys/revoke/1234567890ABCDEF",
            json={"reason": "Test revocation"}
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "1234567890ABCDEF"

        # Verify service was called
        mock_service.revoke_key.assert_called_once()

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.pgp_key_routes.get_current_admin_user")
    def test_admin_generate_pgp_key(
        self,
        mock_get_admin,
        mock_service,
        client,
        mock_admin,
        sample_pgp_key_request,
        sample_pgp_key_response,
    ):
        """Test admin generating PGP key for user."""
        # Setup mocks
        mock_get_admin.return_value = mock_admin
        mock_service.generate_pgp_key.return_value = sample_pgp_key_response

        # Make request
        response = client.post(
            "/pgp-keys/admin/generate/test_user",
            json=sample_pgp_key_request
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "1234567890ABCDEF"

        # Verify service was called
        mock_service.generate_pgp_key.assert_called_once()


class TestSSHKeyAPIEndpoints:
    """Test SSH key API endpoints."""

    @pytest.fixture
    def app(self):
        """Create FastAPI app for testing."""
        app = FastAPI()
        app.include_router(ssh_router)
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def mock_user(self):
        """Mock authenticated user."""
        return {
            "username": "test_user",
            "email": "test@example.com",
            "is_active": True,
            "is_admin": False,
        }

    @pytest.fixture
    def mock_admin(self):
        """Mock admin user."""
        return {
            "username": "admin_user",
            "email": "admin@example.com",
            "is_active": True,
            "is_admin": True,
        }

    @pytest.fixture
    def sample_ssh_key_request(self):
        """Sample SSH key generation request."""
        return {
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "ed25519",
            "key_length": 256,
            "comment": "test@example.com",
            "passphrase": "test_passphrase",
            "usage": "authentication",
            "is_primary": True,
            "auto_rotate": False,
            "rotation_schedule_days": 365,
            "allowed_hosts": ["server1.example.com", "server2.example.com"],
            "allowed_commands": ["ls", "cat", "grep"],
            "source_restrictions": ["from=\"192.168.1.0/24\""],
            "force_command": None,
        }

    @pytest.fixture
    def sample_ssh_key_response(self):
        """Sample SSH key generation response."""
        return {
            "key_id": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
            "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
            "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
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
            "auto_rotate": False,
            "rotation_schedule_days": 365,
            "trust_level": 0,
            "is_revoked": False,
            "revocation_reason": None,
            "revoked_at": None,
            "revoked_by": None,
            "allowed_hosts": ["server1.example.com", "server2.example.com"],
            "allowed_commands": ["ls", "cat", "grep"],
            "source_restrictions": ["from=\"192.168.1.0/24\""],
            "force_command": None,
            "created_at": "2025-01-15T10:30:00Z",
            "updated_at": None,
        }

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_generate_ssh_key_success(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_request,
        sample_ssh_key_response,
    ):
        """Test successful SSH key generation."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.generate_ssh_key.return_value = sample_ssh_key_response

        # Make request
        response = client.post("/ssh-keys/generate", json=sample_ssh_key_request)

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
        assert data["user_id"] == "test_user"
        assert data["is_primary"] is True
        assert data["usage"] == "authentication"

        # Verify service was called
        mock_service.generate_ssh_key.assert_called_once()

    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_generate_ssh_key_unauthorized(self, mock_get_user, client, sample_ssh_key_request):
        """Test SSH key generation without authentication."""
        # Setup mock to raise exception
        mock_get_user.side_effect = Exception("Unauthorized")

        # Make request
        response = client.post("/ssh-keys/generate", json=sample_ssh_key_request)

        # Verify response
        assert response.status_code == 500  # FastAPI will handle the exception

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_import_ssh_key(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_response,
    ):
        """Test importing an SSH key."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.import_ssh_key.return_value = sample_ssh_key_response

        # Make request
        import_request = {
            "name": "Test User",
            "email": "test@example.com",
            "public_key": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... test@example.com",
            "private_key": "-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----",
            "passphrase": "test_passphrase",
            "usage": "authentication",
            "is_primary": False,
        }

        response = client.post("/ssh-keys/import", json=import_request)

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # Verify service was called
        mock_service.import_ssh_key.assert_called_once()

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_get_user_ssh_keys(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_response,
    ):
        """Test getting user SSH keys."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.get_user_keys.return_value = [sample_ssh_key_response]

        # Make request
        response = client.get("/ssh-keys/")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # Verify service was called
        mock_service.get_user_keys.assert_called_once()

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_revoke_ssh_key(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_response,
    ):
        """Test revoking an SSH key."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.revoke_key.return_value = sample_ssh_key_response

        # Make request
        response = client.post(
            "/ssh-keys/revoke/ssh-ed25519%20AAAAC3NzaC1lZDI1NTE5AAAAI...",
            json={"reason": "Test revocation"}
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # Verify service was called
        mock_service.revoke_key.assert_called_once()

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_admin_user")
    def test_admin_generate_ssh_key(
        self,
        mock_get_admin,
        mock_service,
        client,
        mock_admin,
        sample_ssh_key_request,
        sample_ssh_key_response,
    ):
        """Test admin generating SSH key for user."""
        # Setup mocks
        mock_get_admin.return_value = mock_admin
        mock_service.generate_ssh_key.return_value = sample_ssh_key_response

        # Make request
        response = client.post(
            "/ssh-keys/admin/generate/test_user",
            json=sample_ssh_key_request
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # Verify service was called
        mock_service.generate_ssh_key.assert_called_once()

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_get_ssh_key_by_fingerprint(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_response,
    ):
        """Test getting SSH key by fingerprint."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.get_key_by_fingerprint.return_value = sample_ssh_key_response

        # Make request
        fingerprint = "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890"
        response = client.get(f"/ssh-keys/fingerprint/{fingerprint}")

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["fingerprint"] == fingerprint

        # Verify service was called
        mock_service.get_key_by_fingerprint.assert_called_once()

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_get_ssh_key_by_fingerprint_not_found(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
    ):
        """Test getting SSH key by fingerprint when not found."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.get_key_by_fingerprint.return_value = None

        # Make request
        fingerprint = "SHA256:NONEXISTENT1234567890ABCD1234567890ABCD1234567890"
        response = client.get(f"/ssh-keys/fingerprint/{fingerprint}")

        # Verify response
        assert response.status_code == 404
        assert "SSH key not found" in response.json()["detail"]

    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_regenerate_ssh_key(
        self,
        mock_get_user,
        mock_service,
        client,
        mock_user,
        sample_ssh_key_response,
    ):
        """Test regenerating an SSH key."""
        # Setup mocks
        mock_get_user.return_value = mock_user
        mock_service.regenerate_ssh_key.return_value = sample_ssh_key_response

        # Make request
        regenerate_request = {
            "key_type": "ed25519",
            "key_length": 256,
            "comment": "new comment",
            "passphrase": "new_passphrase",
        }

        response = client.post(
            "/ssh-keys/regenerate/ssh-ed25519%20AAAAC3NzaC1lZDI1NTE5AAAAI...",
            json=regenerate_request
        )

        # Verify response
        assert response.status_code == 200
        data = response.json()
        assert data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # Verify service was called
        mock_service.regenerate_ssh_key.assert_called_once()


@pytest.mark.integration
class TestKeyAPIIntegration:
    """Integration tests for key API endpoints."""

    @pytest.fixture
    def app(self):
        """Create FastAPI app with both routers."""
        app = FastAPI()
        app.include_router(pgp_router)
        app.include_router(ssh_router)
        return app

    @pytest.fixture
    def client(self, app):
        """Create test client."""
        return TestClient(app)

    @patch("app.api.pgp_key_routes.pgp_key_service")
    @patch("app.api.ssh_key_routes.ssh_key_service")
    @patch("app.api.pgp_key_routes.get_current_active_user")
    @patch("app.api.ssh_key_routes.get_current_active_user")
    def test_complete_key_workflow(
        self,
        mock_ssh_get_user,
        mock_pgp_get_user,
        mock_ssh_service,
        mock_pgp_service,
        client,
    ):
        """Test complete key workflow: generate PGP and SSH keys."""
        # Setup mocks
        mock_user = {
            "username": "test_user",
            "email": "test@example.com",
            "is_active": True,
            "is_admin": False,
        }
        mock_pgp_get_user.return_value = mock_user
        mock_ssh_get_user.return_value = mock_user

        # Mock PGP key response
        pgp_response = {
            "key_id": "1234567890ABCDEF",
            "fingerprint": "ABCD1234567890ABCD1234567890ABCD12345678",
            "user_id": "test_user",
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "rsa",
            "key_length": 2048,
            "algorithm": "RSA",
            "public_key_armored": "-----BEGIN PGP PUBLIC KEY BLOCK-----\n...\n-----END PGP PUBLIC KEY BLOCK-----",
            "status": "active",
            "is_primary": True,
            "auto_rotate": False,
            "rotation_schedule_days": 365,
            "trust_level": 0,
            "is_revoked": False,
            "revocation_reason": None,
            "revoked_at": None,
            "revoked_by": None,
            "created_at": "2025-01-15T10:30:00Z",
            "updated_at": None,
        }

        # Mock SSH key response
        ssh_response = {
            "key_id": "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI...",
            "fingerprint": "SHA256:ABCD1234567890ABCD1234567890ABCD1234567890",
            "public_key_hash": "abcd1234567890abcd1234567890abcd1234567890abcd1234567890abcd1234",
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
            "auto_rotate": False,
            "rotation_schedule_days": 365,
            "trust_level": 0,
            "is_revoked": False,
            "revocation_reason": None,
            "revoked_at": None,
            "revoked_by": None,
            "allowed_hosts": None,
            "allowed_commands": None,
            "source_restrictions": None,
            "force_command": None,
            "created_at": "2025-01-15T10:30:00Z",
            "updated_at": None,
        }

        mock_pgp_service.generate_pgp_key.return_value = pgp_response
        mock_ssh_service.generate_ssh_key.return_value = ssh_response

        # 1. Generate PGP key
        pgp_request = {
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "RSA",
            "key_length": 2048,
            "is_primary": True,
        }

        pgp_response_obj = client.post("/pgp-keys/generate", json=pgp_request)
        assert pgp_response_obj.status_code == 200
        pgp_data = pgp_response_obj.json()
        assert pgp_data["key_id"] == "1234567890ABCDEF"

        # 2. Generate SSH key
        ssh_request = {
            "name": "Test User",
            "email": "test@example.com",
            "key_type": "ed25519",
            "key_length": 256,
            "comment": "test@example.com",
            "usage": "authentication",
            "is_primary": True,
        }

        ssh_response_obj = client.post("/ssh-keys/generate", json=ssh_request)
        assert ssh_response_obj.status_code == 200
        ssh_data = ssh_response_obj.json()
        assert ssh_data["key_id"] == "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."

        # 3. Get user keys
        mock_pgp_service.get_user_keys.return_value = [pgp_response]
        mock_ssh_service.get_user_keys.return_value = [ssh_response]

        pgp_keys_response = client.get("/pgp-keys/")
        assert pgp_keys_response.status_code == 200
        pgp_keys = pgp_keys_response.json()
        assert len(pgp_keys) == 1

        ssh_keys_response = client.get("/ssh-keys/")
        assert ssh_keys_response.status_code == 200
        ssh_keys = ssh_keys_response.json()
        assert len(ssh_keys) == 1

        # Verify both services were called
        mock_pgp_service.generate_pgp_key.assert_called_once()
        mock_ssh_service.generate_ssh_key.assert_called_once()
        mock_pgp_service.get_user_keys.assert_called_once()
        mock_ssh_service.get_user_keys.assert_called_once()
