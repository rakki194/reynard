# ECS World API Documentation

## Overview

The Reynard ECS World API provides comprehensive REST endpoints for managing the single authoritative ECS World simulation. All ECS operations are centralized through the FastAPI backend, ensuring data consistency and preventing conflicts.

## Base URL

```
http://localhost:8000/api/ecs
```

## Authentication

All ECS endpoints require authentication. Include the authentication token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Endpoints

### World Management

#### Get World Status

Get the current status of the ECS world.

**Endpoint:** `GET /api/ecs/status`

**Response:**

```json
{
  "status": "active",
  "entity_count": 5,
  "system_count": 0,
  "agent_count": 3,
  "mature_agents": 1
}
```

#### List All Agents

Get a list of all agents in the world.

**Endpoint:** `GET /api/ecs/agents`

**Response:**

```json
[
  {
    "agent_id": "agent-001",
    "name": "Vulpine-Architect-13",
    "spirit": "fox",
    "style": "foundation",
    "active": true
  },
  {
    "agent_id": "agent-002",
    "name": "Dynamic-Elder-20",
    "spirit": "otter",
    "style": "foundation",
    "active": true
  }
]
```

#### Create Agent

Create a new agent in the world.

**Endpoint:** `POST /api/ecs/agents`

**Request Body:**

```json
{
  "agent_id": "agent-003",
  "spirit": "wolf",
  "style": "foundation",
  "name": "Custom-Name-123"
}
```

**Response:**

```json
{
  "agent_id": "agent-003",
  "name": "Custom-Name-123",
  "spirit": "wolf",
  "style": "foundation",
  "active": true
}
```

### Agent Operations

#### Create Offspring

Create offspring from two parent agents.

**Endpoint:** `POST /api/ecs/agents/offspring`

**Request Body:**

```json
{
  "parent1_id": "agent-001",
  "parent2_id": "agent-002",
  "offspring_id": "offspring-001"
}
```

**Response:**

```json
{
  "agent_id": "offspring-001",
  "name": "Hybrid-Strategist-42",
  "spirit": "fox",
  "style": "foundation",
  "active": true
}
```

#### Find Compatible Mates

Find compatible mates for an agent.

**Endpoint:** `GET /api/ecs/agents/{agent_id}/mates`

**Query Parameters:**

- `max_results` (optional): Maximum number of mates to return (default: 5)

**Example:** `GET /api/ecs/agents/agent-001/mates?max_results=3`

**Response:**

```json
{
  "agent_id": "agent-001",
  "compatible_mates": [
    "agent-002",
    "agent-003",
    "agent-004"
  ]
}
```

#### Analyze Compatibility

Analyze genetic compatibility between two agents.

**Endpoint:** `GET /api/ecs/agents/{agent1_id}/compatibility/{agent2_id}`

**Example:** `GET /api/ecs/agents/agent-001/compatibility/agent-002`

**Response:**

```json
{
  "compatibility": 0.75,
  "analysis": "High genetic compatibility with complementary traits",
  "recommended": true
}
```

#### Get Agent Lineage

Get the family tree and lineage information for an agent.

**Endpoint:** `GET /api/ecs/agents/{agent_id}/lineage`

**Query Parameters:**

- `depth` (optional): Depth of lineage to retrieve (default: 3)

**Example:** `GET /api/ecs/agents/agent-001/lineage?depth=2`

**Response:**

```json
{
  "agent_id": "agent-001",
  "parents": ["parent-001", "parent-002"],
  "children": ["child-001", "child-002"],
  "ancestors": ["ancestor-001", "ancestor-002"],
  "descendants": ["descendant-001", "descendant-002"]
}
```

### Breeding System

#### Enable/Disable Breeding

Enable or disable automatic breeding in the world.

**Endpoint:** `POST /api/ecs/breeding/enable`

**Query Parameters:**

- `enabled` (optional): Whether to enable breeding (default: true)

**Example:** `POST /api/ecs/breeding/enable?enabled=true`

**Response:**

```json
{
  "message": "Automatic breeding enabled"
}
```

#### Get Breeding Statistics

Get comprehensive breeding statistics.

**Endpoint:** `GET /api/ecs/breeding/stats`

**Response:**

```json
{
  "total_agents": 10,
  "mature_agents": 6,
  "total_offspring": 15,
  "average_offspring_per_agent": 1.5
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "detail": "Invalid request parameters"
}
```

### 401 Unauthorized

```json
{
  "detail": "Authentication required"
}
```

### 404 Not Found

```json
{
  "detail": "Agent not found"
}
```

### 503 Service Unavailable

```json
{
  "detail": "ECS service not available"
}
```

### 500 Internal Server Error

```json
{
  "detail": "Internal server error"
}
```

## MCP Server Integration

MCP servers can connect to the ECS API using the provided ECS client service:

```python
from services.ecs_client import ECSClient, ECSConfig
from services.auth_client import AuthClient, AuthConfig

# Create authenticated ECS client
auth_config = AuthConfig(base_url="http://localhost:8000")
auth_client = AuthClient(auth_config)

ecs_config = ECSConfig(base_url="http://localhost:8000")
ecs_client = ECSClient(ecs_config, auth_client)

# Use the client
await ecs_client.start()
agents = await ecs_client.get_agents()
new_agent = await ecs_client.create_agent("agent-004", "eagle", "foundation")
await ecs_client.close()
```

## Rate Limiting

The ECS API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per minute per client
- **Burst Limit**: 10 requests per second
- **Headers**: Rate limit information is included in response headers

## WebSocket Support (Future)

Future versions will include WebSocket support for real-time updates:

- Agent status changes
- Breeding events
- World simulation updates
- Lineage changes

## Versioning

The ECS API follows semantic versioning:

- **Current Version**: v1.0.0
- **Version Header**: `X-API-Version: 1.0.0`
- **Backward Compatibility**: Maintained for at least 2 major versions

---

*This API documentation is part of the Reynard framework's single authoritative ECS World architecture.*
