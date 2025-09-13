#!/usr/bin/env python3
"""
Simple script to check test coverage.
"""

import subprocess
import sys

def main():
    try:
        # Run pytest with coverage
        result = subprocess.run([
            'python', '-m', 'pytest', 
            '--cov=app', 
            '--cov-report=term-missing', 
            '--tb=no', 
            '-q'
        ], capture_output=True, text=True)
        
        # Extract coverage information
        lines = result.stdout.split('\n')
        for line in lines:
            if 'TOTAL' in line:
                print(f"Coverage: {line}")
                break
        
        # Print any errors
        if result.stderr:
            print(f"Errors: {result.stderr}")
            
    except Exception as e:
        print(f"Error running coverage: {e}")

if __name__ == "__main__":
    main()
