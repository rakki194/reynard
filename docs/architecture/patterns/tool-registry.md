# Tool Registry

Central registry for assistant tools. Manages discovery, permissions, validation, execution, metadata, and stats. Exposed both as a service and as HTTP endpoints.

## Registry

The core registry defines tools with typed parameters and validation rules, enforces permission checks, and provides rich introspection:

- List/search tools (filter by category/tag/permission)
- Get categories/tags and stats
- Validate parameters with structured error output and redaction of sensitive fields
- Execute tools with timeout handling and audit logging for admin tools

- Files:
  - `app/tools/base.py`
  - `app/tools/registry.py`

## Service

`ToolRegistryService` wraps the registry in the service lifecycle and provides health and helper methods (`list_tools`, `get_tool`, `search_tools`, `execute_tool`, etc.).

- File: `app/services/integration/tool_registry_service.py`

## API Endpoints

Prefix: `/api/tools`

- `GET /`: list (query params: `category`, `tag`, `permission`)
- `GET /search?query=`: search by name/description/category/tags
- `GET /categories`: list of categories
- `GET /stats` (admin): registry stats
- `GET /{tool_name}`: tool info
- `POST /{tool_name}/execute`: execute tool with `ToolExecutionRequest`

- File: `app/api/tools.py`

## Notes

- Permission model: `guest` → read; `user` → read/write/execute; `admin` → full
- Parameter validation supports type checks, ranges, lengths, choices, and regex patterns
- Unknown parameters are dropped before validation and defaults are applied before re‑validation
