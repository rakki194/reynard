#!/usr/bin/env python3
"""
Setup script for reynard-gatekeeper service.
"""

from setuptools import find_packages, setup

setup(
    name="reynard-gatekeeper",
    version="0.1.0",
    packages=find_packages(where="reynard_gatekeeper"),
    package_dir={"": "reynard_gatekeeper"},
    python_requires=">=3.8",
    install_requires=[
        "fastapi",
        "pydantic",
        "python-jose[cryptography]",
        "argon2-cffi",
        "python-multipart",
        "passlib",
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
