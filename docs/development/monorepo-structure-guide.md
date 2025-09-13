# 🦊 Reynard Monorepo Structure Guide

This guide provides comprehensive documentation of the Reynard monorepo
tructure, ensuring all agents understand the proper organization and
preventing any confusion about source code placement.

## 🚨 Critical Rule: NO Root-Level `src/` Directory

**IMPORTANT**: The Reynard monorepo does NOT have a root-level `src/` directory. All source code is organized within
individual packages under `packages/`. This is a fundamental architectural principle that must be maintained.

## 📁 Complete Monorepo Structure

```text
reynard/                                       # Monorepo root (NO src/ here)
├── packages/                                  # All source code lives here
│   ├── core/                                  # Core utilities and modules
│   │   ├── src/                               # Package source code
│   │   │   ├── __tests__/                     # Package tests
│   │   │   │   ├── components/                # Component tests
│   │   │   │   ├── utils/                     # Utility tests
│   │   │   │   └── contexts/                  # Context tests
│   │   │   ├── components/                    # Source components
│   │   │   ├── utils/                         # Source utilities
│   │   │   ├── contexts/                      # Context providers
│   │   │   └── index.ts                       # Package entry point
│   │   ├── package.json                       # Package configuration
│   │   ├── tsconfig.json                      # TypeScript configuration
│   │   └── README.md                          # Package documentation
│   ├── components/                            # UI component library
│   │   ├── src/                               # Package source code
│   │   │   ├── __tests__/                     # Package tests
│   │   │   │   ├── ImageViewer.test.tsx
│   │   │   │   ├── Notification.test.tsx
│   │   │   │   ├── Settings.test.tsx
│   │   │   │   └── UploadOverlay.test.tsx
│   │   │   ├── components/                    # UI components
│   │   │   ├── styles/                        # Component styles
│   │   │   └── index.ts                       # Package entry point
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── chat/                                 # Chat messaging system
│   │   ├── src/                              # Package source code
│   │   │   ├── __tests__/                    # Package tests
│   │   │   ├── components/                   # Chat components
│   │   │   ├── composables/                  # Chat composables
│   │   │   └── utils/                        # Chat utilities
│   │   └── package.json
│   ├── rag/                                  # RAG system components
│   ├── auth/                                 # Authentication system
│   ├── charts/                               # Data visualization
│   ├── gallery/                              # File management
│   ├── i18n/                                 # Internationalization
│   ├── testing/                              # Testing utilities
│   └── [other-packages]/                     # Each package is self-contained
├── examples/                                 # Example applications
│   ├── basic-app/                            # Basic example
│   │   ├── src/                              # Example source code
│   │   │   ├── components/                   # Example components
│   │   │   ├── pages/                        # Example pages
│   │   │   └── main.tsx                      # Example entry point
│   │   ├── package.json
│   │   └── README.md
│   ├── comprehensive-dashboard/               # Dashboard example
│   ├── image-caption-app/                    # Caption generation example
│   └── [other-examples]/                      # Each example has its own src/
├── templates/                                 # Project templates
│   ├── starter/                               # Starter template
│   │   ├── src/                               # Template source code
│   │   │   ├── components/                    # Template components
│   │   │   └── main.tsx                       # Template entry point
│   │   └── package.json
│   ├── dashboard/                             # Dashboard template
│   └── portfolio/                             # Portfolio template
├── docs/                                      # Documentation
│   ├── development/                           # Development guides
│   ├── architecture/                          # Architecture documentation
│   ├── guides/                                # User guides
│   └── [other-docs]/                          # Various documentation
├── scripts/                                   # Development scripts
│   ├── dev-setup.sh                           # Development setup
│   ├── i18n-test-all.sh                       # i18n testing
│   └── [other-scripts]/                       # Various scripts
├── e2e/                                       # Integration tests (Playwright)
│   ├── auth.spec.ts                           # Authentication tests
│   └── utils/                                 # E2E test utilities
├── backend/                                   # Python backend (separate from packages)
│   ├── app/                                   # Backend source code
│   │   ├── auth/                              # Authentication backend
│   │   ├── caption_generation/                # Caption generation backend
│   │   └── [other-modules]/                   # Other backend modules
│   ├── tests/                                 # Backend tests
│   │   ├── test_auth/                         # Auth tests
│   │   ├── test_api/                          # API tests
│   │   └── [other-tests]/                     # Other backend tests
│   ├── main.py                                # Backend entry point
│   ├── requirements.txt                       # Python dependencies
│   └── pyproject.toml                         # Python project config
├── third_party/                               # Third-party dependencies
│   ├── pawprint/                              # Pawprint source code for inspiration and reference
│   └── yipyap/                                # YipYap source code for inspiration and reference
├── vitest.global.config.ts                    # Global test configuration
├── package.json                               # Root package configuration
├── pnpm-workspace.yaml                        # Workspace configuration
└── README.md                                  # Main documentation
```

## 🎯 Source Code Organization Rules

### 1. Package Isolation

- Each package under `packages/` is completely self-contained
- Packages have their own `package.json`, `tsconfig.json`, and `README.md`
- No cross-package dependencies except through proper package imports

### 2. No Root `src/` Directory

- **NEVER** create a `src/` directory at the monorepo root
- All source code must be within individual packages
- This prevents confusion and maintains clear boundaries

### 3. Package `src/` Structure

- Source code only exists within `packages/[package-name]/src/`
- Each package follows a consistent internal structure:

  ```text
  packages/[package-name]/src/
  ├── __tests__/                 # Package tests
  ├── components/                # Package components
  ├── utils/                     # Package utilities
  ├── types/                     # TypeScript types
  └── index.ts                   # Package entry point
  ```

### 4. Test Organization

- **Package Tests**: `packages/[package-name]/src/__tests__/`
- **Integration Tests**: `e2e/` (Playwright tests)
- **Backend Tests**: `backend/tests/` (Python tests)
- **No Root Tests**: Never create tests at the monorepo root level

### 5. Backend Separation

- Python backend code is in `backend/` (not in packages)
- Backend has its own structure separate from frontend packages
- Backend tests are in `backend/tests/`

## 📦 Package Types and Purposes

### Core Packages

- **`reynard-core`**: Foundation utilities, notifications, localStorage, validation
- **`reynard-components`**: UI components, modals, tooltips, forms
- **`reynard-themes`**: Theming system with 8 built-in themes
- **`reynard-i18n`**: Internationalization with 37 language support

### Specialized Packages

- **`reynard-chat`**: Real-time chat system with streaming and tool integration
- **`reynard-rag`**: RAG system with EmbeddingGemma integration
- **`reynard-auth`**: Complete authentication system with JWT and security features
- **`reynard-charts`**: Data visualization components built on Chart.js
- **`reynard-gallery`**: Advanced file management with drag-and-drop
- **`reynard-annotating`**: AI-powered caption generation with multiple models
- **`reynard-caption`**: Caption editing UI with tag management
- **`reynard-testing`**: Comprehensive testing utilities and configurations

### Supporting Packages

- **`reynard-floating-panel`**: Advanced floating panel system
- **`reynard-3d`**: Three.js integration for 3D graphics
- **`reynard-monaco`**: Code editor integration
- **`reynard-games`**: Game development utilities

## 🧪 Testing Structure

### Package Tests

Each package has its own test suite in `packages/[package-name]/src/__tests__/`:

- Component tests: `ComponentName.test.tsx`
- Utility tests: `utility-name.test.ts`
- Integration tests: `integration.test.ts`

### Integration Tests

- **Location**: `e2e/`
- **Framework**: Playwright
- **Purpose**: End-to-end testing across packages

### Backend Tests

- **Location**: `backend/tests/`
- **Framework**: pytest
- **Purpose**: Python backend functionality testing

### Global Test Configuration

- **File**: `vitest.global.config.ts` (root level)
- **Purpose**: Global test configuration for all packages

## 🚀 Development Workflow

### Creating a New Package

1. Create directory: `packages/my-new-package/`
2. Initialize package: `pnpm init`
3. Set up structure:

   ```text
   packages/my-new-package/
   ├── src/
   │   ├── __tests__/
   │   ├── components/
   │   ├── utils/
   │   └── index.ts
   ├── package.json
   ├── tsconfig.json
   └── README.md
   ```

### Adding Tests

1. Create test file in: `packages/[package-name]/src/__tests__/`
2. Follow naming convention: `ComponentName.test.tsx`
3. Use utilities from `reynard-testing` package

### Building and Testing

```bash
# Build all packages
pnpm run build

# Test all packages
pnpm test

# Test specific package
cd packages/[package-name]
pnpm test

# Run integration tests
pnpm run test:e2e
```

## 🔧 Configuration Files

### Root Level

- `package.json`: Root package configuration and scripts
- `pnpm-workspace.yaml`: Workspace configuration
- `vitest.global.config.ts`: Global test configuration
- `tsconfig.json`: Root TypeScript configuration

### Package Level

- `packages/[package-name]/package.json`: Package-specific configuration
- `packages/[package-name]/tsconfig.json`: Package-specific TypeScript config
- `packages/[package-name]/README.md`: Package documentation

### Backend Level

- `backend/pyproject.toml`: Python project configuration
- `backend/requirements.txt`: Python dependencies
- `backend/pytest.ini`: Python test configuration

## 🎨 Examples and Templates

### Examples

- **Location**: `examples/[example-name]/src/`
- **Purpose**: Demonstrate package usage
- **Structure**: Each example is a complete application

### Templates

- **Location**: `templates/[template-name]/src/`
- **Purpose**: Project starter templates
- **Structure**: Each template is a complete project scaffold

## 🚫 Common Mistakes to Avoid

### ❌ Don't Do This

- Create a `src/` directory at the monorepo root
- Put source code outside of packages
- Create tests at the monorepo root level
- Mix backend and frontend code in the same package

### ✅ Do This Instead

- Put all source code in `packages/[package-name]/src/`
- Keep packages self-contained
- Put tests in `packages/[package-name]/src/__tests__/`
- Separate backend code in `backend/`

## 🔍 Finding Things

### Source Code

- **Frontend Packages**: `packages/[package-name]/src/`
- **Backend Code**: `backend/app/`
- **Examples**: `examples/[example-name]/src/`
- **Templates**: `templates/[template-name]/src/`

### Tests

- **Package Tests**: `packages/[package-name]/src/__tests__/`
- **Integration Tests**: `e2e/`
- **Backend Tests**: `backend/tests/`

### Documentation

- **Development Guides**: `docs/development/`
- **Architecture Docs**: `docs/architecture/`
- **Package Docs**: `packages/[package-name]/README.md`

### Scripts

- **Development Scripts**: `scripts/`
- **Package Scripts**: `packages/[package-name]/package.json`

## Best Practices

### Package Development

1. Keep packages focused and single-purpose
2. Maintain clear boundaries between packages
3. Use proper TypeScript types and exports
4. Write comprehensive tests for each package
5. Document package APIs clearly

### Testing

1. Write tests for all public APIs
2. Use the unified testing utilities from `reynard-testing`
3. Maintain good test coverage
4. Test both success and failure cases

### Documentation

1. Keep package READMEs up to date
2. Document all public APIs
3. Provide usage examples
4. Update this guide when structure changes

---

_🦊 This structure ensures the Reynard monorepo remains organized, maintainable, and scalable. By following these_
_guidelines, all agents can work effectively within the established architecture without confusion about where code_
_should be placed._
