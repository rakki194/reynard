# Archive Documentation

This directory contains archived documentation that is no longer actively maintained or relevant to the current Reynard modular framework.

## Structure

### Obsolete Documentation

- **`frontend-dashboard-suggestions.md`** - Old frontend dashboard suggestions (monolithic architecture)
- **`state-patterns.md`** - Old state management patterns (pre-modular)
- **`service-lifecycle.md`** - Old service lifecycle documentation (pre-modular)
- **`service-runbook-snippet.md`** - Old service runbook (pre-modular)
- **`README.md`** - Original old-technical-docs README

## Archive Policy

### What Gets Archived

- Documentation referencing old monolithic architecture
- Outdated implementation patterns
- Superseded by new modular architecture
- No longer relevant to current system design

### Archive Maintenance

- Archived docs are kept for historical reference
- No active maintenance or updates
- May be referenced for migration purposes
- Consider for removal in future cleanup cycles

## Migration Notes

When migrating from old patterns to new modular architecture:

1. **State Management**: Old context patterns → New composable patterns
2. **Service Architecture**: Monolithic services → Modular packages
3. **Frontend Structure**: Single app context → Modular component system
4. **Backend Services**: Monolithic backend → Service-oriented architecture

## Historical Context

These archived documents represent the evolution from:

- **YipYap CMS** (monolithic) → **Reynard Framework** (modular)
- **Single context** → **Modular composables**
- **Monolithic services** → **Package-based architecture**

## Future Cleanup

Consider removing archived documentation after:

- Migration to modular architecture is complete
- No historical reference value remains
- New documentation fully covers the same topics
