#!/usr/bin/env python3
"""
Setup script for reynard-mcp-server service.
"""

from setuptools import find_packages, setup

setup(
    name="reynard-mcp-server",
    version="2.0.0",
    packages=find_packages(),
    package_dir={"": "reynard_mcp_server"},
    python_requires=">=3.9",
    install_requires=[
        "reynard-agent-naming",
        "reynard-gatekeeper",
        "reynard-ecs-world",
        "aiohttp",
        "PyJWT",
        "asyncio",
        "pydantic",
        "pathlib",
        "typing-extensions",
    ],
    extras_require={
        "dev": [
            "mypy>=1.0.0",
            "types-requests",
            "types-setuptools",
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "pytest-mock>=3.10.0",
        ],
    },
)
