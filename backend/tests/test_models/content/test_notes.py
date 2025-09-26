"""Tests for content management models."""

from datetime import datetime

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.content.notes import (
    AIMetadata,
    Note,
    NoteAttachment,
    Notebook,
    NoteCollaboration,
    NoteVersion,
    Tag,
    Todo,
    note_tags,
    todo_tags,
)


class TestNotebook:
    """Test cases for the Notebook model."""

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

    @pytest.fixture
    def agent(self, session):
        """Create a test agent."""
        from app.models.core.agent import Agent

        agent = Agent(agent_id="test-agent-001", name="Test Agent")
        session.add(agent)
        session.commit()
        return agent

    def test_notebook_creation(self, session, agent):
        """Test basic notebook creation."""
        notebook = Notebook(
            title="My Notebook",
            description="A test notebook",
            color="#FF5733",
            is_public=False,
            is_archived=False,
            agent_id=agent.id,
        )

        session.add(notebook)
        session.commit()

        assert notebook.id is not None
        assert notebook.title == "My Notebook"
        assert notebook.description == "A test notebook"
        assert notebook.color == "#FF5733"
        assert notebook.is_public is False
        assert notebook.is_archived is False
        assert notebook.agent_id == agent.id
        assert notebook.created_at is not None
        assert notebook.updated_at is not None

    def test_notebook_defaults(self, session, agent):
        """Test notebook default values."""
        notebook = Notebook(title="Default Notebook", agent_id=agent.id)

        # Note: Default values are applied at the database level, not at object creation
        # The values will be None until saved to database
        assert notebook.color is None  # Default applied at DB level
        assert notebook.is_public is None  # Default applied at DB level
        assert notebook.is_archived is None  # Default applied at DB level

    def test_notebook_to_dict(self, session, agent):
        """Test notebook to_dict method."""
        notebook = Notebook(title="Test Notebook", agent_id=agent.id)

        session.add(notebook)
        session.commit()

        notebook_dict = notebook.to_dict()

        assert isinstance(notebook_dict, dict)
        assert notebook_dict["title"] == "Test Notebook"
        assert notebook_dict["agent_id"] == str(agent.id)
        assert "created_at" in notebook_dict
        assert "updated_at" in notebook_dict
        assert "note_count" in notebook_dict

    def test_notebook_relationship_with_agent(self, session, agent):
        """Test notebook relationship with agent."""
        notebook = Notebook(title="Test Notebook", agent_id=agent.id)

        session.add(notebook)
        session.commit()

        # Test relationship
        assert notebook.agent is not None
        assert notebook.agent.agent_id == "test-agent-001"
        assert notebook.agent.name == "Test Agent"


class TestNote:
    """Test cases for the Note model."""

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

    @pytest.fixture
    def agent(self, session):
        """Create a test agent."""
        from app.models.core.agent import Agent

        agent = Agent(agent_id="test-agent-001", name="Test Agent")
        session.add(agent)
        session.commit()
        return agent

    @pytest.fixture
    def notebook(self, session, agent):
        """Create a test notebook."""
        notebook = Notebook(title="Test Notebook", agent_id=agent.id)
        session.add(notebook)
        session.commit()
        return notebook

    def test_note_creation(self, session, agent, notebook):
        """Test basic note creation."""
        note = Note(
            title="My Note",
            content="# Hello World\nThis is a test note.",
            content_type="markdown",
            is_favorite=False,
            is_archived=False,
            notebook_id=notebook.id,
            agent_id=agent.id,
        )

        session.add(note)
        session.commit()

        assert note.id is not None
        assert note.title == "My Note"
        assert note.content == "# Hello World\nThis is a test note."
        assert note.content_type == "markdown"
        assert note.is_favorite is False
        assert note.is_archived is False
        assert note.notebook_id == notebook.id
        assert note.agent_id == agent.id
        assert note.created_at is not None
        assert note.updated_at is not None

    def test_note_defaults(self, session, agent, notebook):
        """Test note default values."""
        note = Note(title="Default Note", notebook_id=notebook.id, agent_id=agent.id)

        assert note.content == ""  # Default empty content
        assert note.content_type == "markdown"  # Default content type
        assert note.is_favorite is False
        assert note.is_archived is False

    def test_note_relationships(self, session, agent, notebook):
        """Test note relationships."""
        note = Note(title="Test Note", notebook_id=notebook.id, agent_id=agent.id)

        session.add(note)
        session.commit()

        # Test relationships
        assert note.notebook is not None
        assert note.notebook.title == "Test Notebook"
        assert note.agent is not None
        assert note.agent.agent_id == "test-agent-001"

    def test_note_to_dict(self, session, agent, notebook):
        """Test note to_dict method."""
        note = Note(
            title="Test Note",
            content="Test content",
            notebook_id=notebook.id,
            agent_id=agent.id,
        )

        session.add(note)
        session.commit()

        note_dict = note.to_dict()

        assert isinstance(note_dict, dict)
        assert note_dict["title"] == "Test Note"
        assert note_dict["content"] == "Test content"
        assert note_dict["notebook_id"] == str(notebook.id)
        assert note_dict["agent_id"] == str(agent.id)
        assert "created_at" in note_dict
        assert "updated_at" in note_dict
        assert "tags" in note_dict
        assert "attachment_count" in note_dict
        assert "collaborator_count" in note_dict


class TestTodo:
    """Test cases for the Todo model."""

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

    @pytest.fixture
    def agent(self, session):
        """Create a test agent."""
        from app.models.core.agent import Agent

        agent = Agent(agent_id="test-agent-001", name="Test Agent")
        session.add(agent)
        session.commit()
        return agent

    def test_todo_creation(self, session, agent):
        """Test basic todo creation."""
        todo = Todo(
            title="My Todo",
            description="A test todo",
            completed=False,
            priority="medium",
            agent_id=agent.id,
        )

        session.add(todo)
        session.commit()

        assert todo.id is not None
        assert todo.title == "My Todo"
        assert todo.description == "A test todo"
        assert todo.completed is False
        assert todo.priority == "medium"
        assert todo.agent_id == agent.id
        assert todo.created_at is not None
        assert todo.updated_at is not None

    def test_todo_defaults(self, session, agent):
        """Test todo default values."""
        todo = Todo(title="Default Todo", agent_id=agent.id)

        assert todo.description is None
        assert todo.completed is False
        assert todo.priority == "medium"  # Default priority
        assert todo.due_date is None
        assert todo.completed_at is None

    def test_todo_mark_completed(self, session, agent):
        """Test todo mark_completed method."""
        todo = Todo(title="Test Todo", agent_id=agent.id)

        session.add(todo)
        session.commit()

        assert todo.completed is False
        assert todo.completed_at is None

        todo.mark_completed()

        assert todo.completed is True
        assert todo.completed_at is not None

    def test_todo_mark_incomplete(self, session, agent):
        """Test todo mark_incomplete method."""
        todo = Todo(title="Test Todo", agent_id=agent.id)

        session.add(todo)
        session.commit()

        # Mark as completed first
        todo.mark_completed()
        assert todo.completed is True
        assert todo.completed_at is not None

        # Mark as incomplete
        todo.mark_incomplete()
        assert todo.completed is False
        assert todo.completed_at is None

    def test_todo_relationship_with_agent(self, session, agent):
        """Test todo relationship with agent."""
        todo = Todo(title="Test Todo", agent_id=agent.id)

        session.add(todo)
        session.commit()

        # Test relationship
        assert todo.agent is not None
        assert todo.agent.agent_id == "test-agent-001"
        assert todo.agent.name == "Test Agent"

    def test_todo_to_dict(self, session, agent):
        """Test todo to_dict method."""
        todo = Todo(
            title="Test Todo", description="Test description", agent_id=agent.id
        )

        session.add(todo)
        session.commit()

        todo_dict = todo.to_dict()

        assert isinstance(todo_dict, dict)
        assert todo_dict["title"] == "Test Todo"
        assert todo_dict["description"] == "Test description"
        assert todo_dict["agent_id"] == str(agent.id)
        assert "created_at" in todo_dict
        assert "updated_at" in todo_dict
        assert "tags" in todo_dict


class TestTag:
    """Test cases for the Tag model."""

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

    @pytest.fixture
    def agent(self, session):
        """Create a test agent."""
        from app.models.core.agent import Agent

        agent = Agent(agent_id="test-agent-001", name="Test Agent")
        session.add(agent)
        session.commit()
        return agent

    def test_tag_creation(self, session, agent):
        """Test basic tag creation."""
        tag = Tag(name="important", color="#FF0000", agent_id=agent.id)

        session.add(tag)
        session.commit()

        assert tag.id is not None
        assert tag.name == "important"
        assert tag.color == "#FF0000"
        assert tag.agent_id == agent.id
        assert tag.created_at is not None

    def test_tag_defaults(self, session, agent):
        """Test tag default values."""
        tag = Tag(name="default", agent_id=agent.id)

        assert tag.color == "#6b7280"  # Default color

    def test_tag_unique_constraint(self, session, agent):
        """Test tag unique constraint per agent."""
        tag1 = Tag(name="important", agent_id=agent.id)
        session.add(tag1)
        session.commit()

        # Same agent, same tag name should fail
        tag2 = Tag(name="important", agent_id=agent.id)  # Same name  # Same agent
        session.add(tag2)

        with pytest.raises(IntegrityError):
            session.commit()

        session.rollback()

        # Different agent, same tag name should work
        from app.models.core.agent import Agent

        agent2 = Agent(agent_id="test-agent-002", name="Test Agent 2")
        session.add(agent2)
        session.commit()

        tag3 = Tag(name="important", agent_id=agent2.id)  # Same name  # Different agent
        session.add(tag3)
        session.commit()  # Should succeed

    def test_tag_relationship_with_agent(self, session, agent):
        """Test tag relationship with agent."""
        tag = Tag(name="test-tag", agent_id=agent.id)

        session.add(tag)
        session.commit()

        # Test relationship
        assert tag.agent is not None
        assert tag.agent.agent_id == "test-agent-001"
        assert tag.agent.name == "Test Agent"

    def test_tag_to_dict(self, session, agent):
        """Test tag to_dict method."""
        tag = Tag(name="test-tag", color="#FF0000", agent_id=agent.id)

        session.add(tag)
        session.commit()

        tag_dict = tag.to_dict()

        assert isinstance(tag_dict, dict)
        assert tag_dict["name"] == "test-tag"
        assert tag_dict["color"] == "#FF0000"
        assert tag_dict["agent_id"] == str(agent.id)
        assert "created_at" in tag_dict
        assert "note_count" in tag_dict
        assert "todo_count" in tag_dict


class TestAIMetadata:
    """Test cases for the AIMetadata model."""

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

    @pytest.fixture
    def agent(self, session):
        """Create a test agent."""
        from app.models.core.agent import Agent

        agent = Agent(agent_id="test-agent-001", name="Test Agent")
        session.add(agent)
        session.commit()
        return agent

    def test_ai_metadata_creation(self, session, agent):
        """Test basic AI metadata creation."""
        ai_metadata = AIMetadata(
            entity_type="note",
            entity_id="123e4567-e89b-12d3-a456-426614174000",
            ai_type="summary",
            ai_data={"summary": "This is a test summary"},
            confidence_score=0.95,
            model_used="gpt-4",
            agent_id=agent.id,
        )

        session.add(ai_metadata)
        session.commit()

        assert ai_metadata.id is not None
        assert ai_metadata.entity_type == "note"
        assert ai_metadata.entity_id == "123e4567-e89b-12d3-a456-426614174000"
        assert ai_metadata.ai_type == "summary"
        assert ai_metadata.ai_data == {"summary": "This is a test summary"}
        assert ai_metadata.confidence_score == 0.95
        assert ai_metadata.model_used == "gpt-4"
        assert ai_metadata.agent_id == agent.id
        assert ai_metadata.created_at is not None

    def test_ai_metadata_relationship_with_agent(self, session, agent):
        """Test AI metadata relationship with agent."""
        ai_metadata = AIMetadata(
            entity_type="todo",
            entity_id="123e4567-e89b-12d3-a456-426614174000",
            ai_type="categorization",
            ai_data={"category": "work"},
            agent_id=agent.id,
        )

        session.add(ai_metadata)
        session.commit()

        # Test relationship
        assert ai_metadata.agent is not None
        assert ai_metadata.agent.agent_id == "test-agent-001"
        assert ai_metadata.agent.name == "Test Agent"

    def test_ai_metadata_to_dict(self, session, agent):
        """Test AI metadata to_dict method."""
        ai_metadata = AIMetadata(
            entity_type="note",
            entity_id="123e4567-e89b-12d3-a456-426614174000",
            ai_type="summary",
            ai_data={"summary": "Test summary"},
            confidence_score=0.9,
            model_used="gpt-3.5-turbo",
            agent_id=agent.id,
        )

        session.add(ai_metadata)
        session.commit()

        ai_dict = ai_metadata.to_dict()

        assert isinstance(ai_dict, dict)
        assert ai_dict["entity_type"] == "note"
        assert ai_dict["entity_id"] == "123e4567-e89b-12d3-a456-426614174000"
        assert ai_dict["ai_type"] == "summary"
        assert ai_dict["ai_data"] == {"summary": "Test summary"}
        assert ai_dict["confidence_score"] == 0.9
        assert ai_dict["model_used"] == "gpt-3.5-turbo"
        assert ai_dict["agent_id"] == str(agent.id)
        assert "created_at" in ai_dict
