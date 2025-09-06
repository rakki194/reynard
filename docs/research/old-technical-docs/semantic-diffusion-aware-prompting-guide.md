# Semantic Diffusion-Aware Prompting Guide for YipYap

## Overview

This guide applies the insights from the SEMANTIC research paper on semantic
diffusion to create effective prompting strategies for working with the YipYap
codebase. The goal is to preserve definitional precision and avoid the
"telephone game" effect that leads to meaning erosion in technical
communication.

## Core Principles from Semantic Diffusion Research

### The Inevitability Paradox

**Principle**: The most useful terms are also the most vulnerable to semantic
diffusion. Terms that are precise, memorable, and relevant are more likely to be
adopted widely, but widespread adoption increases exposure to the mechanisms of
semantic diffusion.

**Application**: When creating prompts for YipYap development, recognize that
popular patterns and terminology will naturally evolve. Design prompts that are
robust against semantic drift while remaining clear and actionable.

### Context Anchoring

**Principle**: Context fragmentation accelerates semantic diffusion. When terms
are used in diverse contexts without clear definitional anchors, the original
meaning becomes increasingly difficult to preserve.

**Application**: Always anchor technical terms in their specific YipYap context.
Reference specific files, modules, or architectural patterns rather than using
generic terminology.

### Definitional Robustness

**Principle**: Definitions should be designed to withstand the pressures of
diffusion through clear boundaries, specific qualifiers, and unambiguous
language.

**Application**: Use precise, bounded definitions in prompts. Avoid broad,
catch-all terms that can be easily misinterpreted or expanded beyond their
intended scope.

## YipYap-Specific Prompting Strategies

### 1. Architecture-Aware Prompting

**Context Anchoring Pattern**:

```markdown
You are working with the YipYap codebase, which follows these architectural
principles:

- **Backend**: Python service-oriented architecture with modular services in
  `app/services/`
- **Frontend**: SolidJS with modular state management in `src/modules/` and
  composables in `src/composables/`
- **100-line rule**: All modules under 100 lines with zero cross-module
  dependencies
- **Single responsibility**: Each module has one clear purpose
- **Comprehensive testing**: 95%+ test coverage for each module

When implementing features, maintain these architectural constraints and follow
established patterns.
```

**Usage**: Include this context in prompts when asking for architectural
decisions or code generation.

### 2. Module-Specific Terminology

**Definitional Robustness Pattern**:

```markdown
In YipYap, use these precise terms:

- **Module**: A focused, single-responsibility unit under 100 lines in
  `src/modules/`
- **Composable**: Reusable reactive logic in `src/composables/` prefixed with
  "use"
- **Context**: Global state management in `src/contexts/` (avoid creating new
  contexts)
- **Service**: Backend service in `app/services/` following the BaseService
  pattern
- **Processor**: Data processing logic in `app/data_access/` for specific
  content types

Avoid generic terms like "component" or "utility" - use the specific YipYap
terminology.
```

**Usage**: Include this terminology guide when asking for code organization or
architecture decisions.

### 3. Semantic Diffusion Prevention Strategies

#### A. Precise Scope Definition

**Before (Vulnerable to Diffusion)**:

```markdown
Create a component for image processing.
```

**After (Diffusion-Resistant)**:

```markdown
Create a SolidJS composable in `src/composables/` named `useImageProcessing.ts`
that:

- Handles image processing operations for the Gallery component
- Integrates with the existing `useUnifiedCaptionGeneration` composable
- Follows the 100-line rule and single responsibility principle
- Includes comprehensive TypeScript interfaces
- Has 95%+ test coverage
```

#### B. Context-Specific Constraints

**Before (Generic)**:

```markdown
Optimize the performance of the application.
```

**After (Context-Anchored)**:

```markdown
Optimize the performance of the YipYap gallery system by:

- Reducing re-renders in the Gallery component (`src/components/Gallery/`)
- Optimizing the `useScrollCoordinator` composable for large datasets
- Improving the virtual selection system in `src/composables/virtual-selection/`
- Maintaining the existing modular architecture patterns
```

#### C. Definitional Boundaries

**Before (Ambiguous)**:

```markdown
Add error handling to the system.
```

**After (Bounded)**:

```markdown
Add error handling to the YipYap caption generation system by:

- Extending the `useUnifiedCaptionGeneration` composable with error states
- Adding error boundaries to the Captioners context
  (`src/contexts/captioners.tsx`)
- Implementing retry logic in the caption generation service
  (`app/services/caption_generation/`)
- Following the existing error handling patterns in
  `src/composables/useAuthFetch.ts`
```

### 4. Code Generation Prompts

#### A. Module Creation

```markdown
Create a new YipYap module following these precise requirements:

**Location**: `src/modules/[moduleName].ts` **Purpose**: [Specific, single
responsibility] **Constraints**:

- Maximum 100 lines
- Zero cross-module dependencies
- Single responsibility principle
- Comprehensive TypeScript interfaces
- 95%+ test coverage requirement

**Integration**:

- Register in `src/modules/registry.ts`
- Add to `src/modules/composition.ts`
- Follow existing module patterns from `src/modules/theme.ts` or
  `src/modules/auth.ts`

**Architecture**:

- Use createSignal/createEffect for reactivity
- Implement config/actions interface pattern
- Include proper cleanup in onCleanup
- Follow the established module composition system
```

#### B. Composable Creation

```markdown
Create a new YipYap composable following these precise requirements:

**Location**: `src/composables/use[FeatureName].ts` **Purpose**: [Specific,
single responsibility] **Constraints**:

- Prefixed with "use" following SolidJS conventions
- Single responsibility principle
- Zero coupling with other composables
- Comprehensive TypeScript interfaces
- Proper resource cleanup

**Integration**:

- Follow patterns from existing composables like `useAuthFetch.ts`
- Use passive event listeners for scroll/touch interactions
- Implement proper error handling
- Include comprehensive testing

**Architecture**:

- Return typed signals, memos, and actions
- Use lazy side-effects with onCleanup
- Accept narrowly scoped options
- Avoid deep config objects
```

#### C. Service Creation

```markdown
Create a new YipYap backend service following these precise requirements:

**Location**: `app/services/[serviceName].py` **Purpose**: [Specific, single
responsibility] **Constraints**:

- Extend BaseService from `app/services/base.py`
- Follow service-oriented architecture patterns
- Implement health checks and lifecycle management
- Include comprehensive error handling

**Integration**:

- Register in service registry
- Follow dependency injection patterns
- Implement proper logging and monitoring
- Include comprehensive testing

**Architecture**:

- Use async/await patterns
- Implement proper resource management
- Follow existing service patterns from `app/services/core/`
- Include health monitoring and status reporting
```

### 5. Testing Prompts

#### A. Module Testing

```markdown
Create comprehensive tests for the YipYap module following these precise
requirements:

**Location**: `src/modules/[moduleName].test.ts` **Coverage Target**: 95%+
**Test Structure**:

- Unit tests for each exported function
- Integration tests for module composition
- Edge case testing for all inputs
- Error condition testing

**Testing Patterns**:

- Follow existing test patterns from `src/modules/theme.test.ts`
- Use SolidJS testing utilities
- Test reactive behavior with createRoot
- Validate TypeScript interfaces

**Assertions**:

- Test signal values and updates
- Test effect triggers and cleanup
- Test action behavior and side effects
- Test error handling and edge cases
```

#### B. Composable Testing

```markdown
Create comprehensive tests for the YipYap composable following these precise
requirements:

**Location**: `src/composables/use[FeatureName].test.tsx` **Coverage Target**:
95%+ **Test Structure**:

- Unit tests for each returned value
- Integration tests for composable behavior
- Event handling tests
- Cleanup and resource management tests

**Testing Patterns**:

- Follow existing test patterns from `useAuthFetch.test.tsx`
- Use createRoot for reactive testing
- Test with different input configurations
- Validate cleanup behavior

**Assertions**:

- Test signal reactivity and updates
- Test memo dependencies and caching
- Test action behavior and side effects
- Test error states and recovery
```

### 6. Documentation Prompts

#### A. Module Documentation

```markdown
Create comprehensive documentation for the YipYap module following these precise
requirements:

**Location**: Update `src/modules/README.md` **Documentation Structure**:

- Purpose and responsibility
- Interface definition
- Usage examples
- Integration patterns
- Testing requirements

**Content Requirements**:

- Clear, precise language
- Code examples with TypeScript
- Integration with existing modules
- Architecture alignment

**Format**:

- Follow existing documentation patterns
- Include code blocks with syntax highlighting
- Reference related modules and composables
- Maintain consistency with established style
```

#### B. API Documentation

```markdown
Create comprehensive API documentation following these precise requirements:

**Location**: `docs/[featureName].md` **Documentation Structure**:

- Overview and purpose
- API endpoints and parameters
- Request/response examples
- Error handling
- Integration patterns

**Content Requirements**:

- Precise parameter definitions
- Clear example usage
- Error code documentation
- Performance considerations

**Format**:

- Follow existing documentation patterns
- Include curl examples
- Reference related services
- Maintain consistency with established style
```

## Semantic Diffusion Prevention Checklist

### Before Writing Prompts

- [ ] **Context Anchoring**: Have I anchored all terms in specific YipYap
      contexts?
- [ ] **Definitional Boundaries**: Have I set clear, bounded definitions for all
      concepts?
- [ ] **Architecture Alignment**: Does the prompt align with YipYap's modular
      architecture?
- [ ] **Terminology Precision**: Am I using YipYap-specific terminology rather
      than generic terms?
- [ ] **Scope Limitation**: Have I avoided broad, catch-all language that could
      be misinterpreted?

### During Prompt Review

- [ ] **Ambiguity Check**: Could any part of this prompt be interpreted
      differently?
- [ ] **Context Verification**: Are all references to specific files, modules,
      or patterns?
- [ ] **Constraint Validation**: Are all constraints clearly stated and bounded?
- [ ] **Integration Clarity**: Is the integration with existing systems clearly
      specified?
- [ ] **Testing Requirements**: Are testing and quality requirements explicitly
      stated?

### After Implementation

- [ ] **Definitional Consistency**: Does the implementation match the original
      prompt intent?
- [ ] **Architecture Compliance**: Does the code follow YipYap's architectural
      principles?
- [ ] **Documentation Alignment**: Does the documentation preserve the original
      definitions?
- [ ] **Testing Coverage**: Do the tests validate the intended behavior?
- [ ] **Integration Verification**: Does the integration work as specified?

## Common Semantic Diffusion Traps

### 1. Generic Terminology

**Trap**: Using generic terms like "component," "utility," or "service" without
YipYap context.

**Prevention**: Always specify the exact YipYap pattern: "SolidJS composable,"
"modular service," "BaseService implementation."

### 2. Broad Scope Definitions

**Trap**: Defining requirements too broadly, allowing interpretation drift.

**Prevention**: Use specific, bounded requirements with clear constraints and
examples.

### 3. Context Fragmentation

**Trap**: Referencing concepts without anchoring them in specific YipYap
contexts.

**Prevention**: Always reference specific files, modules, or architectural
patterns.

### 4. Ambiguous Integration

**Trap**: Vague integration requirements that can be interpreted differently.

**Prevention**: Specify exact integration points, patterns, and constraints.

### 5. Missing Constraints

**Trap**: Failing to specify architectural constraints and quality requirements.

**Prevention**: Always include YipYap-specific constraints like the 100-line
rule, zero dependencies, and 95%+ test coverage.

## Conclusion

By applying the insights from semantic diffusion research to YipYap development,
we can create prompts that preserve definitional precision and avoid the
"telephone game" effect. The key is to anchor all terminology in specific YipYap
contexts, use precise, bounded definitions, and maintain clear architectural
constraints.

Remember: The most useful prompts are also the most vulnerable to semantic
diffusion. By designing prompts with diffusion resistance in mind, we can
maintain clarity and precision throughout the development process.

**Core Takeaway**: In YipYap development, precision is not just a
preference—it's a necessity for maintaining the integrity of our modular,
composable architecture. Every prompt should be designed to withstand the
pressures of interpretation drift while remaining clear and actionable.
