#!/usr/bin/env python3
"""
🦊 Reynard Development Server
"""

import importlib.util
import logging
import os
import subprocess
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Import intelligent reload system
from app.core.intelligent_reload import get_reload_excludes, should_use_intelligent_reload

# Load environment variables
load_dotenv()

# Configure beautiful logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
    datefmt="%H:%M:%S",
)

logger = logging.getLogger(__name__)


def check_dependencies():
    """Check if required dependencies are installed."""
    # Check for watchfiles using importlib.util.find_spec
    if importlib.util.find_spec("watchfiles") is not None:
        logger.info("✅ watchfiles is installed - enhanced file monitoring enabled")
    else:
        logger.warning(
            "⚠️  watchfiles not installed - install with: pip install watchfiles"
        )
        logger.info("   Enhanced file monitoring will be disabled")

    # Check for FastAPI
    if importlib.util.find_spec("fastapi") is not None:
        import fastapi
        logger.info(f"✅ FastAPI {fastapi.__version__} is installed")
    else:
        logger.error("❌ FastAPI not installed")
        return False

    return True


def get_environment_config():
    """Get environment-based configuration."""
    environment = os.getenv("ENVIRONMENT", "development")
    debug = os.getenv("DEBUG", "false").lower() == "true"
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    reload = environment == "development"

    return {
        "environment": environment,
        "debug": debug,
        "host": host,
        "port": port,
        "reload": reload,
    }


def main():
    """Main development server function."""

    # Check dependencies
    if not check_dependencies():
        logger.error("❌ Missing required dependencies")
        sys.exit(1)

    # Get configuration
    config = get_environment_config()

    logger.info(f"🚀 Starting Reynard API in {config['environment']} mode")
    logger.info(
        f"🌐 Server will be available at: http://{config['host']}:{config['port']}"
    )
    logger.info(
        f"📚 API Documentation: http://{config['host']}:{config['port']}/api/docs"
    )
    logger.info(f"🔧 Auto-reload: {'enabled' if config['reload'] else 'disabled'}")
    logger.info(f"🐛 Debug mode: {'enabled' if config['debug'] else 'disabled'}")
    
    if config['reload'] and should_use_intelligent_reload():
        logger.info("🧠 Intelligent service reload enabled")
        logger.info("🎯 Services will reload individually when their files change")

    # Enhanced reload configuration
    reload_config = {}
    if config["reload"]:
        reload_config.update(
            {
                "reload": True,
                "reload_includes": ["*.py", "*.env", "*.json", "*.yaml", "*.yml"],
                "reload_excludes": get_reload_excludes(),
            }
        )

        # Check if watchfiles is available for enhanced monitoring
        if importlib.util.find_spec("watchfiles") is not None:
            logger.info("📁 Enhanced file monitoring with watchfiles enabled")
        else:
            logger.info("📁 Basic file monitoring enabled")

    # Start the server
    try:
        # Use command-line approach for better reload_excludes handling
        if config["reload"]:
            # Build uvicorn command with proper exclude patterns
            cmd = [
                sys.executable,
                "-m",
                "uvicorn",
                "main:app",
                "--host",
                config["host"],
                "--port",
                str(config["port"]),
                "--log-level",
                "info",
                "--reload",
                "--reload-exclude",
                ".mypy_cache",
                "--reload-exclude",
                "__pycache__",
                "--reload-exclude",
                ".pytest_cache",
                "--reload-exclude",
                "*.pyc",
                "--reload-exclude",
                "*.pyo",
                "--reload-exclude",
                "*.pyd",
                "--reload-exclude",
                ".coverage",
                "--reload-exclude",
                "htmlcov",
                "--reload-exclude",
                ".tox",
                "--reload-exclude",
                "venv",
                "--reload-exclude",
                ".venv",
                "--reload-exclude",
                "node_modules",
                "--reload-exclude",
                ".git",
                "--reload-exclude",
                "*.tmp",
                "--reload-exclude",
                "*.temp",
                "--reload-exclude",
                "*.swp",
                "--reload-exclude",
                "*.swo",
                "--reload-exclude",
                "*~",
                "--reload-exclude",
                ".DS_Store",
                "--reload-exclude",
                "Thumbs.db",
                "--reload-exclude",
                "*.lock",
                "--reload-exclude",
                "*.pid",
                "--reload-exclude",
                "*.state",
                "--reload-exclude",
                "reynard_penetration_testing.lock",
                # Exclude test files and directories
                "--reload-exclude",
                "tests",
                "--reload-exclude",
                "test",
                "--reload-exclude",
                "**/tests",
                "--reload-exclude",
                "**/test",
                "--reload-exclude",
                "**/__tests__",
                "--reload-exclude",
                "**/test_*.py",
                "--reload-exclude",
                "**/*_test.py",
                "--reload-exclude",
                "**/conftest.py",
                # Exclude scripts directory
                "--reload-exclude",
                "scripts",
                "--reload-exclude",
                "**/scripts",
            ]

            logger.info("🚀 Starting uvicorn with command-line reload configuration")
            subprocess.run(cmd, check=True)
        else:
            uvicorn.run(
                "main:app",
                host=config["host"],
                port=config["port"],
                log_level="info",
                access_log=True,
                reload=False,
            )
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
