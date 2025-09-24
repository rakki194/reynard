"""Password management for the Gatekeeper authentication library.

This module provides a centralized interface for password hashing operations,
supporting modern Argon2 hashing with optimal security parameters.
"""

import logging
import secrets
from enum import Enum
from typing import Any

try:
    from argon2 import PasswordHasher
    from argon2.exceptions import VerificationError
except ImportError as exc:
    raise ImportError(
        "argon2-cffi is required for password hashing. "
        "Install with: pip install argon2-cffi",
    ) from exc

logger = logging.getLogger(__name__)

# Constants for hash parsing
ARGON2_HASH_MIN_PARTS = 5
ARGON2_PARAMS_COUNT = 3
ARGON2_MIN_PARTS = 2

# Password validation constants
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


class Argon2Variant(Enum):
    """Argon2 variants available for password hashing."""

    ARGON2ID = "argon2id"  # Recommended for password hashing
    ARGON2I = "argon2i"  # Data-independent memory access
    ARGON2D = "argon2d"  # Data-dependent memory access


class SecurityLevel(Enum):
    """Predefined security levels for Argon2 parameters."""

    LOW = "low"  # For development/testing
    MEDIUM = "medium"  # For general use
    HIGH = "high"  # For high-security applications
    PARANOID = "paranoid"  # For maximum security


# Security parameter presets based on OWASP recommendations and modern best practices
SECURITY_PARAMS = {
    SecurityLevel.LOW: {
        "time_cost": 2,
        "memory_cost": 2**16,  # 64 MiB
        "parallelism": 1,
        "hash_len": 32,
        "salt_len": 16,
    },
    SecurityLevel.MEDIUM: {
        "time_cost": 3,
        "memory_cost": 2**17,  # 128 MiB
        "parallelism": 2,
        "hash_len": 32,
        "salt_len": 16,
    },
    SecurityLevel.HIGH: {
        "time_cost": 4,
        "memory_cost": 2**18,  # 256 MiB
        "parallelism": 4,
        "hash_len": 32,
        "salt_len": 16,
    },
    SecurityLevel.PARANOID: {
        "time_cost": 6,
        "memory_cost": 2**19,  # 512 MiB
        "parallelism": 8,
        "hash_len": 32,
        "salt_len": 16,
    },
}


class PasswordManager:
    """Password management class for secure password operations.

    Provides methods for hashing, verifying, and validating passwords using
    modern Argon2 cryptographic algorithms.
    """

    def __init__(self, security_level: SecurityLevel = SecurityLevel.MEDIUM):
        """Initialize the password manager.

        Args:
            security_level: The security level to use for password hashing

        """
        self.security_level = security_level
        self._password_hasher: PasswordHasher | None = None

    def get_security_level(self) -> SecurityLevel:
        """Get the current security level.

        Returns:
            SecurityLevel: The configured security level

        """
        return self.security_level

    def get_argon2_params(self) -> dict[str, Any]:
        """Get Argon2 parameters based on the current security level.

        Returns:
            dict[str, Any]: Argon2 parameters dictionary

        """
        return SECURITY_PARAMS[self.security_level].copy()

    def get_password_hasher(self) -> PasswordHasher:
        """Get the password hasher instance.

        Creates a password hasher with optimal Argon2 parameters based on
        the configured security level.

        Returns:
            PasswordHasher: Configured password hasher instance

        """
        if self._password_hasher is None:
            params = self.get_argon2_params()

            self._password_hasher = PasswordHasher(
                time_cost=params["time_cost"],
                memory_cost=params["memory_cost"],
                parallelism=params["parallelism"],
                hash_len=params["hash_len"],
                salt_len=params["salt_len"],
            )

            logger.info(
                "Initialized Argon2 password hasher with %s security level (t=%d, m=%d, p=%d)",
                self.security_level.value,
                params["time_cost"],
                params["memory_cost"],
                params["parallelism"],
            )

        return self._password_hasher

    def hash_password(self, password: str) -> str:
        """Hash a password using Argon2 with optimal security parameters.

        Args:
            password: Plain text password to hash

        Returns:
            str: Hashed password string

        Raises:
            ValueError: If password is empty

        """
        if not password:
            raise ValueError("Password cannot be empty")

        password_hasher = self.get_password_hasher()
        return password_hasher.hash(password)

    def verify_password(self, password: str, hashed_password: str) -> bool:
        """Verify a password against a hash.

        Supports Argon2 hashes only.

        Args:
            password: Plain text password to verify
            hashed_password: Stored password hash

        Returns:
            bool: True if password matches, False otherwise

        """
        if not password or not hashed_password:
            return False

        # Try Argon2 (modern hashes)
        if self.is_argon2_hash(hashed_password):
            try:
                password_hasher = self.get_password_hasher()
                password_hasher.verify(hashed_password, password)
                return True
            except VerificationError:
                return False
            except Exception as e:
                logger.warning("Error verifying Argon2 hash: %s", e)
                return False

        # Unknown hash format
        logger.warning("Unknown hash format encountered: %s...", hashed_password[:20])
        return False

    def verify_and_update_password(
        self, password: str, hashed_password: str,
    ) -> tuple[bool, str | None]:
        """Verify a password and return updated hash if needed.

        This method will:
        1. Verify the password against the current hash
        2. Return a new hash if the current hash is using outdated parameters

        Args:
            password: Plain text password to verify
            hashed_password: Stored password hash

        Returns:
            tuple[bool, str | None]: (is_valid, new_hash_if_needed)

        """
        if not password or not hashed_password:
            return False, None

        # Try Argon2 first
        if self.is_argon2_hash(hashed_password):
            try:
                password_hasher = self.get_password_hasher()
                password_hasher.verify(hashed_password, password)

                # Check if hash needs updating (different parameters)
                if self._needs_argon2_update(hashed_password):
                    new_hash = password_hasher.hash(password)
                    logger.info("Argon2 hash updated to current parameters")
                    return True, new_hash

                return True, None

            except VerificationError:
                return False, None
            except Exception as e:
                logger.warning("Error verifying Argon2 hash: %s", e)
                return False, None

        # Unknown hash format
        logger.warning("Unknown hash format encountered: %s...", hashed_password[:20])
        return False, None

    def _needs_argon2_update(self, hashed_password: str) -> bool:
        """Check if an Argon2 hash needs updating due to parameter changes.

        Args:
            hashed_password: Argon2 hash to check

        Returns:
            bool: True if hash should be updated

        """
        try:
            # Parse the hash to extract parameters
            parts = hashed_password.split("$")
            if len(parts) < ARGON2_HASH_MIN_PARTS:
                return True

            # Extract parameters from hash
            params_str = parts[3]

            # Parse memory, time, and parallelism from params
            param_parts = params_str.split(",")
            if len(param_parts) != ARGON2_PARAMS_COUNT:
                return True

            try:
                memory_cost = int(param_parts[0].split("=")[1])
                time_cost = int(param_parts[1].split("=")[1])
                parallelism = int(param_parts[2].split("=")[1])
            except (ValueError, IndexError):
                return True

            # Get current recommended parameters
            current_params = self.get_argon2_params()

            # Check if any parameters need updating
            return bool(
                memory_cost != current_params["memory_cost"]
                or time_cost != current_params["time_cost"]
                or parallelism != current_params["parallelism"],
            )

        except Exception as e:
            logger.warning("Error parsing Argon2 hash parameters: %s", e)
            return True

    def is_argon2_hash(self, hashed_password: str) -> bool:
        """Check if a hash is in Argon2 format.

        Args:
            hashed_password: Password hash to check

        Returns:
            bool: True if the hash is in Argon2 format

        """
        return hashed_password.startswith("$argon2")

    def get_hash_algorithm(self, hashed_password: str) -> str:
        """Determine the algorithm used for a password hash.

        Args:
            hashed_password: Password hash to analyze

        Returns:
            str: Algorithm name ('argon2' or 'unknown')

        """
        if self.is_argon2_hash(hashed_password):
            return "argon2"
        return "unknown"

    def get_hash_variant(self, hashed_password: str) -> str | None:
        """Get the specific Argon2 variant used in a hash.

        Args:
            hashed_password: Argon2 hash to analyze

        Returns:
            Optional[str]: Variant name ('argon2id', 'argon2i', 'argon2d') or None

        """
        if not self.is_argon2_hash(hashed_password):
            return None

        try:
            parts = hashed_password.split("$")
            if len(parts) >= ARGON2_MIN_PARTS:
                return parts[1]
        except Exception as e:
            logger.debug("Error parsing hash variant: %s", e)

        return None

    def generate_secure_salt(self, length: int = 16) -> bytes:
        """Generate a cryptographically secure salt.

        Args:
            length: Length of the salt in bytes

        Returns:
            bytes: Random salt

        """
        return secrets.token_bytes(length)

    def benchmark_hash_time(
        self, password: str, iterations: int = 10,
    ) -> dict[str, float]:
        """Benchmark hash performance for different security levels.

        Args:
            password: Password to hash for benchmarking
            iterations: Number of iterations to run

        Returns:
            dict[str, float]: Average time per hash for each security level

        """
        results = {}

        for level in SecurityLevel:
            params = SECURITY_PARAMS[level]
            hasher = PasswordHasher(
                time_cost=params["time_cost"],
                memory_cost=params["memory_cost"],
                parallelism=params["parallelism"],
                hash_len=params["hash_len"],
                salt_len=params["salt_len"],
            )

            import time

            start_time = time.time()

            for _ in range(iterations):
                hasher.hash(password)

            end_time = time.time()
            avg_time = (end_time - start_time) / iterations
            results[level.value] = avg_time

        return results

    def validate_password_strength(self, password: str) -> tuple[bool, str]:
        """Validate password strength according to modern security standards.

        Args:
            password: Password to validate

        Returns:
            tuple[bool, str]: (is_strong, reason)

        """
        if not password:
            return False, "Password cannot be empty"

        if len(password) < MIN_PASSWORD_LENGTH:
            return (
                False,
                f"Password must be at least {MIN_PASSWORD_LENGTH} characters long",
            )

        if len(password) > MAX_PASSWORD_LENGTH:
            return (
                False,
                f"Password must be no more than {MAX_PASSWORD_LENGTH} characters long",
            )

        # Check for common weak patterns
        common_passwords = {
            "password",
            "123456",
            "123456789",
            "qwerty",
            "abc123",
            "password123",
            "admin",
            "letmein",
            "welcome",
            "monkey",
        }

        if password.lower() in common_passwords:
            return False, "Password is too common"

        # Check character diversity
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)

        if not (has_lower and has_upper and has_digit):
            return (
                False,
                "Password must contain lowercase, uppercase, and numeric characters",
            )

        return True, "Password meets strength requirements"

    def get_hash_info(self, hashed_password: str) -> dict[str, Any]:
        """Get detailed information about a password hash.

        Args:
            hashed_password: Password hash to analyze

        Returns:
            dict[str, Any]: Hash information including algorithm, parameters, etc.

        """
        info: dict[str, Any] = {
            "algorithm": self.get_hash_algorithm(hashed_password),
            "variant": None,
            "parameters": {},
            "needs_update": False,
        }

        if info["algorithm"] == "argon2":
            info["variant"] = self.get_hash_variant(hashed_password)
            info["needs_update"] = self._needs_argon2_update(hashed_password)

            # Parse Argon2 parameters
            try:
                parts = hashed_password.split("$")
                if len(parts) >= ARGON2_HASH_MIN_PARTS:
                    params_str = parts[3]
                    param_parts = params_str.split(",")
                    if len(param_parts) == ARGON2_PARAMS_COUNT:
                        info["parameters"] = {
                            "memory_cost": int(param_parts[0].split("=")[1]),
                            "time_cost": int(param_parts[1].split("=")[1]),
                            "parallelism": int(param_parts[2].split("=")[1]),
                        }
            except Exception as e:
                logger.debug("Error parsing Argon2 parameters: %s", e)

        return info
