#!/usr/bin/env python3
"""
Setup script for reynard-agent-naming service.
"""

from setuptools import setup, find_packages

setup(
    name="reynard-agent-naming",
    version="0.1.0",
    packages=find_packages(),
    package_dir={"": "reynard_agent_naming"},
    python_requires=">=3.8",
    install_requires=[],
    extras_require={
        "dev": [
            "pytest",
            "pytest-asyncio",
            "pytest-cov",
            "black",
            "isort",
            "mypy",
            "ruff",
            "pre-commit",
        ],
    },
)



