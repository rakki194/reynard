#!/usr/bin/env python3
"""🦊 Test Script for Intelligent Service Reload System

This script demonstrates how the intelligent reload system works by
showing which services would be affected by different file changes.
"""

import sys
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi import FastAPI

from app.core.intelligent_reload import ServiceReloadManager


def test_file_change_detection():
    """Test the file change detection system."""
    print("🦊 Testing Intelligent Service Reload System")
    print("=" * 60)

    # Create a mock FastAPI app
    app = FastAPI()

    # Create the reload manager
    reload_manager = ServiceReloadManager(app)

    # Test files that should trigger different services
    test_files = [
        "app/ecs/world.py",
        "app/ecs/service.py",
        "app/ecs/endpoints/agents.py",
        "app/ecs/database.py",
        "gatekeeper/api/routes.py",
        "app/auth/user_service.py",
        "app/security/input_validator.py",
        "app/api/comfy/generate.py",
        "app/services/comfy/comfy_service.py",
        "app/api/nlweb/process.py",
        "app/services/nlweb/nlweb_service.py",
        "app/api/rag/search.py",
        "app/services/rag/rag_service.py",
        "app/services/initial_indexing.py",
        "app/api/search/query.py",
        "app/services/search/search_service.py",
        "app/api/ollama/chat.py",
        "app/services/ollama/ollama_service.py",
        "app/api/tts/synthesize.py",
        "app/services/tts/tts_service.py",
        "app/api/image_utils/process.py",
        "app/services/image_processing_service.py",
        "app/services/ai_email_response_service.py",
        "app/api/agent_email_routes.py",
        "app/core/config.py",  # Should not trigger any service
        "main.py",  # Should not trigger any service
    ]

    print("📁 Testing file change detection:")
    print()

    for file_path in test_files:
        affected_services = reload_manager.get_affected_services(file_path)

        if affected_services:
            print(f"📝 {file_path}")
            print(f"   → Affects services: {', '.join(affected_services)}")
        else:
            print(f"📝 {file_path}")
            print("   → No service-specific reload needed")
        print()

    print("=" * 60)
    print("🎯 Summary:")
    print("   • ECS files trigger ECS world service reload")
    print("   • Service-specific files trigger their respective service reloads")
    print("   • Core files (config, main.py) don't trigger service reloads")
    print("   • This allows for faster development cycles")
    print("=" * 60)


def test_service_mappings():
    """Test the service file mappings."""
    print("\n🗺️  Service File Mappings:")
    print("=" * 60)

    # Create a mock FastAPI app
    app = FastAPI()

    # Create the reload manager
    reload_manager = ServiceReloadManager(app)

    for service_name, patterns in reload_manager.service_file_mappings.items():
        print(f"🔧 {service_name}:")
        for pattern in patterns:
            print(f"   • {pattern}")
        print()

    print("=" * 60)


if __name__ == "__main__":
    test_file_change_detection()
    test_service_mappings()

    print("\n🚀 To enable intelligent reload:")
    print("   export INTELLIGENT_RELOAD=true")
    print("   python main.py")
    print()
    print("🔧 To disable intelligent reload:")
    print("   export INTELLIGENT_RELOAD=false")
    print("   python main.py")
