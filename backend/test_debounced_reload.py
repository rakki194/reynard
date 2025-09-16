#!/usr/bin/env python3
"""
Test script for the debounced reload functionality.

This script creates a simple test to verify that the debounced reload system
works correctly by simulating file changes and checking the reload behavior.
"""

import asyncio
import logging
import tempfile
import time
from pathlib import Path

from app.core.reload_watcher import create_reload_watcher

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class ReloadTest:
    """Test class for debounced reload functionality."""
    
    def __init__(self):
        self.reload_count = 0
        self.last_reload_time = 0
    
    def reload_callback(self) -> None:
        """Callback function that tracks reloads."""
        current_time = time.time()
        self.reload_count += 1
        self.last_reload_time = current_time
        logger.info("🔄 Reload #%d triggered at %s", self.reload_count, current_time)
    
    async def test_debounced_reload(self) -> None:
        """Test the debounced reload functionality."""
        logger.info("🧪 Starting debounced reload test")
        
        # Create a temporary directory for testing
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            logger.info("📁 Test directory: %s", temp_path)
            
            # Create the reload watcher with a short debounce delay for testing
            watcher = create_reload_watcher(
                watch_path=str(temp_path),
                reload_callback=self.reload_callback,
                debounce_delay=2.0,  # 2 seconds for testing
                include_patterns=["*.py", "*.txt"],
                exclude_patterns=["*.tmp"]
            )
            
            try:
                # Start the watcher
                watcher.start()
                logger.info("👀 Started file watcher")
                
                # Test 1: Single file change
                logger.info("📝 Test 1: Single file change")
                test_file = temp_path / "test1.py"
                test_file.write_text("# Test file 1")
                await asyncio.sleep(3)  # Wait for debounce
                
                # Test 2: Multiple rapid file changes (should only trigger one reload)
                logger.info("📝 Test 2: Multiple rapid file changes")
                for i in range(5):
                    test_file.write_text(f"# Test file 1 - change {i}")
                    await asyncio.sleep(0.5)  # Rapid changes
                await asyncio.sleep(3)  # Wait for debounce
                
                # Test 3: Multiple files changing
                logger.info("📝 Test 3: Multiple files changing")
                for i in range(3):
                    test_file = temp_path / f"test{i}.py"
                    test_file.write_text(f"# Test file {i}")
                    await asyncio.sleep(0.3)
                await asyncio.sleep(3)  # Wait for debounce
                
                # Test 4: Excluded file (should not trigger reload)
                logger.info("📝 Test 4: Excluded file change")
                excluded_file = temp_path / "test.tmp"
                excluded_file.write_text("# This should be ignored")
                await asyncio.sleep(3)  # Wait to ensure no reload
                
                # Final results
                logger.info("📊 Test Results:")
                logger.info("   Total reloads: %d", self.reload_count)
                logger.info("   Expected: 3 (single, rapid changes, multiple files)")
                
                if self.reload_count == 3:
                    logger.info("✅ Test PASSED - Debounced reload working correctly")
                else:
                    logger.warning("❌ Test FAILED - Expected 3 reloads, got %d", self.reload_count)
                
            finally:
                # Cleanup
                watcher.shutdown()
                logger.info("🛑 Test completed")


async def main():
    """Main test function."""
    test = ReloadTest()
    await test.test_debounced_reload()


if __name__ == "__main__":
    asyncio.run(main())
