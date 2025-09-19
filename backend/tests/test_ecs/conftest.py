"""
Pytest configuration for ECS tests.
"""

import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from backend.app.ecs.world import AgentWorld


@pytest.fixture
def agent_world():
    """Create a fresh AgentWorld instance for testing."""
    return AgentWorld()


@pytest.fixture
def sample_agents(agent_world):
    """Create sample agents for testing."""
    agents = []
    
    # Create agents with different spirits
    spirits = ["fox", "wolf", "otter", "eagle", "lion"]
    styles = ["foundation", "exo", "hybrid", "cyberpunk", "mythological"]
    
    for i, (spirit, style) in enumerate(zip(spirits, styles)):
        agent = agent_world.create_agent(
            agent_id=f"agent_{i}",
            spirit=spirit,
            style=style,
            name=f"{spirit.title()}Agent{i}"
        )
        agents.append(agent)
    
    return agents


@pytest.fixture
def mature_agents(agent_world):
    """Create mature agents ready for breeding."""
    agents = []
    
    # Create two mature agents
    for i in range(2):
        agent = agent_world.create_agent(
            agent_id=f"mature_agent_{i}",
            spirit="fox" if i == 0 else "wolf",
            style="foundation",
            name=f"MatureAgent{i}"
        )
        
        # Age the agent to maturity
        from backend.app.ecs.components import LifecycleComponent
        lifecycle = agent.get_component(LifecycleComponent)
        if lifecycle:
            lifecycle.age = 20.0  # Make mature
        
        agents.append(agent)
    
    return agents
