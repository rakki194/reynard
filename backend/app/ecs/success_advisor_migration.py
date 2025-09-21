"""
Success-Advisor-8 Migration Script

Migrates Success-Advisor-8's complete genomic information to PostgreSQL database.
"""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

from .database import (
    AbilityTrait,
    Agent,
    AgentAchievement,
    AgentDomainExpertise,
    AgentPosition,
    AgentSpecialization,
    AgentWorkflowPreference,
    KnowledgeBaseEntry,
    PerformanceMetric,
    PersonalityTrait,
    PhysicalTrait,
    ecs_db,
)

logger = logging.getLogger(__name__)


class SuccessAdvisorMigration:
    """Migrates Success-Advisor-8's complete genomic data to PostgreSQL."""

    def __init__(self):
        """Initialize the migration."""
        self.db = ecs_db

    async def migrate_success_advisor_8(self, json_file_path: str) -> bool:
        """
        Migrate Success-Advisor-8's complete genomic data to PostgreSQL.

        Args:
            json_file_path: Path to the Success-Advisor-8 JSON file

        Returns:
            True if migration successful, False otherwise
        """
        try:
            with open(json_file_path, "r") as f:
                data = json.load(f)

            with self.db.get_session() as session:
                # Check if agent already exists
                existing_agent = (
                    session.query(Agent)
                    .filter(Agent.agent_id == data.get("id"))
                    .first()
                )
                if existing_agent:
                    logger.info(f"Success-Advisor-8 already exists, updating...")
                    agent = existing_agent
                else:
                    # Create the agent
                    agent = Agent(
                        agent_id=data.get(
                            "id", "permanent-release-manager-success-advisor-8"
                        ),
                        name=data.get("name", "Success-Advisor-8"),
                        spirit=data.get("spirit", "lion"),
                        style=data.get("style", "foundation"),
                        generation=data.get("generation", 1),
                        active=True,
                        created_at=datetime.fromisoformat(
                            data.get(
                                "created_at", datetime.now(timezone.utc).isoformat()
                            )
                        ),
                        last_activity=datetime.now(timezone.utc),
                    )
                    session.add(agent)
                    session.flush()  # Get the agent ID

                # Clear existing traits and data
                session.query(PersonalityTrait).filter(
                    PersonalityTrait.agent_id == agent.id
                ).delete()
                session.query(PhysicalTrait).filter(
                    PhysicalTrait.agent_id == agent.id
                ).delete()
                session.query(AbilityTrait).filter(
                    AbilityTrait.agent_id == agent.id
                ).delete()
                session.query(AgentSpecialization).filter(
                    AgentSpecialization.agent_id == agent.id
                ).delete()
                session.query(AgentDomainExpertise).filter(
                    AgentDomainExpertise.agent_id == agent.id
                ).delete()
                session.query(AgentAchievement).filter(
                    AgentAchievement.agent_id == agent.id
                ).delete()
                session.query(AgentWorkflowPreference).filter(
                    AgentWorkflowPreference.agent_id == agent.id
                ).delete()
                session.query(KnowledgeBaseEntry).filter(
                    KnowledgeBaseEntry.agent_id == agent.id
                ).delete()
                session.query(PerformanceMetric).filter(
                    PerformanceMetric.agent_id == agent.id
                ).delete()

                # Add personality traits
                personality_traits = data.get("personality_traits", {})
                for trait_name, trait_value in personality_traits.items():
                    trait = PersonalityTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add physical traits
                physical_traits = data.get("physical_traits", {})
                for trait_name, trait_value in physical_traits.items():
                    trait = PhysicalTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add ability traits
                ability_traits = data.get("ability_traits", {})
                for trait_name, trait_value in ability_traits.items():
                    trait = AbilityTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add specializations
                specializations = data.get("knowledge_base", {}).get(
                    "specializations", []
                )
                for specialization in specializations:
                    spec = AgentSpecialization(
                        agent_id=agent.id,
                        specialization=specialization,
                        proficiency=0.95,  # High proficiency for Success-Advisor-8
                    )
                    session.add(spec)

                # Add domain expertise from knowledge base
                knowledge_base = data.get("knowledge_base", {})
                for domain, expertise_data in knowledge_base.items():
                    if isinstance(expertise_data, dict):
                        # Calculate average expertise level
                        if expertise_data:
                            avg_expertise = sum(expertise_data.values()) / len(
                                expertise_data
                            )
                            expertise = AgentDomainExpertise(
                                agent_id=agent.id,
                                domain=domain,
                                expertise_level=float(avg_expertise),
                            )
                            session.add(expertise)

                # Add achievements
                achievements = data.get("knowledge_base", {}).get("achievements", [])
                for achievement in achievements:
                    ach = AgentAchievement(
                        agent_id=agent.id,
                        achievement_name=achievement,
                        achievement_description=f"Success-Advisor-8 achievement: {achievement}",
                    )
                    session.add(ach)

                # Add workflow preferences
                workflow_prefs = data.get("knowledge_base", {}).get(
                    "workflow_preferences", {}
                )
                for pref_name, pref_value in workflow_prefs.items():
                    pref = AgentWorkflowPreference(
                        agent_id=agent.id,
                        preference_name=pref_name,
                        preference_value=bool(pref_value),
                    )
                    session.add(pref)

                # Add knowledge base entries
                for domain, expertise_data in knowledge_base.items():
                    if isinstance(expertise_data, dict):
                        for skill, level in expertise_data.items():
                            kb_entry = KnowledgeBaseEntry(
                                agent_id=agent.id,
                                domain=domain,
                                skill=skill,
                                proficiency_level=float(level),
                                last_updated=datetime.now(timezone.utc),
                            )
                            session.add(kb_entry)

                # Add performance metrics
                performance_history = data.get("performance_history", [])
                for perf_data in performance_history:
                    metric = PerformanceMetric(
                        agent_id=agent.id,
                        metric_name="overall_performance",
                        metric_value=float(perf_data.get("fitness", 0.0)),
                        timestamp=datetime.fromisoformat(
                            perf_data.get(
                                "timestamp", datetime.now(timezone.utc).isoformat()
                            )
                        ),
                        metadata={
                            "accuracy": perf_data.get("accuracy", 0.0),
                            "response_time": perf_data.get("response_time", 0.0),
                            "efficiency": perf_data.get("efficiency", 0.0),
                            "generalization": perf_data.get("generalization", 0.0),
                            "creativity": perf_data.get("creativity", 0.0),
                            "consistency": perf_data.get("consistency", 0.0),
                            "significance": perf_data.get("significance", {}),
                        },
                    )
                    session.add(metric)

                # Add position data
                position = (
                    session.query(AgentPosition)
                    .filter(AgentPosition.agent_id == agent.id)
                    .first()
                )
                if not position:
                    position = AgentPosition(
                        agent_id=agent.id,
                        x=0.0,
                        y=0.0,
                        target_x=0.0,
                        target_y=0.0,
                        velocity_x=0.0,
                        velocity_y=0.0,
                        movement_speed=1.0,
                    )
                    session.add(position)

                session.commit()
                logger.info(f"✅ Success-Advisor-8 genomic data migrated successfully")
                return True

        except Exception as e:
            logger.error(f"❌ Failed to migrate Success-Advisor-8: {e}")
            return False

    async def migrate_all_phoenix_data(self) -> Dict[str, bool]:
        """
        Migrate all Phoenix experiment data to PostgreSQL.

        Returns:
            Dictionary with migration results
        """
        results = {}

        # Success-Advisor-8 data
        success_advisor_file = "/home/kade/runeset/reynard/experimental/phoenix/data/agent_state/permanent-release-manager-success-advisor-8.json"
        if Path(success_advisor_file).exists():
            results["success_advisor_8"] = await self.migrate_success_advisor_8(
                success_advisor_file
            )

        # New agent candidate data
        new_agent_file = "/home/kade/runeset/reynard/experimental/phoenix/data/agent_state/new_agent_candidate.json"
        if Path(new_agent_file).exists():
            results["new_agent_candidate"] = await self.migrate_phoenix_agent_data(
                new_agent_file
            )

        # Phoenix test generations
        phoenix_test_dir = Path(
            "/home/kade/runeset/reynard/experimental/phoenix/data/phoenix_test"
        )
        if phoenix_test_dir.exists():
            for gen_file in phoenix_test_dir.glob("generation_*.json"):
                results[f"phoenix_test_{gen_file.stem}"] = (
                    await self.migrate_phoenix_agent_data(str(gen_file))
                )

        return results

    async def migrate_phoenix_agent_data(self, json_file_path: str) -> bool:
        """
        Migrate Phoenix agent data to PostgreSQL.

        Args:
            json_file_path: Path to the Phoenix agent JSON file

        Returns:
            True if migration successful, False otherwise
        """
        try:
            with open(json_file_path, "r") as f:
                data = json.load(f)

            with self.db.get_session() as session:
                # Create agent
                agent = Agent(
                    agent_id=data.get(
                        "id", f"phoenix-agent-{Path(json_file_path).stem}"
                    ),
                    name=data.get("name", "Phoenix Agent"),
                    spirit=data.get("spirit", "phoenix"),
                    style=data.get("style", "foundation"),
                    generation=data.get("generation", 1),
                    active=True,
                    created_at=datetime.fromisoformat(
                        data.get("created_at", datetime.now(timezone.utc).isoformat())
                    ),
                    last_activity=datetime.now(timezone.utc),
                )
                session.add(agent)
                session.flush()  # Get the agent ID

                # Add personality traits
                personality_traits = data.get("personality_traits", {})
                for trait_name, trait_value in personality_traits.items():
                    trait = PersonalityTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add physical traits
                physical_traits = data.get("physical_traits", {})
                for trait_name, trait_value in physical_traits.items():
                    trait = PhysicalTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add ability traits
                ability_traits = data.get("ability_traits", {})
                for trait_name, trait_value in ability_traits.items():
                    trait = AbilityTrait(
                        agent_id=agent.id,
                        trait_name=trait_name,
                        trait_value=float(trait_value),
                    )
                    session.add(trait)

                # Add position data
                position = AgentPosition(
                    agent_id=agent.id,
                    x=0.0,
                    y=0.0,
                    target_x=0.0,
                    target_y=0.0,
                    velocity_x=0.0,
                    velocity_y=0.0,
                    movement_speed=1.0,
                )
                session.add(position)

                session.commit()
                logger.info(f"✅ Phoenix agent data migrated: {agent.name}")
                return True

        except Exception as e:
            logger.error(f"❌ Failed to migrate Phoenix agent data: {e}")
            return False


async def run_success_advisor_migration():
    """Run the Success-Advisor-8 migration."""
    logger.info("🦁 Starting Success-Advisor-8 migration to PostgreSQL")

    migrator = SuccessAdvisorMigration()

    # Create tables if they don't exist
    await migrator.db.create_tables()

    # Migrate all Phoenix data
    results = await migrator.migrate_all_phoenix_data()

    logger.info("🦁 Success-Advisor-8 migration complete!")
    for source, success in results.items():
        status = "✅" if success else "❌"
        logger.info(f"   {status} {source}: {'Success' if success else 'Failed'}")

    return results


if __name__ == "__main__":
    import asyncio

    asyncio.run(run_success_advisor_migration())
