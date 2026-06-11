---
name: eisland-dev-git-commit
author: JNTMTMTM
description: >
  Analyze the current git status, review all staged and unstaged changes, and create a commit
  with a proper English commit message following conventional commit format. Use this skill
  whenever the user asks to "commit", "提交", "git commit", "analyze and commit",
  "check git status and commit", or wants to save their current changes to git.
---

# Git Status Analysis and Commit

Analyze the current git working tree, understand what changed and why, then create a well-formatted commit with an English message.

## When to use

- The user asks to commit their current changes
- The user wants to analyze what's changed and create a commit
- The user says "提交", "commit", "git commit", or similar
- The user wants to review and save their work to git

## Process

### Step 1: Check git status

Run these commands to understand the current state:

```bash
git status
git diff --stat
git diff --cached --stat
```

This tells you:
- Which files are modified, added, or deleted
- Which files are staged vs unstaged
- The scope of changes

### Step 2: Analyze the changes

For each changed file, read the diff to understand what was actually changed:

```bash
git diff <file>        # for unstaged changes
git diff --cached <file>  # for staged changes
```

Categorize changes by type:
| Type | Prefix | When to use |
|------|--------|-------------|
| **feat** | `feat` | New feature or user-facing functionality |
| **fix** | `fix` | Bug fix |
| **refactor** | `refactor` | Code restructuring without behavior change |
| **style** | `style` | Formatting, whitespace, semicolons (no logic change) |
| **docs** | `docs` | Documentation only |
| **test** | `test` | Adding or updating tests |
| **chore** | `chore` | Build config, dependencies, tooling |
| **i18n** | `i18n` | Internationalization changes |
| **perf** | `perf` | Performance improvement |

### Step 3: Determine the scope

Look at which directories/modules were affected:
- `src/renderer/components/` → component name as scope
- `src/main/` → main process scope
- `i18n/` → i18n scope
- `docs/` → docs scope

If changes span multiple unrelated areas, consider making separate commits.

### Step 4: Stage changes

If files are not yet staged, stage them:

```bash
git add <files>
```

Or if the user wants to commit everything:

```bash
git add -A
```

### Step 5: Create the commit message

Use conventional commit format:

```
<type>(<scope>): <subject>

<body (optional)>
```

**Rules:**
- Subject line: imperative mood, lowercase, no period at end, max 72 chars
- Body (if needed): explain *why* not *what* (the diff shows what)
- Use English for all commit messages
- Reference issue numbers if applicable (e.g., `Closes #123`)

**Examples:**
```
feat(clipboard): add keyboard shortcuts for history navigation

fix(island): resolve drag position offset on high-DPI screens

refactor(stt): extract hooks from SttContent into separate files

docs(readme): update installation instructions for Windows

i18n(en-US): add missing translation keys for settings page
```

### Step 6: Commit

Create the commit:

```bash
git commit -m "<commit message>"
```

For multi-line messages:

```bash
git commit -m "<subject>" -m "<body>"
```

### Step 7: Verify

Confirm the commit was created:

```bash
git log -1 --oneline
```

## Output

Return to the user:
- The commit hash (short form)
- The commit message
- A brief summary of what was committed (file count, change types)

## Edge cases

- **No changes**: If `git status` shows nothing to commit, tell the user
- **Merge conflicts**: If conflicts exist, inform the user and don't commit
- **User specifies message**: If the user provides a specific commit message, use it (but still suggest improvements if it doesn't follow conventions)
- **Multiple logical changes**: Suggest splitting into separate commits if changes are unrelated
- **Untracked files**: Ask the user if they want to include new files

## Important rules

- **Always use English** for commit messages, regardless of the user's language
- **Follow conventional commits** format strictly
- **Never commit without reviewing** the actual diff content
- **Match the project's existing style** — check recent commits with `git log --oneline -10` for reference
