#!/usr/bin/env python3
"""🦊 Memory Debug Tools Demo
===========================

Demonstration script showing how to use all the memory debugging tools
to trace RAM consumption in the RAG stack.

This script demonstrates:
1. Memory profiling decorators
2. Memory debug tracer
3. Memory monitor dashboard
4. Integration with RAG components

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.memory_profiling import memory_profile, memory_trace, get_memory_stats
from memory_debug_tracer import MemoryDebugTracer
from memory_monitor_dashboard import MemoryMonitorDashboard

logger = logging.getLogger(__name__)


# Demo RAG components with memory profiling
@memory_profile(component="embedding_service", operation="embed_text", log_threshold_mb=1.0)
async def demo_embed_text(text: str) -> list[float]:
    """Demo embedding function with memory profiling."""
    # Simulate embedding generation
    await asyncio.sleep(0.1)
    embedding = [float(i) for i in range(1024)]  # 1024-dimensional embedding
    return embedding


@memory_profile(component="vector_store", operation="store_vectors", log_threshold_mb=2.0)
async def demo_store_vectors(vectors: list[list[float]]) -> bool:
    """Demo vector storage with memory profiling."""
    # Simulate vector storage
    await asyncio.sleep(0.2)
    # Simulate memory usage for storing vectors
    stored_vectors = vectors.copy()  # This will use memory
    return True


@memory_profile(component="indexing_service", operation="index_documents", log_threshold_mb=5.0)
async def demo_index_documents(documents: list[str]) -> dict:
    """Demo document indexing with memory profiling."""
    # Simulate document indexing
    await asyncio.sleep(0.3)
    
    # Simulate memory-intensive indexing
    indexed_data = {}
    for i, doc in enumerate(documents):
        indexed_data[f"doc_{i}"] = {
            "content": doc,
            "tokens": doc.split(),
            "metadata": {"index": i, "length": len(doc)}
        }
    
    return indexed_data


async def demo_memory_profiling():
    """Demonstrate memory profiling decorators."""
    logger.info("🧪 Demo: Memory Profiling Decorators")
    logger.info("=" * 50)
    
    # Test embedding
    logger.info("Testing embedding service...")
    embedding = await demo_embed_text("This is a test document for embedding")
    logger.info(f"Generated embedding with {len(embedding)} dimensions")
    
    # Test vector storage
    logger.info("Testing vector store...")
    vectors = [await demo_embed_text(f"Document {i}") for i in range(5)]
    success = await demo_store_vectors(vectors)
    logger.info(f"Stored {len(vectors)} vectors: {success}")
    
    # Test document indexing
    logger.info("Testing document indexing...")
    documents = [f"This is test document number {i}" for i in range(10)]
    indexed = await demo_index_documents(documents)
    logger.info(f"Indexed {len(indexed)} documents")
    
    # Get memory statistics
    stats = get_memory_stats()
    logger.info(f"Memory stats: {stats}")
    
    logger.info("✅ Memory profiling demo completed")


async def demo_memory_tracer():
    """Demonstrate memory debug tracer."""
    logger.info("🧪 Demo: Memory Debug Tracer")
    logger.info("=" * 50)
    
    # Create tracer with demo configuration
    config = {
        "sample_interval": 0.5,
        "max_snapshots": 50,
        "leak_threshold_mb": 10,
        "critical_threshold_mb": 50,
        "enable_tracemalloc": True,
        "enable_call_tracing": True,
    }
    
    tracer = MemoryDebugTracer(config)
    
    # Start monitoring
    logger.info("Starting memory tracer...")
    await tracer.start_monitoring(10)  # Monitor for 10 seconds
    
    # Simulate RAG operations
    logger.info("Simulating RAG operations...")
    for i in range(5):
        # Simulate embedding
        embedding = await demo_embed_text(f"Test document {i}")
        
        # Simulate vector storage
        vectors = [embedding]
        await demo_store_vectors(vectors)
        
        # Simulate indexing
        docs = [f"Document {i} content here"]
        await demo_index_documents(docs)
        
        # Small delay
        await asyncio.sleep(1)
    
    # Stop monitoring and get report
    report = await tracer.stop_monitoring()
    
    logger.info("Memory tracer report:")
    logger.info(f"  Duration: {report.get('monitoring_duration_seconds', 0):.1f}s")
    logger.info(f"  Snapshots: {report.get('total_snapshots', 0)}")
    logger.info(f"  Peak memory: {report.get('memory_stats', {}).get('peak_memory_mb', 0):.1f}MB")
    logger.info(f"  Components: {report.get('components_monitored', [])}")
    logger.info(f"  Leaks detected: {report.get('leaks_detected', 0)}")
    
    logger.info("✅ Memory tracer demo completed")


async def demo_memory_dashboard():
    """Demonstrate memory monitor dashboard."""
    logger.info("🧪 Demo: Memory Monitor Dashboard")
    logger.info("=" * 50)
    
    # Create dashboard
    config = {
        "refresh_interval": 1.0,
        "max_history": 30,
        "alert_threshold_mb": 50,
        "critical_threshold_mb": 100,
    }
    
    dashboard = MemoryMonitorDashboard(config)
    
    # Start monitoring
    logger.info("Starting memory dashboard...")
    await dashboard.start_monitoring(8)  # Monitor for 8 seconds
    
    # Simulate some activity
    logger.info("Simulating activity...")
    for i in range(3):
        # Create some memory usage
        data = [j for j in range(1000 * (i + 1))]
        logger.info(f"Created {len(data)} items")
        
        # Simulate RAG operations
        await demo_embed_text(f"Dashboard test {i}")
        await asyncio.sleep(2)
    
    # Stop monitoring
    summary = await dashboard.stop_monitoring()
    
    logger.info("Dashboard summary:")
    logger.info(f"  Duration: {summary.get('monitoring_duration', '0s')}")
    logger.info(f"  Samples: {summary.get('total_samples', 0)}")
    logger.info(f"  Peak memory: {summary.get('peak_memory_mb', 0):.1f}MB")
    logger.info(f"  Components: {summary.get('components_monitored', [])}")
    logger.info(f"  Alerts: {summary.get('alerts_triggered', 0)}")
    
    logger.info("✅ Memory dashboard demo completed")


async def demo_comprehensive_debugging():
    """Demonstrate comprehensive memory debugging."""
    logger.info("🧪 Demo: Comprehensive Memory Debugging")
    logger.info("=" * 50)
    
    # Step 1: Memory profiling
    logger.info("Step 1: Memory Profiling")
    await demo_memory_profiling()
    await asyncio.sleep(1)
    
    # Step 2: Memory tracer
    logger.info("\nStep 2: Memory Tracer")
    await demo_memory_tracer()
    await asyncio.sleep(1)
    
    # Step 3: Memory dashboard
    logger.info("\nStep 3: Memory Dashboard")
    await demo_memory_dashboard()
    
    logger.info("\n✅ Comprehensive memory debugging demo completed")


async def demo_real_world_scenario():
    """Demonstrate a real-world memory debugging scenario."""
    logger.info("🧪 Demo: Real-World Memory Debugging Scenario")
    logger.info("=" * 50)
    
    logger.info("Scenario: RAG service with potential memory leak")
    
    # Create tracer for the scenario
    config = {
        "sample_interval": 0.5,
        "max_snapshots": 100,
        "leak_threshold_mb": 20,
        "critical_threshold_mb": 100,
        "enable_tracemalloc": True,
        "enable_call_tracing": True,
    }
    
    tracer = MemoryDebugTracer(config)
    
    # Start monitoring
    await tracer.start_monitoring(15)  # Monitor for 15 seconds
    
    # Simulate a memory leak scenario
    logger.info("Simulating RAG operations with potential memory leak...")
    
    # Simulate normal operations
    for i in range(3):
        logger.info(f"Batch {i + 1}: Processing documents...")
        
        # Process documents (this might cause memory growth)
        documents = [f"Document {i}_{j} content here" for j in range(20)]
        
        # Simulate embedding and indexing
        for doc in documents:
            embedding = await demo_embed_text(doc)
            vectors = [embedding]
            await demo_store_vectors(vectors)
            await demo_index_documents([doc])
        
        # Simulate memory not being cleaned up properly
        # (This would be the bug in real code)
        if i > 0:  # Don't clean up after first batch
            logger.info("⚠️ Simulating memory leak - not cleaning up properly")
        
        await asyncio.sleep(2)
    
    # Stop monitoring
    report = await tracer.stop_monitoring()
    
    # Analyze the results
    logger.info("\n📊 Analysis Results:")
    logger.info(f"  Monitoring duration: {report.get('monitoring_duration_seconds', 0):.1f}s")
    logger.info(f"  Total snapshots: {report.get('total_snapshots', 0)}")
    logger.info(f"  Memory growth: {report.get('memory_stats', {}).get('memory_growth_mb', 0):.1f}MB")
    logger.info(f"  Peak memory: {report.get('memory_stats', {}).get('peak_memory_mb', 0):.1f}MB")
    logger.info(f"  Leaks detected: {report.get('leaks_detected', 0)}")
    logger.info(f"  Critical alerts: {report.get('critical_alerts', 0)}")
    
    # Show recommendations
    recommendations = report.get('recommendations', [])
    if recommendations:
        logger.info("\n💡 Recommendations:")
        for rec in recommendations:
            logger.info(f"  - {rec}")
    
    logger.info("✅ Real-world scenario demo completed")


def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Memory Debug Tools Demo")
    parser.add_argument("--demo", choices=[
        "profiling", "tracer", "dashboard", "comprehensive", "real-world"
    ], default="comprehensive", help="Demo to run")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.demo == "profiling":
            asyncio.run(demo_memory_profiling())
        elif args.demo == "tracer":
            asyncio.run(demo_memory_tracer())
        elif args.demo == "dashboard":
            asyncio.run(demo_memory_dashboard())
        elif args.demo == "comprehensive":
            asyncio.run(demo_comprehensive_debugging())
        elif args.demo == "real-world":
            asyncio.run(demo_real_world_scenario())
        
        logger.info("\n🎉 Demo completed successfully!")
        logger.info("You can now use these tools to debug memory issues in your RAG stack.")
        
    except KeyboardInterrupt:
        logger.info("Demo interrupted by user")
    except Exception as e:
        logger.error(f"Demo error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
