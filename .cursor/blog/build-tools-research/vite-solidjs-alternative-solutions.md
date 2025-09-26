# Vite and SolidJS Alternative Solutions

**Date:** January 15, 2025
**Context:** Peer dependency issues with vite-plugin-solid and Vite 7
**Purpose:** Document alternative approaches and workarounds

## Overview

This document explores alternative solutions for integrating SolidJS with Vite when facing compatibility issues, particularly with Vite 7 and outdated plugins.

## Immediate Solutions

### 1. Update vite-plugin-solid ⭐

**Recommended Action:**

```bash
# Update to latest version
pnpm update vite-plugin-solid@latest

# Verify version
pnpm list vite-plugin-solid
```

**Expected Outcome:**

- Latest version (2.11.8) supports Vite 6.x
- May work with Vite 7 despite peer dependency warnings
- Improved stability and bug fixes

### 2. Accept Peer Dependency Warnings

**Strategy:** Ignore warnings and test functionality

```bash
# Test if build works despite warnings
pnpm build
pnpm test
pnpm dev
```

**When This Works:**

- Plugin functionality is compatible despite version mismatch
- No breaking changes in Vite 7 that affect plugin operation
- Build process completes successfully

**Monitoring Required:**

- Watch for runtime errors
- Monitor development experience
- Test all SolidJS features

### 3. Downgrade Vite to Version 6.x

**Conservative Approach:**

```bash
# Downgrade to supported version
pnpm add -D vite@^6.0.0

# Verify compatibility
pnpm list vite
```

**Benefits:**

- Guaranteed compatibility with vite-plugin-solid
- Stable, well-tested ecosystem
- No peer dependency warnings

**Trade-offs:**

- Miss Vite 7 features and improvements
- Potential security updates delayed
- May need to upgrade later

## Alternative Build Tools

### 1. Rollup with SolidJS

**Configuration:**

```javascript
// rollup.config.js
import { defineConfig } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import { babel } from "@rollup/plugin-babel";
import solid from "babel-plugin-solid";

export default defineConfig({
  input: "src/index.js",
  output: {
    file: "dist/bundle.js",
    format: "esm",
  },
  plugins: [
    nodeResolve(),
    babel({
      plugins: [solid],
    }),
  ],
});
```

**Pros:**

- Full control over build process
- No peer dependency conflicts
- Custom optimization options

**Cons:**

- More complex configuration
- Manual HMR setup required
- Less ecosystem support

### 2. esbuild with Custom Configuration

**Setup:**

```javascript
// esbuild.config.js
import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

build({
  entryPoints: ["src/index.js"],
  bundle: true,
  outfile: "dist/bundle.js",
  plugins: [solidPlugin()],
  jsx: "preserve",
  loader: {
    ".jsx": "jsx",
    ".tsx": "tsx",
  },
});
```

**Pros:**

- Extremely fast builds
- Simple configuration
- Good TypeScript support

**Cons:**

- Limited plugin ecosystem
- Manual development server setup
- Less mature SolidJS integration

### 3. Webpack with SolidJS Loader

**Configuration:**

```javascript
// webpack.config.js
const path = require("path");

module.exports = {
  entry: "./src/index.js",
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
```

**Babel Configuration:**

```json
{
  "presets": ["@babel/preset-env", "@babel/preset-typescript"],
  "plugins": ["babel-plugin-solid"]
}
```

**Pros:**

- Mature ecosystem
- Extensive plugin support
- Good development tools

**Cons:**

- Slower than Vite
- More complex configuration
- Larger bundle sizes

## Framework-Specific Alternatives

### 1. SolidStart (Meta-Framework)

**Official SolidJS Framework:**

```bash
# Create new SolidStart project
npx create-solid@latest my-app

# Or add to existing project
pnpm add solid-start
```

**Benefits:**

- Official SolidJS meta-framework
- Built-in Vite integration
- Server-side rendering support
- File-based routing
- API routes

**Configuration:**

```javascript
// vite.config.js
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
});
```

### 2. Astro with SolidJS

**Static Site Generator:**

```bash
# Create Astro project with SolidJS
npm create astro@latest -- --template minimal
pnpm add @astrojs/solid
```

**Configuration:**

```javascript
// astro.config.mjs
import { defineConfig } from "astro/config";
import solid from "@astrojs/solid";

export default defineConfig({
  integrations: [solid()],
});
```

**Benefits:**

- Static site generation
- Multiple framework support
- Excellent performance
- Built-in optimization

### 3. SvelteKit-Style Approach

**Custom Meta-Framework:**

```javascript
// Custom build setup
import { build } from "esbuild";
import { solidPlugin } from "esbuild-plugin-solid";

const devServer = {
  serve: port => {
    // Custom development server
    // with HMR support
  },
};
```

## Development Workflow Alternatives

### 1. Manual HMR Setup

**Custom Development Server:**

```javascript
// dev-server.js
import { createServer } from "vite";
import { solidPlugin } from "vite-plugin-solid";

const server = await createServer({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    hmr: {
      overlay: true,
    },
  },
});

await server.listen();
```

### 2. Watch Mode with External Tools

**File Watching:**

```bash
# Watch for changes and rebuild
pnpm add -D nodemon concurrently

# package.json scripts
{
  "scripts": {
    "dev": "concurrently \"nodemon --watch src --exec 'pnpm build'\" \"pnpm serve\""
  }
}
```

### 3. Docker-Based Development

**Containerized Environment:**

```dockerfile
# Dockerfile.dev
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]
```

## Testing Alternatives

### 1. Vitest with Custom Configuration

**Test Setup:**

```javascript
// vitest.config.js
import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

### 2. Jest with SolidJS Support

**Jest Configuration:**

```javascript
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapping: {
    "^solid-js$": "solid-js/web",
  },
};
```

## Production Deployment Alternatives

### 1. Static Site Generation

**Build for Static Hosting:**

```bash
# Build static assets
pnpm build

# Deploy to CDN
aws s3 sync dist/ s3://my-bucket/
```

### 2. Server-Side Rendering

**SSR with SolidStart:**

```javascript
// app.jsx
import { renderToString } from "solid-js/web";
import App from "./App";

export function render() {
  return renderToString(() => <App />);
}
```

### 3. Edge Runtime Deployment

**Vercel Edge Functions:**

```javascript
// api/hello.js
export default function handler(request) {
  return new Response("Hello from SolidJS!");
}

export const config = {
  runtime: "edge",
};
```

## Migration Strategies

### 1. Gradual Migration

**Phase 1:** Update dependencies

```bash
pnpm update vite-plugin-solid@latest
```

**Phase 2:** Test functionality

```bash
pnpm test
pnpm build
```

**Phase 3:** Monitor for issues

- Watch for runtime errors
- Monitor performance
- Check development experience

### 2. Parallel Development

**Branch Strategy:**

```bash
# Create compatibility branch
git checkout -b vite-7-compatibility

# Test alternative solutions
# Compare performance and stability
```

### 3. Rollback Plan

**Emergency Rollback:**

```bash
# Revert to last working state
git checkout main
pnpm install
```

## Decision Matrix

| Solution       | Complexity | Stability | Performance | Ecosystem |
| -------------- | ---------- | --------- | ----------- | --------- |
| Update Plugin  | Low        | Medium    | High        | High      |
| Downgrade Vite | Low        | High      | Medium      | High      |
| Rollup         | Medium     | High      | High        | Medium    |
| esbuild        | Medium     | Medium    | Very High   | Low       |
| Webpack        | High       | High      | Medium      | High      |
| SolidStart     | Low        | High      | High        | High      |

## Recommendations

### For Immediate Relief

1. **Update vite-plugin-solid** to latest version
2. **Test current setup** despite peer dependency warnings
3. **Monitor for issues** during development

### For Long-term Stability

1. **Consider SolidStart** for new projects
2. **Monitor ecosystem** for Vite 7 support
3. **Plan migration strategy** based on project needs

### For Complex Projects

1. **Evaluate build tool alternatives** based on requirements
2. **Consider custom solutions** for specific needs
3. **Maintain flexibility** in build configuration

## Conclusion

While peer dependency warnings can be concerning, they often don't prevent functionality. The key is to:

1. **Test thoroughly** before making changes
2. **Monitor actively** for real issues
3. **Plan strategically** for long-term stability
4. **Stay informed** about ecosystem developments

The SolidJS ecosystem is actively maintained, and compatibility issues are typically resolved quickly by the community.

## Related Documentation

- [Vite 7 and SolidJS Compatibility Research](./vite-7-solidjs-compatibility-research.md)
- [Peer Dependency Management Best Practices](./peer-dependency-management-best-practices.md)
- [Dependency Update Strategy](./dependency-update-strategy.md)
