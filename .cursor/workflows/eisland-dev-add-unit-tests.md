export const meta = {
  name: 'eisland-dev-add-unit-tests',
  author: 'JNTMTMTM',
  description: 'Discover testable untested .ts files and generate unit tests for them',
  phases: [
    { title: 'Discover', detail: 'Scan for testable .ts files without tests' },
    { title: 'Generate', detail: 'Write test files following project conventions' },
    { title: 'Verify', detail: 'Run vitest and fix failures' },
    { title: 'Commit', detail: 'Git commit new test files' },
  ],
}

const DISCOVER_SCHEMA = {
  type: 'object',
  properties: {
    files: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          description: { type: 'string' },
          exports: { type: 'array', items: { type: 'string' } },
        },
        required: ['file', 'description', 'exports'],
      },
    },
  },
  required: ['files'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    totalTests: { type: 'number' },
    passed: { type: 'number' },
    failed: { type: 'number' },
    details: { type: 'string' },
  },
  required: ['totalTests', 'passed', 'failed'],
}

// Phase 1: Discover testable files
phase('Discover')
const discoverResult = await agent(
  `You are scanning the eIsland project to find all .ts source files that can have unit tests added.

STEP 1: Use Glob to find ALL .ts files under src/ (exclude .tsx, .d.ts). Pattern: "src/**/*.ts"
STEP 2: Use Glob to find ALL existing test files. Pattern: "src/**/*.test.ts"
STEP 3: For each .ts file from step 1, check if a test already exists. The project convention is <dir>/test/<basename>.test.ts (check both that and <dir>/<basename>.test.ts).
STEP 4: For each UNTESTED .ts file, READ it and determine testability:

INCLUDE files that have:
- Pure exported functions with logic (calculations, parsing, transformations)
- Configuration objects/maps with meaningful structure
- Zustand slice creators (state management logic)
- API call wrappers (can be mocked)
- Utility/helper functions
- Game logic (2048, gomoku, etc.)
- Service classes with testable methods
- IPC handler registration (can mock electron/ipcMain)

EXCLUDE files that are:
- Type-only exports (only interfaces/types/enums, no runtime functions)
- Barrel re-exports (just "export * from ..." or "export { X } from ...")
- React hooks (filename matches use*.ts AND imports from 'react')
- Pure Electron window management (BrowserWindow creation, tray setup)
- Entry points (main.tsx, index.ts that just bootstraps)
- Files with only 1-2 trivial re-exports

STEP 5: Return a JSON object with "files" array. Each entry:
- "file": relative path from project root (e.g. "src/renderer/utils/foo.ts")
- "description": one-line summary of what the file does
- "exports": array of exported function/class/constant names to test

Be THOROUGH. Check ALL directories:
- src/main/ (utils, config, services, ipc handlers, clipboard, music, system, log)
- src/renderer/api/ (lyrics, user, weather, etc.)
- src/renderer/store/ (slices, utils, constants, index)
- src/renderer/utils/ (audio, security, theme, timeUtils, etc.)
- src/renderer/components/config/ (island config, window config, etc.)
- src/renderer/components/states/*/utils/ (overview utils, game logic, etc.)
- src/renderer/components/states/maxExpand/components/games/ (2048, gomoku logic)
- src/renderer/i18n/
- src/renderer/assets/
- src/preload/`,
  { phase: 'Discover', schema: DISCOVER_SCHEMA }
)

const testableFiles = discoverResult.files
log(`Found ${testableFiles.length} testable files without tests`)

if (testableFiles.length === 0) {
  log('No testable files found. Exiting.')
  return { added: 0 }
}

// Phase 2: Generate tests
phase('Generate')

// Read an example test for conventions reference
const exampleResult = await agent(
  'Read the file src/renderer/store/slices/test/weatherSlice.test.ts and return its FULL content. Also read src/renderer/utils/weatherText/index.test.ts and return its FULL content. These are reference examples of test conventions.',
  { phase: 'Generate' }
)

await pipeline(
  testableFiles,
  file => agent(
    `Write a unit test for "${file.file}".

FILE INFO:
- Path: ${file.file}
- Description: ${file.description}
- Exports to test: ${file.exports.join(', ')}

CONVENTIONS (MUST follow):
1. Test location: <dir>/test/<basename>.test.ts (create test/ subdirectory if needed)
   Example: src/renderer/utils/foo.ts -> src/renderer/utils/test/foo.test.ts
2. Import: import { describe, it, expect, vi, beforeEach } from 'vitest'
3. Mocking: use vi.hoisted() for mock variables, then vi.mock() to wire them
4. Structure: describe/it blocks (NOT test)
5. Mock reset: project has clearMocks/restoreMocks in vitest config, no manual reset needed
6. License header: GPL-3.0 + @file/@description/@author JSDoc block (author: "鸡哥")
7. Mock ALL external dependencies (electron, fs, path, node modules)
8. Mock project-internal imports that have side effects
9. Test: happy path, edge cases, error handling, boundary conditions
10. DO NOT import the real module if it has side effects at import time - use dynamic import with vi.resetModules() if needed

EXAMPLE CONVENTIONS FROM PROJECT:
- Use vi.hoisted() pattern:
  const { someMock } = vi.hoisted(() => ({ someMock: vi.fn() }))
  vi.mock('./module', () => ({ default: someMock }))
- For Zustand slices, create a helper that simulates setState/getState
- For API calls, mock fetch/axios
- For IPC handlers, capture the registered handler and call it directly

STEPS:
1. Read the source file "${file.file}" using the Read tool
2. Analyze its dependencies and logic
3. Write comprehensive tests covering all exports
4. Write the test file to the correct path using the Write tool
5. Make sure all imports are properly mocked - no unhandled side effects

CRITICAL: If the file imports from 'electron', mock the entire electron module. If it imports from other project modules that have side effects (like module-level initialization), mock those too. The goal is to test ONLY the file's own logic in isolation.`,
    { label: `test:${file.file}`, phase: 'Generate' }
  )
)

// Phase 3: Verify
phase('Verify')
const verifyResult = await agent(
  `Run all tests with: npx vitest run --reporter=verbose 2>&1

If any tests FAIL:
1. Read the error output carefully
2. For each failing test file, read both the test file and its source file
3. Fix the test (usually: wrong mock setup, missing dependency mock, wrong import path, incorrect assertion)
4. Re-run tests to verify the fix
5. Repeat up to 3 rounds of fixes

Common fixes needed:
- Module not mocked: add vi.mock('module-name', ...)
- Import path wrong: check the relative path
- Async not awaited: add await
- Mock not returning expected shape: check the source file's actual usage
- vi.hoisted variable not used in vi.mock: make sure the variable is referenced

Return the final vitest output and summary.`,
  { phase: 'Verify', schema: VERIFY_SCHEMA }
)

log(`Test results: ${verifyResult.passed} passed, ${verifyResult.failed} failed out of ${verifyResult.totalTests}`)

// Phase 4: Commit
phase('Commit')
await agent(
  `Stage and commit all new test files:
1. Run: git add -A
2. Run: git status --short to see what's being committed
3. Run: git commit -m "test: add unit tests for previously untested source files"
4. Return the commit hash and list of new test files added.`,
  { phase: 'Commit' }
)

log('All new test files committed successfully')
return { added: testableFiles.length, passed: verifyResult.passed, failed: verifyResult.failed }
