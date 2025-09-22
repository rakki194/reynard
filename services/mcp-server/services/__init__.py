"""Services module for MCP server."""

import sys
from pathlib import Path

# Add the dynamic_enum service to the path
dynamic_enum_path = Path(__file__).parent.parent.parent / "dynamic_enum" / "src"
if dynamic_enum_path.exists():
    sys.path.insert(0, str(dynamic_enum_path))

# Initialize the dynamic enum service with the backend data service
try:
    from backend_adapter import MCPBackendAdapter
    from dynamic_enum_service import initialize_dynamic_enum_service

    from .backend_data_service import backend_data_service

    # Create adapter and initialize the global dynamic enum service
    adapter = MCPBackendAdapter(backend_data_service)
    initialize_dynamic_enum_service(adapter)

    import logging

    logger = logging.getLogger(__name__)
    logger.info("Dynamic enum service initialized with modular architecture")

except ImportError as e:
    # Fallback if dynamic_enum service is not available
    import logging

    logger = logging.getLogger(__name__)
    logger.warning(f"Could not initialize dynamic enum service: {e}")
