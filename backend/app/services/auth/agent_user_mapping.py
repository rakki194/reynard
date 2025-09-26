"""Agent-User mapping service for Reynard Backend.

This service provides mapping between the backend Agent model and Gatekeeper's User model,
allowing the system to use Gatekeeper for authentication while maintaining the Agent model
for content management and other business logic.
"""

import logging
import os
from typing import Optional
from uuid import UUID

from app.gatekeeper_config import get_auth_manager
from app.models.core.agent import Agent
from gatekeeper.models.user import User, UserCreate, UserRole

logger = logging.getLogger(__name__)


class AgentUserMappingService:
    """Service for mapping between Agent and User models."""

    @staticmethod
    async def create_user_from_agent(agent: Agent) -> User:
        """Create a Gatekeeper User from an Agent model.

        Args:
            agent: The Agent model instance

        Returns:
            User: The created Gatekeeper User

        Raises:
            Exception: If user creation fails
        """
        try:
            auth_manager = await get_auth_manager()

            # Create UserCreate object
            user_create = UserCreate(
                username=agent.agent_id,  # Use agent_id as username
                password=os.getenv(
                    "AGENT_TEMP_PASSWORD", "temp_password_123"
                ),  # Temporary password, should be set separately
                email=agent.email,
                role=UserRole.REGULAR,  # Default role
            )

            # Create user in Gatekeeper
            user = await auth_manager.create_user(user_create)

            logger.info(f"Created Gatekeeper user for agent {agent.agent_id}")
            return user

        except Exception as e:
            logger.error(f"Failed to create user from agent {agent.agent_id}: {e}")
            raise

    @staticmethod
    async def get_user_for_agent(agent: Agent) -> Optional[User]:
        """Get the Gatekeeper User associated with an Agent.

        Args:
            agent: The Agent model instance

        Returns:
            Optional[User]: The associated User if found, None otherwise
        """
        try:
            auth_manager = await get_auth_manager()

            # Try to get user by username (using agent_id)
            user = await auth_manager.get_user_by_username(agent.agent_id)

            if user:
                logger.debug(f"Found Gatekeeper user for agent {agent.agent_id}")
                return user

            # If not found, try to get by email
            if agent.email:
                user = await auth_manager.get_user_by_email(agent.email)
                if user:
                    logger.debug(
                        f"Found Gatekeeper user for agent {agent.agent_id} by email"
                    )
                    return user

            logger.warning(f"No Gatekeeper user found for agent {agent.agent_id}")
            return None

        except Exception as e:
            logger.error(f"Failed to get user for agent {agent.agent_id}: {e}")
            return None

    @staticmethod
    async def create_agent_from_user(user: User) -> Agent:
        """Create an Agent model from a Gatekeeper User.

        Args:
            user: The Gatekeeper User instance

        Returns:
            Agent: The created Agent model
        """
        try:
            # Create Agent instance
            agent = Agent(
                agent_id=user.username,  # Use username as agent_id
                name=user.username,  # Use username as name (could be enhanced)
                email=user.email,
                spirit="user",  # Default spirit
                active=user.is_active,
            )

            logger.info(f"Created Agent model for user {user.username}")
            return agent

        except Exception as e:
            logger.error(f"Failed to create agent from user {user.username}: {e}")
            raise

    @staticmethod
    async def sync_agent_with_user(agent: Agent, user: User) -> Agent:
        """Sync an Agent model with a Gatekeeper User.

        Args:
            agent: The Agent model to sync
            user: The Gatekeeper User to sync with

        Returns:
            Agent: The synced Agent model
        """
        try:
            # Update agent fields from user
            agent.email = user.email
            agent.active = user.is_active

            # Update name if it's different
            if agent.name != user.username:
                agent.name = user.username

            logger.info(f"Synced agent {agent.agent_id} with user {user.username}")
            return agent

        except Exception as e:
            logger.error(
                f"Failed to sync agent {agent.agent_id} with user {user.username}: {e}"
            )
            raise

    @staticmethod
    async def ensure_user_exists_for_agent(agent: Agent) -> User:
        """Ensure a Gatekeeper User exists for an Agent, creating one if necessary.

        Args:
            agent: The Agent model instance

        Returns:
            User: The associated or newly created User
        """
        try:
            # First, try to get existing user
            user = await AgentUserMappingService.get_user_for_agent(agent)

            if user:
                return user

            # If no user exists, create one
            logger.info(f"Creating Gatekeeper user for agent {agent.agent_id}")
            user = await AgentUserMappingService.create_user_from_agent(agent)

            return user

        except Exception as e:
            logger.error(
                f"Failed to ensure user exists for agent {agent.agent_id}: {e}"
            )
            raise

    @staticmethod
    async def get_agent_for_user(user: User) -> Optional[Agent]:
        """Get the Agent model associated with a Gatekeeper User.

        Args:
            user: The Gatekeeper User instance

        Returns:
            Optional[Agent]: The associated Agent if found, None otherwise
        """
        try:
            # This would require querying the Agent model by agent_id (username)
            # For now, we'll return None as this requires database access
            # In a full implementation, you'd query the Agent model here

            logger.debug(f"Looking for agent for user {user.username}")
            # TODO: Implement database query to find Agent by agent_id
            return None

        except Exception as e:
            logger.error(f"Failed to get agent for user {user.username}: {e}")
            return None


# Global instance
agent_user_mapping_service = AgentUserMappingService()
