#!/usr/bin/env python3
"""
Quality Gates Setup Script

🦊 *whiskers twitch with systematic precision* Script to initialize the
quality gates system in the Reynard PostgreSQL database.

This script:
- Runs the quality gates database migration
- Initializes default Reynard quality gates
- Sets up environment configurations
- Verifies the installation

Author: Strategic-Fox-42 (Reynard Fox Specialist)
Version: 1.0.0
"""

import os
import sys
import asyncio
import logging
from pathlib import Path

# Add the backend directory to the Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from app.services.quality_gates import QualityGatesService
from app.core.database_manager import get_e2e_session
from alembic.config import Config
from alembic import command

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


async def run_migration():
    """Run the quality gates database migration."""
    logger.info("🦊 Running quality gates database migration...")
    
    try:
        # Get the alembic config for e2e database
        alembic_cfg = Config(str(backend_dir / "alembic_e2e.ini"))
        
        # Run the migration
        command.upgrade(alembic_cfg, "head")
        
        logger.info("✅ Quality gates migration completed successfully")
        return True
        
    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        return False


async def initialize_default_gates():
    """Initialize default Reynard quality gates."""
    logger.info("🦦 Initializing default Reynard quality gates...")
    
    try:
        session = get_e2e_session()
        service = QualityGatesService(session)
        
        # Create default gates
        gates = await service.create_reynard_default_gates()
        
        logger.info(f"✅ Created {len(gates)} default quality gates:")
        for gate in gates:
            logger.info(f"   - {gate.gate_id}: {gate.name}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize default gates: {e}")
        return False


async def verify_installation():
    """Verify the quality gates installation."""
    logger.info("🐺 Verifying quality gates installation...")
    
    try:
        session = get_e2e_session()
        service = QualityGatesService(session)
        
        # Get all gates
        gates = await service.get_quality_gates()
        
        if len(gates) == 0:
            logger.warning("⚠️ No quality gates found after installation")
            return False
        
        logger.info(f"✅ Found {len(gates)} quality gates:")
        for gate in gates:
            logger.info(f"   - {gate.gate_id}: {gate.name} ({gate.environment.value})")
        
        # Test evaluation with sample metrics
        sample_metrics = {
            "bugs": 0,
            "vulnerabilities": 0,
            "codeSmells": 25,
            "cyclomaticComplexity": 150,
            "maintainabilityIndex": 75,
            "linesOfCode": 50000,
            "lineCoverage": 85,
            "branchCoverage": 75
        }
        
        results = await service.evaluate_quality_gates(sample_metrics, "development")
        
        logger.info(f"✅ Test evaluation completed with {len(results)} results")
        for result in results:
            status_icon = "✅" if result["status"] == "PASSED" else "⚠️" if result["status"] == "WARN" else "❌"
            logger.info(f"   {status_icon} {result['gateName']}: {result['status']} ({result['overallScore']:.1f}%)")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Verification failed: {e}")
        return False


async def main():
    """Main setup function."""
    logger.info("🦊 Reynard Quality Gates Setup")
    logger.info("==============================")
    
    # Check environment variables
    e2e_url = os.getenv("E2E_DATABASE_URL")
    if not e2e_url:
        logger.error("❌ E2E_DATABASE_URL environment variable is required")
        logger.error("   Set it to: postgresql://postgres:password@localhost:5432/reynard_e2e")
        sys.exit(1)
    
    logger.info(f"📊 Using E2E database: {e2e_url}")
    
    # Step 1: Run migration
    if not await run_migration():
        logger.error("❌ Setup failed at migration step")
        sys.exit(1)
    
    # Step 2: Initialize default gates
    if not await initialize_default_gates():
        logger.error("❌ Setup failed at initialization step")
        sys.exit(1)
    
    # Step 3: Verify installation
    if not await verify_installation():
        logger.error("❌ Setup failed at verification step")
        sys.exit(1)
    
    logger.info("🎉 Quality gates setup completed successfully!")
    logger.info("")
    logger.info("Next steps:")
    logger.info("1. Start the Reynard backend server")
    logger.info("2. Use the CLI to manage quality gates:")
    logger.info("   reynard-code-quality quality-gate-mgmt --action list")
    logger.info("3. Evaluate quality gates:")
    logger.info("   reynard-code-quality quality-gate --environment development")


if __name__ == "__main__":
    asyncio.run(main())
