/**
 * 🦊 Reynard Queue Watcher Exclusion Pattern Tests
 *
 * Tests for file exclusion pattern matching.
 */

import { shouldExcludeFile } from "../file-utils.js";

describe("File Exclusion Patterns", () => {
  const testCases = [
    // Should be excluded
    { path: "/home/user/project/backend/.mypy_cache/3.13/main.meta.json", shouldExclude: true },
    { path: "/home/user/project/backend/__pycache__/module.pyc", shouldExclude: true },
    { path: "/home/user/project/node_modules/package/index.js", shouldExclude: true },
    { path: "/home/user/project/dist/bundle.js", shouldExclude: true },
    { path: "/home/user/project/build/output.js", shouldExclude: true },
    { path: "/home/user/project/.git/HEAD", shouldExclude: true },
    { path: "/home/user/project/.vscode/settings.json", shouldExclude: true },
    { path: "/home/user/project/coverage/lcov.info", shouldExclude: true },
    { path: "/home/user/project/.pytest_cache/v/cache/lastfailed", shouldExclude: true },
    { path: "/home/user/project/.tox/py39/lib/python3.9/site-packages/", shouldExclude: true },
    { path: "/home/user/project/.coverage", shouldExclude: true },
    { path: "/home/user/project/.eggs/setuptools.egg-info/", shouldExclude: true },
    { path: "/home/user/project/reynard.core.egg-info/", shouldExclude: true },
    { path: "/home/user/project/test-results/results.xml", shouldExclude: true },
    { path: "/home/user/project/playwright-report/index.html", shouldExclude: true },
    { path: "/home/user/project/dombench-results/benchmark.json", shouldExclude: true },
    { path: "/home/user/project/results/test-output.log", shouldExclude: true },
    { path: "/home/user/project/.tsbuildinfo", shouldExclude: true },
    { path: "/home/user/project/pnpm-lock.yaml", shouldExclude: true },
    { path: "/home/user/project/package-lock.json", shouldExclude: true },
    { path: "/home/user/project/yarn.lock", shouldExclude: true },
    { path: "/home/user/project/.env", shouldExclude: true },
    { path: "/home/user/project/.env.local", shouldExclude: true },
    { path: "/home/user/project/.DS_Store", shouldExclude: true },
    { path: "/home/user/project/Thumbs.db", shouldExclude: true },
    { path: "/home/user/project/file.pyc", shouldExclude: true },
    { path: "/home/user/project/file.pyo", shouldExclude: true },
    { path: "/home/user/project/file.pyd", shouldExclude: true },
    { path: "/home/user/project/file.so", shouldExclude: true },
    { path: "/home/user/project/file.dylib", shouldExclude: true },
    { path: "/home/user/project/file.dll", shouldExclude: true },
    { path: "/home/user/project/file.exe", shouldExclude: true },
    { path: "/home/user/project/file.cache", shouldExclude: true },
    { path: "/home/user/project/file.tmp", shouldExclude: true },
    { path: "/home/user/project/file.temp", shouldExclude: true },
    { path: "/home/user/project/file.log", shouldExclude: true },
    { path: "/home/user/project/file.pid", shouldExclude: true },
    { path: "/home/user/project/file.lock", shouldExclude: true },
    { path: "/home/user/project/file.swp", shouldExclude: true },
    { path: "/home/user/project/file.swo", shouldExclude: true },
    { path: "/home/user/project/file~", shouldExclude: true },
    
    // Should NOT be excluded
    { path: "/home/user/project/src/main.ts", shouldExclude: false },
    { path: "/home/user/project/src/components/Button.tsx", shouldExclude: false },
    { path: "/home/user/project/src/utils/helper.js", shouldExclude: false },
    { path: "/home/user/project/src/app.py", shouldExclude: false },
    { path: "/home/user/project/README.md", shouldExclude: false },
    { path: "/home/user/project/docs/guide.mdx", shouldExclude: false },
    { path: "/home/user/project/package.json", shouldExclude: false },
    { path: "/home/user/project/config.yaml", shouldExclude: false },
    { path: "/home/user/project/styles.css", shouldExclude: false },
    { path: "/home/user/project/index.html", shouldExclude: false },
    { path: "/home/user/project/src/__tests__/test.ts", shouldExclude: false },
    { path: "/home/user/project/src/__tests__/test-utils.tsx", shouldExclude: false },
  ];

  testCases.forEach(({ path, shouldExclude }) => {
    test(`should ${shouldExclude ? 'exclude' : 'not exclude'} ${path}`, () => {
      const result = shouldExcludeFile(path);
      expect(result).toBe(shouldExclude);
    });
  });
});
