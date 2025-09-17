"""
Tests for password utilities and security functions.

This module tests password hashing, verification, and security measures.
"""

from app.auth.password_utils import get_password_hash, verify_password


class TestPasswordHashing:
    """Test password hashing functionality."""

    def test_password_hash_generation(self):
        """Test that password hashing generates a valid hash."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        # Hash should be a string
        assert isinstance(hashed, str)

        # Hash should be in Argon2 format (starts with $argon2id$)
        assert hashed.startswith("$argon2id$")

        # Should contain version, memory, time, parallelism, salt, and hash
        parts = hashed.split("$")
        assert len(parts) >= 6  # $argon2id$v=19$m=131072,t=3,p=2$salt$hash

        # Should be a valid Argon2 hash format
        assert parts[1] == "argon2id"
        assert parts[2].startswith("v=")
        # The third part contains m=,t=,p= all together
        assert "m=" in parts[3] and "t=" in parts[3] and "p=" in parts[3]

    def test_password_hash_uniqueness(self):
        """Test that the same password generates different hashes."""
        password = "testpassword123"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)

        # Hashes should be different due to random salt
        assert hash1 != hash2

    def test_password_verification_success(self):
        """Test successful password verification."""
        password = "testpassword123"
        hashed = get_password_hash(password)

        # Correct password should verify successfully
        assert verify_password(password, hashed) is True

    def test_password_verification_failure(self):
        """Test failed password verification."""
        password = "testpassword123"
        wrong_password = "wrongpassword456"
        hashed = get_password_hash(password)

        # Wrong password should fail verification
        assert verify_password(wrong_password, hashed) is False
