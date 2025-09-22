#!/usr/bin/env python3
"""
Test File Indexing Service
==========================

Test script to verify that the file indexing and caching service works
efficiently for fast file discovery and content caching.

🔥 Phoenix approach: We test our file indexing implementation to ensure
it soars with efficiency for fast file operations!
"""

import asyncio
import sys
from pathlib import Path

# Add the backend directory to the path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.services.rag.file_indexing_service import get_file_indexing_service
from app.config.file_indexing_config import get_file_indexing_config


async def test_file_indexing_service():
    """Test the file indexing service functionality."""
    print("🔥 Testing File Indexing Service")
    print("=" * 50)
    
    # Get the service
    indexing_service = get_file_indexing_service()
    
    # Get configuration
    config = get_file_indexing_config()
    print(f"📊 Configuration loaded: {config['file_indexing_enabled']}")
    print(f"🔥 File indexing: {config['file_indexing']['enabled']}")
    print(f"💾 Content caching: {config['content_caching']['enabled']}")
    
    # Initialize the service
    print("\n🚀 Initializing service...")
    success = await indexing_service.initialize(config)
    print(f"✅ Initialization: {'Success' if success else 'Failed'}")
    
    if not success:
        print("❌ Service initialization failed")
        return
    
    # Test file indexing
    print("\n📁 Testing file indexing...")
    directories = ["app/services/rag"]
    file_types = [".py"]
    
    result = await indexing_service.index_files(directories, file_types)
    print(f"📊 Indexed {result['indexed_files']} files in {result['index_time']:.2f}s")
    
    # Test content caching
    print("\n💾 Testing content caching...")
    test_file = "app/services/rag/file_indexing_service.py"
    content = await indexing_service.get_file_content(test_file)
    if content:
        await indexing_service.cache_content(test_file, content)
        cached_content = await indexing_service.get_cached_content(test_file)
        print(f"📄 Cached and retrieved content: {len(cached_content)} characters")
    else:
        print("❌ Failed to get file content for caching test")
    
    # Test file search
    print("\n🔍 Testing file search...")
    search_results = await indexing_service.search_files("indexing", max_results=5)
    print(f"🔍 Found {len(search_results)} files matching 'indexing'")
    for i, file_path in enumerate(search_results[:3], 1):
        print(f"  {i}. {file_path}")
    
    # Test file content retrieval
    if search_results:
        print(f"\n📄 Testing file content retrieval...")
        content = await indexing_service.get_file_content(search_results[0])
        if content:
            lines = content.split('\n')
            print(f"📊 Retrieved {len(lines)} lines from {search_results[0]}")
            print(f"📝 First line: {lines[0][:100]}...")
        else:
            print("❌ Failed to retrieve file content")
    
    # Test statistics
    print("\n📊 Service Statistics:")
    stats = await indexing_service.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    # Test health check
    print(f"\n🏥 Health Check: {'✅ Healthy' if await indexing_service.health_check() else '❌ Unhealthy'}")
    
    print("\n🔥 File Indexing Service Test Complete!")
    print("=" * 50)


async def test_monolith_detection_integration():
    """Test monolith detection with file indexing integration."""
    print("\n🔥 Testing Monolith Detection Integration")
    print("=" * 50)
    
    try:
        # Import the monolith analysis service
        from services.mcp_server.services.monolith_analysis_service import MonolithAnalysisService
        
        # Create service instance
        monolith_service = MonolithAnalysisService()
        
        # Test file analysis
        print("📊 Testing file analysis...")
        test_file = "backend/app/services/rag/lightweight_rag_service.py"
        
        if Path(test_file).exists():
            metrics = await monolith_service.analyze_file_metrics(test_file)
            print(f"📄 File: {metrics['file_path']}")
            print(f"📏 Lines of code: {metrics['lines_of_code']}")
            print(f"📊 Total lines: {metrics['total_lines']}")
            
            if "ast_metrics" in metrics:
                ast_metrics = metrics["ast_metrics"]
                print(f"🔧 Functions: {ast_metrics.get('functions', 0)}")
                print(f"🏗️ Classes: {ast_metrics.get('classes', 0)}")
                print(f"📦 Imports: {ast_metrics.get('imports', 0)}")
                print(f"⚡ Complexity: {ast_metrics.get('complexity', 0)}")
        else:
            print(f"❌ Test file not found: {test_file}")
        
        # Test monolith detection
        print("\n🔍 Testing monolith detection...")
        result = await monolith_service.detect_monoliths(
            max_lines=50,  # Lower threshold for testing
            directories=["backend/app/services/rag"],
            file_types=[".py"],
            top_n=3
        )
        print("📊 Monolith Detection Results:")
        print(result)
        
    except ImportError as e:
        print(f"❌ Failed to import monolith service: {e}")
    except Exception as e:
        print(f"❌ Error testing monolith detection: {e}")


if __name__ == "__main__":
    print("🔥 Phoenix File Indexing Test Suite")
    print("=" * 60)
    
    # Run tests
    asyncio.run(test_file_indexing_service())
    asyncio.run(test_monolith_detection_integration())
    
    print("\n🎉 All tests completed!")
