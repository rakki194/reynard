"""
ECS Data Migration Script

Migrates existing JSON agent data to PostgreSQL database.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime, timezone

from .database import ecs_db, Agent, PersonalityTrait, PhysicalTrait, AbilityTrait, AgentPosition, AgentAchievement, AgentSpecialization, AgentDomainExpertise, AgentWorkflowPreference

logger = logging.getLogger(__name__)


class ECSDataMigrator:
    """Migrates ECS data from JSON files to PostgreSQL database."""

    def __init__(self):
        """Initialize the migrator."""
        self.db = ecs_db

    async def migrate_agent_names_json(self, json_file_path: str) -> int:
        """
        Migrate agent data from agent-names.json file.
        
        Args:
            json_file_path: Path to the agent-names.json file
            
        Returns:
            Number of agents migrated
        """
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            
            migrated_count = 0
            
            with self.db.get_session() as session:
                for agent_id, agent_data in data.items():
                    try:
                        # Create agent
                        agent = Agent(
                            agent_id=agent_id,
                            name=agent_data.get('name', 'Unknown'),
                            spirit=agent_data.get('spirit', 'fox'),
                            style=agent_data.get('style', 'foundation'),
                            generation=1,
                            active=True,
                            created_at=datetime.fromisoformat(agent_data.get('generated_at', datetime.now(timezone.utc).isoformat()).replace('Z', '+00:00')),
                            last_activity=datetime.fromisoformat(agent_data.get('last_activity', datetime.now(timezone.utc).isoformat()).replace('Z', '+00:00'))
                        )
                        
                        session.add(agent)
                        session.flush()  # Get the agent ID
                        
                        # Add personality traits
                        personality_traits = agent_data.get('personality_traits', {})
                        for trait_name, trait_value in personality_traits.items():
                            trait = PersonalityTrait(
                                agent_id=agent.id,
                                trait_name=trait_name,
                                trait_value=float(trait_value)
                            )
                            session.add(trait)
                        
                        # Add specializations
                        specializations = agent_data.get('specializations', [])
                        for specialization in specializations:
                            spec = AgentSpecialization(
                                agent_id=agent.id,
                                specialization=specialization,
                                proficiency=0.8  # Default proficiency
                            )
                            session.add(spec)
                        
                        # Add workflow preferences
                        workflow_prefs = agent_data.get('workflow_preferences', {})
                        for pref_name, pref_value in workflow_prefs.items():
                            pref = AgentWorkflowPreference(
                                agent_id=agent.id,
                                preference_name=pref_name,
                                preference_value=bool(pref_value)
                            )
                            session.add(pref)
                        
                        # Add achievements if available
                        if 'last_release' in agent_data:
                            achievement = AgentAchievement(
                                agent_id=agent.id,
                                achievement_name=f"Released {agent_data['last_release']}",
                                achievement_description=f"Successfully released version {agent_data['last_release']}"
                            )
                            session.add(achievement)
                        
                        # Add position data
                        position = AgentPosition(
                            agent_id=agent.id,
                            x=0.0,
                            y=0.0,
                            target_x=0.0,
                            target_y=0.0,
                            velocity_x=0.0,
                            velocity_y=0.0,
                            movement_speed=1.0
                        )
                        session.add(position)
                        
                        migrated_count += 1
                        logger.info(f"✅ Migrated agent: {agent.name} ({agent.agent_id})")
                        
                    except Exception as e:
                        logger.error(f"❌ Failed to migrate agent {agent_id}: {e}")
                        session.rollback()
                        continue
                
                session.commit()
                logger.info(f"✅ Successfully migrated {migrated_count} agents from {json_file_path}")
                return migrated_count
                
        except Exception as e:
            logger.error(f"❌ Failed to migrate agent-names.json: {e}")
            return 0

    async def migrate_phoenix_agent_data(self, json_file_path: str) -> int:
        """
        Migrate agent data from PHOENIX experiment JSON files.
        
        Args:
            json_file_path: Path to the PHOENIX agent JSON file
            
        Returns:
            Number of agents migrated
        """
        try:
            with open(json_file_path, 'r') as f:
                data = json.load(f)
            
            migrated_count = 0
            
            with self.db.get_session() as session:
                try:
                    # Create agent
                    agent = Agent(
                        agent_id=data.get('id', 'unknown'),
                        name=data.get('name', 'Unknown'),
                        spirit=data.get('spirit', 'fox'),
                        style=data.get('style', 'foundation'),
                        generation=data.get('generation', 1),
                        active=True,
                        created_at=datetime.fromisoformat(data.get('created_at', datetime.now(timezone.utc).isoformat())),
                        last_activity=datetime.fromisoformat(data.get('last_updated', datetime.now(timezone.utc).isoformat()))
                    )
                    
                    session.add(agent)
                    session.flush()  # Get the agent ID
                    
                    # Add personality traits
                    personality_traits = data.get('personality_traits', {})
                    for trait_name, trait_value in personality_traits.items():
                        trait = PersonalityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
                        )
                        session.add(trait)
                    
                    # Add physical traits
                    physical_traits = data.get('physical_traits', {})
                    for trait_name, trait_value in physical_traits.items():
                        trait = PhysicalTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
                        )
                        session.add(trait)
                    
                    # Add ability traits
                    ability_traits = data.get('ability_traits', {})
                    for trait_name, trait_value in ability_traits.items():
                        trait = AbilityTrait(
                            agent_id=agent.id,
                            trait_name=trait_name,
                            trait_value=float(trait_value)
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
                        movement_speed=1.0
                    )
                    session.add(position)
                    
                    migrated_count += 1
                    logger.info(f"✅ Migrated PHOENIX agent: {agent.name} ({agent.agent_id})")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to migrate PHOENIX agent: {e}")
                    session.rollback()
                    return 0
                
                session.commit()
                logger.info(f"✅ Successfully migrated {migrated_count} PHOENIX agents from {json_file_path}")
                return migrated_count
                
        except Exception as e:
            logger.error(f"❌ Failed to migrate PHOENIX agent data: {e}")
            return 0

    async def migrate_all_data(self) -> Dict[str, int]:
        """
        Migrate all available JSON data to PostgreSQL.
        
        Returns:
            Dictionary with migration results
        """
        results = {}
        
        # Find and migrate agent-names.json files
        agent_names_files = [
            "/home/kade/runeset/reynard/services/agent-naming/data/agent-names.json",
            "/home/kade/runeset/reynard/services/agent-naming/reynard_agent_naming/agent-names.json"
        ]
        
        for file_path in agent_names_files:
            if Path(file_path).exists():
                count = await self.migrate_agent_names_json(file_path)
                results[f"agent_names_{Path(file_path).name}"] = count
        
        # Find and migrate PHOENIX agent data
        phoenix_files = [
            "/home/kade/runeset/reynard/experimental/phoenix/data/agent_state/new_agent_candidate.json"
        ]
        
        for file_path in phoenix_files:
            if Path(file_path).exists():
                count = await self.migrate_phoenix_agent_data(file_path)
                results[f"phoenix_{Path(file_path).name}"] = count
        
        total_migrated = sum(results.values())
        logger.info(f"✅ Total agents migrated: {total_migrated}")
        
        return results


async def run_migration():
    """Run the complete data migration."""
    logger.info("🐺 Starting ECS data migration - Brave-Wise-32")
    
    migrator = ECSDataMigrator()
    
    # Create tables if they don't exist
    await migrator.db.create_tables()
    
    # Migrate all data
    results = await migrator.migrate_all_data()
    
    logger.info("🐺 ECS data migration complete!")
    for source, count in results.items():
        logger.info(f"   {source}: {count} agents")
    
    return results


if __name__ == "__main__":
    import asyncio
    asyncio.run(run_migration())
