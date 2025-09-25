"""🔐 Key Storage Test Configuration

Pytest fixtures and configuration for key storage tests.
Provides shared fixtures for PGP and SSH key testing.

Author: Vulpine (Security-focused Fox Specialist)
Version: 1.0.0
"""

import asyncio
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock
from uuid import uuid4

import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ed25519, rsa, ec
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.security.pgp_key_models import AuthBase as PGPAuthBase
from app.security.ssh_key_models import AuthBase as SSHAuthBase


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def temp_dir() -> Generator[Path, None, None]:
    """Create a temporary directory for test files."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        yield Path(tmp_dir)


@pytest.fixture
def test_db_engine():
    """Create an in-memory SQLite database engine for testing."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Create all tables
    PGPAuthBase.metadata.create_all(engine)
    SSHAuthBase.metadata.create_all(engine)
    
    yield engine
    
    # Cleanup
    PGPAuthBase.metadata.drop_all(engine)
    SSHAuthBase.metadata.drop_all(engine)


@pytest.fixture
def test_db_session(test_db_engine):
    """Create a database session for testing."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_db_engine)
    session = SessionLocal()
    yield session
    session.close()


@pytest.fixture
def sample_pgp_key_data():
    """Sample PGP key data for testing."""
    return {
        "key_id": "1234567890ABCDEF",
        "fingerprint": "ABCD1234567890ABCD1234567890ABCD12345678",
        "short_fingerprint": "ABCD1234",
        "user_id": "test_user",
        "name": "Test User",
        "email": "test@example.com",
        "key_type": "RSA",
        "key_length": 2048,
        "algorithm": "RSA",
        "public_key_armored": "-----BEGIN PGP PUBLIC KEY BLOCK-----\nVersion: GnuPG v1\n\nmQENBFxQ...\n-----END PGP PUBLIC KEY BLOCK-----",
        "private_key_armored": "-----BEGIN PGP PRIVATE KEY BLOCK-----\nVersion: GnuPG v1\n\nlQH+BFxQ...\n-----END PGP PRIVATE KEY BLOCK-----",
        "passphrase": "test_passphrase",
        "status": "active",
        "is_primary": True,
        "auto_rotate": False,
        "rotation_schedule_days": 365,
        "trust_level": 0,
        "is_revoked": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    }


@pytest.fixture
def sample_ssh_key_data():
    """Sample SSH key data for testing."""
    return {
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
        "private_key_openssh": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABFwAAAAdzc2gtcn\n...\n-----END OPENSSH PRIVATE KEY-----",
        "passphrase": "test_passphrase",
        "status": "active",
        "usage": "authentication",
        "is_primary": True,
        "auto_rotate": False,
        "rotation_schedule_days": 365,
        "trust_level": 0,
        "is_revoked": False,
        "allowed_hosts": ["server1.example.com", "server2.example.com"],
        "allowed_commands": ["ls", "cat", "grep"],
        "source_restrictions": ["from=\"192.168.1.0/24\"", "from=\"10.0.0.0/8\""],
        "force_command": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    }


@pytest.fixture
def sample_ed25519_key_data():
    """Sample Ed25519 SSH key data for testing."""
    return {
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
        "private_key_openssh": "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAFwAAAAdzc2gtZWQy\n...\n-----END OPENSSH PRIVATE KEY-----",
        "passphrase": "test_passphrase",
        "status": "active",
        "usage": "signing",
        "is_primary": False,
        "auto_rotate": True,
        "rotation_schedule_days": 180,
        "trust_level": 5,
        "is_revoked": False,
        "allowed_hosts": None,
        "allowed_commands": None,
        "source_restrictions": None,
        "force_command": None,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None,
    }


@pytest.fixture
def mock_user_data():
    """Mock user data for testing."""
    return {
        "username": "test_user",
        "email": "test@example.com",
        "full_name": "Test User",
        "is_active": True,
        "is_admin": False,
        "created_at": datetime.now(timezone.utc),
        "last_login": None,
    }


@pytest.fixture
def mock_admin_user_data():
    """Mock admin user data for testing."""
    return {
        "username": "admin_user",
        "email": "admin@example.com",
        "full_name": "Admin User",
        "is_active": True,
        "is_admin": True,
        "created_at": datetime.now(timezone.utc),
        "last_login": datetime.now(timezone.utc),
    }


@pytest.fixture
def mock_request_data():
    """Mock HTTP request data for testing."""
    return {
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
        "request_id": str(uuid4()),
        "headers": {
            "x-forwarded-for": "192.168.1.100",
            "x-real-ip": "192.168.1.100",
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "x-request-id": str(uuid4()),
        },
    }


@pytest.fixture
def mock_pgp_key_service():
    """Mock PGP key service for testing."""
    service = MagicMock()
    service.generate_pgp_key = MagicMock()
    service.import_pgp_key = MagicMock()
    service.regenerate_pgp_key = MagicMock()
    service.get_user_keys = MagicMock()
    service.revoke_key = MagicMock()
    service.get_key_by_fingerprint = MagicMock()
    service._log_access = MagicMock()
    return service


@pytest.fixture
def mock_ssh_key_service():
    """Mock SSH key service for testing."""
    service = MagicMock()
    service.generate_ssh_key = MagicMock()
    service.import_ssh_key = MagicMock()
    service.regenerate_ssh_key = MagicMock()
    service.get_user_keys = MagicMock()
    service.revoke_key = MagicMock()
    service.get_key_by_fingerprint = MagicMock()
    service._log_access = MagicMock()
    return service


@pytest.fixture
def mock_database_session():
    """Mock database session for testing."""
    session = MagicMock()
    session.add = MagicMock()
    session.commit = MagicMock()
    session.rollback = MagicMock()
    session.query = MagicMock()
    session.close = MagicMock()
    session.filter = MagicMock()
    session.first = MagicMock()
    session.all = MagicMock()
    return session


@pytest.fixture
def sample_rsa_key_pair():
    """Generate a sample RSA key pair for testing."""
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
    )
    
    public_key = private_key.public_key()
    
    # Serialize keys
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    
    return {
        "private_key": private_pem,
        "public_key": public_pem,
        "key_size": 2048,
        "key_type": "RSA",
    }


@pytest.fixture
def sample_ed25519_key_pair():
    """Generate a sample Ed25519 key pair for testing."""
    private_key = ed25519.Ed25519PrivateKey.generate()
    public_key = private_key.public_key()
    
    # Serialize keys
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    
    return {
        "private_key": private_pem,
        "public_key": public_pem,
        "key_size": 256,
        "key_type": "Ed25519",
    }


@pytest.fixture
def sample_ecdsa_key_pair():
    """Generate a sample ECDSA key pair for testing."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_key = private_key.public_key()
    
    # Serialize keys
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    
    return {
        "private_key": private_pem,
        "public_key": public_pem,
        "key_size": 256,
        "key_type": "ECDSA",
    }


@pytest.fixture
def clean_environment():
    """Clean environment variables for testing."""
    # Store original values
    original_values = {}
    env_vars = [
        "AUTH_DATABASE_URL",
        "PGP_KEY_STORAGE_PATH",
        "SSH_KEY_STORAGE_PATH",
        "ENCRYPTION_KEY",
        "DEBUG",
        "TESTING",
    ]

    for var in env_vars:
        if var in os.environ:
            original_values[var] = os.environ[var]
            del os.environ[var]

    # Set test environment
    os.environ["TESTING"] = "true"
    os.environ["DEBUG"] = "false"

    yield

    # Restore original values
    for var, value in original_values.items():
        os.environ[var] = value


@pytest.fixture
def mock_audit_logger():
    """Mock audit logger for testing."""
    logger = MagicMock()
    logger.info = MagicMock()
    logger.warning = MagicMock()
    logger.error = MagicMock()
    logger.debug = MagicMock()
    return logger


# Pytest configuration
def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line("markers", "asyncio: mark test as async")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "unit: mark test as unit test")
    config.addinivalue_line("markers", "security: mark test as security test")
    config.addinivalue_line("markers", "pgp: mark test as PGP key test")
    config.addinivalue_line("markers", "ssh: mark test as SSH key test")
    config.addinivalue_line("markers", "slow: mark test as slow running")


def pytest_collection_modifyitems(config, items):
    """Modify test collection to add markers."""
    for item in items:
        # Add asyncio marker to async tests
        if asyncio.iscoroutinefunction(item.function):
            item.add_marker(pytest.mark.asyncio)

        # Add unit marker to non-integration tests
        if "integration" not in item.name:
            item.add_marker(pytest.mark.unit)

        # Add security marker to security tests
        if "security" in item.name.lower() or "Security" in item.name:
            item.add_marker(pytest.mark.security)

        # Add PGP marker to PGP tests
        if "pgp" in item.name.lower() or "PGP" in item.name:
            item.add_marker(pytest.mark.pgp)

        # Add SSH marker to SSH tests
        if "ssh" in item.name.lower() or "SSH" in item.name:
            item.add_marker(pytest.mark.ssh)

        # Add slow marker to integration tests
        if "integration" in item.name.lower() or "Integration" in item.name:
            item.add_marker(pytest.mark.slow)
