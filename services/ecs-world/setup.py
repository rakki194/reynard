#!/usr/bin/env python3
"""
Setup script for reynard-ecs-world service.
"""

from setuptools import find_packages, setup

setup(
    name="reynard-ecs-world",
    version="0.1.0",
    packages=find_packages(),
    package_dir={"": "reynard_ecs_world"},
    python_requires=">=3.8",
    install_requires=[
        "pydantic>=2.0.0",
        "asyncio",
        "pathlib",
        "typing-extensions",
    ],
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
