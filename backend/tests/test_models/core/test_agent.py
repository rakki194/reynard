"""Tests for core Agent model."""

import pytest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError

from app.models.base import Base
from app.models.core.agent import Agent


class TestAgent:
    """Test cases for the Agent model."""

    @pytest.fixture
    def engine(self):
        """Create in-memory SQLite engine for testing."""
        engine = create_engine("sqlite:///:memory:", echo=False)
        Base.metadata.create_all(engine)
        return engine

    @pytest.fixture
    def session(self, engine):
        """Create database session."""
        Session = sessionmaker(bind=engine)
        session = Session()
        yield session
        session.close()

    def test_agent_creation(self, session):
        """Test basic agent creation."""
        agent = Agent(
            agent_id="test-agent-001",
            name="Test Agent",
            email="test@example.com",
            spirit="fox",
            style="foundation",
            generation="13"
        )
        
        session.add(agent)
        session.commit()
        
        assert agent.id is not None
        assert agent.agent_id == "test-agent-001"
        assert agent.name == "Test Agent"
        assert agent.email == "test@example.com"
        assert agent.spirit == "fox"
        assert agent.style == "foundation"
        assert agent.generation == "13"
        assert agent.active is True
        assert agent.is_system_agent is False
        assert agent.created_at is not None
        assert agent.updated_at is not None
        assert agent.last_activity is not None

    def test_agent_unique_constraints(self, session):
        """Test agent unique constraints."""
        # Create first agent
        agent1 = Agent(
            agent_id="test-agent-001",
            name="Test Agent 1",
            email="test1@example.com"
        )
        session.add(agent1)
        session.commit()
        
        # Try to create agent with same agent_id
        agent2 = Agent(
            agent_id="test-agent-001",  # Same agent_id
            name="Test Agent 2",
            email="test2@example.com"
        )
        session.add(agent2)
        
        with pytest.raises(IntegrityError):
            session.commit()
        
        session.rollback()
        
        # Try to create agent with same email
        agent3 = Agent(
            agent_id="test-agent-002",
            name="Test Agent 3",
            email="test1@example.com"  # Same email
        )
        session.add(agent3)
        
        with pytest.raises(IntegrityError):
            session.commit()

    def test_agent_optional_fields(self, session):
        """Test agent creation with optional fields."""
        agent = Agent(
            agent_id="minimal-agent",
            name="Minimal Agent"
        )
        
        session.add(agent)
        session.commit()
        
        assert agent.email is None
        assert agent.spirit is None
        assert agent.style is None
        assert agent.generation is None
        assert agent.preferences is None

    def test_agent_to_dict(self, session):
        """Test agent to_dict method."""
        agent = Agent(
            agent_id="test-agent-001",
            name="Test Agent",
            email="test@example.com",
            spirit="fox",
            style="foundation",
            generation="13"
        )
        
        session.add(agent)
        session.commit()
        
        agent_dict = agent.to_dict()
        
        assert isinstance(agent_dict, dict)
        assert agent_dict["agent_id"] == "test-agent-001"
        assert agent_dict["name"] == "Test Agent"
        assert agent_dict["email"] == "test@example.com"
        assert agent_dict["spirit"] == "fox"
        assert agent_dict["style"] == "foundation"
        assert agent_dict["generation"] == "13"
        assert agent_dict["active"] is True
        assert agent_dict["is_system_agent"] is False
        assert "created_at" in agent_dict
        assert "updated_at" in agent_dict
        assert "last_activity" in agent_dict

    def test_agent_repr(self, session):
        """Test agent string representation."""
        agent = Agent(
            agent_id="test-agent-001",
            name="Test Agent"
        )
        
        session.add(agent)
        session.commit()
        
        repr_str = repr(agent)
        assert "Agent" in repr_str
        assert "test-agent-001" in repr_str
        assert "Test Agent" in repr_str

    def test_agent_timestamps(self, session):
        """Test agent timestamp fields."""
        agent = Agent(
            agent_id="test-agent-001",
            name="Test Agent"
        )
        
        session.add(agent)
        session.commit()
        
        # Check that timestamps are set
        assert agent.created_at is not None
        assert agent.updated_at is not None
        assert agent.last_activity is not None
        
        # Check that created_at and updated_at are initially the same
        assert agent.created_at == agent.updated_at
        
        # Update agent and check that updated_at changes
        original_updated_at = agent.updated_at
        agent.name = "Updated Agent"
        session.commit()
        
        assert agent.updated_at > original_updated_at

    def test_agent_defaults(self, session):
        """Test agent default values."""
        agent = Agent(
            agent_id="test-agent-001",
            name="Test Agent"
        )
        
        assert agent.active is True
        assert agent.is_system_agent is False
        assert agent.preferences is None

    def test_agent_system_agent(self, session):
        """Test system agent creation."""
        agent = Agent(
            agent_id="system-agent-001",
            name="System Agent",
            is_system_agent=True
        )
        
        session.add(agent)
        session.commit()
        
        assert agent.is_system_agent is True
        assert agent.active is True

    def test_agent_inactive(self, session):
        """Test inactive agent creation."""
        agent = Agent(
            agent_id="inactive-agent-001",
            name="Inactive Agent",
            active=False
        )
        
        session.add(agent)
        session.commit()
        
        assert agent.active is False


