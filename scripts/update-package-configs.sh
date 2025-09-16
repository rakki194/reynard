#!/bin/bash

# Script to update package.json and tsconfig.json for all new packages

PACKAGES=(
  "caption-multimodal"
  "repository-core"
  "repository-storage"
  "repository-search"
  "repository-multimodal"
  "components-charts"
  "components-themes"
  "components-dashboard"
)

for package in "${PACKAGES[@]}"; do
  echo "Updating ${package}..."

  # Update package.json
  sed -i 's|"main": "./dist/index.js",|"main": "./dist/index.cjs",|g' "packages/${package}/package.json"
  sed -i 's|"build": "vite build && tsc -p tsconfig.json --emitDeclarationOnly",|"build": "vite build && rm -f tsconfig.tsbuildinfo && tsc -p tsconfig.json --declaration --emitDeclarationOnly",|g' "packages/${package}/package.json"

  # Update tsconfig.json
  cat > "packages/${package}/tsconfig.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "composite": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"]
  },
  "include": ["src"],
  "exclude": [
    "dist",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/*.spec.ts",
    "**/*.spec.tsx",
    "**/test-setup.ts",
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.test.tsx"
  ]
}
EOF

  echo "✅ Updated ${package}"
done

echo "🎉 All packages updated!"
