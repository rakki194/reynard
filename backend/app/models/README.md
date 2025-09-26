# Reynard Backend Models

This directory contains all database models and schemas for the Reynard backend, organized by domain for better maintainability and clarity.

## Directory Structure

```text
app/models/
├── __init__.py              # Central model exports
├── base.py                  # SQLAlchemy Base class
├── core/                    # Core business models
│   ├── __init__.py
│   └── agent.py            # Main Agent model
├── mcp/                     # MCP tool configuration models
│   ├── __init__.py
│   └── tool_config.py      # Tool configuration models
├── content/                 # Content management models
│   ├── __init__.py
│   └── notes.py            # Notes, todos, tags, AI metadata
└── schemas/                 # Pydantic schemas for API validation
    ├── __init__.py
    ├── email_schemas.py     # Email-related schemas
    ├── caption_schemas.py   # Caption generation schemas
    └── agent_schemas.py     # Agent-related schemas
```

## Model Architecture Overview

```mermaid
graph TB
    subgraph "Reynard Backend Models"
        subgraph "Core Models"
            Agent[Agent<br/>Main user entity]
        end

        subgraph "MCP Models"
            Tool[Tool<br/>MCP tool config]
            ToolCategory[ToolCategory<br/>Tool organization]
            ToolConfig[ToolConfiguration<br/>Global settings]
            ToolHistory[ToolConfigHistory<br/>Change tracking]
        end

        subgraph "Content Models"
            Notebook[Notebook<br/>Note organization]
            Note[Note<br/>Rich text content]
            Todo[Todo<br/>Task management]
            Tag[Tag<br/>Categorization]
            AIMetadata[AIMetadata<br/>AI-generated content]
        end

        subgraph "Pydantic Schemas"
            EmailSchemas[Email Schemas<br/>Validation & requests]
            CaptionSchemas[Caption Schemas<br/>AI caption generation]
            AgentSchemas[Agent Schemas<br/>Email management]
        end
    end

    %% Relationships
    Agent --> Notebook
    Agent --> Note
    Agent --> Todo
    Agent --> Tag
    Agent --> AIMetadata

    ToolCategory --> Tool
    Tool --> ToolHistory
    ToolConfig --> Tool

    Notebook --> Note
    Note --> Tag
    Todo --> Tag
    Note --> AIMetadata
    Todo --> AIMetadata

    %% Schema relationships
    EmailSchemas -.-> Agent
    CaptionSchemas -.-> Note
    AgentSchemas -.-> Agent
```

## Model Categories

### Core Models (`core/`)

**Agent** - The main user/agent entity in the Reynard system

- `id`: UUID primary key
- `agent_id`: Unique string identifier
- `name`: Display name
- `email`: Email address (optional, unique)
- `spirit`: Animal spirit type
- `style`: Naming style
- `generation`: Generation number
- `active`: Whether agent is active
- `is_system_agent`: Whether this is a system agent
- `preferences`: JSON preferences
- `created_at`, `updated_at`, `last_activity`: Timestamps

### MCP Models (`mcp/`)

**Tool** - MCP tool configuration

- `id`: UUID primary key
- `name`: Tool name (unique)
- `category_id`: Foreign key to ToolCategory
- `enabled`: Whether tool is enabled
- `description`: Tool description
- `dependencies`: JSON array of dependencies
- `config`: JSON configuration
- `version`: Tool version
- `is_system_tool`: Whether this is a system tool
- `execution_type`: 'sync' or 'async'
- `timeout_seconds`: Execution timeout
- `max_concurrent`: Maximum concurrent executions

**ToolCategory** - Tool categorization

- `id`: UUID primary key
- `name`: Category name (unique)
- `display_name`: Human-readable name
- `description`: Category description
- `icon`: Icon identifier
- `color`: Hex color code
- `sort_order`: Display order
- `is_active`: Whether category is active

**ToolConfiguration** - Global tool configuration

- `id`: UUID primary key
- `version`: Configuration version
- `auto_sync_enabled`: Whether auto-sync is enabled
- `default_timeout`: Default timeout in seconds
- `max_concurrent_tools`: Maximum concurrent tools
- `cache_ttl_seconds`: Cache TTL
- `settings`: JSON settings

**ToolConfigHistory** - Tool configuration change history

- `id`: UUID primary key
- `tool_id`: Foreign key to Tool
- `change_type`: Type of change (created, updated, enabled, disabled, deleted)
- `old_values`: JSON of old values
- `new_values`: JSON of new values
- `changed_by`: Who made the change
- `change_reason`: Reason for change

### Content Models (`content/`)

**Notebook** - Note organization

- `id`: UUID primary key
- `title`: Notebook title
- `description`: Notebook description
- `color`: Hex color code
- `is_public`: Whether notebook is public
- `is_archived`: Whether notebook is archived
- `agent_id`: Foreign key to Agent
- `created_at`, `updated_at`: Timestamps

**Note** - Rich text content

- `id`: UUID primary key
- `title`: Note title
- `content`: Note content
- `content_type`: Content type (markdown, rich-text, code)
- `is_favorite`: Whether note is favorited
- `is_archived`: Whether note is archived
- `notebook_id`: Foreign key to Notebook
- `agent_id`: Foreign key to Agent
- `created_at`, `updated_at`: Timestamps

**Todo** - Task management

- `id`: UUID primary key
- `title`: Todo title
- `description`: Todo description
- `completed`: Whether todo is completed
- `priority`: Priority level (low, medium, high, urgent)
- `due_date`: Due date
- `completed_at`: Completion timestamp
- `agent_id`: Foreign key to Agent
- `created_at`, `updated_at`: Timestamps

**Tag** - Categorization system

- `id`: UUID primary key
- `name`: Tag name
- `color`: Hex color code
- `agent_id`: Foreign key to Agent
- `created_at`: Creation timestamp

**AIMetadata** - AI-generated content metadata

- `id`: UUID primary key
- `entity_type`: Type of entity (note, todo, notebook)
- `entity_id`: ID of the entity
- `ai_type`: Type of AI processing (summary, tags, categorization)
- `ai_data`: JSON data from AI processing
- `confidence_score`: AI confidence score
- `model_used`: AI model used
- `agent_id`: Foreign key to Agent
- `created_at`: Creation timestamp

### Pydantic Schemas (`schemas/`)

**Email Schemas**

- `EmailAttachmentModel`: Email attachment validation

**Caption Schemas**

- `CaptionRequest`: Caption generation request
- `CaptionResponse`: Caption generation response

**Agent Schemas**

- `AgentEmailConfig`: Agent email configuration
- `AgentEmailStats`: Agent email statistics
- `AgentEmailTemplate`: Email template
- `AgentEmailSendRequest`: Email send request
- `AgentEmailMessage`: Email message

## Relationships

### Agent Relationships

- `notebooks`: One-to-many with Notebook
- `notes`: One-to-many with Note
- `todos`: One-to-many with Todo
- `tags`: One-to-many with Tag
- `ai_metadata`: One-to-many with AIMetadata

### Tool Relationships

- `category`: Many-to-one with ToolCategory
- `history`: One-to-many with ToolConfigHistory

### Content Relationships

- `Notebook.notes`: One-to-many with Note
- `Note.tags`: Many-to-many with Tag
- `Todo.tags`: Many-to-many with Tag
- `Note.ai_metadata`: One-to-many with AIMetadata
- `Todo.ai_metadata`: One-to-many with AIMetadata

## Detailed Database Schema Diagrams

### Core Model Relationships

```mermaid
erDiagram
    Agent {
        uuid id PK
        string agent_id UK
        string name
        string email UK
        string spirit
        string style
        string generation
        boolean active
        boolean is_system_agent
        text preferences
        datetime created_at
        datetime updated_at
        datetime last_activity
    }

    Agent ||--o{ Notebook : "owns"
    Agent ||--o{ Note : "creates"
    Agent ||--o{ Todo : "manages"
    Agent ||--o{ Tag : "creates"
    Agent ||--o{ AIMetadata : "generates"
```

### MCP Tool Configuration Relationships

```mermaid
erDiagram
    ToolCategory {
        uuid id PK
        string name UK
        string display_name
        text description
        string icon
        string color
        integer sort_order
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    Tool {
        uuid id PK
        string name UK
        uuid category_id FK
        boolean enabled
        text description
        json dependencies
        json config
        string version
        boolean is_system_tool
        string execution_type
        integer timeout_seconds
        integer max_concurrent
        datetime created_at
        datetime updated_at
    }

    ToolConfiguration {
        uuid id PK
        string version
        boolean auto_sync_enabled
        integer default_timeout
        integer max_concurrent_tools
        integer cache_ttl_seconds
        json settings
        datetime created_at
        datetime updated_at
    }

    ToolConfigHistory {
        uuid id PK
        uuid tool_id FK
        string change_type
        json old_values
        json new_values
        string changed_by
        text change_reason
        datetime created_at
    }

    ToolCategory ||--o{ Tool : "categorizes"
    Tool ||--o{ ToolConfigHistory : "tracks"
    ToolConfiguration ||--o{ Tool : "configures"
```

### Content Management Relationships

```mermaid
erDiagram
    Notebook {
        uuid id PK
        string title
        text description
        string color
        boolean is_public
        boolean is_archived
        uuid agent_id FK
        datetime created_at
        datetime updated_at
    }

    Note {
        uuid id PK
        string title
        text content
        string content_type
        boolean is_favorite
        boolean is_archived
        uuid notebook_id FK
        uuid agent_id FK
        datetime created_at
        datetime updated_at
    }

    Todo {
        uuid id PK
        string title
        text description
        boolean completed
        string priority
        datetime due_date
        datetime completed_at
        uuid agent_id FK
        datetime created_at
        datetime updated_at
    }

    Tag {
        uuid id PK
        string name
        string color
        uuid agent_id FK
        datetime created_at
    }

    AIMetadata {
        uuid id PK
        string entity_type
        uuid entity_id
        string ai_type
        json ai_data
        float confidence_score
        string model_used
        uuid agent_id FK
        datetime created_at
    }

    NoteAttachment {
        uuid id PK
        uuid note_id FK
        string filename
        string file_path
        string mime_type
        integer file_size
        datetime created_at
    }

    NoteCollaboration {
        uuid id PK
        uuid note_id FK
        string collaborator_type
        string collaborator_id
        string permission_level
        datetime created_at
    }

    NoteVersion {
        uuid id PK
        uuid note_id FK
        integer version_number
        text content
        string change_summary
        datetime created_at
    }

    Notebook ||--o{ Note : "contains"
    Note ||--o{ NoteAttachment : "has"
    Note ||--o{ NoteCollaboration : "shares"
    Note ||--o{ NoteVersion : "versions"
    Note }o--o{ Tag : "tagged_with"
    Todo }o--o{ Tag : "tagged_with"
    Note ||--o{ AIMetadata : "analyzed_by"
    Todo ||--o{ AIMetadata : "analyzed_by"
```

## Technical Architecture

### Model Organization Strategy

```mermaid
graph TD
    subgraph "Import Strategy"
        A[app/models/__init__.py] --> B[Central Export Hub]
        B --> C[Core Models]
        B --> D[MCP Models]
        B --> E[Content Models]
        B --> F[Pydantic Schemas]
    end

    subgraph "Database Separation"
        G[Main Database] --> H[Core + Content + MCP]
        I[ECS Database] --> J[Simulation Models]
        K[Auth Database] --> L[User Management]
    end

    subgraph "Migration Strategy"
        M[alembic_main.ini] --> N[Main DB Migrations]
        O[alembic_mcp.ini] --> P[MCP DB Migrations]
        Q[alembic_ecs.ini] --> R[ECS DB Migrations]
    end
```

### Import Patterns

**Centralized Imports (Recommended):**

```python
from app.models import Agent, Tool, Note, Todo, Tag
```

**Direct Imports (For specific use cases):**

```python
from app.models.core.agent import Agent
from app.models.mcp.tool_config import Tool, ToolCategory
from app.models.content.notes import Note, Todo, Tag
from app.models.schemas.email_schemas import EmailAttachmentModel
```

### Database Migration Architecture

```mermaid
graph LR
    subgraph "Migration Environments"
        A[alembic_main.ini] --> B[Main Database]
        C[alembic_mcp.ini] --> D[MCP Database]
        E[alembic_ecs.ini] --> F[ECS Database]
    end

    subgraph "Model Registration"
        G[Base.metadata] --> H[All Models]
        I[env.py] --> J[Model Imports]
        J --> G
    end

    subgraph "Migration Flow"
        K[Model Changes] --> L[Auto-generate Migration]
        L --> M[Review & Edit]
        M --> N[Apply Migration]
        N --> O[Update Database]
    end
```

Migrations are managed using Alembic with separate environments:

- **Main Database**: `alembic_main.ini` - Core application models
- **MCP Database**: `alembic_mcp.ini` - MCP-specific models
- **ECS Database**: `alembic_ecs.ini` - ECS simulation models

## Usage Examples

### Creating an Agent

```python
from app.models import Agent

agent = Agent(
    agent_id="test-agent-001",
    name="Test Agent",
    email="test@example.com",
    spirit="fox",
    style="foundation",
    generation="13"
)
```

### Creating a Tool

```python
from app.models import Tool, ToolCategory

# First get or create a category
category = session.query(ToolCategory).filter_by(name="UTILITY").first()

tool = Tool(
    name="test_tool",
    category_id=category.id,
    enabled=True,
    description="A test tool",
    version="1.0.0",
    execution_type="sync"
)
```

### Creating a Note

```python
from app.models import Note, Notebook

# Get agent and notebook
agent = session.query(Agent).filter_by(agent_id="test-agent-001").first()
notebook = session.query(Notebook).filter_by(agent_id=agent.id).first()

note = Note(
    title="My Note",
    content="# Hello World\nThis is a test note.",
    content_type="markdown",
    notebook_id=notebook.id,
    agent_id=agent.id
)
```

## Best Practices

1. **Always use UUIDs** for primary keys
2. **Include timestamps** for audit trails
3. **Use foreign keys** for relationships
4. **Validate data** with Pydantic schemas
5. **Use transactions** for multi-model operations
6. **Index frequently queried fields**
7. **Use soft deletes** where appropriate
8. **Document relationships** clearly

## Testing

Models should be tested with:

- Unit tests for model creation and validation
- Integration tests for relationships
- Migration tests for schema changes
- Performance tests for queries

See `tests/test_models/` for example test implementations.
