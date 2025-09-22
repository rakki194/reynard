# Tool Configuration PostgreSQL Migration

## 🎯 Objective

Migrate MCP tool configuration from JSON file to PostgreSQL database with FastAPI backend integration.

## 📋 Tasks

### Phase 1: Database Schema & Models

- [ ] Create PostgreSQL schema for tool_categories, tools, and tool_config_history tables
- [ ] Implement SQLAlchemy models in `backend/app/models/tool_config_models.py`
- [ ] Create Pydantic models for API requests/responses
- [ ] Set up database migrations with Alembic

### Phase 2: Service Layer

- [ ] Implement `ToolConfigService` in `backend/app/services/tool_config_service.py`
- [ ] Add CRUD operations for tools and categories
- [ ] Implement JSON sync functionality
- [ ] Add audit trail and history tracking

### Phase 3: FastAPI Endpoints

- [ ] Update `backend/app/api/mcp/tool_config_endpoints.py` to use PostgreSQL
- [ ] Add endpoints: GET /tools, GET /tools/{name}, PUT /tools/{name}, POST /sync-from-json
- [ ] Implement proper error handling and validation
- [ ] Add authentication and authorization

### Phase 4: MCP Server Integration

- [ ] Update `services/mcp-server/services/tool_config_service.py` to use FastAPI backend
- [ ] Replace JSON file operations with HTTP API calls
- [ ] Maintain backward compatibility during transition
- [ ] Add connection pooling and error handling

### Phase 5: Migration & Testing

- [ ] Create migration script `backend/scripts/migrate_tool_config.py`
- [ ] Test migration from existing `tool_config.json`
- [ ] Validate all 69 tools are properly migrated
- [ ] Performance testing and optimization

### Phase 6: Documentation & Deployment

- [ ] Update API documentation
- [ ] Create deployment guide
- [ ] Add monitoring and logging
- [ ] Remove deprecated JSON file handling

## 🎯 Success Criteria

- All 69 tools migrated to PostgreSQL
- FastAPI endpoints fully functional
- MCP server uses PostgreSQL via FastAPI
- Zero downtime migration
- Performance equal or better than JSON
- Complete audit trail for configuration changes

## 🔧 Technical Stack

- **Database**: PostgreSQL (primary `reynard` database)
- **ORM**: SQLAlchemy with async support
- **API**: FastAPI with Pydantic models
- **Migration**: Alembic
- **Integration**: HTTP API calls from MCP server
