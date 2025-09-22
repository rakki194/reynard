#!/usr/bin/env python3
"""
Reynard Backend Startup Script with Warning Suppression

This script starts the Reynard backend while suppressing ML library warnings
that are output to stderr during the import process.
"""

import contextlib
import os
import subprocess
import sys
from io import StringIO


def suppress_warnings_startup():
    """Start the backend with suppressed warnings."""

    # Set environment variables to suppress warnings
    env = os.environ.copy()
    env.update(
        {
            "TF_CPP_MIN_LOG_LEVEL": "3",
            "TOKENIZERS_PARALLELISM": "false",
            "PYTORCH_CUDA_ALLOC_CONF": "max_split_size_mb:128",
            "CUDA_LAUNCH_BLOCKING": "0",
            "PYTHONWARNINGS": "ignore",
            "TF_ENABLE_ONEDNN_OPTS": "0",  # Disable oneDNN optimizations
            "OMP_NUM_THREADS": "1",  # Limit OpenMP threads
        }
    )

    # Filter function to suppress specific warning lines
    def filter_stderr(line):
        """Filter out unwanted warning lines."""
        if not line:
            return False

        # Suppress specific warning patterns
        suppress_patterns = [
            "WARNING: Logging before InitGoogleLogging() is written to STDERR",
            "SymmetricMemory.cpp",
            "Destroying Symmetric Memory Allocators",
            "I20250921",  # Google logging timestamps
        ]

        for pattern in suppress_patterns:
            if pattern in line:
                return False

        return True

    # Start the backend with filtered stderr
    try:
        # Use the main.py script
        cmd = [sys.executable, "main.py"]

        # Start the process with filtered stderr
        process = subprocess.Popen(
            cmd,
            env=env,
            stderr=subprocess.PIPE,
            stdout=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True,
        )

        # Stream stdout normally
        for line in iter(process.stdout.readline, ""):
            if line:
                print(line.rstrip())

        # Filter stderr
        for line in iter(process.stderr.readline, ""):
            if filter_stderr(line):
                print(line.rstrip(), file=sys.stderr)

        process.wait()

    except KeyboardInterrupt:
        print("\n🦊 Shutting down Reynard backend...")
        if process:
            process.terminate()
            process.wait()
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("🦊 Starting Reynard Backend with Warning Suppression...")
    suppress_warnings_startup()
