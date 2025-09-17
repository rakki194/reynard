# ECS Automatic Breeding System Tests

## Overview

This directory contains comprehensive pytest tests for the ECS (Entity Component System) automatic breeding system in the Reynard MCP server. The tests verify agent lifecycle, reproduction, lineage tracking, and singleton pattern behavior.

## Test Files

### `test_ecs_simple.py`

**Status**: ✅ All 21 tests passing

Comprehensive test suite covering:

#### Core ECS Functionality

- ✅ World simulation creation and initialization
- ✅ Agent creation with inheritance
- ✅ Component system (Agent, Lifecycle, Trait, Lineage, Reproduction)
- ✅ Simulation time tracking and acceleration
- ✅ Agent persona and LoRA configuration generation

#### Breeding and Reproduction

- ✅ **Automatic breeding simulation** - Tests that agents breed automatically during simulation updates
- ✅ **Manual offspring creation** - Tests lineage tracking between parents and offspring
- ✅ **Genetic compatibility analysis** - Tests compatibility calculation between agents
- ✅ **Compatible mate finding** - Tests the mate selection system

#### Singleton Pattern Analysis

- ✅ **Singleton-like behavior verification** - Tests that multiple WorldSimulation instances maintain consistent state
- ✅ **Agent persistence across instances** - Tests that each world instance maintains its own entities (not shared)

## Key Findings

### ECS World Architecture

- **Not a true singleton**: Each `WorldSimulation` instance has its own `ECSWorld` with separate entities
- **Data directory sharing**: Multiple instances can share the same data directory for persistence
- **Time synchronization**: All instances maintain consistent simulation time and acceleration settings

### Automatic Breeding System

- ✅ **Working**: The system successfully creates offspring during simulation updates
- ✅ **Lineage tracking**: Parent-child relationships are properly maintained
- ✅ **Component inheritance**: Offspring inherit traits from parents
- ✅ **Reproduction cooldowns**: System respects breeding limits and cooldowns

### Agent Lifecycle

- ✅ **Lifecycle progression**: Agents progress through infant → juvenile → adult → elder stages
- ✅ **Maturity detection**: System correctly identifies mature agents for breeding
- ✅ **Death and cleanup**: Old agents are removed from the breeding pool

## Test Results Summary

```
============================== 21 passed in 1.16s ==============================
```

**All tests passing** - The ECS automatic breeding system is functioning correctly.

## Integration with Queue-Watcher

The ECS world simulation can be integrated with the queue-watcher system for monitoring:

1. **Simulation Status Monitoring**: The `get_simulation_status()` method provides real-time statistics
2. **Agent Population Tracking**: Monitor total agent count and breeding activity
3. **Time Acceleration Control**: Adjust simulation speed for different monitoring needs
4. **Event Logging**: Track breeding events, agent deaths, and lifecycle transitions

## Usage

Run all tests:

```bash
cd /home/kade/runeset/reynard/scripts/mcp
python -m pytest tests/test_ecs_simple.py -v
```

Run specific test categories:

```bash
# Test automatic breeding
python -m pytest tests/test_ecs_simple.py::TestECSSimple::test_automatic_breeding_simulation -v

# Test singleton pattern
python -m pytest tests/test_ecs_simple.py::TestECSSimple::test_singleton_pattern_verification -v

# Test lineage tracking
python -m pytest tests/test_ecs_simple.py::TestECSSimple::test_breeding_with_offspring_creation -v
```

## Architecture Notes

### ECS Components Tested

- **AgentComponent**: Core agent identity (name, spirit, style)
- **LifecycleComponent**: Age, life stage, maturity tracking
- **TraitComponent**: Personality, physical, and ability traits
- **LineageComponent**: Parent-child relationships and genealogy
- **ReproductionComponent**: Breeding capabilities and cooldowns

### Systems Tested

- **LifecycleSystem**: Manages agent aging and life stage transitions
- **ReproductionSystem**: Handles automatic breeding and offspring creation
- **TimeSystem**: Manages simulation time and acceleration

### Data Persistence

- Agent personas saved to `agent-personas.json`
- LoRA configurations saved to `lora-configs.json`
- Simulation state can be saved/loaded for persistence

## Future Enhancements

1. **Queue-Watcher Integration**: Add real-time monitoring of breeding events
2. **Performance Metrics**: Track breeding rates, population growth, and system performance
3. **Advanced Genetics**: Implement more sophisticated trait inheritance
4. **Environmental Factors**: Add environmental influences on breeding success
5. **Population Dynamics**: Implement carrying capacity and resource limitations

---

_Tests created by Sovereign-Scientist-56 (Wolf Specialist)_
_Following the 140-line axiom and modular architecture principles_
