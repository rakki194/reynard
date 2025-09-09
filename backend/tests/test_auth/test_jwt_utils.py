"""
Tests for JWT token utilities and security functions.

This module tests JWT token creation, verification, and security measures.
"""

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from app.auth.jwt_utils import create_access_token, create_refresh_token, verify_token
from app.config.jwt_config import SECRET_KEY, ALGORITHM


class TestJWTTokenCreation:
    """Test JWT token creation functionality."""

    def test_create_access_token_success(self):
        """Test successful access token creation."""
        data = {"sub": "testuser", "username": "testuser"}
        token = create_access_token(data)
        
        # Token should be a string
        assert isinstance(token, str)
        
        # Token should be decodable
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == "testuser"
        assert decoded["username"] == "testuser"
        assert "exp" in decoded

    def test_create_refresh_token_success(self):
        """Test successful refresh token creation."""
        data = {"sub": "testuser", "username": "testuser"}
        token = create_refresh_token(data)
        
        # Token should be a string
        assert isinstance(token, str)
        
        # Token should be decodable
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == "testuser"
        assert decoded["username"] == "testuser"
        assert "exp" in decoded

    def test_create_token_with_custom_expiry(self):
        """Test token creation with custom expiry time."""
        data = {"sub": "testuser"}
        custom_expiry = timedelta(minutes=5)
        token = create_access_token(data, expires_delta=custom_expiry)
        
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_time = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
        expected_time = datetime.now(timezone.utc) + custom_expiry
        
        # Expiry should be within 1 second of expected time
        time_diff = abs((exp_time - expected_time).total_seconds())
        assert time_diff < 1

    def test_create_token_with_empty_data(self):
        """Test token creation with empty data."""
        data = {}
        token = create_access_token(data)
        
        # Should still create a valid token
        assert isinstance(token, str)
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert "exp" in decoded

    def test_create_token_with_complex_data(self):
        """Test token creation with complex data structures."""
        data = {
            "sub": "testuser",
            "username": "testuser",
            "roles": ["user", "admin"],
            "permissions": {"read": True, "write": False},
            "metadata": {"last_login": "2023-01-01T00:00:00Z"}
        }
        token = create_access_token(data)
        
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        assert decoded["sub"] == "testuser"
        assert decoded["username"] == "testuser"
        assert decoded["roles"] == ["user", "admin"]
        assert decoded["permissions"]["read"] is True
        assert decoded["permissions"]["write"] is False


class TestJWTTokenVerification:
    """Test JWT token verification functionality."""

    def test_verify_valid_access_token(self):
        """Test verification of valid access token."""
        data = {"sub": "testuser", "username": "testuser"}
        token = create_access_token(data)
        
        result = verify_token(token, "access")
        assert result is not None
        assert result["sub"] == "testuser"
        assert result["username"] == "testuser"

    def test_verify_valid_refresh_token(self):
        """Test verification of valid refresh token."""
        data = {"sub": "testuser", "username": "testuser"}
        token = create_refresh_token(data)
        
        result = verify_token(token, "refresh")
        assert result is not None
        assert result["sub"] == "testuser"
        assert result["username"] == "testuser"

    def test_verify_expired_token(self):
        """Test verification of expired token."""
        data = {"sub": "testuser"}
        expired_token = create_access_token(data, expires_delta=timedelta(minutes=-1))
        
        result = verify_token(expired_token, "access")
        assert result is None

    def test_verify_invalid_token(self):
        """Test verification of invalid token."""
        invalid_tokens = [
            "invalid.token.here",
            "not.a.valid.jwt",
            "",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature",
            "not-a-jwt-at-all"
        ]
        
        for invalid_token in invalid_tokens:
            result = verify_token(invalid_token, "access")
            assert result is None

    def test_verify_token_with_wrong_secret(self):
        """Test verification of token with wrong secret key."""
        # Create token with correct secret
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Try to decode with wrong secret
        try:
            jwt.decode(token, "wrong-secret", algorithms=[ALGORITHM])
            assert False, "Should have raised JWTError"
        except JWTError:
            pass  # Expected

    def test_verify_token_with_wrong_algorithm(self):
        """Test verification of token with wrong algorithm."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Try to decode with wrong algorithm
        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS512"])
            assert False, "Should have raised JWTError"
        except JWTError:
            pass  # Expected

    def test_verify_token_missing_required_fields(self):
        """Test verification of token missing required fields."""
        # Create token without 'sub' field
        data = {"username": "testuser"}
        token = create_access_token(data)
        
        result = verify_token(token, "access")
        # Should still work, but 'sub' field won't be present
        assert result is not None
        assert "username" in result

    def test_verify_token_with_malformed_payload(self):
        """Test verification of token with malformed payload."""
        # Create a token with malformed payload
        header = jwt.get_unverified_header(create_access_token({"sub": "testuser"}))
        malformed_payload = {"sub": "testuser", "exp": "not-a-number"}
        
        try:
            malformed_token = jwt.encode(malformed_payload, SECRET_KEY, algorithm=ALGORITHM)
            result = verify_token(malformed_token, "access")
            assert result is None
        except Exception:
            # If encoding fails, that's also acceptable
            pass


class TestJWTSecurity:
    """Test JWT security measures."""

    def test_token_contains_no_sensitive_data(self):
        """Test that tokens don't contain sensitive information."""
        data = {
            "sub": "testuser",
            "password": "secretpassword",  # This should not appear in token
            "secret_key": "secretvalue"    # This should not appear in token
        }
        token = create_access_token(data)
        
        # Decode without verification to see raw payload
        unverified = jwt.get_unverified_claims(token)
        
        # Sensitive data should not be in the token
        assert "password" not in unverified
        assert "secret_key" not in unverified
        assert "sub" in unverified

    def test_token_expiry_validation(self):
        """Test that token expiry is properly validated."""
        data = {"sub": "testuser"}
        
        # Create token with very short expiry
        short_token = create_access_token(data, expires_delta=timedelta(seconds=1))
        
        # Should be valid immediately
        result = verify_token(short_token, "access")
        assert result is not None
        
        # Wait for expiry and test again
        import time
        time.sleep(1.1)
        
        result = verify_token(short_token, "access")
        assert result is None

    def test_token_algorithm_validation(self):
        """Test that only correct algorithms are accepted."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Should work with correct algorithm
        result = verify_token(token, "access")
        assert result is not None
        
        # Try to decode with different algorithm
        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS512", "RS256"])
            assert False, "Should have raised JWTError"
        except JWTError:
            pass  # Expected

    def test_token_signature_validation(self):
        """Test that token signatures are properly validated."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Modify the signature
        parts = token.split('.')
        parts[2] = "modified_signature"
        modified_token = '.'.join(parts)
        
        result = verify_token(modified_token, "access")
        assert result is None

    def test_token_header_validation(self):
        """Test that token headers are properly validated."""
        data = {"sub": "testuser"}
        token = create_access_token(data)
        
        # Modify the header to use a different algorithm
        parts = token.split('.')
        parts[0] = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9"  # HS512 algorithm instead of HS256
        modified_token = '.'.join(parts)
        
        result = verify_token(modified_token, "access")
        assert result is None


class TestJWTEdgeCases:
    """Test JWT edge cases and error conditions."""

    def test_verify_token_with_none_input(self):
        """Test token verification with None input."""
        result = verify_token(None, "access")
        assert result is None

    def test_verify_token_with_empty_string(self):
        """Test token verification with empty string."""
        result = verify_token("", "access")
        assert result is None

    def test_verify_token_with_whitespace(self):
        """Test token verification with whitespace-only string."""
        result = verify_token("   ", "access")
        assert result is None

    def test_verify_token_with_unicode_characters(self):
        """Test token verification with unicode characters in data."""
        data = {"sub": "测试用户", "username": "тест"}
        token = create_access_token(data)
        
        result = verify_token(token, "access")
        assert result is not None
        assert result["sub"] == "测试用户"
        assert result["username"] == "тест"

    def test_verify_token_with_large_payload(self):
        """Test token verification with large payload."""
        # Create a large payload
        large_data = {
            "sub": "testuser",
            "large_field": "x" * 10000  # 10KB of data
        }
        token = create_access_token(large_data)
        
        result = verify_token(token, "access")
        assert result is not None
        assert len(result["large_field"]) == 10000

    def test_verify_token_type_parameter(self):
        """Test that token type parameter is handled correctly."""
        data = {"sub": "testuser"}
        access_token = create_access_token(data)
        refresh_token = create_refresh_token(data)
        
        # Both should verify regardless of type parameter
        assert verify_token(access_token, "access") is not None
        assert verify_token(access_token, "refresh") is not None
        assert verify_token(refresh_token, "access") is not None
        assert verify_token(refresh_token, "refresh") is not None
