"""Example usage of the modular Reynard middleware system.

This module demonstrates how to use the new modular middleware system
with different configurations and environments.
"""

from fastapi import FastAPI

from .factory import (
    setup_middleware,
    setup_reynard_middleware,
    create_custom_middleware_stack
)
# Removed orchestrator import - no longer needed


def example_basic_setup():
    """Example of basic middleware setup."""
    app = FastAPI()
    
    # Clean setup with default configuration
    setup_middleware(app, environment="development")
    
    return app


def example_custom_config():
    """Example of middleware setup with custom configuration."""
    app = FastAPI()
    
    # Setup with custom rate limiting
    setup_middleware(
        app, 
        environment="development",
        rate_limit=50,
        rate_window=30
    )
    
    return app


def example_custom_stack():
    """Example of custom middleware stack."""
    app = FastAPI()
    
    # Create custom middleware stack
    create_custom_middleware_stack(
        app,
        environment="development",
        enabled_middleware=["cors", "security_headers", "rate_limiting"],
        rate_limit=100,
        rate_window=60
    )
    
    return app


def example_production_setup():
    """Example of production middleware setup."""
    app = FastAPI()
    
    # Production setup with custom rate limiting
    setup_middleware(
        app,
        environment="production",
        rate_limit=100,
        rate_window=60
    )
    
    return app


def example_testing_setup():
    """Example of testing environment setup."""
    app = FastAPI()
    
    # Testing setup with relaxed rate limiting
    setup_middleware(
        app,
        environment="testing",
        rate_limit=1000,
        rate_window=60
    )
    
    return app


# Example usage in main application
if __name__ == "__main__":
    # Choose the setup method you want to use
    
    # Basic setup
    app = example_basic_setup()
    
    # Or use custom config
    # app = example_custom_config()
    
    # Or use custom stack
    # app = example_custom_stack()
    
    # Or use production setup
    # app = example_production_setup()
    
    # Or use testing setup
    # app = example_testing_setup()
    
    print("FastAPI app created with clean middleware factory!")
    print("Available endpoints:")
    print("- /docs - API documentation")
    print("- /health - Health check")
    print("- /api/* - API endpoints")
