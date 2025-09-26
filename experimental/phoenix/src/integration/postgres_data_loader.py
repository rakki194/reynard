"""PostgreSQL Data Loader for Phoenix Experiments

Provides PostgreSQL-based data loading for Phoenix agent reconstruction experiments.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class PostgresDataLoader:
    """PostgreSQL-based data loader for Phoenix experiments."""

    def __init__(self, ecs_service=None):
        """Initialize the PostgreSQL data loader.

        Args:
            ecs_service: ECS service instance for database access

        """
        self.ecs_service = ecs_service

    async def load_agent_data(self, agent_id: str) -> dict[str, Any] | None:
        """Load agent data from PostgreSQL database.

        Args:
            agent_id: Agent identifier

        Returns:
            Dictionary containing complete agent data or None if not found

        """
        try:
            if not self.ecs_service:
                logger.error("ECS service not available")
                return None

            # Get agent data from PostgreSQL
            agent_data = await self.ecs_service.get_agent(agent_id)
            if not agent_data:
                logger.warning(f"Agent {agent_id} not found in database")
                return None

            logger.info(f"✅ Loaded agent data for {agent_id} from PostgreSQL")
            return agent_data

        except Exception as e:
            logger.error(f"❌ Failed to load agent data for {agent_id}: {e}")
            return None

    async def load_success_advisor_8(self) -> dict[str, Any] | None:
        """Load Success-Advisor-8's complete genomic data from PostgreSQL.

        Returns:
            Dictionary containing Success-Advisor-8's complete data

        """
        return await self.load_agent_data("permanent-release-manager-success-advisor-8")

    async def load_phoenix_test_agents(self) -> list[dict[str, Any]]:
        """Load all Phoenix test agents from PostgreSQL.

        Returns:
            List of Phoenix test agent data

        """
        try:
            if not self.ecs_service:
                logger.error("ECS service not available")
                return []

            # Get all agents
            all_agents = await self.ecs_service.get_all_agents()

            # Filter for Phoenix test agents
            phoenix_agents = [
                agent
                for agent in all_agents
                if "generation" in agent.get("agent_id", "")
            ]

            logger.info(
                f"✅ Loaded {len(phoenix_agents)} Phoenix test agents from PostgreSQL",
            )
            return phoenix_agents

        except Exception as e:
            logger.error(f"❌ Failed to load Phoenix test agents: {e}")
            return []

    async def save_agent_data(self, agent_data: dict[str, Any]) -> bool:
        """Save agent data to PostgreSQL database.

        Args:
            agent_data: Complete agent data dictionary

        Returns:
            True if save successful, False otherwise

        """
        try:
            if not self.ecs_service:
                logger.error("ECS service not available")
                return False

            # Create agent in PostgreSQL
            result = await self.ecs_service.create_agent(
                agent_id=agent_data.get("agent_id"),
                name=agent_data.get("name"),
                spirit=agent_data.get("spirit"),
                style=agent_data.get("style"),
                generation=agent_data.get("generation", 1),
                personality_traits=agent_data.get("personality_traits", {}),
                physical_traits=agent_data.get("physical_traits", {}),
                ability_traits=agent_data.get("ability_traits", {}),
                specializations=agent_data.get("specializations", []),
                domain_expertise=agent_data.get("domain_expertise", []),
                achievements=agent_data.get("achievements", []),
                workflow_preferences=agent_data.get("workflow_preferences", {}),
            )

            logger.info(
                f"✅ Saved agent data for {agent_data.get('agent_id')} to PostgreSQL",
            )
            return True

        except Exception as e:
            logger.error(f"❌ Failed to save agent data: {e}")
            return False

    async def get_agent_traits(self, agent_id: str) -> dict[str, dict[str, float]]:
        """Get agent traits from PostgreSQL.

        Args:
            agent_id: Agent identifier

        Returns:
            Dictionary containing personality, physical, and ability traits

        """
        try:
            agent_data = await self.load_agent_data(agent_id)
            if not agent_data:
                return {}

            return {
                "personality_traits": agent_data.get("personality_traits", {}),
                "physical_traits": agent_data.get("physical_traits", {}),
                "ability_traits": agent_data.get("ability_traits", {}),
            }

        except Exception as e:
            logger.error(f"❌ Failed to get traits for {agent_id}: {e}")
            return {}

    async def get_agent_performance_metrics(
        self,
        agent_id: str,
    ) -> list[dict[str, Any]]:
        """Get agent performance metrics from PostgreSQL.

        Args:
            agent_id: Agent identifier

        Returns:
            List of performance metrics

        """
        try:
            agent_data = await self.load_agent_data(agent_id)
            if not agent_data:
                return []

            # Extract performance metrics from agent data
            # This would need to be implemented based on the actual data structure
            return agent_data.get("performance_metrics", [])

        except Exception as e:
            logger.error(f"❌ Failed to get performance metrics for {agent_id}: {e}")
            return []

    async def compare_agents(self, agent1_id: str, agent2_id: str) -> dict[str, Any]:
        """Compare two agents from PostgreSQL.

        Args:
            agent1_id: First agent identifier
            agent2_id: Second agent identifier

        Returns:
            Dictionary containing comparison results

        """
        try:
            agent1_data = await self.load_agent_data(agent1_id)
            agent2_data = await self.load_agent_data(agent2_id)

            if not agent1_data or not agent2_data:
                return {}

            # Perform comparison
            comparison = {
                "agent1": agent1_id,
                "agent2": agent2_id,
                "personality_similarity": self._calculate_trait_similarity(
                    agent1_data.get("personality_traits", {}),
                    agent2_data.get("personality_traits", {}),
                ),
                "physical_similarity": self._calculate_trait_similarity(
                    agent1_data.get("physical_traits", {}),
                    agent2_data.get("physical_traits", {}),
                ),
                "ability_similarity": self._calculate_trait_similarity(
                    agent1_data.get("ability_traits", {}),
                    agent2_data.get("ability_traits", {}),
                ),
            }

            logger.info(f"✅ Compared agents {agent1_id} and {agent2_id}")
            return comparison

        except Exception as e:
            logger.error(f"❌ Failed to compare agents: {e}")
            return {}

    def _calculate_trait_similarity(
        self,
        traits1: dict[str, float],
        traits2: dict[str, float],
    ) -> float:
        """Calculate similarity between two trait dictionaries.

        Args:
            traits1: First trait dictionary
            traits2: Second trait dictionary

        Returns:
            Similarity score between 0.0 and 1.0

        """
        if not traits1 or not traits2:
            return 0.0

        # Find common traits
        common_traits = set(traits1.keys()) & set(traits2.keys())
        if not common_traits:
            return 0.0

        # Calculate average absolute difference
        total_diff = sum(
            abs(traits1[trait] - traits2[trait]) for trait in common_traits
        )
        avg_diff = total_diff / len(common_traits)

        # Convert to similarity (1.0 - avg_diff)
        similarity = max(0.0, 1.0 - avg_diff)
        return similarity


# Global instance
postgres_data_loader = PostgresDataLoader()


def get_postgres_data_loader(ecs_service=None) -> PostgresDataLoader:
    """Get the global PostgreSQL data loader instance."""
    if ecs_service:
        postgres_data_loader.ecs_service = ecs_service
    return postgres_data_loader
