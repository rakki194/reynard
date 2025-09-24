"""Mock password manager.
"""

from ..main import MockPasswordManager, SecurityLevel

# Alias for compatibility
PasswordManager = MockPasswordManager

__all__ = ["MockPasswordManager", "PasswordManager", "SecurityLevel"]
