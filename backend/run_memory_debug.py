#!/usr/bin/env python3
"""🦊 Run Memory Debug Tools
==========================

Simple script to run the memory debugging tools for the RAG stack.
This script provides easy access to all memory debugging capabilities.

Usage:
    python run_memory_debug.py --tracer --duration 300
    python run_memory_debug.py --dashboard --refresh 1
    python run_memory_debug.py --add-profiling
    python run_memory_debug.py --test-profiling

Author: Reynard Development Team
Version: 1.0.0
"""

import argparse
import asyncio
import logging
import subprocess
import sys
from pathlib import Path

logger = logging.getLogger(__name__)


async def run_memory_tracer(duration: int = 300, output: str = None):
    """Run the memory debug tracer."""
    logger.info(f"🚀 Starting memory tracer for {duration} seconds...")
    
    cmd = [sys.executable, "memory_debug_tracer.py", "--monitor", "--duration", str(duration)]
    if output:
        cmd.extend(["--output", output])
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=duration + 30)
        
        if result.returncode == 0:
            logger.info("✅ Memory tracer completed successfully")
            if result.stdout:
                print(result.stdout)
        else:
            logger.error(f"❌ Memory tracer failed: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logger.error("❌ Memory tracer timed out")
    except Exception as e:
        logger.error(f"❌ Error running memory tracer: {e}")


async def run_memory_dashboard(refresh: float = 2.0, duration: int = None):
    """Run the memory monitor dashboard."""
    logger.info("🚀 Starting memory monitor dashboard...")
    
    cmd = [sys.executable, "memory_monitor_dashboard.py", "--refresh", str(refresh)]
    if duration:
        cmd.extend(["--duration", str(duration)])
    
    try:
        # Run dashboard in foreground
        process = subprocess.Popen(cmd)
        process.wait()
        
        if process.returncode == 0:
            logger.info("✅ Memory dashboard completed successfully")
        else:
            logger.error(f"❌ Memory dashboard failed with code {process.returncode}")
            
    except KeyboardInterrupt:
        logger.info("Dashboard interrupted by user")
        if process:
            process.terminate()
    except Exception as e:
        logger.error(f"❌ Error running memory dashboard: {e}")


def add_memory_profiling():
    """Add memory profiling to RAG components."""
    logger.info("🚀 Adding memory profiling to RAG components...")
    
    cmd = [sys.executable, "add_memory_profiling.py"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Memory profiling added successfully")
            if result.stdout:
                print(result.stdout)
        else:
            logger.error(f"❌ Failed to add memory profiling: {result.stderr}")
            
    except Exception as e:
        logger.error(f"❌ Error adding memory profiling: {e}")


def test_memory_profiling():
    """Test memory profiling functionality."""
    logger.info("🧪 Testing memory profiling...")
    
    cmd = [sys.executable, "test_memory_profiling.py"]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            logger.info("✅ Memory profiling test completed")
            if result.stdout:
                print(result.stdout)
        else:
            logger.error(f"❌ Memory profiling test failed: {result.stderr}")
            
    except Exception as e:
        logger.error(f"❌ Error testing memory profiling: {e}")


async def run_comprehensive_debug(duration: int = 300):
    """Run comprehensive memory debugging."""
    logger.info("🚀 Starting comprehensive memory debugging...")
    
    # Step 1: Add memory profiling
    logger.info("Step 1: Adding memory profiling...")
    add_memory_profiling()
    
    # Step 2: Test profiling
    logger.info("Step 2: Testing memory profiling...")
    test_memory_profiling()
    
    # Step 3: Run memory tracer
    logger.info("Step 3: Running memory tracer...")
    await run_memory_tracer(duration, f"memory_debug_report_{duration}s.json")
    
    # Step 4: Run dashboard
    logger.info("Step 4: Running memory dashboard...")
    await run_memory_dashboard(1.0, duration)
    
    logger.info("✅ Comprehensive memory debugging completed")


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Run Memory Debug Tools")
    parser.add_argument("--tracer", action="store_true", help="Run memory debug tracer")
    parser.add_argument("--dashboard", action="store_true", help="Run memory monitor dashboard")
    parser.add_argument("--add-profiling", action="store_true", help="Add memory profiling to components")
    parser.add_argument("--test-profiling", action="store_true", help="Test memory profiling")
    parser.add_argument("--comprehensive", action="store_true", help="Run comprehensive debugging")
    parser.add_argument("--duration", type=int, default=300, help="Duration in seconds")
    parser.add_argument("--refresh", type=float, default=2.0, help="Dashboard refresh interval")
    parser.add_argument("--output", type=str, help="Output file for tracer")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose logging")
    
    args = parser.parse_args()
    
    # Setup logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        if args.comprehensive:
            asyncio.run(run_comprehensive_debug(args.duration))
        elif args.tracer:
            asyncio.run(run_memory_tracer(args.duration, args.output))
        elif args.dashboard:
            asyncio.run(run_memory_dashboard(args.refresh, args.duration))
        elif args.add_profiling:
            add_memory_profiling()
        elif args.test_profiling:
            test_memory_profiling()
        else:
            parser.print_help()
    
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    except Exception as e:
        logger.error(f"Error: {e}")


if __name__ == "__main__":
    main()
