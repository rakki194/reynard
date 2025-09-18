#!/bin/bash

# 🦊 Script to refactor remaining Playwright configs to use unified results structure

echo "🦊 Refactoring remaining Playwright configs..."

# List of configs to refactor
configs=(
    "configs/playwright.config.performance.ts"
    "configs/playwright.config.penetration.ts" 
    "configs/playwright.config.components.ts"
    "configs/playwright.config.dom.ts"
)

for config in "${configs[@]}"; do
    echo "📝 Refactoring $config..."
    
    # Add import and results manager initialization
    sed -i '/import { defineConfig, devices } from "@playwright\/test";/a\
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";\
\
// 🦊 Initialize results manager\
const resultsManager = createResultsManager(TEST_TYPES.'"$(echo $config | sed 's/.*playwright\.config\.\([^.]*\)\.ts/\U\1/')"', {\
  environment: process.env.NODE_ENV || "development",\
  branch: process.env.GIT_BRANCH || "unknown",\
  commit: process.env.GIT_COMMIT || "unknown"\
});\
\
// Create directories and get paths\
const resultsPaths = resultsManager.createDirectories();' "$config"
    
    echo "✅ Refactored $config"
done

echo "🦊 All configs refactored!"
