# PHOENIX Control Makefile
# Success-Advisor-8 Agent State Management and Release Automation System

.PHONY: help install test lint format type-check quality examples clean docs dev

# Default target
help:
	@echo "PHOENIX Control - Available Commands:"
	@echo "  install     - Install dependencies"
	@echo "  test        - Run tests"
	@echo "  lint        - Run linting"
	@echo "  format      - Format code"
	@echo "  type-check  - Run type checking"
	@echo "  quality     - Run all quality checks"
	@echo "  examples    - Run basic usage example"
	@echo "  examples-all - Run all examples"
	@echo "  docs        - Generate documentation"
	@echo "  clean       - Clean temporary files"
	@echo "  dev         - Development setup"

# Installation
install:
	pip install -r requirements.txt

# Testing
test:
	python -m pytest tests/ -v

# Linting
lint:
	python -m flake8 src/ --max-line-length=100 --extend-ignore=E203,W503

# Formatting
format:
	python -m black src/ --line-length=100

# Type Checking
type-check:
	python -m mypy src/ --ignore-missing-imports

# Quality Checks
quality: lint format type-check
	@echo "All quality checks completed"

# Examples
examples:
	python examples/basic_usage.py

examples-all:
	@echo "Running all examples..."
	@for example in examples/*.py; do \
		echo "Running $$example..."; \
		python "$$example"; \
		echo "Completed $$example"; \
		echo "---"; \
	done

# Documentation
docs:
	python -m pydoc -w src/
	@echo "Documentation generated"

# Cleanup
clean:
	find . -type f -name '*.pyc' -delete
	find . -type d -name '__pycache__' -delete
	find . -type f -name '*.pyo' -delete
	find . -type f -name '*.pyd' -delete
	find . -type f -name '*.so' -delete
	find . -type f -name '*.egg' -delete
	find . -type d -name '*.egg-info' -exec rm -rf {} +
	find . -type d -name 'build' -exec rm -rf {} +
	find . -type d -name 'dist' -exec rm -rf {} +
	find . -type d -name '.pytest_cache' -exec rm -rf {} +
	find . -type d -name '.coverage' -exec rm -rf {} +
	find . -type d -name 'htmlcov' -exec rm -rf {} +
	@echo "Cleanup completed"

# Development
dev: install examples
	@echo "Development environment ready"

# Quick development cycle
quick: format lint examples
	@echo "Quick development cycle completed"
