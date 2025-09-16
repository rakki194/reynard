"""
Debounced Reload Watcher for Reynard Backend

A custom file watcher that pools file changes and only triggers a reload
after a configurable grace period, preventing constant reloads during
rapid file changes during development.

Features:
- Configurable debounce delay (default: 10 seconds)
- File change pooling and batching
- Graceful shutdown handling
- Comprehensive logging of reload events
- Support for include/exclude patterns
"""

import asyncio
import logging
import threading
import time
from pathlib import Path
from typing import Set, Optional, List, Callable, Any
from queue import Queue

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
except ImportError:
    # Fallback for when watchdog is not installed
    Observer = None
    FileSystemEventHandler = object

logger = logging.getLogger(__name__)


class DebouncedReloadHandler(FileSystemEventHandler):
    """File system event handler with debounced reload functionality."""
    
    def __init__(
        self,
        reload_callback: Callable[[], None],
        debounce_delay: float = 10.0,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
    ) -> None:
        """
        Initialize the debounced reload handler.
        
        Args:
            reload_callback: Function to call when reload should be triggered
            debounce_delay: Delay in seconds before triggering reload
            include_patterns: File patterns to watch (e.g., ['*.py', '*.env'])
            exclude_patterns: File patterns to ignore (e.g., ['*.db', '*.log'])
        """
        self.reload_callback = reload_callback
        self.debounce_delay = debounce_delay
        self.include_patterns = include_patterns or ['*.py', '*.env', '*.json']
        self.exclude_patterns = exclude_patterns or ['*.db', '*.log', 'generated/*', '__pycache__/*']
        
        # Thread-safe communication
        self.changed_files: Set[str] = set()
        self.last_change_time: float = 0
        self.reload_timer: Optional[threading.Timer] = None
        self.shutdown_event = threading.Event()
        self.lock = threading.Lock()
        
        logger.info("🦊 DebouncedReloadHandler initialized with %ss delay", debounce_delay)
        logger.info("📁 Include patterns: %s", self.include_patterns)
        logger.info("🚫 Exclude patterns: %s", self.exclude_patterns)
    
    def _should_watch_file(self, file_path: str) -> bool:
        """Check if a file should be watched based on include/exclude patterns."""
        path = Path(file_path)
        
        # Check exclude patterns first
        for pattern in self.exclude_patterns:
            if path.match(pattern) or any(part for part in path.parts if Path(part).match(pattern)):
                return False
        
        # Check include patterns
        for pattern in self.include_patterns:
            if path.match(pattern):
                return True
        
        return False
    
    def _schedule_reload(self) -> None:
        """Schedule a reload after the debounce delay."""
        with self.lock:
            current_time = time.time()
            self.last_change_time = current_time
            
            # Cancel any existing reload timer
            if self.reload_timer and self.reload_timer.is_alive():
                self.reload_timer.cancel()
            
            # Schedule new reload timer
            self.reload_timer = threading.Timer(self.debounce_delay, self._trigger_reload)
            self.reload_timer.start()
    
    def _trigger_reload(self) -> None:
        """Trigger the actual reload."""
        with self.lock:
            # Check if we should still reload (no new changes since we started waiting)
            if time.time() - self.last_change_time >= self.debounce_delay:
                if self.changed_files:
                    logger.info("🔄 Triggering reload after %ss delay", self.debounce_delay)
                    logger.info("📝 Changed files: %s", ', '.join(sorted(self.changed_files)))
                    self.changed_files.clear()
                    self.reload_callback()
                else:
                    logger.debug("🔄 No files changed, skipping reload")
            else:
                logger.debug("🔄 Reload cancelled due to new file changes")
    
    def on_modified(self, event: Any) -> None:
        """Handle file modification events."""
        if not event.is_directory and self._should_watch_file(event.src_path):
            with self.lock:
                self.changed_files.add(event.src_path)
            logger.debug("📝 File modified: %s", event.src_path)
            self._schedule_reload()
    
    def on_created(self, event: Any) -> None:
        """Handle file creation events."""
        if not event.is_directory and self._should_watch_file(event.src_path):
            with self.lock:
                self.changed_files.add(event.src_path)
            logger.debug("📝 File created: %s", event.src_path)
            self._schedule_reload()
    
    def on_moved(self, event: Any) -> None:
        """Handle file move/rename events."""
        if not event.is_directory:
            # Check both source and destination
            for file_path in [event.src_path, event.dest_path]:
                if self._should_watch_file(file_path):
                    with self.lock:
                        self.changed_files.add(file_path)
                    logger.debug("📝 File moved: %s", file_path)
                    self._schedule_reload()
    
    def shutdown(self) -> None:
        """Gracefully shutdown the reload handler."""
        logger.info("🛑 Shutting down debounced reload handler")
        self.shutdown_event.set()
        
        with self.lock:
            if self.reload_timer and self.reload_timer.is_alive():
                self.reload_timer.cancel()
                self.reload_timer.join(timeout=1.0)


class DebouncedReloadWatcher:
    """Main watcher class that manages the file system observer and reload handler."""
    
    def __init__(
        self,
        watch_path: str,
        reload_callback: Callable[[], None],
        debounce_delay: float = 10.0,
        include_patterns: Optional[List[str]] = None,
        exclude_patterns: Optional[List[str]] = None,
    ) -> None:
        """
        Initialize the debounced reload watcher.
        
        Args:
            watch_path: Directory path to watch for changes
            reload_callback: Function to call when reload should be triggered
            debounce_delay: Delay in seconds before triggering reload
            include_patterns: File patterns to watch
            exclude_patterns: File patterns to ignore
        """
        self.watch_path = Path(watch_path).resolve()
        self.reload_callback = reload_callback
        self.debounce_delay = debounce_delay
        
        # Create the event handler
        self.handler = DebouncedReloadHandler(
            reload_callback=reload_callback,
            debounce_delay=debounce_delay,
            include_patterns=include_patterns,
            exclude_patterns=exclude_patterns,
        )
        
        # Create the observer
        if Observer is None:
            raise ImportError("watchdog package is required for file watching. Install with: pip install watchdog")
        
        self.observer = Observer()
        self.observer.schedule(self.handler, str(self.watch_path), recursive=True)
        
        logger.info("🦊 DebouncedReloadWatcher initialized for: %s", self.watch_path)
    
    def start(self) -> None:
        """Start watching for file changes."""
        if not self.watch_path.exists():
            logger.warning("⚠️ Watch path does not exist: %s", self.watch_path)
            return
        
        self.observer.start()
        logger.info("👀 Started watching: %s", self.watch_path)
        logger.info("⏱️ Debounce delay: %ss", self.debounce_delay)
    
    def stop(self) -> None:
        """Stop watching for file changes."""
        self.observer.stop()
        self.observer.join()
        logger.info("🛑 Stopped file watching")
    
    def shutdown(self) -> None:
        """Gracefully shutdown the watcher."""
        logger.info("🛑 Shutting down debounced reload watcher")
        self.handler.shutdown()
        self.stop()


def create_reload_watcher(
    watch_path: str,
    reload_callback: Callable[[], None],
    debounce_delay: float = 10.0,
    include_patterns: Optional[List[str]] = None,
    exclude_patterns: Optional[List[str]] = None,
) -> DebouncedReloadWatcher:
    """
    Create a debounced reload watcher instance.
    
    Args:
        watch_path: Directory path to watch for changes
        reload_callback: Function to call when reload should be triggered
        debounce_delay: Delay in seconds before triggering reload
        include_patterns: File patterns to watch
        exclude_patterns: File patterns to ignore
    
    Returns:
        Configured DebouncedReloadWatcher instance
    """
    return DebouncedReloadWatcher(
        watch_path=watch_path,
        reload_callback=reload_callback,
        debounce_delay=debounce_delay,
        include_patterns=include_patterns,
        exclude_patterns=exclude_patterns,
    )
