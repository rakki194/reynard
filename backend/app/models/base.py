"""Base Models for SQLAlchemy

Centralized base class for all SQLAlchemy models to avoid circular imports.
"""

from sqlalchemy.orm import declarative_base

# Create the declarative base
Base = declarative_base()
