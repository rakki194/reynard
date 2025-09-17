# Shared Configuration Examples

_Common configuration patterns used across Reynard packages_

## Table of Contents

- [Shared Configuration Examples](#shared-configuration-examples)
  - [Table of Contents](#table-of-contents)
  - [TypeScript Configuration](#typescript-configuration)
    - [Standard tsconfig.json](#standard-tsconfigjson)
    - [Package-Specific Extensions](#package-specific-extensions)
  - [Vite Configuration](#vite-configuration)
    - [Standard vite.config.ts](#standard-viteconfigts)
    - [Package Development Config](#package-development-config)
  - [Version Pinning Strategy](#version-pinning-strategy)
    - [Key Principles](#key-principles)
    - [Version Update Process](#version-update-process)
  - [Package.json Templates](#packagejson-templates)
    - [Core Package Template](#core-package-template)
    - [Application Template](#application-template)
  - [ESLint Configuration](#eslint-configuration)
    - [Standard .eslintrc.json](#standard-eslintrcjson)
  - [Environment Variables](#environment-variables)
    - [Development Environment](#development-environment)
    - [Production Environment](#production-environment)
  - [Backend Configuration](#backend-configuration)
    - [FastAPI Configuration](#fastapi-configuration)
    - [Python Dependencies (pyproject.toml)](#python-dependencies-pyprojecttoml)
    - [Docker Configuration](#docker-configuration)
  - [Common Scripts](#common-scripts)
    - [Package Scripts](#package-scripts)
    - [Workspace Scripts](#workspace-scripts)
  - [Cross-References](#cross-references)

## TypeScript Configuration

### Standard tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### Package-Specific Extensions

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules", "**/*.test.ts"]
}
```

## Vite Configuration

### Standard vite.config.ts

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  server: {
    port: 3001,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "solid-router": ["@solidjs/router"],
          "reynard-core": ["reynard-core"],
          "reynard-components": ["reynard-components"],
        },
      },
    },
  },
});
```

### Package Development Config

```typescript
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    solid(),
    dts({
      insertTypesEntry: true,
      exclude: ["**/*.test.ts", "**/*.test.tsx"],
    }),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ReynardPackage",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
    },
  },
});
```

## Version Pinning Strategy

Reynard uses precise version pinning for all dependencies to ensure reproducible builds and
consistent behavior across environments. This approach eliminates the "works on my machine" problem and
provides predictable dependency resolution.

### Key Principles

- **Exact Versions**: All dependencies use exact version pins (e.g., `"1.9.9"` not `"^1.9.9"`)
- **Latest Stable**: Versions are pinned to the latest stable releases at the time of package creation
- **Workspace Dependencies**: Internal packages use `workspace:*` for development flexibility
- **Peer Dependencies**: Shared dependencies like `solid-js` are specified as peer dependencies with exact versions

### Version Update Process

1. **Regular Audits**: Dependencies are audited and updated regularly
2. **Security Updates**: Critical security updates are applied immediately
3. **Breaking Changes**: Major version updates are tested thoroughly before adoption
4. **Documentation**: All version changes are documented in changelogs

## Package.json Templates

### Core Package Template

```json
{
  "name": "reynard-package-name",
  "version": "0.1.2",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && rm -f tsconfig.tsbuildinfo && tsc -p tsconfig.json --declaration --emitDeclarationOnly",
    "build:types": "tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "peerDependencies": {
    "solid-js": "1.9.9"
  },
  "devDependencies": {
    "@types/node": "24.3.1",
    "typescript": "5.9.2",
    "vite": "7.1.5",
    "vite-plugin-solid": "2.11.8",
    "vitest": "3.2.4"
  }
}
```

### Application Template

```json
{
  "name": "reynard-app",
  "version": "0.1.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite preview",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx,css,json}'",
    "format:check": "prettier --check 'src/**/*.{ts,tsx,css,json}'"
  },
  "dependencies": {
    "solid-js": "1.9.9",
    "reynard-core": "workspace:*",
    "reynard-components": "workspace:*",
    "reynard-themes": "workspace:*",
    "reynard-fluent-icons": "workspace:*",
    "reynard-charts": "workspace:*"
  },
  "devDependencies": {
    "@solidjs/testing-library": "0.8.10",
    "@testing-library/jest-dom": "6.6.4",
    "@types/node": "24.3.1",
    "@types/three": "0.180.0",
    "@vitest/coverage-v8": "3.2.4",
    "happy-dom": "^18.0.1",
    "prettier": "3.6.2",
    "typescript": "5.9.2",
    "vite": "7.1.5",
    "vite-plugin-solid": "2.11.8",
    "vitest": "3.2.4"
  }
}
```

## ESLint Configuration

### Standard .eslintrc.json

```json
{
  "extends": ["eslint:recommended", "@typescript-eslint/recommended", "plugin:solid/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "solid"],
  "rules": {
    "max-lines-per-function": ["error", 140],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  },
  "ignorePatterns": ["dist", "node_modules"]
}
```

## Environment Variables

### Development Environment

```bash
# .env.development
NODE_ENV=development
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_DEBUG=true
```

### Production Environment

```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.(TBD)
VITE_WS_URL=wss://api.(TBD)/ws
VITE_DEBUG=false
```

## Backend Configuration

### FastAPI Configuration

```python
# config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Core settings
    app_name: str = "Reynard API"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "postgresql://user:pass@localhost/reynard"

    # Services
    ollama_base_url: str = "http://localhost:11434"
    rag_enabled: bool = True
    tts_enabled: bool = True

    class Config:
        env_file = ".env"

settings = Settings()
```

### Python Dependencies (pyproject.toml)

```toml
[project]
name = "reynard-backend"
version = "0.1.0"
description = "Reynard Backend - FastAPI-based backend services"
requires-python = ">=3.13"

dependencies = [
    "fastapi",
    "uvicorn[standard]",
    "python-jose[cryptography]",
    "python-dotenv",
    "python-multipart",
    "email-validator",
    "pydantic[email]",
    "slowapi",
    "limits",
    "torch",
    "torchvision",
    "pillow",
    "numpy",
    "asyncio",
    "sqlalchemy",
    "psycopg2-binary",
    "aiohttp",
    "pgvector",
    "argon2-cffi",
    "cryptography",
]

[project.optional-dependencies]
test = [
    "pytest",
    "pytest-asyncio",
    "pytest-cov",
    "httpx",
    "pytest-mock",
    "pytest-xdist",
    "factory-boy",
    "faker",
    "freezegun",
    "responses",
]

dev = [
    "reynard-backend[test]",
    "black",
    "isort",
    "flake8",
    "mypy",
    "pre-commit",
]
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine AS frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM python:3.13-slim AS backend
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
COPY --from=frontend /app/dist ./static

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Common Scripts

### Package Scripts

```json
{
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build && rm -f tsconfig.tsbuildinfo && tsc -p tsconfig.json --declaration --emitDeclarationOnly",
    "build:types": "tsc -p tsconfig.json --emitDeclarationOnly",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:coverage:check": "vitest run --coverage --reporter=verbose",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "lint:fix": "eslint src --fix",
    "clean": "rm -rf dist"
  }
}
```

### Workspace Scripts

```json
{
  "scripts": {
    "build": "pnpm -r build",
    "build:all": "pnpm -r build",
    "dev:frontend": "pnpm --filter templates/starter dev",
    "dev:backend": "cd backend && source venv/bin/activate && python main.py",
    "dev:both": "concurrently \"pnpm run dev:backend\" \"pnpm run dev:frontend\"",
    "test": "pnpm -r test",
    "test:coverage": "pnpm -r test:coverage",
    "test:coverage:check": "pnpm -r test:coverage:check",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "lint:fix": "pnpm -r lint:fix",
    "format": "prettier --write '**/*.{ts,tsx,js,jsx,css,json,md}'",
    "format:check": "prettier --check '**/*.{ts,tsx,js,jsx,css,json,md}'",
    "clean": "pnpm -r clean && rm -rf node_modules"
  }
}
```

## Cross-References

- [TypeScript Modularity Standards](../development/frontend/typescript-modularity-standards.md)
- [SolidJS Naming Conventions](../development/frontend/solidjs-naming-conventions.md)
- [Backend Environment Configuration](../development/backend/environment-configuration.md)
- [Package Architecture](../architecture/patterns/package-exports.md)
