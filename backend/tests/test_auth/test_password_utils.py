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
        
        # Hash should contain salt and hash separated by colon
        assert ":" in hashed
        salt_hex, password_hash_hex = hashed.split(":")
        
        # Both parts should be valid hex strings
        assert len(salt_hex) == 64  # 32 bytes = 64 hex chars
        assert len(password_hash_hex) == 64  # 32 bytes = 64 hex chars
        
        # Should be valid hex
        int(salt_hex, 16)
        int(password_hash_hex, 16)

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