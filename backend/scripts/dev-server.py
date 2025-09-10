#!/usr/bin/env python3
"""
🦊 Reynard Development Server
"""

import asyncio
import logging
import os
import sys
from pathlib import Path

import uvicorn
from dotenv import load_dotenv

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
load_dotenv()

# Configure beautiful logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)-20s | %(message)s",
    datefmt="%H:%M:%S"
)

logger = logging.getLogger(__name__)


def check_dependencies():
    """Check if required dependencies are installed."""
    try:
        import watchfiles
        logger.info("✅ watchfiles is installed - enhanced file monitoring enabled")
    except ImportError:
        logger.warning("⚠️  watchfiles not installed - install with: pip install watchfiles")
        logger.info("   Enhanced file monitoring will be disabled")
    
    try:
        import fastapi
        logger.info(f"✅ FastAPI {fastapi.__version__} is installed")
    except ImportError:
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
    logger.info(f"🌐 Server will be available at: http://{config['host']}:{config['port']}")
    logger.info(f"📚 API Documentation: http://{config['host']}:{config['port']}/api/docs")
    logger.info(f"🔧 Auto-reload: {'enabled' if config['reload'] else 'disabled'}")
    logger.info(f"🐛 Debug mode: {'enabled' if config['debug'] else 'disabled'}")
    
    # Enhanced reload configuration
    reload_config = {}
    if config['reload']:
        reload_config.update({
            "reload": True,
            "reload_includes": ["*.py", "*.env", "*.json", "*.yaml", "*.yml"],
            "reload_excludes": ["*.db", "*.log", "generated/*", "*.pyc", "__pycache__/*"],
        })
        
        # Check if watchfiles is available for enhanced monitoring
        try:
            import watchfiles
            logger.info("📁 Enhanced file monitoring with watchfiles enabled")
        except ImportError:
            logger.info("📁 Basic file monitoring enabled")
    
    # Start the server
    try:
        uvicorn.run(
            "main:app",
            host=config['host'],
            port=config['port'],
            log_level="info",
            access_log=True,
            **reload_config
        )
    except KeyboardInterrupt:
        logger.info("🛑 Server stopped by user")
    except Exception as e:
        logger.error(f"❌ Server failed to start: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
