# Model Tests

This directory contains comprehensive tests for all database models and Pydantic schemas in the Reynard backend.

## Test Structure

```
tests/test_models/
├── __init__.py
├── conftest.py              # Pytest configuration and fixtures
├── core/                    # Core model tests
│   └── test_agent.py        # Agent model tests
├── mcp/                     # MCP model tests
│   └── test_tool_config.py  # Tool configuration model tests
├── content/                 # Content model tests
│   └── test_notes.py        # Notes, todos, tags, AI metadata tests
└── schemas/                 # Schema tests
    └── test_schemas.py      # Pydantic schema tests
```

## Running Tests

### Run All Model Tests

```bash
cd /home/kade/runeset/reynard/backend
python -m pytest tests/test_models/ -v
```

### Run Specific Test Categories

```bash
# Core models only
python -m pytest tests/test_models/core/ -v

# MCP models only
python -m pytest tests/test_models/mcp/ -v

# Content models only
python -m pytest tests/test_models/content/ -v

# Schemas only
python -m pytest tests/test_models/schemas/ -v
```

### Run Specific Test Files

```bash
# Agent model tests
python -m pytest tests/test_models/core/test_agent.py -v

# Tool configuration tests
python -m pytest tests/test_models/mcp/test_tool_config.py -v

# Notes and todos tests
python -m pytest tests/test_models/content/test_notes.py -v

# Schema tests
python -m pytest tests/test_models/schemas/test_schemas.py -v
```

### Run with Coverage

```bash
python -m pytest tests/test_models/ --cov=app.models --cov-report=html
```

## Test Categories

### Core Model Tests (`core/`)

- **Agent Model**: Tests for the main Agent entity
  - Basic creation and validation
  - Unique constraints (agent_id, email)
  - Default values
  - Timestamp handling
  - String representation
  - Dictionary serialization

### MCP Model Tests (`mcp/`)

- **ToolCategory Model**: Tool categorization
  - Basic creation and validation
  - Unique name constraints
  - Default values
- **Tool Model**: MCP tool configuration
  - Basic creation and validation
  - Unique name constraints
  - Relationship with categories
  - Default values
  - Dictionary serialization
- **ToolConfiguration Model**: Global tool settings
  - Basic creation and validation
  - Default values
- **ToolConfigHistory Model**: Change tracking
  - Basic creation and validation
  - Relationship with tools
- **Enums**: ToolCategoryEnum, ExecutionType, ToolAction
  - Enum value validation

### Content Model Tests (`content/`)

- **Notebook Model**: Note organization
  - Basic creation and validation
  - Default values
  - Relationship with agents
  - Dictionary serialization
- **Note Model**: Rich text content
  - Basic creation and validation
  - Default values
  - Relationships with notebooks and agents
  - Dictionary serialization
- **Todo Model**: Task management
  - Basic creation and validation
  - Default values
  - Mark completed/incomplete methods
  - Relationship with agents
  - Dictionary serialization
- **Tag Model**: Categorization system
  - Basic creation and validation
  - Unique constraints per agent
  - Default values
  - Relationship with agents
  - Dictionary serialization
- **AIMetadata Model**: AI-generated content metadata
  - Basic creation and validation
  - Relationship with agents
  - Dictionary serialization

### Schema Tests (`schemas/`)

- **EmailAttachmentModel**: Email attachment validation
  - Basic creation and validation
  - Optional fields
- **CaptionRequest/Response**: Caption generation schemas
  - Basic creation and validation
  - Optional fields
- **Agent Email Schemas**: Agent email management
  - EventType enum validation
  - AgentEmailConfig creation and defaults
  - AgentEmailStats creation and defaults
  - AgentEmailTemplate creation and defaults
  - AgentEmailMessage creation and validation
  - AgentEmailSendRequest creation
  - Serialization and deserialization

## Test Fixtures

### Database Fixtures

- `test_engine`: In-memory SQLite engine for testing
- `test_session`: Database session for tests
- `clean_database`: Cleans database before each test

### Model Fixtures

- `agent`: Creates a test Agent instance
- `category`: Creates a test ToolCategory instance
- `tool`: Creates a test Tool instance
- `notebook`: Creates a test Notebook instance

## Test Patterns

### Model Creation Tests

```python
def test_model_creation(self, session):
    """Test basic model creation."""
    model = Model(
        field1="value1",
        field2="value2"
    )

    session.add(model)
    session.commit()

    assert model.id is not None
    assert model.field1 == "value1"
    assert model.field2 == "value2"
```

### Constraint Tests

```python
def test_unique_constraint(self, session):
    """Test unique constraint validation."""
    model1 = Model(unique_field="value")
    session.add(model1)
    session.commit()

    model2 = Model(unique_field="value")  # Same value
    session.add(model2)

    with pytest.raises(IntegrityError):
        session.commit()
```

### Relationship Tests

```python
def test_relationship(self, session, related_model):
    """Test model relationships."""
    model = Model(related_id=related_model.id)
    session.add(model)
    session.commit()

    assert model.related is not None
    assert model.related.id == related_model.id
```

### Method Tests

```python
def test_model_method(self, session):
    """Test model methods."""
    model = Model()
    session.add(model)
    session.commit()

    result = model.some_method()
    assert result == expected_value
```

## Best Practices

1. **Use Fixtures**: Leverage pytest fixtures for common setup
2. **Test Edge Cases**: Include tests for boundary conditions
3. **Test Relationships**: Verify all model relationships work correctly
4. **Test Constraints**: Ensure database constraints are enforced
5. **Test Methods**: Test all model methods and properties
6. **Clean State**: Use clean_database fixture to ensure test isolation
7. **Descriptive Names**: Use clear, descriptive test method names
8. **Assert Messages**: Include helpful assertion messages
9. **Coverage**: Aim for high test coverage of model functionality
10. **Performance**: Use in-memory SQLite for fast test execution

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

- **Fast Execution**: Uses in-memory SQLite for speed
- **No Dependencies**: No external database required
- **Isolated**: Each test runs in isolation
- **Deterministic**: Tests produce consistent results
- **Comprehensive**: Covers all model functionality

## Debugging Tests

### Run with Verbose Output

```bash
python -m pytest tests/test_models/ -v -s
```

### Run Single Test with Debug

```bash
python -m pytest tests/test_models/core/test_agent.py::TestAgent::test_agent_creation -v -s
```

### Run with PDB Debugger

```bash
python -m pytest tests/test_models/ --pdb
```

### Generate Test Report

```bash
python -m pytest tests/test_models/ --html=test_report.html --self-contained-html
```
