#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist/index.js");

if (!fs.existsSync(distPath)) {
  console.error("❌ dist/index.js not found");
  process.exit(1);
}

let content = fs.readFileSync(distPath, "utf8");

// Remove the problematic 'use' import from solid-js/web
content = content.replace(
  /import { createComponent as x, template as w, insert as p, memo as H, use as he, effect as O, setAttribute as V, mergeProps as me, setStyleProperty as y, className as ee } from "solid-js\/web";/,
  'import { createComponent as x, template as w, insert as p, memo as H, setAttribute as V, mergeProps as me, className as ee } from "solid-js/web";'
);

// Add createEffect import to solid-js imports
content = content.replace(
  /import { createSignal as _, createEffect as E, onCleanup as B, Show as k, onMount as W, splitProps as Q } from "solid-js";/,
  'import { createSignal as _, createEffect as E, onCleanup as B, Show as k, onMount as W, splitProps as Q, createEffect as O } from "solid-js";'
);

// Replace all instances of 'he(' with 'O(' (use -> createEffect)
content = content.replace(/he\(/g, "O(");

// Replace all instances of 'y(' with a no-op function call
content = content.replace(/y\(/g, "(() => {})(");

fs.writeFileSync(distPath, content);
console.log("✅ Fixed SolidJS imports for compatibility with version 1.9.9");
