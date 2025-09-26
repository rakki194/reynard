"""Abstract backend interfaces for the Gatekeeper authentication library.

This module defines the abstract base classes that all user backends must implement.
"""

from abc import ABC, abstractmethod
from typing import Any

from ..models.user import User, UserCreate, UserPublic, UserUpdate


class BackendError(Exception):
    """Base exception for backend operations."""


class UserNotFoundError(BackendError):
    """Raised when a user is not found in the backend."""


class UserAlreadyExistsError(BackendError):
    """Raised when trying to create a user that already exists."""


class InvalidCredentialsError(BackendError):
    """Raised when authentication credentials are invalid."""


class UserBackend(ABC):
    """Abstract base class for user data backends.

    All user storage backends must implement this interface to provide
    consistent user management functionality across different storage systems.
    """

    @abstractmethod
    async def create_user(self, user: UserCreate) -> User:
        """Create a new user in the backend.

        Args:
            user: User creation data

        Returns:
            User: The created user object

        Raises:
            UserAlreadyExistsError: If a user with the same username already exists
            BackendError: For other backend-specific errors

        """

    @abstractmethod
    async def get_user_by_username(self, username: str) -> User | None:
        """Retrieve a user by username.

        Args:
            username: The username to search for

        Returns:
            Optional[User]: The user if found, None otherwise

        """

    @abstractmethod
    async def get_user_by_id(self, user_id: str) -> User | None:
        """Retrieve a user by ID.

        Args:
            user_id: The user ID to search for

        Returns:
            Optional[User]: The user if found, None otherwise

        """

    @abstractmethod
    async def get_user_by_email(self, email: str) -> User | None:
        """Retrieve a user by email address.

        Args:
            email: The email address to search for

        Returns:
            Optional[User]: The user if found, None otherwise

        """

    @abstractmethod
    async def update_user(self, username: str, user_update: UserUpdate) -> User:
        """Update an existing user.

        Args:
            username: The username of the user to update
            user_update: The update data

        Returns:
            User: The updated user object

        Raises:
            UserNotFoundError: If the user is not found
            BackendError: For other backend-specific errors

        """

    @abstractmethod
    async def delete_user(self, username: str) -> bool:
        """Delete a user from the backend.

        Args:
            username: The username of the user to delete

        Returns:
            bool: True if the user was deleted, False if not found

        """

    @abstractmethod
    async def list_users(self, skip: int = 0, limit: int = 100) -> list[UserPublic]:
        """List users in the backend.

        Args:
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return

        Returns:
            List[UserPublic]: List of users (public data only)

        """

    @abstractmethod
    async def count_users(self) -> int:
        """Get the total number of users in the backend.

        Returns:
            int: Total number of users

        """

    @abstractmethod
    async def update_user_password(self, username: str, new_password_hash: str) -> bool:
        """Update a user's password hash.

        Args:
            username: The username of the user
            new_password_hash: The new password hash

        Returns:
            bool: True if the password was updated, False if user not found

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def update_user_role(self, username: str, new_role: str) -> bool:
        """Update a user's role.

        Args:
            username: The username of the user
            new_role: The new role

        Returns:
            bool: True if the role was updated, False if user not found

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def update_user_profile_picture(
        self,
        username: str,
        profile_picture_url: str | None,
    ) -> bool:
        """Update a user's profile picture URL.

        Args:
            username: The username of the user
            profile_picture_url: The new profile picture URL or None to remove

        Returns:
            bool: True if the profile picture was updated, False if user not found

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def update_user_metadata(
        self,
        username: str,
        metadata: dict[str, Any],
    ) -> bool:
        """Update a user's metadata.

        Args:
            username: The username of the user
            metadata: The new metadata dictionary

        Returns:
            bool: True if the metadata was updated, False if user not found

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def search_users(
        self,
        query: str,
        skip: int = 0,
        limit: int = 100,
    ) -> list[UserPublic]:
        """Search for users by username or email.

        Args:
            query: Search query string
            skip: Number of users to skip (for pagination)
            limit: Maximum number of users to return

        Returns:
            List[UserPublic]: List of matching users (public data only)

        """

    @abstractmethod
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
            List[UserPublic]: List of users with the specified role

        """

    @abstractmethod
    async def is_username_taken(self, username: str) -> bool:
        """Check if a username is already taken.

        Args:
            username: The username to check

        Returns:
            bool: True if the username is taken, False otherwise

        """

    @abstractmethod
    async def is_email_taken(self, email: str) -> bool:
        """Check if an email is already taken.

        Args:
            email: The email to check

        Returns:
            bool: True if the email is taken, False otherwise

        """

    @abstractmethod
    async def get_user_settings(self, username: str) -> dict[str, Any]:
        """Get user settings.

        Args:
            username: The username of the user

        Returns:
            Dict[str, Any]: User settings dictionary

        Raises:
            UserNotFoundError: If the user is not found

        """

    @abstractmethod
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
            bool: True if the settings were updated, False if user not found

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def update_user_username(self, old_username: str, new_username: str) -> bool:
        """Update a user's username.

        Args:
            old_username: The current username
            new_username: The new username

        Returns:
            bool: True if the username was updated, False if user not found or new username taken

        Raises:
            BackendError: For backend-specific errors

        """

    @abstractmethod
    async def get_all_users(self) -> list[UserPublic]:
        """Get all users in the backend.

        Returns:
            List[UserPublic]: List of all users (public data only)

        """

    async def update_user_yapcoin_balance(self, username: str, amount: int) -> bool:
        """Update a user's YapCoin balance.

        This method is optional and may not be implemented by all backends.
        Default implementation returns False.

        Args:
            username: The username of the user
            amount: The amount to add/subtract from the balance

        Returns:
            bool: True if the balance was updated, False if user not found or not supported

        """
        return False

    @abstractmethod
    async def close(self) -> None:
        """Close the backend connection and clean up resources.

        This method should be called when the backend is no longer needed.
        """

    @abstractmethod
    async def health_check(self) -> bool:
        """Perform a health check on the backend.

        Returns:
            bool: True if the backend is healthy, False otherwise

        """

    # RBAC Methods

    @abstractmethod
    async def create_role(self, role_data: dict[str, Any]) -> dict[str, Any]:
        """Create a new role.

        Args:
            role_data: Role creation data

        Returns:
            dict: Created role data

        Raises:
            BackendError: If role creation fails
        """

    @abstractmethod
    async def get_role_by_name(self, name: str) -> dict[str, Any] | None:
        """Get a role by name.

        Args:
            name: Role name

        Returns:
            dict: Role data if found, None otherwise
        """

    @abstractmethod
    async def get_role_by_id(self, role_id: str) -> dict[str, Any] | None:
        """Get a role by ID.

        Args:
            role_id: Role ID

        Returns:
            dict: Role data if found, None otherwise
        """

    @abstractmethod
    async def create_permission(
        self, permission_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a new permission.

        Args:
            permission_data: Permission creation data

        Returns:
            dict: Created permission data

        Raises:
            BackendError: If permission creation fails
        """

    @abstractmethod
    async def get_permission_by_id(self, permission_id: str) -> dict[str, Any] | None:
        """Get a permission by ID.

        Args:
            permission_id: Permission ID

        Returns:
            dict: Permission data if found, None otherwise
        """

    @abstractmethod
    async def assign_role_to_user(
        self, user_id: str, role_id: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Assign a role to a user.

        Args:
            user_id: User ID
            role_id: Role ID
            context: Optional context for the assignment

        Returns:
            bool: True if successful, False otherwise
        """

    @abstractmethod
    async def remove_role_from_user(
        self, user_id: str, role_id: str, context: dict[str, Any] | None = None
    ) -> bool:
        """Remove a role from a user.

        Args:
            user_id: User ID
            role_id: Role ID
            context: Optional context for the removal

        Returns:
            bool: True if successful, False otherwise
        """

    @abstractmethod
    async def get_user_roles(
        self, user_id: str, context: dict[str, Any] | None = None
    ) -> list[dict[str, Any]]:
        """Get all roles for a user.

        Args:
            user_id: User ID
            context: Optional context filter

        Returns:
            list: List of user roles
        """

    @abstractmethod
    async def check_permission(
        self, user_id: str, resource_type: str, resource_id: str, operation: str
    ) -> dict[str, Any]:
        """Check if a user has permission for a resource/operation.

        Args:
            user_id: User ID
            resource_type: Type of resource
            resource_id: ID of the resource
            operation: Operation to check

        Returns:
            dict: Permission check result
        """

    @abstractmethod
    async def get_permissions_for_role(self, role_id: str) -> list[dict[str, Any]]:
        """Get all permissions for a role.

        Args:
            role_id: Role ID

        Returns:
            list: List of permissions
        """

    # Advanced RBAC Methods

    async def create_conditional_permission(
        self, conditional_permission_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a conditional permission.

        Args:
            conditional_permission_data: Conditional permission data

        Returns:
            dict: Created conditional permission data
        """
        raise NotImplementedError(
            "Conditional permissions not implemented in this backend"
        )

    async def get_conditional_permissions_for_role(
        self, role_id: str
    ) -> list[dict[str, Any]]:
        """Get conditional permissions for a role.

        Args:
            role_id: Role ID

        Returns:
            list: List of conditional permissions
        """
        raise NotImplementedError(
            "Conditional permissions not implemented in this backend"
        )

    async def create_role_assignment_rule(
        self, rule_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a role assignment rule.

        Args:
            rule_data: Rule data

        Returns:
            dict: Created rule data
        """
        raise NotImplementedError(
            "Role assignment rules not implemented in this backend"
        )

    async def get_role_assignment_rules_by_trigger(
        self, trigger_type: str
    ) -> list[dict[str, Any]]:
        """Get role assignment rules by trigger type.

        Args:
            trigger_type: Trigger type

        Returns:
            list: List of rules
        """
        raise NotImplementedError(
            "Role assignment rules not implemented in this backend"
        )

    async def create_role_delegation(
        self, delegation_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a role delegation.

        Args:
            delegation_data: Delegation data

        Returns:
            dict: Created delegation data
        """
        raise NotImplementedError("Role delegation not implemented in this backend")

    async def get_role_delegation_by_id(
        self, delegation_id: str
    ) -> dict[str, Any] | None:
        """Get a role delegation by ID.

        Args:
            delegation_id: Delegation ID

        Returns:
            dict: Delegation data if found, None otherwise
        """
        raise NotImplementedError("Role delegation not implemented in this backend")

    async def revoke_role_delegation(self, delegation_id: str) -> bool:
        """Revoke a role delegation.

        Args:
            delegation_id: Delegation ID

        Returns:
            bool: True if successful, False otherwise
        """
        raise NotImplementedError("Role delegation not implemented in this backend")

    async def create_role_hierarchy(
        self, hierarchy_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a role hierarchy relationship.

        Args:
            hierarchy_data: Hierarchy data

        Returns:
            dict: Created hierarchy data
        """
        raise NotImplementedError("Role hierarchy not implemented in this backend")

    async def get_role_hierarchies_by_child(
        self, child_role_id: str
    ) -> list[dict[str, Any]]:
        """Get role hierarchies by child role ID.

        Args:
            child_role_id: Child role ID

        Returns:
            list: List of hierarchy relationships
        """
        raise NotImplementedError("Role hierarchy not implemented in this backend")

    async def create_permission_override(
        self, override_data: dict[str, Any]
    ) -> dict[str, Any]:
        """Create a permission override.

        Args:
            override_data: Override data

        Returns:
            dict: Created override data
        """
        raise NotImplementedError(
            "Permission overrides not implemented in this backend"
        )

    async def get_permission_overrides_for_role(
        self, role_id: str
    ) -> list[dict[str, Any]]:
        """Get permission overrides for a role.

        Args:
            role_id: Role ID

        Returns:
            list: List of permission overrides
        """
        raise NotImplementedError(
            "Permission overrides not implemented in this backend"
        )
