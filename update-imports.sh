#!/bin/bash

# Script to update composable imports across the Reynard codebase

echo "🦊> Updating composable imports to use reynard-composables package..."

# Update bounding box imports
find packages/boundingbox -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useBoundingBoxes'\''|from '\''reynard-composables'\''|g'
find packages/boundingbox -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useBoxMove'\''|from '\''reynard-composables'\''|g'
find packages/boundingbox -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useBoxResize'\''|from '\''reynard-composables'\''|g'

# Update 3D imports
find packages/3d -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useThreeJSVisualization'\''|from '\''reynard-composables'\''|g'
find packages/3d -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/usePointCloud'\''|from '\''reynard-composables'\''|g'
find packages/3d -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useThreeJSAnimations'\''|from '\''reynard-composables'\''|g'

# Update chat imports
find packages/chat -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useChat'\''|from '\''reynard-composables'\''|g'
find packages/chat -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useP2PChat'\''|from '\''reynard-composables'\''|g'

# Update gallery imports
find packages/gallery -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useFileUpload'\''|from '\''reynard-composables'\''|g'
find packages/gallery -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useGalleryState'\''|from '\''reynard-composables'\''|g'

# Update auth imports
find packages/auth -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useAuth'\''|from '\''reynard-composables'\''|g'
find packages/auth -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/usePasswordStrength'\''|from '\''reynard-composables'\''|g'

# Update settings imports
find packages/settings -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useSettings'\''|from '\''reynard-composables'\''|g'

# Update monaco imports
find packages/monaco -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useMonacoShiki'\''|from '\''reynard-composables'\''|g'
find packages/monaco -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useLanguageDetection'\''|from '\''reynard-composables'\''|g'

# Update error-boundaries imports
find packages/error-boundaries -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useErrorBoundary'\''|from '\''reynard-composables'\''|g'
find packages/error-boundaries -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useErrorReporting'\''|from '\''reynard-composables'\''|g'

# Update features imports
find packages/features -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i 's|from '\''\.\./composables/useFeatures'\''|from '\''reynard-composables'\''|g'

echo "✅ Import updates completed!"
