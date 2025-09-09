#!/usr/bin/env node

/**
 * Custom ESM loader for docs-generator that resolves imports without extensions
 */

import { pathToFileURL } from 'url';
import { resolve as resolvePath } from 'path';
import { existsSync } from 'fs';

const extensions = ['.js', '.ts', '.mjs', '.json'];

export async function resolve(specifier, context, nextResolve) {
  // If it's a relative import without extension, try to resolve it
  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const parentURL = context.parentURL;
    if (parentURL) {
      const parentPath = new URL(parentURL).pathname;
      const parentDir = parentPath.substring(0, parentPath.lastIndexOf('/'));
      
      for (const ext of extensions) {
        const fullPath = resolvePath(parentDir, specifier + ext);
        if (existsSync(fullPath)) {
          return {
            url: pathToFileURL(fullPath).href,
            shortCircuit: true
          };
        }
      }
    }
  }
  
  // Handle absolute paths that might be relative to project root
  if (specifier.startsWith('packages/') || specifier.startsWith('./packages/')) {
    const projectRoot = '/home/kade/runeset/reynard';
    const fullPath = resolvePath(projectRoot, specifier);
    
    for (const ext of extensions) {
      const pathWithExt = fullPath + ext;
      if (existsSync(pathWithExt)) {
        return {
          url: pathToFileURL(pathWithExt).href,
          shortCircuit: true
        };
      }
    }
  }
  
  // Handle directory imports by looking for index files
  if (specifier.endsWith('/') || (!specifier.includes('.') && !specifier.endsWith('/'))) {
    const parentURL = context.parentURL;
    if (parentURL) {
      const parentPath = new URL(parentURL).pathname;
      const parentDir = parentPath.substring(0, parentPath.lastIndexOf('/'));
      const fullPath = resolvePath(parentDir, specifier);
      
      // Try index files
      for (const ext of extensions) {
        const indexPath = resolvePath(fullPath, 'index' + ext);
        if (existsSync(indexPath)) {
          return {
            url: pathToFileURL(indexPath).href,
            shortCircuit: true
          };
        }
      }
      
      // If it's a directory, try to resolve it as a directory import
      if (existsSync(fullPath)) {
        for (const ext of extensions) {
          const indexPath = resolvePath(fullPath, 'index' + ext);
          if (existsSync(indexPath)) {
            return {
              url: pathToFileURL(indexPath).href,
              shortCircuit: true
            };
          }
        }
      }
    }
  }
  
  // Fall back to default resolution
  return nextResolve(specifier, context);
}
