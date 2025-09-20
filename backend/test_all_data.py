#!/usr/bin/env python3
"""Test script to verify all data is loaded correctly."""

import requests
import json

def test_api_endpoints():
    """Test all API endpoints to verify data completeness."""
    base_url = "http://localhost:8000/api/ecs"
    
    print("🧪 Testing API endpoints for complete data...")
    
    # Test naming spirits (races)
    try:
        response = requests.get(f"{base_url}/naming/animal-spirits")
        if response.status_code == 200:
            data = response.json()
            spirits = data.get('races', {})
            spirit_count = len(spirits)
            print(f"✅ Found {spirit_count} naming spirits")
            
            # Show some sample spirits
            print("📋 Sample spirits:")
            for i, (spirit_name, spirit_data) in enumerate(list(spirits.items())[:5]):
                print(f"  {i+1}. {spirit_name} ({spirit_data.get('emoji', '?')}) - {spirit_data.get('category', 'Unknown')}")
            
            if spirit_count > 5:
                print(f"  ... and {spirit_count - 5} more")
                
        else:
            print(f"❌ Failed to get naming spirits: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing naming spirits: {e}")
    
    # Test naming components
    try:
        response = requests.get(f"{base_url}/naming/components")
        if response.status_code == 200:
            components = response.json()
            print(f"✅ Found {len(components)} naming components")
            
            # Show component types
            if isinstance(components, dict):
                print("📋 Component types:")
                for comp_type, comp_list in components.items():
                    print(f"  {comp_type}: {len(comp_list)} components")
            else:
                print(f"📋 Components: {len(components)} total")
                
        else:
            print(f"❌ Failed to get naming components: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing naming components: {e}")
    
    # Test naming config
    try:
        response = requests.get(f"{base_url}/naming/config")
        if response.status_code == 200:
            config = response.json()
            print(f"✅ Found {len(config)} naming config entries")
            
            # Show config keys
            print("📋 Config entries:")
            for key, value in config.items():
                if isinstance(value, dict):
                    print(f"  {key}: {value.get('config_value', 'N/A')}")
                else:
                    print(f"  {key}: {value}")
                    
        else:
            print(f"❌ Failed to get naming config: {response.status_code}")
    except Exception as e:
        print(f"❌ Error testing naming config: {e}")
    
    print("\n🎉 Data verification complete!")

if __name__ == "__main__":
    test_api_endpoints()
