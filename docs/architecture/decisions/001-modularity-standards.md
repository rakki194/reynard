# ADR-001: Modularity Standards and 140-Line Axiom

## Status

**Accepted** - 2024-01-15

## Context

The Reynard codebase was experiencing significant maintainability issues due to large,
monolithic files. Several files exceeded 500+ lines, making them difficult to understand, test, and
maintain. This led to:

- Reduced code readability and comprehension
- Increased complexity in debugging and testing
- Slower development velocity
- Higher risk of introducing bugs
- Difficulty in code reviews

## Decision

We will adopt the **140-line axiom** as a core architectural principle:

### File Size Limits

- **Source Files**: Maximum 140 lines (excluding blank lines and comments)
- **Test Files**: Maximum 200 lines (excluding blank lines and comments)
- **Functions**: Maximum 50 lines per function
- **Configuration Files**: Maximum 50 lines

### Enforcement Mechanisms

- **ESLint Rules**: Automated linting with `max-lines` and `max-lines-per-function` rules
- **Pre-commit Hooks**: Line count validation before commits
- **CI/CD Integration**: Build failures on violations
- **Code Reviews**: Manual verification during reviews

### Refactoring Patterns

- **Factory Pattern**: For classes handling multiple types/variants
- **Composable Pattern**: For composables with multiple concerns
- **Test Orchestrator Pattern**: For large test files
- **Category-Specific Modules**: For configuration files
- **Functional Modules**: For utility files

## Rationale

### Benefits of the 140-Line Axiom

1. **Improved Readability**: Files are small enough to understand at a glance
2. **Better Maintainability**: Changes are localized and predictable
3. **Enhanced Testability**: Smaller modules are easier to test comprehensively
4. **Clearer Separation of Concerns**: Each file has a single, well-defined responsibility
5. **Improved Code Reviews**: Reviewers can focus on smaller, focused changes
6. **Reduced Cognitive Load**: Developers can understand the full context quickly

### Empirical Evidence

From our refactoring efforts:

- **Thumbnail Generator**: 1009 → 370 lines (63% reduction)
- **P2P Chat**: 980 → 370 lines (62% reduction)
- **File Types Config**: 673 → 50 lines (93% reduction)
- **i18n Test Suite**: 775 → 150 lines (81% reduction)

### Industry Best Practices

- **Unix Philosophy**: "Do one thing and do it well"
- **Single Responsibility Principle**: Each module should have one reason to change
- **Composition over Inheritance**: Prefer small, focused modules
- **Test-Driven Development**: Smaller modules are easier to test

## Consequences

### Positive Consequences

- **Maintainability**: Code is easier to understand and modify
- **Scalability**: Codebase can grow without becoming unwieldy
- **Testability**: Focused modules are easier to test
- **Collaboration**: Multiple developers can work efficiently
- **Quality**: Reduced bug introduction through clearer code

### Negative Consequences

- **Initial Overhead**: Refactoring existing large files requires time
- **File Proliferation**: More files to manage (mitigated by good organization)
- **Import Complexity**: More imports to manage (mitigated by orchestrators)
- **Learning Curve**: Team needs to adapt to new patterns

### Mitigation Strategies

- **Gradual Migration**: Refactor files incrementally
- **Orchestrator Pattern**: Use main files to re-export from modules
- **Clear Documentation**: Provide comprehensive guides and examples
- **Tooling Support**: Automated enforcement reduces manual overhead
- **Team Training**: Educate team on new patterns and benefits

## Implementation

### Phase 1: Foundation (Completed)

- [x] Add ESLint rules for line count enforcement
- [x] Implement pre-commit hooks for validation
- [x] Create refactoring guidelines and patterns
- [x] Document architecture decisions

### Phase 2: Critical Refactoring (Completed)

- [x] Refactor files exceeding 500+ lines
- [x] Implement proven patterns (Factory, Composable, Test Orchestrator)
- [x] Verify functionality and test coverage
- [x] Update documentation

### Phase 3: Systematic Cleanup (Completed)

- [x] Refactor files exceeding 300+ lines
- [x] Implement category-specific modules
- [x] Create functional module architecture
- [x] Maintain backward compatibility

### Phase 4: Final Hunt (Completed)

- [x] Refactor remaining 100-200 line files
- [x] Split large test suites
- [x] Implement prevention mechanisms
- [x] Create comprehensive documentation

## Monitoring and Metrics

### Success Metrics

- **File Size Distribution**: Track distribution of file sizes
- **Refactoring Velocity**: Measure time to refactor files
- **Bug Reduction**: Monitor bug introduction rates
- **Developer Satisfaction**: Survey team on code quality
- **Build Performance**: Monitor build times and bundle sizes

### Quality Gates

- **ESLint Violations**: Zero violations in CI/CD
- **Test Coverage**: Maintain or improve coverage
- **Build Success**: All builds must pass
- **Performance**: No significant performance regressions

## Review and Updates

This ADR will be reviewed:

- **Quarterly**: Assess effectiveness and metrics
- **On Major Changes**: When significant architectural changes occur
- **On Team Feedback**: When team provides substantial feedback

## References

- [Reynard Modularity Patterns](../modularity-patterns.md)
- [Refactoring Checklist](../refactoring-checklist.md)
- [Unix Philosophy](https://en.wikipedia.org/wiki/Unix_philosophy)
- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Clean Code by Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

---

**Decision Makers**: Reynard Architecture Team  
**Stakeholders**: Development Team, QA Team, Product Team  
**Review Date**: 2024-04-15
