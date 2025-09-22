#!/usr/bin/env python3
"""
Setup script for Dynamic Enum Service
=====================================

A modular service for managing dynamic enums based on FastAPI ECS backend data.
"""

from setuptools import find_packages, setup

setup(
    name="reynard-dynamic-enum",
    version="1.0.0",
    description="A modular service for managing dynamic enums based on FastAPI ECS backend data",
    long_description=open("README.md").read() if open("README.md", "r") else "",
    long_description_content_type="text/markdown",
    author="Reynard Development Team",
    author_email="dev@reynard.ai",
    url="https://github.com/reynard-ai/reynard",
    packages=find_packages(),
    python_requires=">=3.8",
    install_requires=[
        "httpx>=0.24.0",
    ],
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "isort>=5.12.0",
            "flake8>=6.0.0",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
    keywords="enum dynamic backend service reynard",
)
