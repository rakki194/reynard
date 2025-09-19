"""
Integration Tests for Agent Naming System
========================================

Comprehensive integration tests for the complete agent naming system,
testing all components working together.
"""

import tempfile
from collections.abc import Generator
from pathlib import Path
from unittest.mock import Mock, patch

import pytest

from reynard_agent_naming.agent_naming.generator import ReynardRobotNamer
from reynard_agent_naming.agent_naming.manager import AgentNameManager
from reynard_agent_naming.agent_naming.modular_generator import ModularAgentNamer
from reynard_agent_naming.agent_naming.types import (
    AgentName,
    AnimalSpirit,
    NamingConfig,
    NamingScheme,
    NamingStyle,
)

pytestmark = pytest.mark.integration

# Test constants
BATCH_SIZE_SMALL = 5
BATCH_SIZE_MEDIUM = 10
BATCH_SIZE_LARGE = 100
BATCH_SIZE_XLARGE = 1000
PERFORMANCE_THRESHOLD = 10.0
AGENT_COUNT_MULTI = 5
AGENT_COUNT_CONCURRENT = 50


class TestSystemIntegration:
    """Test complete system integration."""

    @pytest.fixture
    def temp_data_dir(self) -> Generator[Path]:
        """Create a temporary directory for test data."""
        with tempfile.TemporaryDirectory() as temp_dir:
            yield Path(temp_dir)

    def test_generator_to_manager_integration(self, temp_data_dir: Path) -> None:
        """Test integration between generator and manager."""
        # Create generator and manager
        generator = ReynardRobotNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Generate name using generator
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )
        names = generator.generate_batch(config)
        generated_name = names[0].name

        # Assign name using manager
        agent_id = "test-agent-001"
        result = manager.assign_name(agent_id, generated_name)

        assert result is True
        assert manager.get_name(agent_id) == generated_name

    def test_modular_generator_to_manager_integration(self, temp_data_dir: Path) -> None:
        """Test integration between modular generator and manager."""
        # Create modular generator and manager
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Generate name using modular generator
        config = NamingConfig(spirit=AnimalSpirit.WOLF, style=NamingStyle.EXO, count=1)
        names = modular_generator.generate_batch(config)
        generated_name = names[0].name

        # Assign name using manager
        agent_id = "test-agent-002"
        result = manager.assign_name(agent_id, generated_name)

        assert result is True
        assert manager.get_name(agent_id) == generated_name

    def test_manager_persistence_integration(self, temp_data_dir: Path) -> None:
        """Test manager persistence integration."""
        # Create first manager instance
        manager1 = AgentNameManager(str(temp_data_dir))

        # Generate and assign names
        agent_ids = ["agent-001", "agent-002", "agent-003"]
        for agent_id in agent_ids:
            name = manager1.generate_name(AnimalSpirit.FOX, NamingStyle.FOUNDATION)
            manager1.assign_name(agent_id, name)

        # Create second manager instance (should load persisted data)
        manager2 = AgentNameManager(str(temp_data_dir))

        # Verify data was persisted
        for agent_id in agent_ids:
            name1 = manager1.get_name(agent_id)
            name2 = manager2.get_name(agent_id)
            assert name1 == name2

    def test_ecs_integration_with_manager(self, temp_data_dir: Path) -> None:
        """Test ECS integration with manager."""
        # Mock ECS world
        mock_ecs_world = Mock()
        mock_ecs_world.create_agent_with_inheritance.return_value = Mock()
        mock_ecs_world.get_agent_persona.return_value = {
            "agent_id": "test-agent",
            "personality_traits": ["cunning", "intelligent"],
            "communication_style": "formal",
            "specializations": ["planning", "analysis"],
        }
        mock_ecs_world.get_lora_config.return_value = {
            "base_model": "reynard-agent-base",
            "lora_rank": 16,
            "lora_alpha": 32,
            "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
        }
        mock_ecs_world.nudge_time.return_value = None

        with patch(
            "reynard_agent_naming.agent_naming.manager.WorldSimulation",
            return_value=mock_ecs_world,
        ):
            manager = AgentNameManager(str(temp_data_dir))

            # Create agent with ECS integration
            result = manager.create_agent_with_ecs(
                "test-agent-001", AnimalSpirit.FOX, NamingStyle.FOUNDATION
            )

            assert result["ecs_available"] is True
            assert "entity_id" in result
            assert "persona" in result
            assert "lora_config" in result
            assert "test-agent-001" in manager.agents

    def test_name_analysis_integration(self, temp_data_dir: Path) -> None:
        """Test name analysis integration across components."""
        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Generate names using different methods
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=1
        )

        # Generate using original generator
        original_name = generator.generate_batch(config)[0]

        # Generate using modular generator
        modular_name = modular_generator.generate_batch(config)[0]

        # Analyze names using different analyzers
        original_analysis = generator.get_spirit_info(original_name.name)
        modular_analysis = modular_generator.get_spirit_info(modular_name.name)
        manager_analysis = manager.analyze_name(original_name.name)

        # All analyses should be consistent
        assert original_analysis["spirit"] == "fox"
        assert modular_analysis["spirit"] == "fox"
        assert manager_analysis["spirit"] == "fox"

        assert original_analysis["style"] == "foundation"
        assert modular_analysis["style"] == "foundation"
        assert manager_analysis["style"] == "foundation"

    def test_batch_generation_integration(self, temp_data_dir: Path) -> None:
        """Test batch generation integration."""
        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Generate batches using different methods
        config = NamingConfig(
            spirit=AnimalSpirit.OTTER, style=NamingStyle.CYBERPUNK, count=BATCH_SIZE_SMALL
        )

        # Generate using original generator
        original_names = generator.generate_batch(config)

        # Generate using modular generator
        modular_names = modular_generator.generate_batch(config)

        # Generate using manager
        manager_names: list[str] = []
        for _ in range(BATCH_SIZE_SMALL):
            name: str = manager.generate_name(AnimalSpirit.OTTER, NamingStyle.CYBERPUNK)
            manager_names.append(name)

        # All should generate valid names
        assert len(original_names) == BATCH_SIZE_SMALL
        assert len(modular_names) == BATCH_SIZE_SMALL
        assert len(manager_names) == BATCH_SIZE_SMALL

        # All names should be valid
        for original_name in original_names:
            assert isinstance(original_name, AgentName)
            assert original_name.spirit == AnimalSpirit.OTTER
            assert original_name.style == NamingStyle.CYBERPUNK

        for modular_name in modular_names:
            assert isinstance(modular_name, AgentName)
            assert modular_name.spirit == AnimalSpirit.OTTER
            assert modular_name.style == NamingStyle.CYBERPUNK

        for name in manager_names:
            assert isinstance(name, str)
            assert len(name) > 0

    def test_error_handling_integration(self, temp_data_dir: Path) -> None:
        """Test error handling integration across components."""
        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Test with invalid configurations
        invalid_configs = [
            NamingConfig(count=0),
            NamingConfig(spirit=None, style=None),
            NamingConfig(scheme=NamingScheme.ELEMENTAL, scheme_type="invalid"),
        ]

        for config in invalid_configs:
            # All components should handle invalid configs gracefully
            original_names = generator.generate_batch(config)
            modular_names = modular_generator.generate_batch(config)

            assert isinstance(original_names, list)
            assert isinstance(modular_names, list)

        # Test manager with invalid parameters
        invalid_name = manager.generate_name()
        assert isinstance(invalid_name, str)
        assert len(invalid_name) > 0

        # Test assignment with invalid data
        result = manager.assign_name("", "")
        assert result is True  # Should not raise exception

    def test_performance_integration(self, temp_data_dir: Path) -> None:
        """Test performance integration across components."""
        import time

        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Test batch generation performance
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=BATCH_SIZE_LARGE
        )

        # Time original generator
        start_time = time.time()
        original_names = generator.generate_batch(config)
        original_time = time.time() - start_time

        # Time modular generator
        start_time = time.time()
        modular_names = modular_generator.generate_batch(config)
        modular_time = time.time() - start_time

        # Time manager generation
        start_time = time.time()
        manager_names = []
        for _ in range(BATCH_SIZE_LARGE):
            name = manager.generate_name(AnimalSpirit.FOX, NamingStyle.FOUNDATION)
            manager_names.append(name)
        manager_time = time.time() - start_time

        # All should complete in reasonable time (less than 10 seconds)
        assert original_time < PERFORMANCE_THRESHOLD
        assert modular_time < PERFORMANCE_THRESHOLD
        assert manager_time < PERFORMANCE_THRESHOLD

        # All should generate the expected number of names
        assert len(original_names) == BATCH_SIZE_LARGE
        assert len(modular_names) == BATCH_SIZE_LARGE
        assert len(manager_names) == BATCH_SIZE_LARGE

    def test_data_consistency_integration(self, temp_data_dir: Path) -> None:
        """Test data consistency integration across components."""
        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Test that all components use consistent data
        spirits = [AnimalSpirit.FOX, AnimalSpirit.WOLF, AnimalSpirit.OTTER]
        styles = [NamingStyle.FOUNDATION, NamingStyle.EXO, NamingStyle.CYBERPUNK]

        for spirit in spirits:
            for style in styles:
                config = NamingConfig(spirit=spirit, style=style, count=1)

                # Generate using different methods
                original_name = generator.generate_single_name(config)
                modular_name = modular_generator.generate_single_name(config)
                manager_name = manager.generate_name(spirit, style)

                # All should generate valid names
                assert isinstance(original_name, AgentName)
                assert isinstance(modular_name, AgentName)
                assert isinstance(manager_name, str)

                # All should have correct spirit and style
                assert original_name.spirit == spirit
                assert original_name.style == style
                assert modular_name.spirit == spirit
                assert modular_name.style == style

    def test_complete_workflow_integration(self, temp_data_dir: Path) -> None:
        """Test complete workflow integration."""
        # Create components
        generator = ReynardRobotNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Complete workflow: generate -> assign -> persist -> retrieve -> analyze
        agent_id = "workflow-agent-001"
        spirit = AnimalSpirit.FOX
        style = NamingStyle.FOUNDATION

        # Step 1: Generate name
        config = NamingConfig(spirit=spirit, style=style, count=1)
        names = generator.generate_batch(config)
        generated_name = names[0]

        # Step 2: Assign name
        result = manager.assign_name(agent_id, generated_name.name)
        assert result is True

        # Step 3: Retrieve name
        retrieved_name = manager.get_name(agent_id)
        assert retrieved_name == generated_name.name

        # Step 4: Analyze name
        analysis = manager.analyze_name(retrieved_name)
        assert analysis["spirit"] == "fox"
        assert analysis["style"] == "foundation"

        # Step 5: Verify persistence
        new_manager = AgentNameManager(str(temp_data_dir))
        persisted_name = new_manager.get_name(agent_id)
        assert persisted_name == generated_name.name

        # Step 6: List agents
        agents = new_manager.list_agents()
        assert agent_id in agents
        assert agents[agent_id] == generated_name.name

    def test_multi_agent_workflow_integration(self, temp_data_dir: Path) -> None:
        """Test multi-agent workflow integration."""
        # Create components
        generator = ReynardRobotNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Create multiple agents with different spirits and styles
        agents_data = [
            ("agent-001", AnimalSpirit.FOX, NamingStyle.FOUNDATION),
            ("agent-002", AnimalSpirit.WOLF, NamingStyle.EXO),
            ("agent-003", AnimalSpirit.OTTER, NamingStyle.CYBERPUNK),
            ("agent-004", AnimalSpirit.DRAGON, NamingStyle.MYTHOLOGICAL),
            ("agent-005", AnimalSpirit.EAGLE, NamingStyle.SCIENTIFIC),
        ]

        # Generate and assign names for all agents
        for agent_id, spirit, style in agents_data:
            config = NamingConfig(spirit=spirit, style=style, count=1)
            names = generator.generate_batch(config)
            generated_name = names[0]

            result = manager.assign_name(agent_id, generated_name.name)
            assert result is True

        # Verify all agents were created
        agents = manager.list_agents()
        assert len(agents) == AGENT_COUNT_MULTI

        for agent_id, spirit, style in agents_data:
            assert agent_id in agents
            name = manager.get_name(agent_id)
            assert name is not None
            assert len(name) > 0

            # Analyze the name
            analysis = manager.analyze_name(name)
            assert analysis["spirit"] == spirit.value
            assert analysis["style"] == style.value

    def test_error_recovery_integration(self, temp_data_dir: Path) -> None:
        """Test error recovery integration."""
        # Create components
        generator = ReynardRobotNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Test recovery from various error conditions

        # 1. Invalid spirit
        try:
            config = NamingConfig(
                spirit=None, style=NamingStyle.FOUNDATION, count=1
            )
            names = generator.generate_batch(config)
            assert len(names) > 0  # Should fall back gracefully
        except Exception:
            pytest.fail("Should handle invalid spirit gracefully")

        # 2. Invalid style
        try:
            config = NamingConfig(
                spirit=AnimalSpirit.FOX, style=None, count=1
            )
            names = generator.generate_batch(config)
            assert len(names) > 0  # Should fall back gracefully
        except Exception:
            pytest.fail("Should handle invalid style gracefully")

        # 3. File system errors
        try:
            # Make directory read-only
            temp_data_dir.chmod(0o444)

            # Should still work in memory
            name = manager.generate_name(AnimalSpirit.FOX, NamingStyle.FOUNDATION)
            assert isinstance(name, str)
            assert len(name) > 0

            # Assignment should work in memory even if file write fails
            result = manager.assign_name("test-agent", name)
            assert result is True

        except Exception:
            pytest.fail("Should handle file system errors gracefully")
        finally:
            # Restore write permissions
            temp_data_dir.chmod(0o755)

        # 4. Empty configurations
        try:
            config = NamingConfig()
            names = generator.generate_batch(config)
            assert len(names) > 0  # Should generate fallback names
        except Exception:
            pytest.fail("Should handle empty configurations gracefully")

    def test_concurrent_access_integration(self, temp_data_dir: Path) -> None:
        """Test concurrent access integration."""
        import threading

        # Create components
        manager = AgentNameManager(str(temp_data_dir))

        # Test concurrent name generation and assignment
        results = []
        errors = []

        def generate_and_assign(agent_id_prefix: str, count: int) -> None:
            try:
                for i in range(count):
                    agent_id = f"{agent_id_prefix}-{i}"
                    name = manager.generate_name(
                        AnimalSpirit.FOX, NamingStyle.FOUNDATION
                    )
                    result = manager.assign_name(agent_id, name)
                    results.append((agent_id, name, result))
            except Exception as e:
                errors.append(e)

        # Create multiple threads
        threads = []
        for i in range(5):
            thread = threading.Thread(
                target=generate_and_assign, args=(f"thread-{i}", BATCH_SIZE_MEDIUM)
            )
            threads.append(thread)

        # Start all threads
        for thread in threads:
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # Verify no errors occurred
        assert len(errors) == 0

        # Verify all assignments were successful
        assert len(results) == AGENT_COUNT_CONCURRENT  # 5 threads * 10 agents each

        for _agent_id, name, result in results:
            assert result is True
            assert isinstance(name, str)
            assert len(name) > 0

        # Verify all agents are in the manager
        agents = manager.list_agents()
        assert len(agents) == AGENT_COUNT_CONCURRENT

        # Verify all names are retrievable
        for agent_id, name, _result in results:
            retrieved_name = manager.get_name(agent_id)
            assert retrieved_name == name

    def test_memory_usage_integration(self, temp_data_dir: Path) -> None:
        """Test memory usage integration."""
        import gc

        # Create components
        generator = ReynardRobotNamer()
        modular_generator = ModularAgentNamer()
        manager = AgentNameManager(str(temp_data_dir))

        # Generate large batches
        config = NamingConfig(
            spirit=AnimalSpirit.FOX, style=NamingStyle.FOUNDATION, count=BATCH_SIZE_XLARGE
        )

        # Generate using original generator
        original_names = generator.generate_batch(config)
        assert len(original_names) == BATCH_SIZE_XLARGE

        # Generate using modular generator
        modular_names = modular_generator.generate_batch(config)
        assert len(modular_names) == BATCH_SIZE_XLARGE

        # Generate using manager
        manager_names = []
        for _ in range(BATCH_SIZE_XLARGE):
            name = manager.generate_name(AnimalSpirit.FOX, NamingStyle.FOUNDATION)
            manager_names.append(name)
        assert len(manager_names) == BATCH_SIZE_XLARGE

        # Force garbage collection
        gc.collect()

        # All should still work after garbage collection
        assert len(original_names) == BATCH_SIZE_XLARGE
        assert len(modular_names) == BATCH_SIZE_XLARGE
        assert len(manager_names) == BATCH_SIZE_XLARGE

        # Test that we can still generate new names
        new_config = NamingConfig(
            spirit=AnimalSpirit.WOLF, style=NamingStyle.EXO, count=BATCH_SIZE_MEDIUM
        )

        new_names = generator.generate_batch(new_config)
        assert len(new_names) == BATCH_SIZE_MEDIUM

        new_modular_names = modular_generator.generate_batch(new_config)
        assert len(new_modular_names) == BATCH_SIZE_MEDIUM

        new_manager_names = []
        for _ in range(BATCH_SIZE_MEDIUM):
            name = manager.generate_name(AnimalSpirit.WOLF, NamingStyle.EXO)
            new_manager_names.append(name)
        assert len(new_manager_names) == BATCH_SIZE_MEDIUM
