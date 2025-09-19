#!/usr/bin/env python3
"""
ECS World Trait Evolution Test Runner

Runs comprehensive tests to verify that agent traits evolve over time in the ECS world simulation.
Uses the virtual environment as specified in the user requirements.

Author: Wit-Prime-13 (Fox Specialist)
"""

import subprocess
import sys
import os
from pathlib import Path


def run_trait_evolution_tests():
    """Run the trait evolution tests using the virtual environment."""
    
    # Get the current directory (should be packages/ecs-world)
    current_dir = Path(__file__).parent
    test_file = current_dir / "src" / "__tests__" / "test_trait_evolution.py"
    
    # Verify test file exists
    if not test_file.exists():
        print(f"❌ Test file not found: {test_file}")
        return False
    
    print("🦊 Running ECS World Trait Evolution Tests...")
    print(f"📁 Test file: {test_file}")
    print(f"📁 Working directory: {current_dir}")
    
    # Construct the bash command with virtual environment activation
    bash_command = f"""
    source ~/venv/bin/activate && \
    cd {current_dir} && \
    python -m pytest {test_file} -v --tb=short --color=yes
    """
    
    try:
        print("🚀 Executing tests with virtual environment...")
        print(f"🔧 Command: {bash_command.strip()}")
        
        # Run the command using bash -c as requested
        result = subprocess.run(
            ["bash", "-c", bash_command],
            capture_output=True,
            text=True,
            cwd=current_dir
        )
        
        # Print the output
        print("\n" + "="*80)
        print("📊 TEST RESULTS")
        print("="*80)
        
        if result.stdout:
            print("📤 STDOUT:")
            print(result.stdout)
        
        if result.stderr:
            print("📤 STDERR:")
            print(result.stderr)
        
        print("="*80)
        print(f"🔢 Exit code: {result.returncode}")
        
        if result.returncode == 0:
            print("✅ All tests passed! Traits are evolving correctly in the ECS world.")
            return True
        else:
            print("❌ Some tests failed. Check the output above for details.")
            return False
            
    except Exception as e:
        print(f"💥 Error running tests: {e}")
        return False


def run_individual_test_scenarios():
    """Run individual test scenarios to demonstrate trait evolution."""
    
    print("\n🦊 Running Individual Trait Evolution Scenarios...")
    
    # Test scenario 1: Trait inheritance
    print("\n📋 Scenario 1: Testing Trait Inheritance During Breeding")
    bash_command = """
    source ~/venv/bin/activate && \
    cd packages/ecs-world && \
    python -c "
import sys
sys.path.append('src')
from __tests__.test_trait_evolution import TestTraitEvolution
import tempfile
from pathlib import Path

# Create test instance
test = TestTraitEvolution()
temp_dir = Path(tempfile.mkdtemp())
world = test.agent_world(temp_dir)

# Run trait inheritance test
test.test_trait_inheritance_during_breeding(world)
print('✅ Trait inheritance test passed!')
"
    """
    
    try:
        result = subprocess.run(["bash", "-c", bash_command], capture_output=True, text=True)
        print("📤 Output:", result.stdout)
        if result.stderr:
            print("📤 Errors:", result.stderr)
    except Exception as e:
        print(f"💥 Error in scenario 1: {e}")
    
    # Test scenario 2: Time progression
    print("\n📋 Scenario 2: Testing Time-Based Trait Progression")
    bash_command = """
    source ~/venv/bin/activate && \
    cd packages/ecs-world && \
    python -c "
import sys
sys.path.append('src')
from __tests__.test_trait_evolution import TestTraitEvolution
import tempfile
from pathlib import Path

# Create test instance
test = TestTraitEvolution()
temp_dir = Path(tempfile.mkdtemp())
simulation = test.world_simulation(temp_dir)

# Run time progression test
test.test_simulation_time_acceleration(simulation)
print('✅ Time progression test passed!')
"
    """
    
    try:
        result = subprocess.run(["bash", "-c", bash_command], capture_output=True, text=True)
        print("📤 Output:", result.stdout)
        if result.stderr:
            print("📤 Errors:", result.stderr)
    except Exception as e:
        print(f"💥 Error in scenario 2: {e}")


def main():
    """Main test runner function."""
    print("🦊 ECS World Trait Evolution Test Suite")
    print("=" * 50)
    print("Testing trait evolution over time in the ECS world simulation")
    print("=" * 50)
    
    # Run comprehensive tests
    success = run_trait_evolution_tests()
    
    # Run individual scenarios
    run_individual_test_scenarios()
    
    if success:
        print("\n🎉 All trait evolution tests completed successfully!")
        print("🦊 Traits are evolving correctly in the ECS world simulation.")
    else:
        print("\n⚠️  Some tests failed. Please check the output above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
