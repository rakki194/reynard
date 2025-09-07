"""
Background service for Reynard Basic Backend
Handles background tasks with reload optimization
"""

import asyncio
import os
import time
from typing import Dict, Any, Set, Optional
from datetime import datetime

# Detect reload mode
IS_RELOAD_MODE = os.environ.get("UVICORN_RELOAD_PROCESS") == "1"


class BackgroundService:
    """Background service for handling long-running tasks"""
    
    def __init__(self):
        self.tasks: Set[asyncio.Task] = set()
        self.is_running = False
        self.stats = {
            "tasks_started": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "uptime": 0
        }
        self.start_time: Optional[float] = None
    
    async def start(self):
        """Start background service"""
        if IS_RELOAD_MODE:
            print("🔄 Skipping background service during reload")
            return
        
        print("🔧 Starting background service...")
        
        self.is_running = True
        self.start_time = time.time()
        
        # Start background tasks
        await self._start_cleanup_task()
        await self._start_health_monitor_task()
        await self._start_stats_collector_task()
        
        print("✅ Background service started")
    
    async def stop(self):
        """Stop background service and cancel all tasks"""
        if not self.is_running:
            return
        
        print("🔧 Stopping background service...")
        
        self.is_running = False
        
        # Cancel all tasks
        if self.tasks:
            print(f"🛑 Cancelling {len(self.tasks)} background tasks...")
            for task in self.tasks:
                task.cancel()
            
            # Wait for tasks to complete cancellation
            await asyncio.gather(*self.tasks, return_exceptions=True)
            self.tasks.clear()
        
        print("✅ Background service stopped")
    
    async def _start_cleanup_task(self):
        """Start cleanup task"""
        task = asyncio.create_task(self._cleanup_worker())
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        self.stats["tasks_started"] += 1
    
    async def _start_health_monitor_task(self):
        """Start health monitoring task"""
        task = asyncio.create_task(self._health_monitor_worker())
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        self.stats["tasks_started"] += 1
    
    async def _start_stats_collector_task(self):
        """Start statistics collection task"""
        task = asyncio.create_task(self._stats_collector_worker())
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        self.stats["tasks_started"] += 1
    
    async def _cleanup_worker(self):
        """Background cleanup worker"""
        print("🧹 Cleanup worker started")
        
        while self.is_running:
            try:
                # Simulate cleanup work
                await asyncio.sleep(30)  # Run every 30 seconds
                
                if self.is_running:
                    print("🧹 Performing background cleanup...")
                    # Add actual cleanup logic here
                    await asyncio.sleep(1)  # Simulate cleanup time
                
            except asyncio.CancelledError:
                print("🛑 Cleanup worker cancelled")
                break
            except Exception as e:
                print(f"❌ Cleanup worker error: {e}")
                self.stats["tasks_failed"] += 1
                await asyncio.sleep(5)  # Wait before retrying
        
        print("✅ Cleanup worker stopped")
        self.stats["tasks_completed"] += 1
    
    async def _health_monitor_worker(self):
        """Background health monitoring worker"""
        print("🏥 Health monitor started")
        
        while self.is_running:
            try:
                # Simulate health monitoring
                await asyncio.sleep(60)  # Run every minute
                
                if self.is_running:
                    print("🏥 Performing health check...")
                    # Add actual health check logic here
                    await asyncio.sleep(0.5)  # Simulate health check time
                
            except asyncio.CancelledError:
                print("🛑 Health monitor cancelled")
                break
            except Exception as e:
                print(f"❌ Health monitor error: {e}")
                self.stats["tasks_failed"] += 1
                await asyncio.sleep(10)  # Wait before retrying
        
        print("✅ Health monitor stopped")
        self.stats["tasks_completed"] += 1
    
    async def _stats_collector_worker(self):
        """Background statistics collection worker"""
        print("📊 Stats collector started")
        
        while self.is_running:
            try:
                # Update uptime
                if self.start_time:
                    self.stats["uptime"] = time.time() - self.start_time
                
                # Simulate stats collection
                await asyncio.sleep(120)  # Run every 2 minutes
                
                if self.is_running:
                    print("📊 Collecting statistics...")
                    # Add actual stats collection logic here
                    await asyncio.sleep(0.2)  # Simulate stats collection time
                
            except asyncio.CancelledError:
                print("🛑 Stats collector cancelled")
                break
            except Exception as e:
                print(f"❌ Stats collector error: {e}")
                self.stats["tasks_failed"] += 1
                await asyncio.sleep(15)  # Wait before retrying
        
        print("✅ Stats collector stopped")
        self.stats["tasks_completed"] += 1
    
    async def add_task(self, coro, name: str = "custom_task"):
        """Add a custom background task"""
        if not self.is_running:
            raise RuntimeError("Background service not running")
        
        task = asyncio.create_task(coro)
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)
        self.stats["tasks_started"] += 1
        
        print(f"📝 Added background task: {name}")
        return task
    
    def get_stats(self) -> Dict[str, Any]:
        """Get background service statistics"""
        uptime = 0
        if self.start_time:
            uptime = time.time() - self.start_time
        
        return {
            "running": self.is_running,
            "active_tasks": len(self.tasks),
            "uptime": uptime,
            "tasks_started": self.stats["tasks_started"],
            "tasks_completed": self.stats["tasks_completed"],
            "tasks_failed": self.stats["tasks_failed"],
            "success_rate": (
                self.stats["tasks_completed"] / self.stats["tasks_started"]
                if self.stats["tasks_started"] > 0 else 0
            )
        }
    
    async def health_check(self) -> bool:
        """Check background service health"""
        if not self.is_running:
            return False
        
        try:
            # Check if tasks are still running
            active_tasks = [task for task in self.tasks if not task.done()]
            return len(active_tasks) > 0
        except Exception:
            return False
