#!/usr/bin/env python3
"""ECS Database Indexes

Critical database indexes for ECS backend performance optimization.
These indexes address the bottlenecks identified in the performance analysis.
"""

import logging

from sqlalchemy import text
from sqlalchemy.orm import Session

from .database import SessionLocal

logger = logging.getLogger(__name__)


class ECSDatabaseIndexes:
    """Database index management for ECS backend."""

    def __init__(self):
        self.indexes = [
            # Agent-related indexes
            {
                "name": "idx_agents_active",
                "table": "agents",
                "columns": ["active"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(active);",
                "description": "Index for filtering active agents",
            },
            {
                "name": "idx_agents_name",
                "table": "agents",
                "columns": ["name"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);",
                "description": "Index for agent name lookups",
            },
            {
                "name": "idx_agents_spirit_active",
                "table": "agents",
                "columns": ["spirit", "active"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agents_spirit_active ON agents(spirit, active);",
                "description": "Composite index for spirit and active status",
            },
            # Agent traits indexes
            {
                "name": "idx_agent_traits_agent_id",
                "table": "agent_traits",
                "columns": ["agent_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_traits_agent_id ON agent_traits(agent_id);",
                "description": "Index for agent traits lookups",
            },
            {
                "name": "idx_agent_traits_trait_name",
                "table": "agent_traits",
                "columns": ["trait_name"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_traits_trait_name ON agent_traits(trait_name);",
                "description": "Index for trait name lookups",
            },
            {
                "name": "idx_agent_traits_agent_trait",
                "table": "agent_traits",
                "columns": ["agent_id", "trait_name"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_traits_agent_trait ON agent_traits(agent_id, trait_name);",
                "description": "Composite index for agent-trait lookups",
            },
            # Agent relationships indexes
            {
                "name": "idx_agent_relationships_agent1",
                "table": "agent_relationships",
                "columns": ["agent1_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_relationships_agent1 ON agent_relationships(agent1_id);",
                "description": "Index for agent1 relationship lookups",
            },
            {
                "name": "idx_agent_relationships_agent2",
                "table": "agent_relationships",
                "columns": ["agent2_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_relationships_agent2 ON agent_relationships(agent2_id);",
                "description": "Index for agent2 relationship lookups",
            },
            {
                "name": "idx_agent_relationships_type",
                "table": "agent_relationships",
                "columns": ["relationship_type"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_relationships_type ON agent_relationships(relationship_type);",
                "description": "Index for relationship type filtering",
            },
            # Agent interactions indexes
            {
                "name": "idx_agent_interactions_agent1",
                "table": "agent_interactions",
                "columns": ["agent1_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent1 ON agent_interactions(agent1_id);",
                "description": "Index for agent1 interaction lookups",
            },
            {
                "name": "idx_agent_interactions_agent2",
                "table": "agent_interactions",
                "columns": ["agent2_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent2 ON agent_interactions(agent2_id);",
                "description": "Index for agent2 interaction lookups",
            },
            {
                "name": "idx_agent_interactions_timestamp",
                "table": "agent_interactions",
                "columns": ["timestamp"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_interactions_timestamp ON agent_interactions(timestamp);",
                "description": "Index for timestamp-based interaction queries",
            },
            {
                "name": "idx_agent_interactions_agent1_timestamp",
                "table": "agent_interactions",
                "columns": ["agent1_id", "timestamp"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_interactions_agent1_timestamp ON agent_interactions(agent1_id, timestamp DESC);",
                "description": "Composite index for agent interactions with timestamp ordering",
            },
            # Agent positions indexes
            {
                "name": "idx_agent_positions_agent_id",
                "table": "agent_positions",
                "columns": ["agent_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_positions_agent_id ON agent_positions(agent_id);",
                "description": "Index for agent position lookups",
            },
            {
                "name": "idx_agent_positions_coordinates",
                "table": "agent_positions",
                "columns": ["x", "y"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_positions_coordinates ON agent_positions(x, y);",
                "description": "Spatial index for coordinate-based queries",
            },
            # Naming system indexes
            {
                "name": "idx_naming_spirits_enabled",
                "table": "naming_spirits",
                "columns": ["enabled"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_naming_spirits_enabled ON naming_spirits(enabled);",
                "description": "Index for enabled naming spirits",
            },
            {
                "name": "idx_naming_spirits_category",
                "table": "naming_spirits",
                "columns": ["category"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_naming_spirits_category ON naming_spirits(category);",
                "description": "Index for spirit category filtering",
            },
            {
                "name": "idx_naming_components_type",
                "table": "naming_components",
                "columns": ["component_type"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_naming_components_type ON naming_components(component_type);",
                "description": "Index for component type filtering",
            },
            {
                "name": "idx_naming_components_enabled",
                "table": "naming_components",
                "columns": ["enabled"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_naming_components_enabled ON naming_components(enabled);",
                "description": "Index for enabled naming components",
            },
            # Agent memories indexes
            {
                "name": "idx_agent_memories_agent_id",
                "table": "agent_memories",
                "columns": ["agent_id"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_id ON agent_memories(agent_id);",
                "description": "Index for agent memory lookups",
            },
            {
                "name": "idx_agent_memories_timestamp",
                "table": "agent_memories",
                "columns": ["timestamp"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_memories_timestamp ON agent_memories(timestamp DESC);",
                "description": "Index for timestamp-based memory queries",
            },
            {
                "name": "idx_agent_memories_agent_timestamp",
                "table": "agent_memories",
                "columns": ["agent_id", "timestamp"],
                "sql": "CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_timestamp ON agent_memories(agent_id, timestamp DESC);",
                "description": "Composite index for agent memories with timestamp ordering",
            },
        ]

    def create_all_indexes(self) -> dict:
        """Create all database indexes.

        Returns:
            dict: Results of index creation

        """
        results = {
            "created": [],
            "failed": [],
            "skipped": [],
            "total": len(self.indexes),
        }

        with SessionLocal() as session:
            for index in self.indexes:
                try:
                    # Check if index already exists
                    if self._index_exists(session, index["name"]):
                        results["skipped"].append(
                            {"name": index["name"], "reason": "Index already exists"},
                        )
                        logger.info(f"Index {index['name']} already exists, skipping")
                        continue

                    # Create the index
                    session.execute(text(index["sql"]))
                    session.commit()

                    results["created"].append(
                        {
                            "name": index["name"],
                            "table": index["table"],
                            "columns": index["columns"],
                            "description": index["description"],
                        },
                    )

                    logger.info(
                        f"Created index {index['name']} on {index['table']}({', '.join(index['columns'])})",
                    )

                except Exception as e:
                    results["failed"].append({"name": index["name"], "error": str(e)})
                    logger.exception(f"Failed to create index {index['name']}")
                    session.rollback()

        return results

    def _index_exists(self, session: Session, index_name: str) -> bool:
        """Check if an index exists.

        Args:
            session: Database session
            index_name: Name of the index to check

        Returns:
            bool: True if index exists, False otherwise

        """
        try:
            result = session.execute(
                text(
                    """
                SELECT 1 FROM pg_indexes
                WHERE indexname = :index_name
            """,
                ),
                {"index_name": index_name},
            )
            return result.fetchone() is not None
        except Exception:
            logger.exception(f"Could not check if index {index_name} exists")
            return False

    def get_index_status(self) -> dict:
        """Get status of all indexes.

        Returns:
            dict: Index status information

        """
        status = {
            "total_indexes": len(self.indexes),
            "existing_indexes": [],
            "missing_indexes": [],
        }

        with SessionLocal() as session:
            for index in self.indexes:
                if self._index_exists(session, index["name"]):
                    status["existing_indexes"].append(index["name"])
                else:
                    status["missing_indexes"].append(index["name"])

        return status

    def drop_index(self, index_name: str) -> bool:
        """Drop a specific index.

        Args:
            index_name: Name of the index to drop

        Returns:
            bool: True if successful, False otherwise

        """
        try:
            with SessionLocal() as session:
                session.execute(text(f"DROP INDEX IF EXISTS {index_name}"))
                session.commit()
                logger.info(f"Dropped index {index_name}")
                return True
        except Exception:
            logger.exception(f"Failed to drop index {index_name}")
            return False

    def optimize_database(self) -> dict:
        """Run database optimization commands.

        Returns:
            dict: Optimization results

        """
        results = {"analyze_tables": [], "vacuum_tables": [], "errors": []}

        # Tables to optimize
        tables = [
            "agents",
            "agent_traits",
            "agent_relationships",
            "agent_interactions",
            "agent_positions",
            "agent_memories",
            "naming_spirits",
            "naming_components",
            "naming_config",
        ]

        with SessionLocal() as session:
            for table in tables:
                try:
                    # ANALYZE table for query planner
                    session.execute(text(f"ANALYZE {table}"))
                    results["analyze_tables"].append(table)
                    logger.info(f"Analyzed table {table}")

                    # VACUUM table for space reclamation
                    session.execute(text(f"VACUUM {table}"))
                    results["vacuum_tables"].append(table)
                    logger.info(f"Vacuumed table {table}")

                except Exception as e:
                    results["errors"].append({"table": table, "error": str(e)})
                    logger.exception(f"Failed to optimize table {table}")

            session.commit()

        return results


def main():
    """Main function to create database indexes."""
    print("🐍 Mysterious-Prime-67 ECS Database Index Creation")
    print("=" * 50)

    index_manager = ECSDatabaseIndexes()

    # Get current status
    print("\n📊 Current Index Status:")
    status = index_manager.get_index_status()
    print(f"   Total indexes needed: {status['total_indexes']}")
    print(f"   Existing indexes: {len(status['existing_indexes'])}")
    print(f"   Missing indexes: {len(status['missing_indexes'])}")

    if status["missing_indexes"]:
        print(f"   Missing: {', '.join(status['missing_indexes'])}")

    # Create missing indexes
    if status["missing_indexes"]:
        print("\n🔧 Creating Missing Indexes...")
        results = index_manager.create_all_indexes()

        print("\n✅ Results:")
        print(f"   Created: {len(results['created'])}")
        print(f"   Failed: {len(results['failed'])}")
        print(f"   Skipped: {len(results['skipped'])}")

        if results["created"]:
            print("\n   Created indexes:")
            for index in results["created"]:
                print(
                    f"     • {index['name']} on {index['table']}({', '.join(index['columns'])})",
                )

        if results["failed"]:
            print("\n   Failed indexes:")
            for index in results["failed"]:
                print(f"     • {index['name']}: {index['error']}")
    else:
        print("\n✅ All indexes already exist!")

    # Optimize database
    print("\n🚀 Optimizing Database...")
    optimization_results = index_manager.optimize_database()

    print(f"   Analyzed tables: {len(optimization_results['analyze_tables'])}")
    print(f"   Vacuumed tables: {len(optimization_results['vacuum_tables'])}")
    print(f"   Errors: {len(optimization_results['errors'])}")

    if optimization_results["errors"]:
        print("\n   Optimization errors:")
        for error in optimization_results["errors"]:
            print(f"     • {error['table']}: {error['error']}")

    print("\n🎉 Database optimization complete!")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
