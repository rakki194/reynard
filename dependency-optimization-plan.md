# Reynard Monorepo Dependency Optimization Plan

## 🦦 Current State Analysis

### Key Metrics

- **601 internal dependencies** across monorepo
- **59 packages** with internal dependencies
- **6 external dependencies** (solid-js, three, etc.)
- **Heavy interdependency clusters** in key packages

### Critical Issues

1. **Heavy Dependency Packages**
   - `reynard-caption`: 12 dependencies
   - `reynard-unified-repository`: 8 dependencies
   - `reynard-components`: 5 dependencies

2. **Circular Dependencies**
   - `reynard-core` → `reynard-connection` → `reynard-validation`
   - `reynard-components` → `reynard-charts` → `reynard-core`

3. **Inconsistent Dependency Management**
   - Mixed `workspace:*` and `link:packages/...` usage
   - Inconsistent peer dependency patterns

## 🎯 Optimization Strategy

### Phase 1: Immediate Optimizations (Week 1)

#### 1.1 Standardize Workspace Protocol

**Goal**: Convert all internal dependencies to `workspace:*`

**Actions**:

```bash
# Find all packages using link: protocol
find packages -name "package.json" -exec grep -l "link:packages/" {} \;

# Convert to workspace: protocol
# Example: "reynard-core": "link:packages/core" → "reynard-core": "workspace:*"
```

**Benefits**:

- Consistent dependency resolution
- Better pnpm optimization
- Cleaner package.json files

#### 1.2 Optimize Peer Dependencies

**Goal**: Move shared dependencies to peer dependencies

**Target Packages**:

- `solid-js` (used by 95% of packages)
- `three` (used by 3d, components, charts)
- `@types/three` (used by 3d, components)

**Implementation**:

```json
{
  "peerDependencies": {
    "solid-js": "1.9.9",
    "three": "^0.180.0"
  },
  "peerDependenciesMeta": {
    "solid-js": {
      "optional": false
    },
    "three": {
      "optional": true
    }
  }
}
```

#### 1.3 Remove Circular Dependencies

**Goal**: Break circular dependency chains

**Critical Chains**:

1. `reynard-core` → `reynard-connection` → `reynard-validation`
2. `reynard-components` → `reynard-charts` → `reynard-core`

**Solutions**:

- Extract shared interfaces to separate packages
- Use dependency injection patterns
- Create shared utility packages

### Phase 2: Package Splitting (Week 2-3)

#### 2.1 Split `reynard-caption` Package

**Current**: 12 dependencies, monolithic structure

**Proposed Split**:

```
reynard-caption/
├── reynard-caption-core/          # Core caption logic
├── reynard-caption-ui/            # UI components
├── reynard-caption-editor/        # Monaco editor integration
└── reynard-caption-multimodal/    # Audio/video/image integration
```

**Dependencies per Package**:

- `reynard-caption-core`: 2 deps (reynard-core, solid-js)
- `reynard-caption-ui`: 3 deps (reynard-caption-core, reynard-components, reynard-fluent-icons)
- `reynard-caption-editor`: 2 deps (reynard-caption-core, reynard-monaco)
- `reynard-caption-multimodal`: 4 deps (reynard-caption-core, reynard-audio, reynard-video, reynard-image)

#### 2.2 Modularize `reynard-components`

**Current**: 5 dependencies, large component library

**Proposed Split**:

```
reynard-components/
├── reynard-components-core/       # Basic components
├── reynard-components-charts/     # Chart components
├── reynard-components-3d/         # 3D components
└── reynard-components-themes/     # Theme-aware components
```

#### 2.3 Decompose `reynard-unified-repository`

**Current**: 8 dependencies, complex repository management

**Proposed Split**:

```
reynard-unified-repository/
├── reynard-repository-core/       # Core repository logic
├── reynard-repository-storage/    # Storage abstractions
├── reynard-repository-search/     # Search functionality
└── reynard-repository-multimodal/ # Multimodal data handling
```

### Phase 3: Architectural Improvements (Week 4)

#### 3.1 Create Shared Utility Packages

**New Packages**:

```
reynard-shared/
├── reynard-shared-types/          # Common TypeScript types
├── reynard-shared-utils/          # Utility functions
├── reynard-shared-constants/      # Constants and enums
└── reynard-shared-interfaces/     # Common interfaces
```

#### 3.2 Implement Dependency Injection

**Goal**: Reduce direct dependencies through DI patterns

**Implementation**:

- Create service registry packages
- Use factory patterns for component creation
- Implement plugin architecture for extensibility

#### 3.3 Extract Common Interfaces

**Goal**: Create clear boundaries between packages

**New Interface Packages**:

```
reynard-interfaces/
├── reynard-interfaces-api/        # API contracts
├── reynard-interfaces-ui/         # UI component contracts
├── reynard-interfaces-data/       # Data model contracts
└── reynard-interfaces-services/   # Service contracts
```

## 📊 Expected Outcomes

### Before Optimization

- **601 internal dependencies**
- **59 packages** with internal deps
- **Average 10.2 deps per package**
- **3 circular dependency chains**

### After Optimization

- **~300 internal dependencies** (50% reduction)
- **~35 packages** with internal deps (40% reduction)
- **Average 5.8 deps per package** (43% reduction)
- **0 circular dependency chains**

### Benefits

1. **Faster Build Times**: Reduced dependency resolution
2. **Better Tree Shaking**: Smaller, focused packages
3. **Improved Maintainability**: Clear package boundaries
4. **Enhanced Reusability**: Independent, composable packages
5. **Reduced Bundle Size**: Eliminate unused dependencies

## 🛠️ Implementation Scripts

### Script 1: Convert to Workspace Protocol

```bash
#!/bin/bash
# convert-to-workspace.sh

find packages -name "package.json" -exec sed -i 's/"reynard-\([^"]*\)": "link:packages\/\([^"]*\)"/"reynard-\1": "workspace:*"/g' {} \;
```

### Script 2: Analyze Dependency Usage

```bash
#!/bin/bash
# analyze-deps.sh

echo "=== Package Dependency Analysis ==="
for pkg in packages/*/package.json; do
    name=$(jq -r '.name' "$pkg")
    deps=$(jq -r '.dependencies | keys[]' "$pkg" 2>/dev/null | grep "reynard-" | wc -l)
    echo "$name: $deps internal dependencies"
done | sort -k2 -nr
```

### Script 3: Detect Circular Dependencies

```bash
#!/bin/bash
# detect-circular.sh

pnpm list --depth=10 | grep -E "reynard-" | awk '{print $2}' | sort | uniq -c | sort -nr
```

## 🎯 Success Metrics

1. **Dependency Count**: < 300 internal dependencies
2. **Package Independence**: < 6 deps per package average
3. **Build Time**: 30% reduction in build time
4. **Bundle Size**: 25% reduction in bundle size
5. **Circular Dependencies**: 0 circular chains

## 📅 Timeline

- **Week 1**: Phase 1 (Immediate Optimizations)
- **Week 2-3**: Phase 2 (Package Splitting)
- **Week 4**: Phase 3 (Architectural Improvements)
- **Week 5**: Testing and Validation

## 🔍 Monitoring

### Daily Checks

- Run dependency analysis script
- Monitor build times
- Check for new circular dependencies

### Weekly Reviews

- Review package splitting progress
- Validate bundle size improvements
- Assess maintainability improvements

---

_Generated by Cascade-Guardian-15 - Your Strategic Otter Specialist_ 🦦
