#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all the source files to find SVG imports
const srcDir = path.join(__dirname, '../src');
const typeDeclarations = [];

function findSvgImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const svgImports = content.match(/import\s+\w+\s+from\s+["']@fluentui\/svg-icons\/icons\/[^"']+\.svg\?raw["']/g);
  
  if (svgImports) {
    svgImports.forEach(importLine => {
      const match = importLine.match(/from\s+["']([^"']+)["']/);
      if (match) {
        const modulePath = match[1];
        typeDeclarations.push(`declare module "${modulePath}" {
  const content: string;
  export default content;
}`);
      }
    });
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      findSvgImports(filePath);
    }
  });
}

// Walk through all source files
walkDir(srcDir);

// Generate the type declaration file
const typeFileContent = `/// <reference types="vite/client" />

// SVG imports with ?raw suffix
declare module "*.svg?raw" {
  const content: string;
  export default content;
}

// Fluent UI SVG icon imports
declare module "@fluentui/svg-icons/icons/*.svg?raw" {
  const content: string;
  export default content;
}

// Handle any SVG imports from @fluentui/svg-icons
declare module "@fluentui/svg-icons/icons/*" {
  const content: string;
  export default content;
}

// Generated type declarations for specific imports
${typeDeclarations.join('\n\n')}
`;

// Write the type declaration file
const outputPath = path.join(__dirname, '../src/vite-env.d.ts');
fs.writeFileSync(outputPath, typeFileContent);

console.log(`Generated ${typeDeclarations.length} type declarations in ${outputPath}`);
