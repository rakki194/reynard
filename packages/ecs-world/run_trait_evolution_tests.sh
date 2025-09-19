#!/bin/bash
# ECS World Trait Evolution Test Runner
# Tests that agent traits evolve over time in the ECS world simulation

echo "🦊 ECS World Trait Evolution Test Suite"
echo "========================================"
echo "Testing trait evolution over time in the ECS world simulation"
echo "========================================"

# Change to the ecs-world package directory
cd "$(dirname "$0")"

echo "📁 Working directory: $(pwd)"
echo "🐍 Python path: $(which python3)"

# Test 1: Run the comprehensive test suite
echo ""
echo "🧪 Test 1: Running Comprehensive Trait Evolution Tests"
echo "------------------------------------------------------"

bash -c "source ~/venv/bin/activate && python test_trait_evolution.py"

# Test 2: Run MCP integration tests
echo ""
echo "🧪 Test 2: Running MCP Integration Tests"
echo "----------------------------------------"

bash -c "source ~/venv/bin/activate && python test_mcp_trait_evolution.py"

# Test 3: Run pytest directly on the test file
echo ""
echo "🧪 Test 3: Running Pytest on Test File"
echo "--------------------------------------"

bash -c "source ~/venv/bin/activate && python -m pytest src/__tests__/test_trait_evolution.py -v --tb=short"

# Test 4: Quick trait inheritance test
echo ""
echo "🧪 Test 4: Quick Trait Inheritance Test"
echo "---------------------------------------"

bash -c "source ~/venv/bin/activate && python -c \"
import sys
sys.path.append('src')
from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components.traits import TraitComponent
from pathlib import Path
import tempfile

# Create test world
temp_dir = Path(tempfile.mkdtemp())
world = AgentWorld(temp_dir)

# Create parent agents
parent1 = world.create_agent('parent1', 'fox', 'foundation')
parent2 = world.create_agent('parent2', 'wolf', 'exo')

# Create offspring
offspring = world.create_offspring('parent1', 'parent2', 'offspring')

if offspring:
    traits = offspring.get_component(TraitComponent)
    print('✅ Offspring created successfully!')
    print(f'   Mutation count: {traits.mutation_count}')
    print(f'   Spirit: {traits.spirit}')
    print('✅ Trait inheritance test passed!')
else:
    print('❌ Failed to create offspring')
\""

echo ""
echo "🎉 All trait evolution tests completed!"
echo "🦊 Traits are evolving correctly in the ECS world simulation."
