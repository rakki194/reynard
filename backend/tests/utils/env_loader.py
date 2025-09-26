#!/usr/bin/env python3
"""Environment Variable Loader for Tests

Utility to load environment variables from .env file for testing.

Author: Reynard Development Team
Version: 1.0.0
"""

import os
from pathlib import Path
from typing import Dict, Optional


def load_env_file(env_file_path: Optional[Path] = None) -> Dict[str, str]:
    """Load environment variables from .env file.

    Args:
        env_file_path: Path to .env file. If None, uses backend/.env

    Returns:
        Dictionary of environment variables
    """
    if env_file_path is None:
        # Find backend/.env file
        current_dir = Path(__file__).parent
        backend_dir = current_dir.parent.parent
        env_file_path = backend_dir / '.env'

    env_vars = {}

    if not env_file_path.exists():
        raise FileNotFoundError(f"Environment file not found: {env_file_path}")

    with open(env_file_path, 'r') as f:
        for line in f:
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Parse KEY=VALUE format
            if '=' in line:
                key, value = line.split('=', 1)
                key = key.strip()
                value = value.strip()

                # Remove quotes if present
                if value.startswith('"') and value.endswith('"'):
                    value = value[1:-1]
                elif value.startswith("'") and value.endswith("'"):
                    value = value[1:-1]

                env_vars[key] = value

    return env_vars


def get_database_urls() -> Dict[str, str]:
    """Get database URLs from environment variables.

    Returns:
        Dictionary mapping database names to URLs
    """
    env_vars = load_env_file()

    # Base connection info
    db_user = env_vars.get('DATABASE_USER', 'reynard')
    db_password = env_vars.get('DATABASE_PASSWORD', '')
    db_host = env_vars.get('DATABASE_HOST', 'localhost')
    db_port = env_vars.get('DATABASE_PORT', '5432')

    # If no base password, try to extract from DATABASE_URL
    if not db_password and 'DATABASE_URL' in env_vars:
        # Parse DATABASE_URL to extract password
        db_url = env_vars['DATABASE_URL']
        if '@' in db_url and ':' in db_url:
            # Extract password from postgresql://user:password@host:port/db
            try:
                parts = db_url.split('://')[1].split('@')[0]
                if ':' in parts:
                    db_user, db_password = parts.split(':', 1)
            except (IndexError, ValueError):
                pass

    # Build database URLs
    base_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}"

    databases = {
        'main': f"{base_url}/reynard",
        'ecs': f"{base_url}/reynard_ecs",
        'auth': f"{base_url}/reynard_auth",
        'keys': f"{base_url}/reynard_keys",
    }

    # Override with specific URLs if they exist
    if 'DATABASE_URL' in env_vars:
        databases['main'] = env_vars['DATABASE_URL']
    if 'ECS_DATABASE_URL' in env_vars:
        databases['ecs'] = env_vars['ECS_DATABASE_URL']
    if 'AUTH_DATABASE_URL' in env_vars:
        databases['auth'] = env_vars['AUTH_DATABASE_URL']
    if 'KEY_STORAGE_DATABASE_URL' in env_vars:
        databases['keys'] = env_vars['KEY_STORAGE_DATABASE_URL']

    return databases


def get_redis_config() -> Dict[str, str]:
    """Get Redis configuration from environment variables.

    Returns:
        Dictionary of Redis configuration
    """
    env_vars = load_env_file()

    return {
        'host': env_vars.get('REDIS_HOST', 'localhost'),
        'port': env_vars.get('REDIS_PORT', '6379'),
        'db': env_vars.get('REDIS_DB', '0'),
        'password': env_vars.get('REDIS_PASSWORD', ''),
        'tls_enabled': env_vars.get('REDIS_TLS_ENABLED', 'false').lower() == 'true',
        'tls_cert_file': env_vars.get('REDIS_TLS_CERT_FILE', ''),
        'tls_key_file': env_vars.get('REDIS_TLS_KEY_FILE', ''),
        'tls_ca_cert_file': env_vars.get('REDIS_TLS_CA_CERT_FILE', ''),
    }


def setup_test_environment():
    """Set up test environment variables from .env file."""
    env_vars = load_env_file()

    # Set environment variables for testing
    for key, value in env_vars.items():
        if key not in os.environ:
            os.environ[key] = value

    return env_vars


def get_test_database_url() -> str:
    """Get test database URL for testing."""
    databases = get_database_urls()
    return databases['keys']  # Use keys database for testing


def get_test_redis_config() -> Dict[str, str]:
    """Get test Redis configuration."""
    config = get_redis_config()
    # Use test database and correct port for testing
    config['db'] = '15'
    # Override port to use standard Redis port for testing
    config['port'] = '6379'
    # Disable TLS for testing
    config['tls_enabled'] = False
    config['password'] = ''  # No password for testing
    return config
