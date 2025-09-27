#!/usr/bin/env python3
"""🦊 Simple Backend Startup Memory Profiler
==========================================

Simplified script to profile memory usage during backend startup.
This script focuses on identifying what's consuming RAM during initialization.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import sys
import time
import psutil
import gc
from pathlib import Path
from typing import Dict, Any, List

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

logger = logging.getLogger(__name__)


class SimpleStartupProfiler:
    """Simple profiler for backend startup memory usage."""
    
    def __init__(self):
        """Initialize the profiler."""
        self.snapshots: List[Dict[str, Any]] = []
        self.start_time = None
    
    def take_snapshot(self, phase: str) -> Dict[str, Any]:
        """Take a memory snapshot."""
        process = psutil.Process()
        memory_info = process.memory_info()
        
        snapshot = {
            "phase": phase,
            "timestamp": time.time(),
            "memory_mb": memory_info.rss / 1024 / 1024,
            "memory_percent": process.memory_percent(),
            "cpu_percent": process.cpu_percent(),
            "num_threads": process.num_threads(),
            "gc_counts": gc.get_count(),
        }
        
        self.snapshots.append(snapshot)
        return snapshot
    
    def log_snapshot(self, snapshot: Dict[str, Any]):
        """Log a memory snapshot."""
        logger.info(f"📊 {snapshot['phase']}: {snapshot['memory_mb']:.1f}MB "
                   f"({snapshot['memory_percent']:.1f}%) - {snapshot['num_threads']} threads")
    
    def analyze_memory_growth(self) -> Dict[str, Any]:
        """Analyze memory growth during startup."""
        if len(self.snapshots) < 2:
            return {"error": "Not enough snapshots"}
        
        initial = self.snapshots[0]
        final = self.snapshots[-1]
        
        growth = final["memory_mb"] - initial["memory_mb"]
        duration = final["timestamp"] - initial["timestamp"]
        growth_rate = growth / duration if duration > 0 else 0
        
        # Find peak memory usage
        peak_snapshot = max(self.snapshots, key=lambda s: s["memory_mb"])
        
        # Calculate growth by phase
        phase_growth = {}
        for i in range(1, len(self.snapshots)):
            prev = self.snapshots[i-1]
            curr = self.snapshots[i]
            phase = curr["phase"]
            growth = curr["memory_mb"] - prev["memory_mb"]
            if phase not in phase_growth:
                phase_growth[phase] = 0
            phase_growth[phase] += growth
        
        return {
            "initial_memory_mb": initial["memory_mb"],
            "final_memory_mb": final["memory_mb"],
            "peak_memory_mb": peak_snapshot["memory_mb"],
            "peak_phase": peak_snapshot["phase"],
            "total_growth_mb": growth,
            "growth_rate_mb_per_second": growth_rate,
            "duration_seconds": duration,
            "phase_growth": phase_growth,
            "total_snapshots": len(self.snapshots)
        }


async def profile_backend_startup():
    """Profile the backend startup process."""
    profiler = SimpleStartupProfiler()
    
    logger.info("🚀 Starting backend startup memory profiling...")
    logger.info("=" * 60)
    
    # Initial snapshot
    snapshot = profiler.take_snapshot("initial")
    profiler.log_snapshot(snapshot)
    
    # Phase 1: Basic imports
    logger.info("\n📦 Phase 1: Basic Imports")
    try:
        import os
        import sys
        import asyncio
        snapshot = profiler.take_snapshot("basic_imports")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in basic imports: {e}")
    
    # Phase 2: Core modules
    logger.info("\n🔧 Phase 2: Core Modules")
    try:
        from app.core.config import get_config
        snapshot = profiler.take_snapshot("core_config")
        profiler.log_snapshot(snapshot)
        
        # Get config
        config = get_config()
        snapshot = profiler.take_snapshot("config_loaded")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in core modules: {e}")
    
    # Phase 3: RAG modules
    logger.info("\n🧠 Phase 3: RAG Modules")
    try:
        from app.services.rag.rag_service import RAGService
        snapshot = profiler.take_snapshot("rag_service_imported")
        profiler.log_snapshot(snapshot)
        
        from app.services.rag.indexing import IndexingService
        snapshot = profiler.take_snapshot("indexing_service_imported")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in RAG modules: {e}")
    
    # Phase 4: AI modules
    logger.info("\n🤖 Phase 4: AI Modules")
    try:
        from app.services.ai.ai_service import AIService
        snapshot = profiler.take_snapshot("ai_service_imported")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in AI modules: {e}")
    
    # Phase 5: Database modules
    logger.info("\n🗄️ Phase 5: Database Modules")
    try:
        # Try to import database-related modules
        snapshot = profiler.take_snapshot("database_modules")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in database modules: {e}")
    
    # Phase 6: Heavy modules
    logger.info("\n⚡ Phase 6: Heavy Modules")
    try:
        # Import some potentially heavy modules
        import numpy as np
        snapshot = profiler.take_snapshot("numpy_imported")
        profiler.log_snapshot(snapshot)
        
        import pandas as pd
        snapshot = profiler.take_snapshot("pandas_imported")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in heavy modules: {e}")
    
    # Phase 7: Create some objects
    logger.info("\n🏗️ Phase 7: Object Creation")
    try:
        # Create some test objects
        test_data = [i for i in range(10000)]
        snapshot = profiler.take_snapshot("test_data_created")
        profiler.log_snapshot(snapshot)
        
        # Create a large dictionary
        large_dict = {f"key_{i}": f"value_{i}" for i in range(1000)}
        snapshot = profiler.take_snapshot("large_dict_created")
        profiler.log_snapshot(snapshot)
    except Exception as e:
        logger.error(f"Error in object creation: {e}")
    
    # Final snapshot
    snapshot = profiler.take_snapshot("final")
    profiler.log_snapshot(snapshot)
    
    # Analyze results
    logger.info("\n📊 Memory Growth Analysis")
    logger.info("=" * 60)
    
    analysis = profiler.analyze_memory_growth()
    
    if "error" not in analysis:
        logger.info(f"Initial Memory: {analysis['initial_memory_mb']:.1f}MB")
        logger.info(f"Final Memory: {analysis['final_memory_mb']:.1f}MB")
        logger.info(f"Peak Memory: {analysis['peak_memory_mb']:.1f}MB (in {analysis['peak_phase']})")
        logger.info(f"Total Growth: {analysis['total_growth_mb']:.1f}MB")
        logger.info(f"Growth Rate: {analysis['growth_rate_mb_per_second']:.1f}MB/s")
        logger.info(f"Duration: {analysis['duration_seconds']:.2f}s")
        
        logger.info(f"\n📈 Growth by Phase:")
        for phase, growth in analysis['phase_growth'].items():
            logger.info(f"  {phase}: {growth:.1f}MB")
        
        # Identify biggest memory consumers
        logger.info(f"\n🔍 Biggest Memory Consumers:")
        sorted_phases = sorted(analysis['phase_growth'].items(), key=lambda x: x[1], reverse=True)
        for phase, growth in sorted_phases[:5]:
            if growth > 0:
                logger.info(f"  {phase}: +{growth:.1f}MB")
    
    return analysis


async def profile_import_memory():
    """Profile memory usage of individual imports."""
    logger.info("🔍 Profiling individual import memory usage...")
    logger.info("=" * 60)
    
    profiler = SimpleStartupProfiler()
    
    # Initial
    snapshot = profiler.take_snapshot("initial")
    profiler.log_snapshot(snapshot)
    
    # Test individual imports
    imports_to_test = [
        ("asyncio", "import asyncio"),
        ("psutil", "import psutil"),
        ("numpy", "import numpy as np"),
        ("pandas", "import pandas as pd"),
        ("pydantic", "import pydantic"),
        ("fastapi", "import fastapi"),
        ("sqlalchemy", "import sqlalchemy"),
        ("alembic", "import alembic"),
        ("redis", "import redis"),
        ("chromadb", "import chromadb"),
    ]
    
    for name, import_stmt in imports_to_test:
        try:
            exec(import_stmt)
            snapshot = profiler.take_snapshot(f"imported_{name}")
            profiler.log_snapshot(snapshot)
        except ImportError:
            logger.info(f"❌ {name}: Not available")
        except Exception as e:
            logger.error(f"❌ {name}: Error - {e}")
    
    # Analyze import memory usage
    analysis = profiler.analyze_memory_growth()
    
    if "error" not in analysis:
        logger.info(f"\n📊 Import Memory Analysis:")
        logger.info(f"Total growth from imports: {analysis['total_growth_mb']:.1f}MB")
        
        logger.info(f"\n📈 Growth by Import:")
        for phase, growth in analysis['phase_growth'].items():
            if growth > 0:
                logger.info(f"  {phase}: +{growth:.1f}MB")


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Simple Backend Startup Memory Profiler")
    parser.add_argument("--test-imports", action="store_true", help="Test individual import memory usage")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.test_imports:
            await profile_import_memory()
        else:
            await profile_backend_startup()
        
        logger.info("\n🎉 Memory profiling completed!")
        
    except KeyboardInterrupt:
        logger.info("Profiling interrupted by user")
    except Exception as e:
        logger.error(f"Profiling error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
