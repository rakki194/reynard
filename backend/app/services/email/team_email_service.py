"""Team-based Email Management Service with RBAC Integration.

This service provides team-based email account management using the
RBAC system for access control and team collaboration.
"""

import logging
from typing import Any, Dict, List, Optional
from uuid import UUID

from app.gatekeeper_config import get_auth_manager
from app.services.email.core.multi_account_service import (
    AccountConfig,
    MultiAccountService,
)
from app.services.email.rbac_email_service import RBACEmailService
from gatekeeper.models.rbac import PermissionResult

logger = logging.getLogger(__name__)


class TeamEmailService:
    """Service for managing team-based email accounts with RBAC."""

    def __init__(
        self,
        multi_account_service: MultiAccountService,
        rbac_email_service: RBACEmailService,
    ):
        """Initialize the team email service.

        Args:
            multi_account_service: MultiAccountService instance for email operations
            rbac_email_service: RBACEmailService instance for permission checking
        """
        self.multi_account_service = multi_account_service
        self.rbac_email_service = rbac_email_service
        self.auth_manager = get_auth_manager()
        self.logger = logging.getLogger(f"{__name__}.team_email_service")

    async def create_team_email_account(
        self,
        team_id: str,
        email_address: str,
        display_name: str,
        creator_id: str,
        smtp_config: Dict[str, Any],
        imap_config: Dict[str, Any],
        team_permissions: Optional[Dict[str, Any]] = None,
        encryption_config: Optional[Dict[str, Any]] = None,
        calendar_config: Optional[Dict[str, Any]] = None,
        ai_config: Optional[Dict[str, Any]] = None,
    ) -> AccountConfig:
        """Create a new team email account with RBAC permissions.

        Args:
            team_id: ID of the team
            email_address: Email address for the team account
            display_name: Display name for the team account
            creator_id: ID of the user creating the account
            smtp_config: SMTP configuration
            imap_config: IMAP configuration
            team_permissions: Team-specific permissions
            encryption_config: Encryption configuration
            calendar_config: Calendar configuration
            ai_config: AI configuration

        Returns:
            AccountConfig object
        """
        try:
            # Check if creator has permission to create team accounts
            creator_permission = await self.rbac_email_service.check_email_permission(
                creator_id, "team", "create"
            )

            if not creator_permission.granted:
                self.logger.warning(
                    f"User {creator_id} does not have permission to create team accounts"
                )
                raise PermissionError("Insufficient permissions to create team account")

            # Create the account
            account = await self.multi_account_service.create_account(
                account_type="team",
                email_address=email_address,
                display_name=display_name,
                smtp_config=smtp_config,
                imap_config=imap_config,
                encryption_config=encryption_config,
                calendar_config=calendar_config,
                ai_config=ai_config,
                is_primary=False,
            )

            # Create team-specific RBAC permissions
            await self._setup_team_permissions(
                account.account_id, team_id, creator_id, team_permissions
            )

            self.logger.info(
                f"Created team email account {account.account_id} for team {team_id}"
            )
            return account

        except Exception as e:
            self.logger.error(f"Failed to create team email account: {e}")
            raise

    async def add_team_member_to_account(
        self,
        account_id: str,
        team_id: str,
        user_id: str,
        permission_level: str,
        added_by: str,
    ) -> bool:
        """Add a team member to an email account with specific permissions.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            user_id: ID of the user to add
            permission_level: Permission level (viewer, editor, owner)
            added_by: ID of the user adding the member

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Check if the user adding the member has permission
            can_manage = await self.rbac_email_service.check_email_permission(
                added_by, account_id, "manage"
            )

            if not can_manage.granted:
                self.logger.warning(
                    f"User {added_by} does not have permission to manage account {account_id}"
                )
                return False

            # Share the account with the team member
            success = await self.rbac_email_service.share_email_account(
                account_id=account_id,
                owner_id=added_by,
                target_user_id=user_id,
                permission_level=permission_level,
                context={"team_id": team_id, "added_by": added_by},
            )

            if success:
                self.logger.info(
                    f"Added team member {user_id} to account {account_id} with {permission_level} permissions"
                )

            return success

        except Exception as e:
            self.logger.error(f"Failed to add team member to account: {e}")
            return False

    async def remove_team_member_from_account(
        self,
        account_id: str,
        team_id: str,
        user_id: str,
        removed_by: str,
    ) -> bool:
        """Remove a team member from an email account.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            user_id: ID of the user to remove
            removed_by: ID of the user removing the member

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Check if the user removing the member has permission
            can_manage = await self.rbac_email_service.check_email_permission(
                removed_by, account_id, "manage"
            )

            if not can_manage.granted:
                self.logger.warning(
                    f"User {removed_by} does not have permission to manage account {account_id}"
                )
                return False

            # Revoke access
            success = await self.rbac_email_service.revoke_email_access(
                account_id=account_id,
                owner_id=removed_by,
                target_user_id=user_id,
                context={"team_id": team_id, "removed_by": removed_by},
            )

            if success:
                self.logger.info(
                    f"Removed team member {user_id} from account {account_id}"
                )

            return success

        except Exception as e:
            self.logger.error(f"Failed to remove team member from account: {e}")
            return False

    async def get_team_email_accounts(
        self,
        team_id: str,
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """Get all email accounts accessible to a team.

        Args:
            team_id: ID of the team
            user_id: ID of the user requesting the list

        Returns:
            List[Dict[str, Any]]: List of accessible email accounts
        """
        try:
            # Check if user has permission to view team accounts
            can_view = await self.rbac_email_service.check_email_permission(
                user_id, "team", "receive"
            )

            if not can_view.granted:
                self.logger.warning(
                    f"User {user_id} does not have permission to view team accounts"
                )
                return []

            # Get all accounts for the team
            # TODO: Implement actual team account retrieval from RBAC system

            accounts = []
            self.logger.info(
                f"Retrieved {len(accounts)} team email accounts for team {team_id}"
            )

            return accounts

        except Exception as e:
            self.logger.error(f"Failed to get team email accounts: {e}")
            return []

    async def update_team_account_permissions(
        self,
        account_id: str,
        team_id: str,
        user_id: str,
        new_permission_level: str,
        updated_by: str,
    ) -> bool:
        """Update a team member's permissions for an email account.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            user_id: ID of the user whose permissions to update
            new_permission_level: New permission level
            updated_by: ID of the user updating the permissions

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            # Check if the user updating permissions has permission
            can_manage = await self.rbac_email_service.check_email_permission(
                updated_by, account_id, "manage"
            )

            if not can_manage.granted:
                self.logger.warning(
                    f"User {updated_by} does not have permission to manage account {account_id}"
                )
                return False

            # Update permissions
            success = await self.rbac_email_service.update_email_permission(
                account_id=account_id,
                owner_id=updated_by,
                target_user_id=user_id,
                new_permission_level=new_permission_level,
                context={"team_id": team_id, "updated_by": updated_by},
            )

            if success:
                self.logger.info(
                    f"Updated permissions for user {user_id} on account {account_id} to {new_permission_level}"
                )

            return success

        except Exception as e:
            self.logger.error(f"Failed to update team account permissions: {e}")
            return False

    async def get_team_account_collaborators(
        self,
        account_id: str,
        team_id: str,
        user_id: str,
    ) -> List[Dict[str, Any]]:
        """Get list of team members with access to an email account.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            user_id: ID of the user requesting the list

        Returns:
            List[Dict[str, Any]]: List of team members with their permissions
        """
        try:
            # Check if user has permission to view collaborators
            can_view = await self.rbac_email_service.check_email_permission(
                user_id, account_id, "receive"
            )

            if not can_view.granted:
                self.logger.warning(
                    f"User {user_id} does not have permission to view account {account_id}"
                )
                return []

            # Get collaborators
            collaborators = (
                await self.rbac_email_service.get_email_account_collaborators(
                    account_id, user_id
                )
            )

            # Filter for team members only
            team_collaborators = [
                collab for collab in collaborators if collab.get("team_id") == team_id
            ]

            self.logger.info(
                f"Retrieved {len(team_collaborators)} team collaborators for account {account_id}"
            )

            return team_collaborators

        except Exception as e:
            self.logger.error(f"Failed to get team account collaborators: {e}")
            return []

    async def can_team_member_access_account(
        self,
        account_id: str,
        team_id: str,
        user_id: str,
        operation: str = "receive",
    ) -> bool:
        """Check if a team member can access an email account for a specific operation.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            user_id: ID of the team member
            operation: Operation to check

        Returns:
            bool: True if team member can access the account, False otherwise
        """
        try:
            # Check RBAC permission
            can_access = await self.rbac_email_service.can_user_access_email_account(
                user_id, account_id, operation
            )

            if not can_access:
                return False

            # Additional team-specific checks could be added here
            # For example, checking if the user is still a member of the team

            return True

        except Exception as e:
            self.logger.error(f"Failed to check team member account access: {e}")
            return False

    async def _setup_team_permissions(
        self,
        account_id: str,
        team_id: str,
        creator_id: str,
        team_permissions: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Set up RBAC permissions for a team email account.

        Args:
            account_id: ID of the email account
            team_id: ID of the team
            creator_id: ID of the account creator
            team_permissions: Team-specific permissions
        """
        try:
            # Create owner permission for the creator
            await self.rbac_email_service.share_email_account(
                account_id=account_id,
                owner_id=creator_id,
                target_user_id=creator_id,
                permission_level="owner",
                context={"team_id": team_id, "is_creator": True},
            )

            # Set up default team permissions if provided
            if team_permissions:
                for member_id, permission_level in team_permissions.items():
                    await self.rbac_email_service.share_email_account(
                        account_id=account_id,
                        owner_id=creator_id,
                        target_user_id=member_id,
                        permission_level=permission_level,
                        context={"team_id": team_id, "is_team_member": True},
                    )

            self.logger.info(
                f"Set up team permissions for account {account_id} in team {team_id}"
            )

        except Exception as e:
            self.logger.error(f"Failed to setup team permissions: {e}")
            raise
