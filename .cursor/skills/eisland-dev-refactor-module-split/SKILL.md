---
name: eisland-dev-refactor-module-split
author: JNTMTMTM
description: >
  Refactor a monolithic React component file into a standardized module structure with
  components/, hooks/, utils/, and config/ subdirectories. Use this skill whenever the user
  asks to "split", "refactor", "拆分", "拆解", or "restructure" a component file into
  subdirectories, or when they mention organizing code into utils/hooks/config/components folders.
---

# Refactor Module Split

Split a monolithic React component file into a clean module structure with four subdirectories: `components/`, `hooks/`, `utils/`, and `config/`.

## When to use

- A single `.tsx` file has grown large and contains multiple concerns (utility functions, hooks, sub-components, constants)
- The user explicitly asks to split/refactor a component into subdirectories
- The file is a React component that mixes UI rendering, state management, utility logic, and configuration

## Process

### Step 1: Analyze the source file

Read the target file in full. Categorize every piece of code into one of four buckets:

| Bucket | Criteria | Target directory |
|--------|----------|-----------------|
| **Pure functions** | No React hooks, no side effects, deterministic input→output | `utils/` |
| **React hooks** | Uses `useState`, `useEffect`, `useMemo`, `useCallback`, or custom hooks | `hooks/` |
| **Sub-components** | Returns JSX, used within the main component | `components/` |
| **Constants** | `const` values, config keys, i18n keys/defaults, type-only definitions used across modules | `config/` |

Also check if the file's sibling directories already exist (e.g., `components/` or `hooks/` may already have files from prior refactoring). Don't duplicate existing extractions.

### Step 2: Create the extracted files

For each extracted piece, create a new file in the appropriate directory. Every file must include:

1. **License header** — copy the exact GPL-3.0 block from the source file
2. **File-level JSDoc** — `@file`, `@description`, `@author` tags
3. **Function/type JSDoc** — `@param`, `@returns` for all exported functions
4. **Correct imports** — relative paths back to shared types or store slices

Naming conventions:
- `utils/` — camelCase function name as filename (e.g., `findCurrentIndex.ts`, `formatDatetime.ts`)
- `hooks/` — camelCase with `use` prefix (e.g., `useBeijingClock.ts`, `useLyricsSettings.ts`)
- `components/` — PascalCase component name (e.g., `KaraokeSyllableLine.tsx`, `AnnouncementHeader.tsx`)
- `config/` — camelCase descriptive name (e.g., `lyricsConstants.ts`, `announcementDefaults.ts`)

### Step 3: Rewrite the source file

Replace the extracted code in the original file with imports from the new modules. The source file should become a thin composition layer that:
- Imports from `./hooks/`, `./components/`, `./utils/`, `./config/`
- Calls hooks at the top level
- Renders sub-components in JSX
- Contains no extracted logic

### Step 4: Verify

Run these checks in order — all must pass before committing:

```bash
# 1. TypeScript compilation
npx tsc --noEmit --pretty

# 2. Comment standards compliance (file headers, JSDoc)
npm run comment:check

# 3. i18n completeness (all t() keys exist in both zh-CN and en-US)
npm run i18n:check

# 4. Unit tests
npm run test
```

If any check fails, fix the issue before proceeding. Common failures:
- `comment:check` — missing license header, missing `@file`/`@description`/`@author`, missing JSDoc on exported functions
- `i18n:check` — a `t('key')` call references a key not present in both locale files
- `test` — a refactored import path broke a test, or an extracted function changed behavior

### Step 5: Commit

Use a conventional commit message:
```
refactor(<module-name>): extract utils, hooks, components, config from <OriginalFile>

- utils/<name>.ts: <what it does>
- components/<Name>.tsx: <what it does>
- hooks/<name>.ts: <what it does>
- config/<name>.ts: <what it contains>
- <OriginalFile>.ts: simplified from <N> to <M> lines
```

## Directory structure example

```
feature/
├── FeatureContent.tsx          (thin composition layer)
├── components/
│   └── FeatureHeader.tsx       (sub-component)
├── hooks/
│   ├── useFeatureData.ts       (data fetching hook)
│   └── useFeatureSettings.ts   (settings listener hook)
├── utils/
│   └── formatValue.ts          (pure utility function)
└── config/
    └── featureConstants.ts     (i18n keys, store keys, defaults)
```

## Acceptance criteria

Every extracted file MUST satisfy ALL of the following before the refactoring is considered complete.

### Comment standards (references/COMMENT_STANDARDS.md)

| # | Criterion | Check |
|---|-----------|-------|
| C1 | Every `.ts`/`.tsx` file starts with the GPL-3.0 license block (project name, URL, copyright, author, GPL notice) | `npm run comment:check` |
| C2 | Every `.ts`/`.tsx` file has a file-level JSDoc with `@file`, `@description`, `@author` | `npm run comment:check` |
| C3 | Every exported function/class/method has JSDoc with `@param` and `@returns` | `npm run comment:check` |
| C4 | `@author` is set to `鸡哥` (project default) | Visual check |
| C5 | Comments are in Chinese, explain "why" not "what" | Visual check |
| C6 | No comments on simple getters/setters, self-explanatory assignments, or template code | Visual check |

### Frontend standards (references/FRONTEND_STANDARDS.md)

| # | Criterion | Check |
|---|-----------|-------|
| F1 | Use `const` for constants, `let` for reassignable vars, never `var` | `npm run test` (lint) |
| F2 | One variable per declaration | Visual check |
| F3 | No `any` type — use explicit types or `unknown` | `npx tsc --noEmit` |
| F4 | Interface over `type` for object shapes; `type` only for unions/tuples | Visual check |
| F5 | ES6 modules (`import`/`export`), no `require()` | Visual check |
| F6 | Import order: builtins → external → internal (absolute) → parent relative → sibling relative | Visual check |
| F7 | No file extension in import paths | Visual check |
| F8 | Single quotes for JS/TS strings, double quotes for JSX attribute values | Visual check |
| F9 | 2-space indentation | Visual check |
| F10 | Semicolons at end of statements | Visual check |
| F11 | Unix line endings (`\n`) | Visual check |
| F12 | Variables/functions: camelCase; Classes/interfaces/types/enums: PascalCase; Constants: UPPER_SNAKE_CASE | Visual check |
| F13 | React components defined as named function declarations, not anonymous arrow functions | Visual check |
| F14 | No unused `React` import (JSX transform handles it) | `npx tsc --noEmit` |
| F15 | Hooks called only at top level, never in conditions/loops | Visual check |

### i18n completeness

| # | Criterion | Check |
|---|-----------|-------|
| I1 | Every `t('key')` in extracted files has a matching entry in both `zh-CN.json` and `en-US.json` | `npm run i18n:check` |
| I2 | No hardcoded Chinese or English strings in UI code — all wrapped in `t()` | `npm run i18n:check` |

### Behavioral preservation

| # | Criterion | Check |
|---|-----------|-------|
| B1 | TypeScript compiles with zero errors | `npx tsc --noEmit` |
| B2 | All existing tests pass | `npm run test` |
| B3 | No logic changes — the refactored code produces identical behavior | `npm run test` |
| B4 | Every `useEffect` extracted to a hook preserves the same dependency array | Visual check against original |

## Important rules

- **All four directories must exist.** If a directory has no files, create a `.gitkeep` placeholder. The user expects the full structure.
- **Extract ALL hooks.** Every `useEffect`, `useState`, `useMemo`, `useCallback` block in the original file must end up in a hook file. The main component should have zero `useEffect` calls after refactoring (unless the effect is trivially tied to a single prop and extracting it would overcomplicate the code — justify with a comment).
- **Extract ALL pure functions.** If a function has no React hooks and no side effects, it belongs in `utils/`. Don't leave pure functions in the component.
- **Match existing style.** Use the same comment density, naming patterns, and import ordering as the rest of the project.
- **Preserve behavior exactly.** This is a pure structural refactor — no logic changes, no new features, no "improvements" to adjacent code.
- **Relative imports from subdirectories.** A file in `hooks/` that needs a store type uses `../../../../store/types`, not an alias.
- **i18n keys stay in components.** The `t()` calls remain in the JSX; only the default values and key constants move to `config/`.
- **Run all four verification commands before committing.** Do not skip any check. If a check fails, fix it before committing.
