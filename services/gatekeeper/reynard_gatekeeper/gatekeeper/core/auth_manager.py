"""Authentication manager for the Gatekeeper authentication library.

This module provides the main authentication manager that orchestrates
user authentication, authorization, and management operations.
"""

import logging
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from ..backends.base import UserAlreadyExistsError, UserBackend, UserNotFoundError
from ..models.rbac import (
    Permission,
    PermissionCreate,
    PermissionResult,
    ResourceAccessControl,
    ResourcePermissionGrant,
    Role,
    RoleCreate,
    UserRoleAssignment,
    UserRoleLink,
)
from ..models.token import TokenConfig, TokenResponse
from ..models.user import User, UserCreate, UserPublic, UserUpdate
from .audit_service import AuditEventType, audit_service
from .password_manager import PasswordManager, SecurityLevel
from .token_manager import TokenManager

logger = logging.getLogger(__name__)


class AuthManager:
    """Main authentication manager for the Gatekeeper library.

    This class orchestrates all authentication and authorization operations,
    including user management, password handling, and token management.
    """

    def __init__(
        self,
        backend: UserBackend,
        token_config: TokenConfig,
        password_security_level: SecurityLevel = SecurityLevel.MEDIUM,
    ):
        """Initialize the authentication manager.

        Args:
            backend: User data storage backend
            token_config: JWT token configuration
            password_security_level: Security level for password hashing

        """
        self.backend = backend
        self.token_config = token_config
        self.password_manager = PasswordManager(security_level=password_security_level)
        self.token_manager = TokenManager(token_config)

    async def create_user(self, user: UserCreate) -> User:
        """Create a new user with hashed password.

        Args:
            user: User creation data

        Returns:
            User: The created user object

        Raises:
            UserAlreadyExistsError: If a user with the same username already exists
            BackendError: For other backend-specific errors

        """
        # Hash the password
        password_hash = self.password_manager.hash_password(user.password)

        # Create user in backend
        created_user = await self.backend.create_user(user)

        # Update the password hash
        await self.backend.update_user_password(created_user.username, password_hash)

        # Return user with hashed password
        created_user.password_hash = password_hash

        logger.info(f"Created user '{user.username}' with role '{user.role}'")
        return created_user

    async def authenticate(
        self,
        username: str,
        password: str,
        client_ip: str | None = None,
    ) -> TokenResponse | None:
        """Authenticate a user with username and password.

        Args:
            username: The username
            password: The plain text password
            client_ip: Client IP address for rate limiting

        Returns:
            TokenResponse | None: Token response if authentication successful, None otherwise

        """
        # Rate limiting check
        if client_ip and not self.token_manager.check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return None

        # Get user from backend
        user = await self.backend.get_user_by_username(username)
        if not user:
            logger.warning(f"Authentication failed: user '{username}' not found")
            return None

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Authentication failed: user '{username}' is inactive")
            return None

        # Verify password
        is_valid, updated_hash = self.password_manager.verify_and_update_password(
            password,
            user.password_hash,
        )

        if not is_valid:
            logger.warning(
                f"Authentication failed: invalid password for user '{username}'",
            )
            return None

        # Update password hash if needed
        if updated_hash:
            await self.backend.update_user_password(username, updated_hash)
            logger.info(f"Password hash updated for user '{username}'")

        # Create tokens
        token_data: dict[str, Any] = {
            "sub": user.username,
            "role": user.role.value,
            "permissions": user.permissions or [],
            "user_id": str(user.id),
            "rbac_enabled": user.rbac_enabled,
            "default_role": user.default_role,
        }

        # Add RBAC data if enabled
        if user.rbac_enabled:
            try:
                # Get user roles
                user_roles = await self.get_user_roles(username)
                token_data["rbac_roles"] = [
                    {
                        "role_name": role["role_name"],
                        "role_level": role["role_level"],
                        "context_type": role["context_type"],
                        "context_id": role["context_id"],
                        "expires_at": (
                            role["expires_at"].isoformat()
                            if role["expires_at"]
                            else None
                        ),
                    }
                    for role in user_roles
                ]

                # Get user permissions (simplified for token)
                token_data["rbac_permissions"] = []
                for role in user_roles:
                    # This is a simplified approach - in production you might want to cache this
                    # or include more detailed permission information
                    token_data["rbac_permissions"].append(f"{role['role_name']}:*")

            except Exception as e:
                logger.warning(f"Failed to load RBAC data for user {username}: {e}")
                # Continue without RBAC data rather than failing authentication

        tokens = self.token_manager.create_tokens(token_data)

        # Log successful authentication
        logger.info(f"User '{username}' authenticated successfully")

        return tokens

    async def authenticate_by_email(
        self,
        email: str,
        password: str,
    ) -> TokenResponse | None:
        """Authenticate a user with email and password.

        Args:
            email: The email address
            password: The plain text password

        Returns:
            TokenResponse | None: Token response if authentication successful, None otherwise

        """
        try:
            # Get user from backend by email
            user = await self.backend.get_user_by_email(email)
            if not user:
                logger.warning(
                    f"Authentication failed: user with email '{email}' not found",
                )
                return None

            # Check if user is active
            if not user.is_active:
                logger.warning(
                    f"Authentication failed: user with email '{email}' is inactive",
                )
                return None

            # Verify password
            is_valid, updated_hash = self.password_manager.verify_and_update_password(
                password,
                user.password_hash,
            )

            if not is_valid:
                logger.warning(
                    f"Authentication failed: invalid password for user with email '{email}'",
                )
                return None

            # Update password hash if needed (e.g., migration to new Argon2 parameters)
            if updated_hash:
                await self.backend.update_user_password(user.username, updated_hash)
                logger.info(f"Updated password hash for user '{user.username}'")

            # Create token pair
            token_data: dict[str, Any] = {
                "sub": user.username,
                "role": user.role.value,
                "permissions": user.permissions or [],
                "user_id": str(user.id),
                "rbac_enabled": user.rbac_enabled,
                "default_role": user.default_role,
            }

            # Add RBAC data if enabled
            if user.rbac_enabled:
                try:
                    # Get user roles
                    user_roles = await self.get_user_roles(user.username)
                    token_data["rbac_roles"] = [
                        {
                            "role_name": role["role_name"],
                            "role_level": role["role_level"],
                            "context_type": role["context_type"],
                            "context_id": role["context_id"],
                            "expires_at": (
                                role["expires_at"].isoformat()
                                if role["expires_at"]
                                else None
                            ),
                        }
                        for role in user_roles
                    ]

                    # Get user permissions (simplified for token)
                    token_data["rbac_permissions"] = []
                    for role in user_roles:
                        # This is a simplified approach - in production you might want to cache this
                        # or include more detailed permission information
                        token_data["rbac_permissions"].append(f"{role['role_name']}:*")

                except Exception as e:
                    logger.warning(
                        f"Failed to load RBAC data for user {user.username}: {e}"
                    )
                    # Continue without RBAC data rather than failing authentication

            tokens = self.token_manager.create_tokens(token_data)

            logger.info(f"User with email '{email}' authenticated successfully")
            return tokens

        except Exception as e:
            logger.error(f"Error during email authentication: {e}")
            return None

    async def refresh_tokens(
        self,
        refresh_token: str,
        client_ip: str | None = None,
    ) -> TokenResponse | None:
        """Refresh access token using a valid refresh token.

        Args:
            refresh_token: The refresh token
            client_ip: Client IP address for rate limiting

        Returns:
            TokenResponse | None: New tokens if refresh successful, None otherwise

        """
        # Rate limiting check
        if client_ip and not self.token_manager.check_rate_limit(client_ip):
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return None

        # Verify refresh token
        result = self.token_manager.verify_token(refresh_token, "refresh")
        if not result.is_valid:
            logger.warning("Token refresh failed: invalid refresh token")
            return None

        # Get user data from token
        username = result.payload.sub if result.payload else None
        if not username:
            logger.warning("Token refresh failed: missing username in token")
            return None

        # Get user from backend to ensure they still exist and are active
        user = await self.backend.get_user_by_username(username)
        if not user or not user.is_active:
            logger.warning(
                f"Token refresh failed: user '{username}' not found or inactive",
            )
            return None

        # Create new tokens
        token_data: dict[str, Any] = {
            "sub": user.username,
            "role": user.role.value,
            "permissions": user.permissions or [],
            "user_id": str(user.id),
        }

        tokens = self.token_manager.create_tokens(token_data)

        logger.info(f"Tokens refreshed successfully for user '{username}'")
        return tokens

    # Backward-compatible alias for tests
    async def refresh_token(self, refresh_token: str) -> TokenResponse | None:
        """Backward-compatible alias for refresh_tokens.

        Args:
            refresh_token: The refresh token

        Returns:
            TokenResponse | None: New tokens if refresh successful, None otherwise

        """
        return await self.refresh_tokens(refresh_token)

    async def revoke_tokens(self, username: str, token: str | None = None) -> bool:
        """Revoke tokens for a user.

        Args:
            username: The username whose tokens should be revoked
            token: Specific token to revoke (if None, revokes all user tokens)

        Returns:
            bool: True if tokens were revoked successfully

        """
        if token:
            # Revoke specific token
            self.token_manager.blacklist_token(token)
            logger.info(f"Token revoked for user '{username}'")
        else:
            # Revoke all user tokens
            self.token_manager.revoke_user_tokens(username)
            logger.info(f"All tokens revoked for user '{username}'")

        return True

    async def logout(self, token: str) -> bool:
        """Logout a user by revoking their token.

        Args:
            token: The token to revoke

        Returns:
            bool: True if logout successful

        """
        # Get token info to log the logout
        token_info = self.token_manager.get_token_info(token)
        username = token_info.get("sub") if token_info else "unknown"

        # Revoke the token
        self.token_manager.blacklist_token(token)

        logger.info(f"User '{username}' logged out successfully")
        return True

    async def get_current_user(self, token: str) -> User | None:
        """Get the current user from a valid token.

        Args:
            token: The JWT token

        Returns:
            User | None: The user if token is valid, None otherwise

        """
        # Verify the token
        result = self.token_manager.verify_token(token, "access")
        if not result.is_valid:
            logger.warning("Failed to get current user: invalid token")
            return None

        # Extract username from token
        username = result.payload.sub if result.payload else None
        if not username:
            logger.warning("Failed to get current user: missing username in token")
            return None

        # Get user from backend
        user = await self.backend.get_user_by_username(username)
        if not user or not user.is_active:
            logger.warning(
                f"Failed to get current user: user '{username}' not found or inactive",
            )
            return None

        return user

    async def validate_token(
        self,
        token: str,
        required_role: str | None = None,
    ) -> bool:
        """Validate a token and optionally check role requirements.

        Args:
            token: The JWT token to validate
            required_role: Optional role requirement

        Returns:
            bool: True if token is valid and meets role requirements

        """
        # Verify the token
        result = self.token_manager.verify_token(token, "access")
        if not result.is_valid:
            return False

        # Check role requirement if specified
        if required_role:
            user_role = result.payload.role if result.payload else None
            if user_role != required_role:
                return False

        return True

    async def get_token_stats(self) -> dict[str, Any]:
        """Get statistics about token usage and blacklist.

        Returns:
            dict[str, Any]: Token statistics

        """
        return self.token_manager.get_blacklist_stats()

    async def cleanup_expired_tokens(self) -> None:
        """Clean up expired tokens from blacklist."""
        self.token_manager.cleanup_expired_blacklist()

    async def change_password(
        self,
        username: str,
        current_password: str,
        new_password: str,
    ) -> bool:
        """Change a user's password.

        Args:
            username: The username
            current_password: The current password for verification
            new_password: The new password

        Returns:
            bool: True if password was changed successfully, False otherwise

        """
        # Get user
        user = await self.backend.get_user_by_username(username)
        if not user:
            return False

        # Verify current password
        is_valid, _ = self.password_manager.verify_and_update_password(
            current_password,
            user.password_hash,
        )

        if not is_valid:
            return False

        # Hash new password
        new_password_hash = self.password_manager.hash_password(new_password)

        # Update password in backend
        success = await self.backend.update_user_password(username, new_password_hash)

        if success:
            logger.info(f"Password changed for user '{username}'")

        return success

    async def update_user(self, username: str, user_update: UserUpdate) -> User | None:
        """Update user information.

        Args:
            username: The username of the user to update
            user_update: The update data

        Returns:
            User | None: The updated user if successful, None otherwise

        """
        try:
            updated_user = await self.backend.update_user(username, user_update)
            logger.info(f"Updated user '{username}'")
            return updated_user
        except (UserNotFoundError, UserAlreadyExistsError) as e:
            logger.warning(f"Failed to update user '{username}': {e}")
            return None

    async def delete_user(self, username: str) -> bool:
        """Delete a user.

        Args:
            username: The username of the user to delete

        Returns:
            bool: True if user was deleted, False otherwise

        """
        success = await self.backend.delete_user(username)

        if success:
            logger.info(f"Deleted user '{username}'")

        return success

    async def list_users(self, skip: int = 0, limit: int = 100) -> list[UserPublic]:
        """List users in the system.

        Args:
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return

        Returns:
            list[UserPublic]: List of users (public data only)

        """
        return await self.backend.list_users(skip=skip, limit=limit)

    async def get_user_by_username(self, username: str) -> User | None:
        """Get a user by username.

        Args:
            username: The username to search for

        Returns:
            User | None: The user if found, None otherwise

        """
        return await self.backend.get_user_by_username(username)

    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserPublic]:
        """Search for users.

        Args:
            query: Search query string
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return

        Returns:
            list[UserPublic]: List of matching users

        """
        return await self.backend.search_users(query, skip=skip, limit=limit)

    async def get_users_by_role(
        self,
        role: str,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserPublic]:
        """Get users by role.

        Args:
            role: The role to filter by
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return

        Returns:
            list[UserPublic]: List of users with the specified role

        """
        return await self.backend.get_users_by_role(role, skip=skip, limit=limit)

    async def update_user_role(self, username: str, new_role: str) -> bool:
        """Update a user's role.

        Args:
            username: The username of the user
            new_role: The new role

        Returns:
            bool: True if role was updated, False otherwise

        """
        success = await self.backend.update_user_role(username, new_role)

        if success:
            logger.info(f"Updated role for user '{username}' to '{new_role}'")

        return success

    async def update_user_profile_picture(
        self,
        username: str,
        profile_picture_url: str | None,
    ) -> bool:
        """Update a user's profile picture.

        Args:
            username: The username of the user
            profile_picture_url: The new profile picture URL or None to remove

        Returns:
            bool: True if profile picture was updated, False otherwise

        """
        return await self.backend.update_user_profile_picture(
            username,
            profile_picture_url,
        )

    async def get_user_settings(self, username: str) -> dict[str, Any]:
        """Get user settings.

        Args:
            username: The username of the user

        Returns:
            dict[str, Any]: User settings dictionary

        """
        return await self.backend.get_user_settings(username)

    async def update_user_settings(
        self,
        username: str,
        settings: dict[str, Any],
    ) -> bool:
        """Update user settings.

        Args:
            username: The username of the user
            settings: The settings to update

        Returns:
            bool: True if settings were updated, False otherwise

        """
        return await self.backend.update_user_settings(username, settings)

    async def update_user_username(self, old_username: str, new_username: str) -> bool:
        """Update a user's username.

        Args:
            old_username: The current username
            new_username: The new username

        Returns:
            bool: True if username was updated, False otherwise

        """
        success = await self.backend.update_user_username(old_username, new_username)

        if success:
            logger.info(f"Updated username from '{old_username}' to '{new_username}'")

        return success

    async def get_all_users(self) -> list[UserPublic]:
        """Get all users in the system.

        Returns:
            list[UserPublic]: List of all users (public data only)

        """
        return await self.backend.get_all_users()

    async def update_user_yapcoin_balance(self, username: str, amount: int) -> bool:
        """Update a user's YapCoin balance.

        This method is optional and may not be supported by all backends.

        Args:
            username: The username of the user
            amount: The amount to add/subtract from the balance

        Returns:
            bool: True if balance was updated, False otherwise or if not supported

        """
        try:
            success = await self.backend.update_user_yapcoin_balance(username, amount)

            if success:
                logger.info(
                    f"Updated YapCoin balance for user '{username}' by {amount}",
                )
            else:
                logger.warning(
                    f"YapCoin balance update failed for user '{username}' or not supported by backend",
                )

            return success
        except Exception as e:
            logger.warning(f"YapCoin balance update not supported by backend: {e}")
            return False

    async def is_username_taken(self, username: str) -> bool:
        """Check if a username is already taken.

        Args:
            username: The username to check

        Returns:
            bool: True if the username is taken, False otherwise

        """
        return await self.backend.is_username_taken(username)

    async def is_email_taken(self, email: str) -> bool:
        """Check if an email is already taken.

        Args:
            email: The email to check

        Returns:
            bool: True if the email is taken, False otherwise

        """
        return await self.backend.is_email_taken(email)

    async def count_users(self) -> int:
        """Get the total number of users.

        Returns:
            int: Total number of users

        """
        return await self.backend.count_users()

    def validate_password_strength(self, password: str) -> tuple[bool, str]:
        """Validate password strength.

        Args:
            password: The password to validate

        Returns:
            tuple[bool, str]: (is_strong, reason)

        """
        return self.password_manager.validate_password_strength(password)

    def verify_token(self, token: str) -> bool:
        """Verify if a token is valid.

        Args:
            token: The JWT token to verify

        Returns:
            bool: True if token is valid, False otherwise

        """
        result = self.token_manager.verify_token(token, "access")
        return result.is_valid

    async def request_password_reset(self, email: str) -> str | None:
        """Request a password reset for a user.

        This method generates a secure reset token and stores it temporarily.
        In a production environment, this token would be sent via email.

        Args:
            email: The email address of the user requesting password reset

        Returns:
            str | None: Reset token if successful, None if user not found

        """
        try:
            # Find user by email
            user = await self.backend.get_user_by_email(email)
            if not user:
                logger.warning(
                    f"Password reset requested for non-existent email: {email}",
                )
                return None

            if not user.is_active:
                logger.warning(f"Password reset requested for inactive user: {email}")
                return None

            # Generate a secure reset token
            # TODO: Implement create_reset_token method in TokenManager
            reset_token = f"reset_{secrets.token_urlsafe(32)}"

            # Store the reset token in user metadata (in production, this would be in a separate table)
            if not user.metadata:
                user.metadata = {}

            user.metadata["reset_token"] = reset_token
            user.metadata["reset_token_expires"] = (
                datetime.now(UTC) + timedelta(hours=24)
            ).isoformat()

            # Update user with reset token
            from ..models.user import UserUpdate

            user_update = UserUpdate(metadata=user.metadata)
            await self.backend.update_user(user.username, user_update)

            logger.info(f"Password reset token generated for user: {user.username}")
            return reset_token

        except Exception as e:
            logger.error(f"Error requesting password reset for {email}: {e}")
            return None

    async def reset_password_with_token(
        self,
        reset_token: str,
        new_password: str,
    ) -> bool:
        """Reset a user's password using a valid reset token.

        Args:
            reset_token: The reset token from request_password_reset
            new_password: The new password

        Returns:
            bool: True if password was reset successfully, False otherwise

        """
        try:
            # Verify the reset token format
            # TODO: Implement proper reset token verification in TokenManager
            if not reset_token.startswith("reset_"):
                logger.warning("Invalid reset token format")
                return False

            # For now, we need to find the user by searching for the reset token in metadata
            # In a proper implementation, the token would contain the email
            # This is a simplified implementation - in production, you'd have a separate reset token table
            user = None
            # We'll need to search through users to find one with this reset token
            # This is not efficient but works for the current implementation
            try:
                # Get all users and find the one with this reset token
                all_users = await self.backend.get_all_users()
                for u in all_users:
                    if u.metadata and u.metadata.get("reset_token") == reset_token:
                        user = await self.backend.get_user_by_username(u.username)
                        break
            except Exception:
                pass

            if not user:
                logger.warning("User not found for reset token")
                return False

            if not user.is_active:
                logger.warning(
                    f"Password reset attempted for inactive user: {user.username}",
                )
                return False

            # Verify the token matches what's stored in user metadata
            if not user.metadata or user.metadata.get("reset_token") != reset_token:
                logger.warning(f"Reset token mismatch for user: {user.username}")
                return False

            # Check if token has expired (24 hours)
            token_expires = user.metadata.get("reset_token_expires")
            if token_expires:
                try:
                    expires_dt = datetime.fromisoformat(token_expires)
                    if datetime.now(UTC) > expires_dt:
                        logger.warning(f"Reset token expired for user: {user.username}")
                        return False
                except Exception as e:
                    logger.warning(f"Error parsing token expiration: {e}")
                    return False

            # Validate new password strength
            is_strong, reason = self.password_manager.validate_password_strength(
                new_password,
            )
            if not is_strong:
                logger.warning(f"Password reset failed - weak password: {reason}")
                return False

            # Hash the new password
            new_password_hash = self.password_manager.hash_password(new_password)

            # Update the password
            success = await self.backend.update_user_password(
                user.username,
                new_password_hash,
            )
            if not success:
                logger.error(f"Failed to update password for user: {user.username}")
                return False

            # Clear the reset token from metadata
            if user.metadata:
                user.metadata.pop("reset_token", None)
                user.metadata.pop("reset_token_expires", None)
                user_update = UserUpdate(metadata=user.metadata)
                await self.backend.update_user(user.username, user_update)

            logger.info(f"Password reset successful for user: {user.username}")
            return True

        except Exception as e:
            logger.error(f"Error resetting password with token: {e}")
            return False

    # RBAC Methods

    async def create_role(self, role_data: RoleCreate) -> Role:
        """Create a new role.

        Args:
            role_data: Role creation data

        Returns:
            Role: Created role

        Raises:
            BackendError: If role creation fails
        """
        try:
            role_dict = await self.backend.create_role(role_data.model_dump())
            return Role(**role_dict)
        except Exception as e:
            logger.error(f"Failed to create role: {e}")
            raise

    async def get_role_by_name(self, name: str) -> Role | None:
        """Get a role by name.

        Args:
            name: Role name

        Returns:
            Role: Role if found, None otherwise
        """
        try:
            role_dict = await self.backend.get_role_by_name(name)
            if role_dict:
                return Role(**role_dict)
            return None
        except Exception as e:
            logger.error(f"Failed to get role by name: {e}")
            return None

    async def create_permission(self, permission_data: PermissionCreate) -> Permission:
        """Create a new permission.

        Args:
            permission_data: Permission creation data

        Returns:
            Permission: Created permission

        Raises:
            BackendError: If permission creation fails
        """
        try:
            permission_dict = await self.backend.create_permission(
                permission_data.model_dump()
            )
            return Permission(**permission_dict)
        except Exception as e:
            logger.error(f"Failed to create permission: {e}")
            raise

    async def assign_role_to_user(
        self, username: str, role_name: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Assign a role to a user.

        Args:
            username: Username of the user
            role_name: Name of the role to assign
            context: Optional context for the role assignment

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get user
            user = await self.get_user_by_username(username)
            if not user:
                logger.error(f"User {username} not found")
                return False

            # Get role
            role = await self.get_role_by_name(role_name)
            if not role:
                logger.error(f"Role {role_name} not found")
                return False

            # Assign role
            success = await self.backend.assign_role_to_user(user.id, role.id, context)

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.ROLE_ASSIGNED,
                username=username,
                user_id=user.id,
                role_name=role_name,
                success=success,
                context=context,
            )

            if success:
                logger.info(f"Assigned role {role_name} to user {username}")
            else:
                logger.error(f"Failed to assign role {role_name} to user {username}")

            return success

        except Exception as e:
            logger.error(f"Failed to assign role to user: {e}")
            return False

    async def remove_role_from_user(
        self, username: str, role_name: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Remove a role from a user.

        Args:
            username: Username of the user
            role_name: Name of the role to remove
            context: Optional context for the role removal

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Get user
            user = await self.get_user_by_username(username)
            if not user:
                logger.error(f"User {username} not found")
                return False

            # Get role
            role = await self.get_role_by_name(role_name)
            if not role:
                logger.error(f"Role {role_name} not found")
                return False

            # Remove role
            success = await self.backend.remove_role_from_user(
                user.id, role.id, context
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.ROLE_REMOVED,
                username=username,
                user_id=user.id,
                role_name=role_name,
                success=success,
                context=context,
            )

            if success:
                logger.info(f"Removed role {role_name} from user {username}")
            else:
                logger.error(f"Failed to remove role {role_name} from user {username}")

            return success

        except Exception as e:
            logger.error(f"Failed to remove role from user: {e}")
            return False

    async def get_user_roles(
        self, username: str, context: dict[str, Any] | None = None
    ) -> list[dict[str, Any]]:
        """Get all roles for a user.

        Args:
            username: Username of the user
            context: Optional context filter

        Returns:
            list[dict[str, Any]]: List of user roles
        """
        try:
            user = await self.get_user_by_username(username)
            if not user:
                logger.error(f"User {username} not found")
                return []

            return await self.backend.get_user_roles(user.id, context)

        except Exception as e:
            logger.error(f"Failed to get user roles: {e}")
            return []

    async def check_permission(
        self, username: str, resource_type: str, resource_id: str, operation: str
    ) -> PermissionResult:
        """Check if a user has permission for a resource/operation.

        Args:
            username: Username of the user
            resource_type: Type of resource
            resource_id: ID of the resource
            operation: Operation to check

        Returns:
            PermissionResult: Permission check result
        """
        try:
            user = await self.get_user_by_username(username)
            if not user:
                return PermissionResult(granted=False, reason="User not found")

            # Check if user has RBAC enabled
            if not user.rbac_enabled:
                return PermissionResult(
                    granted=False, reason="RBAC not enabled for user"
                )

            # Check permission
            result = await self.backend.check_permission(
                user.id, resource_type, resource_id, operation
            )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=(
                    AuditEventType.PERMISSION_GRANTED
                    if result.get("granted")
                    else AuditEventType.PERMISSION_DENIED
                ),
                username=username,
                user_id=user.id,
                resource_type=resource_type,
                resource_id=resource_id,
                operation=operation,
                success=result.get("granted", False),
                error_message=(
                    result.get("reason") if not result.get("granted") else None
                ),
            )

            return PermissionResult(**result)

        except Exception as e:
            logger.error(f"Failed to check permission: {e}")
            return PermissionResult(
                granted=False, reason=f"Permission check failed: {e}"
            )

    async def enable_rbac_for_user(
        self, username: str, default_role: str | None = None
    ) -> bool:
        """Enable RBAC for a user.

        Args:
            username: Username of the user
            default_role: Optional default role to assign

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            user = await self.get_user_by_username(username)
            if not user:
                logger.error(f"User {username} not found")
                return False

            # Update user to enable RBAC
            user_update = UserUpdate(
                rbac_enabled=True,
                default_role=default_role,
                last_rbac_sync=datetime.now(UTC),
            )

            updated_user = await self.update_user(username, user_update)
            if not updated_user:
                return False

            # Assign default role if specified
            if default_role:
                success = await self.assign_role_to_user(username, default_role)
                if not success:
                    logger.warning(
                        f"Failed to assign default role {default_role} to user {username}"
                    )

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.RBAC_ENABLED,
                username=username,
                user_id=user.id,
                success=True,
                context={"default_role": default_role},
            )

            logger.info(f"Enabled RBAC for user {username}")
            return True

        except Exception as e:
            logger.error(f"Failed to enable RBAC for user: {e}")
            return False

    async def disable_rbac_for_user(self, username: str) -> bool:
        """Disable RBAC for a user.

        Args:
            username: Username of the user

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            user = await self.get_user_by_username(username)
            if not user:
                logger.error(f"User {username} not found")
                return False

            # Update user to disable RBAC
            user_update = UserUpdate(
                rbac_enabled=False, default_role=None, last_rbac_sync=datetime.now(UTC)
            )

            updated_user = await self.update_user(username, user_update)
            if not updated_user:
                return False

            # Log audit event
            await audit_service.log_rbac_operation(
                event_type=AuditEventType.RBAC_DISABLED,
                username=username,
                user_id=user.id,
                success=True,
            )

            logger.info(f"Disabled RBAC for user {username}")
            return True

        except Exception as e:
            logger.error(f"Failed to disable RBAC for user: {e}")
            return False

    async def close(self) -> None:
        """Close the authentication manager and clean up resources."""
        await self.backend.close()
        logger.info("Authentication manager closed")

    async def health_check(self) -> bool:
        """Perform a health check on the authentication system.

        Returns:
            bool: True if the system is healthy, False otherwise

        """
        try:
            return await self.backend.health_check()
        except Exception as e:
            logger.error(f"Health check failed: {e}")
            return False
