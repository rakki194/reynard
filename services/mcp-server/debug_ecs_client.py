#!/usr/bin/env python3
"""
Debug script for ECS client issues.
"""

import asyncio
import sys
import os

# Add the MCP scripts directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services.ecs_client import get_ecs_client

async def test_ecs_client():
    """Test the ECS client functionality."""
    print("🔍 Testing ECS Client...")
    
    try:
        # Get ECS client
        ecs_client = get_ecs_client()
        print(f"✅ ECS client created: {type(ecs_client)}")
        
        # Start the client
        await ecs_client.start()
        print("✅ ECS client started")
        
        # Test world status
        print("\n🌍 Testing world status...")
        status = await ecs_client.get_world_status()
        print(f"World status: {status}")
        
        # Test agent creation
        print("\n🤖 Testing agent creation...")
        result = await ecs_client.create_agent(
            agent_id="debug-test-agent",
            spirit="fox",
            style="foundation"
        )
        print(f"Agent creation result: {result}")
        
        # Test getting agent positions
        print("\n📍 Testing agent positions...")
        positions = await ecs_client.get_all_agent_positions()
        print(f"Agent positions: {positions}")
        
        # Close the client
        await ecs_client.close()
        print("✅ ECS client closed")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_ecs_client())
