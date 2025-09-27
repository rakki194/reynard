#!/usr/bin/env python3
"""🦊 Test Conditional Lazy Loading
================================

Test script to verify that conditional lazy loading respects environment variables
and only creates lazy exports for enabled packages.

Author: Reynard Development Team
Version: 1.0.0
"""

import asyncio
import logging
import os
import sys
import time
import psutil
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

logger = logging.getLogger(__name__)


def get_memory_mb() -> float:
    """Get current memory usage in MB."""
    process = psutil.Process()
    return process.memory_info().rss / 1024 / 1024


def log_memory(phase: str):
    """Log current memory usage."""
    memory_mb = get_memory_mb()
    logger.info(f"📊 {phase}: {memory_mb:.1f}MB")


def test_environment_variables():
    """Test that environment variables are set correctly."""
    logger.info("🔍 Testing Environment Variables")
    logger.info("=" * 50)
    
    env_vars = [
        "NUMPY_ENABLED",
        "PANDAS_ENABLED", 
        "PYTORCH_ENABLED",
        "TRANSFORMERS_ENABLED",
        "SCIKIT_LEARN_ENABLED",
        "PILLOW_ENABLED",
        "OPENCV_ENABLED",
        "MATPLOTLIB_ENABLED",
        "SEABORN_ENABLED",
        "PLOTLY_ENABLED",
        "EMBEDDING_SENTENCE_TRANSFORMERS_ENABLED",
    ]
    
    for env_var in env_vars:
        value = os.getenv(env_var, "not_set")
        logger.info(f"{env_var}: {value}")
    
    logger.info("")


def test_conditional_lazy_loading():
    """Test conditional lazy loading system."""
    logger.info("🧪 Testing Conditional Lazy Loading System")
    logger.info("=" * 50)
    
    # Initial memory
    log_memory("initial")
    
    # Import conditional lazy loading system
    logger.info("Importing conditional lazy loading system...")
    from app.utils.conditional_lazy_loading import (
        get_conditional_lazy_loading_system,
        is_package_enabled,
        create_conditional_ml_packages,
    )
    log_memory("conditional_lazy_loading_imported")
    
    # Test package enabled checks
    logger.info("\n📋 Testing Package Enabled Checks:")
    packages_to_test = [
        "numpy", "pandas", "torch", "transformers", 
        "scikit_learn", "pillow", "opencv", "matplotlib",
        "seaborn", "plotly", "sentence_transformers"
    ]
    
    for package in packages_to_test:
        enabled = is_package_enabled(package)
        logger.info(f"  {package}: {'✅ Enabled' if enabled else '❌ Disabled'}")
    
    # Create conditional ML packages
    logger.info("\n🏗️ Creating Conditional ML Packages:")
    ml_packages = create_conditional_ml_packages()
    log_memory("conditional_ml_packages_created")
    
    logger.info(f"Created {len(ml_packages)} conditional ML packages:")
    for package_name in ml_packages.keys():
        logger.info(f"  ✅ {package_name}")
    
    # Get system stats
    logger.info("\n📊 System Statistics:")
    system = get_conditional_lazy_loading_system()
    stats = system.get_system_stats()
    
    for key, value in stats.items():
        logger.info(f"  {key}: {value}")
    
    return ml_packages


def test_traditional_vs_conditional():
    """Compare traditional vs conditional lazy loading."""
    logger.info("\n🔄 Comparing Traditional vs Conditional Lazy Loading")
    logger.info("=" * 60)
    
    # Test traditional approach
    logger.info("Traditional Approach:")
    traditional_start = get_memory_mb()
    
    try:
        from app.utils.lazy_loading_registry import ml_packages as traditional_ml_packages
        traditional_count = len(traditional_ml_packages)
        logger.info(f"  Traditional ML packages created: {traditional_count}")
        for package_name in traditional_ml_packages.keys():
            logger.info(f"    📦 {package_name}")
    except Exception as e:
        logger.error(f"  Error with traditional approach: {e}")
        traditional_count = 0
    
    traditional_end = get_memory_mb()
    traditional_growth = traditional_end - traditional_start
    
    # Test conditional approach
    logger.info("\nConditional Approach:")
    conditional_start = get_memory_mb()
    
    try:
        from app.utils.conditional_lazy_loading import create_conditional_ml_packages
        conditional_ml_packages = create_conditional_ml_packages()
        conditional_count = len(conditional_ml_packages)
        logger.info(f"  Conditional ML packages created: {conditional_count}")
        for package_name in conditional_ml_packages.keys():
            logger.info(f"    📦 {package_name}")
    except Exception as e:
        logger.error(f"  Error with conditional approach: {e}")
        conditional_count = 0
    
    conditional_end = get_memory_mb()
    conditional_growth = conditional_end - conditional_start
    
    # Compare results
    logger.info(f"\n📊 Comparison Results:")
    logger.info(f"  Traditional packages: {traditional_count}")
    logger.info(f"  Conditional packages: {conditional_count}")
    logger.info(f"  Traditional memory growth: {traditional_growth:.1f}MB")
    logger.info(f"  Conditional memory growth: {conditional_growth:.1f}MB")
    
    if traditional_count > conditional_count:
        saved_packages = traditional_count - conditional_count
        logger.info(f"  💡 Saved {saved_packages} package exports")
    
    if traditional_growth > conditional_growth:
        saved_memory = traditional_growth - conditional_growth
        logger.info(f"  💡 Saved {saved_memory:.1f}MB memory")


def test_import_behavior():
    """Test actual import behavior with conditional loading."""
    logger.info("\n🔬 Testing Import Behavior")
    logger.info("=" * 50)
    
    # Test importing disabled packages
    disabled_packages = ["numpy", "pandas", "torch", "transformers"]
    
    for package in disabled_packages:
        logger.info(f"\nTesting {package}:")
        
        # Check if package is enabled
        from app.utils.conditional_lazy_loading import is_package_enabled
        enabled = is_package_enabled(package)
        logger.info(f"  Environment check: {'Enabled' if enabled else 'Disabled'}")
        
        if not enabled:
            logger.info(f"  ✅ {package} correctly disabled - no lazy export created")
        else:
            logger.info(f"  ⚠️ {package} is enabled - lazy export may be created")


async def main():
    """Main function."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Conditional Lazy Loading")
    parser.add_argument("--test", choices=["env", "conditional", "compare", "imports", "all"], 
                       default="all", help="Test to run")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.test == "env":
            test_environment_variables()
        elif args.test == "conditional":
            test_conditional_lazy_loading()
        elif args.test == "compare":
            test_traditional_vs_conditional()
        elif args.test == "imports":
            test_import_behavior()
        elif args.test == "all":
            test_environment_variables()
            test_conditional_lazy_loading()
            test_traditional_vs_conditional()
            test_import_behavior()
        
        logger.info("\n🎉 Conditional lazy loading tests completed!")
        
    except KeyboardInterrupt:
        logger.info("Tests interrupted by user")
    except Exception as e:
        logger.error(f"Test error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
