#!/usr/bin/env python3
"""Check the actual API responses for tests."""

from reynard_ecs_world.world.agent_world import AgentWorld
from reynard_ecs_world.components import MemoryType, GenderIdentity

def main():
    world = AgentWorld()
    
    # Test memory stats
    agent = world.create_agent('test-agent', spirit='fox', style='foundation')
    world.store_memory('test-agent', MemoryType.EPISODIC, 'test memory', importance=0.8)
    memory_stats = world.get_memory_stats('test-agent')
    print('Memory stats keys:', list(memory_stats.keys()))
    print('Memory stats:', memory_stats)
    
    # Test interaction stats
    interaction_stats = world.get_interaction_stats('test-agent')
    print('\nInteraction stats keys:', list(interaction_stats.keys()))
    print('Interaction stats:', interaction_stats)
    
    # Test social stats
    social_stats = world.get_social_stats('test-agent')
    print('\nSocial stats keys:', list(social_stats.keys()))
    print('Social stats:', social_stats)
    
    # Test gender stats
    world.update_gender_identity('test-agent', GenderIdentity.MALE)
    gender_stats = world.get_gender_stats('test-agent')
    print('\nGender stats keys:', list(gender_stats.keys()))
    print('Gender stats:', gender_stats)

if __name__ == "__main__":
    main()
