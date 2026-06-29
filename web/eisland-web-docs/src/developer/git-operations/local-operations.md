---
title: Local Git Operations
icon: terminal
---

# Local Git Operations

:::info
This document covers local Git commands and workflows used in eIsland development, including branching, committing, merging, checkout, rebasing, and history management. For environment setup (Git installation, repository cloning, remote configuration), see [Frontend Setup](/developer/environment-setup/frontend-setup.md) or [Backend Setup](/developer/environment-setup/backend-setup.md).
:::

## Prerequisites

Before following this guide, ensure you have:

| Requirement | Description | Setup Guide |
|-------------|-------------|-------------|
| **Git installed** | Version 2.40+ recommended | [Frontend Setup](/developer/environment-setup/frontend-setup.md#prerequisites) |
| **Repository cloned** | Your fork with `upstream` remote configured | [Frontend Setup — Project Setup](/developer/environment-setup/frontend-setup.md#project-setup) |
| **Dev branch checked out** | Local `dev` synced with `upstream/dev` | [Frontend Setup — Switch to Dev Branch](/developer/environment-setup/frontend-setup.md#switch-to-dev-branch) |

:::warning
All examples in this document assume you are in the project root directory and have configured the `upstream` remote pointing to the original repository. If you have not completed the environment setup, do that first.
:::

## Branching Strategy

The eIsland project uses a **feature-branch workflow** centered on the `dev` branch.

### Branch Naming Conventions

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/dynamic-island-animation` |
| `fix/` | Bug fixes | `fix/login-token-expiry` |
| `refactor/` | Code restructuring | `refactor/extract-auth-module` |
| `docs/` | Documentation changes | `docs/update-api-spec` |
| `test/` | Test additions or fixes | `test/add-user-service-tests` |
| `chore/` | Build, CI, dependency updates | `chore/upgrade-spring-boot` |

:::tip
Use lowercase-kebab-case for branch names. Keep them short and descriptive — they should answer "what is this branch about?" at a glance.
:::

### Create a Feature Branch

Always branch from the latest `dev`:

```bash
# Ensure dev is up to date
git checkout dev
git pull upstream dev

# Create and switch to a new branch
git checkout -b feat/your-feature-name
```

:::info
`git checkout -b` is a shorthand for `git branch <name>` followed by `git checkout <name>`. It creates the branch and switches to it in one step.
:::

### List Branches

```bash
# List local branches (* marks current)
git branch

# List all branches (local + remote)
git branch -a

# List remote branches only
git branch -r
```

### Delete a Branch

```bash
# Delete a merged local branch
git branch -d feat/your-feature-name

# Force delete an unmerged local branch
git branch -D feat/your-feature-name
```

:::danger
`git branch -D` deletes a branch regardless of merge status. Use it only when you are certain the branch's work is no longer needed or has been cherry-picked elsewhere.
:::

## Staging and Committing

### Stage Changes

```bash
# Stage a specific file
git add src/main/index.ts

# Stage all changes in the current directory
git add .

# Stage all changes in the repository
git add -A

# Interactively stage hunks (useful for partial commits)
git add -p
```

:::tip
Use `git add -p` to review and stage individual hunks. This lets you split large changes into logical commits without manually editing files.
:::

### Commit

```bash
# Commit with a message
git commit -m "feat: add dynamic island animation transition"

# Commit with a multi-line message
git commit -m "feat: add dynamic island animation

- Implement spring-based transition between compact and expanded states
- Add GPU-accelerated transform animations
- Handle edge cases for rapid state toggling"
```

:::important
Follow the [Commit Conventions](/developer/standards/commit-conventions.md) for commit message format. All commits must use the `type: description` format (e.g., `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
:::

### Amend the Last Commit

```bash
# Amend the commit message
git commit --amend -m "feat: add dynamic island animation (corrected)"

# Amend the last commit to include staged changes (keeps the same message)
git commit --amend --no-edit
```

:::warning
`git commit --amend` rewrites the commit hash. If you have already pushed the commit, you will need to force-push (`git push --force-with-lease`). Avoid amending commits that others may have already pulled.
:::

### View Commit History

```bash
# Compact log
git log --oneline

# Graph with branches
git log --oneline --graph --all

# Detailed log for the current branch (last 10 commits)
git log -10 --stat

# Show changes in a specific commit
git show <commit-hash>
```

## Checkout and Branch Switching

### Switch Branches

```bash
# Switch to an existing branch
git checkout dev

# Switch to a branch (modern syntax)
git switch dev

# Create and switch to a new branch
git checkout -b feat/new-feature
git switch -c feat/new-feature
```

:::info
`git switch` is the modern alternative to `git checkout` for branch switching. Use `git checkout` when you need its additional capabilities (e.g., restoring files, detaching HEAD).
:::

### Checkout a Specific Commit

```bash
# Detach HEAD at a specific commit
git checkout <commit-hash>

# Return to the dev branch
git checkout dev
```

:::warning
When HEAD is detached, you are not on any branch. Commits made in this state will be orphaned unless you create a branch from that point. Always switch back to a branch when done inspecting.
:::

### Checkout a Remote Branch

```bash
# Fetch and switch to a remote branch
git fetch upstream
git checkout -b feat/some-feature upstream/feat/some-feature

# Or use the modern shorthand
git switch -c feat/some-feature upstream/feat/some-feature
```

### Restore Files (Discard Changes)

```bash
# Discard unstaged changes to a specific file
git checkout -- src/main/index.ts
# Modern equivalent:
git restore src/main/index.ts

# Discard all unstaged changes in the working directory
git checkout -- .
# Modern equivalent:
git restore .

# Unstage a file (move back from index to working directory)
git reset HEAD src/main/index.ts
# Modern equivalent:
git restore --staged src/main/index.ts
```

:::danger
`git restore .` discards all unstaged modifications permanently. There is no undo. Make sure you truly want to discard the changes before running this.
:::

## Syncing with Upstream

### Fetch Latest Changes

```bash
# Fetch from upstream (does not modify your working directory)
git fetch upstream

# Fetch and prune deleted remote branches
git fetch upstream --prune
```

### Pull into Current Branch

```bash
# Pull with rebase (recommended — keeps history linear)
git pull --rebase upstream dev

# Pull with merge (creates a merge commit)
git pull upstream dev
```

:::important
Always pull from `upstream` (the original repository), not `origin` (your fork). Your fork may be behind the latest changes.
:::

### Rebase Your Feature Branch onto Latest Dev

```bash
# While on your feature branch
git checkout feat/your-feature-name

# Rebase onto the latest upstream dev
git fetch upstream
git rebase upstream/dev
```

This replays your feature branch commits on top of the latest `dev`, creating a clean linear history.

:::details Rebase vs. Merge — When to Use Which
**Rebase** (`git rebase upstream/dev`):
- Rewrites your commits to appear on top of the latest `dev`
- Creates a clean, linear history
- Use for **updating your feature branch** before opening a PR

**Merge** (`git merge upstream/dev`):
- Creates a merge commit that ties two histories together
- Preserves the exact point where branches diverged
- Use for **integrating completed features** into `dev`

In eIsland, prefer rebase for feature branch updates and merge for integrating branches.
:::

## Merging

### Merge a Branch into Dev

```bash
# Switch to dev
git checkout dev

# Merge the feature branch
git merge feat/your-feature-name
```

### Fast-Forward Merge

If `dev` has not diverged from the feature branch, Git performs a fast-forward merge (no merge commit):

```bash
# Force a fast-forward merge (fails if not possible)
git merge --ff-only feat/your-feature-name
```

:::info
A fast-forward merge simply moves the `dev` pointer forward. It is equivalent to rebasing and then merging — but without the rewrite. Use `--ff-only` when you want to guarantee no merge commit is created.
:::

### No-Fast-Forward Merge

Always create a merge commit, even if a fast-forward is possible:

```bash
git merge --no-ff feat/your-feature-name
```

:::tip
Use `--no-ff` when merging feature branches into `dev` to preserve the branch boundary in history. This makes it easy to revert an entire feature with a single `git revert <merge-commit>`.
:::

### Merge Conflict Resolution

When Git cannot auto-merge, it marks conflicts in the affected files:

```bash
# After starting a merge that conflicts
git merge feat/your-feature-name
# CONFLICT (content): Merge conflict in src/main/index.ts

# 1. Open the file and resolve conflicts manually
#    Look for <<<<<<< / ======= / >>>>>>> markers

# 2. Stage the resolved files
git add src/main/index.ts

# 3. Complete the merge
git commit
```

:::details Conflict Markers Explained
```text
<<<<<<< HEAD
  // Your current branch's version (e.g., dev)
=======
  // The incoming branch's version (e.g., feat/your-feature)
>>>>>>> feat/your-feature
```

Edit the file to keep the correct code, remove all conflict markers, then `git add` and `git commit`.
:::

### Abort a Merge

If a merge goes wrong, abort and return to the pre-merge state:

```bash
git merge --abort
```

:::tip
`git merge --abort` only works before you commit the merge. If you have already committed, use `git reset --hard HEAD~1` to undo the merge commit (see [Rollback](#rollback)).
:::

## Rebasing (Interactive)

Interactive rebase lets you edit, reorder, squash, or drop commits before sharing them.

### Start an Interactive Rebase

```bash
# Rebase the last 3 commits
git rebase -i HEAD~3
```

This opens an editor with:

```text
pick a1b2c3d feat: add animation base
pick e4f5g6h fix: typo in animation
pick i7j8k9l feat: add spring physics
```

### Rebase Commands

| Command | Effect | When to Use |
|---------|--------|-------------|
| `pick` | Keep the commit as-is | Default — no changes needed |
| `reword` | Keep the commit, edit the message | Fix a typo in a commit message |
| `squash` | Merge into the previous commit, combine messages | Combine related small commits |
| `fixup` | Merge into the previous commit, discard this message | Clean up noise commits |
| `drop` | Remove the commit entirely | Remove a commit you no longer want |
| `edit` | Pause at this commit for amendments | Split a commit or add forgotten changes |

:::details Example — Squash Commits
```text
pick a1b2c3d feat: add animation base
squash e4f5g6h fix: typo in animation
squash i7j8k9l feat: add spring physics
```

This combines all three commits into one. Git opens a second editor to let you write the combined commit message.
:::

### Continue or Abort a Rebase

```bash
# After resolving conflicts during rebase
git add <resolved-files>
git rebase --continue

# Abort the entire rebase and return to the original state
git rebase --abort
```

:::warning
Interactive rebase rewrites commit hashes. Never rebase commits that have been pushed to a shared branch — it will cause divergent histories for other developers.
:::

## Rollback

### Undo Uncommitted Changes

```bash
# Discard changes to a specific file
git restore src/main/index.ts

# Discard all unstaged changes
git restore .

# Unstage all files (keep changes in working directory)
git restore --staged .
```

### Undo the Last Commit (Keep Changes)

```bash
# Move HEAD back one commit, keep changes staged
git reset --soft HEAD~1

# Move HEAD back one commit, keep changes unstaged
git reset --mixed HEAD~1
```

### Undo the Last Commit (Discard Changes)

```bash
# Move HEAD back one commit, discard all changes
git reset --hard HEAD~1
```

:::danger
`git reset --hard` permanently discards all uncommitted changes and the last commit. There is no undo. Use with extreme caution.
:::

### Reset to a Specific Commit

```bash
# Soft reset — moves HEAD, keeps changes staged
git reset --soft <commit-hash>

# Mixed reset — moves HEAD, keeps changes unstaged (default)
git reset --mixed <commit-hash>

# Hard reset — moves HEAD, discards everything
git reset --hard <commit-hash>
```

:::info
| Reset Type | HEAD | Index (Staged) | Working Directory |
|------------|------|----------------|-------------------|
| `--soft` | Moved | Unchanged | Unchanged |
| `--mixed` | Moved | Reset | Unchanged |
| `--hard` | Moved | Reset | Reset |

Use `--soft` when you want to re-organize commits. Use `--hard` when you want to completely discard work.
:::

### Revert a Commit (Safe)

Create a new commit that undoes the changes from a specific commit:

```bash
# Revert a specific commit
git revert <commit-hash>

# Revert a merge commit (specify which parent to keep)
git revert -m 1 <merge-commit-hash>

# Revert multiple commits
git revert <commit-hash-1> <commit-hash-2>
```

:::tip
`git revert` is safer than `git reset` because it does not rewrite history. It creates a new "undo" commit, making it safe for shared branches. Prefer `git revert` over `git reset` when working on branches that others may have pulled.
:::

### Recover Deleted Commits

If you accidentally ran `git reset --hard`, the commits are not immediately garbage-collected:

```bash
# View the reflog (history of HEAD movements)
git reflog

# Recover by resetting to the lost commit
git reset --hard <recovered-commit-hash>
```

:::important
The reflog keeps references for 90 days by default. If you need to recover a commit, act before the reflog entries expire.
:::

## Stashing

Temporarily shelve uncommitted changes to work on something else:

```bash
# Stash all tracked changes
git stash

# Stash with a descriptive message
git stash push -m "WIP: animation refactor"

# Stash including untracked files
git stash -u

# List all stashes
git stash list

# Apply the most recent stash (keep it in the stash list)
git stash apply

# Apply and remove the most recent stash
git stash pop

# Apply a specific stash
git stash apply stash@{2}

# Drop a specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

:::tip
Use `git stash push -m "description"` to label your stashes. Without a message, stashes are identified only by index (`stash@{0}`, `stash@{1}`), which becomes confusing when you have multiple stashes.
:::

## Useful Commands Reference

### Status and Diff

```bash
# Show working tree status
git status

# Show staged changes
git diff --staged

# Show unstaged changes
git diff

# Show changes between two branches
git diff dev..feat/your-feature-name

# Show only file names that changed
git diff --name-only dev..feat/your-feature-name
```

### Tags

```bash
# List tags
git tag

# Create a lightweight tag
git tag v1.0.0

# Create an annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push a tag to upstream
git push upstream v1.0.0
```

:::note
Tags in eIsland follow [Semantic Versioning](https://semver.org/). Only maintainers should create release tags.
:::

### Clean Untracked Files

```bash
# Preview what would be deleted
git clean -fd --dry-run

# Delete untracked files and directories
git clean -fd

# Include ignored files (nuclear option)
git clean -fdx
```

:::danger
`git clean -fd` permanently deletes untracked files — they are not recoverable. Always run with `--dry-run` first to preview what will be removed.
:::

### Search

```bash
# Search for a string in tracked files
git grep "TODO" -- "*.ts"

# Search commit messages
git log --grep="feat" --oneline

# Find which commit introduced a specific line
git blame src/main/index.ts
```

## Troubleshooting

### Detached HEAD State

If you see `HEAD detached at <commit>`:

```bash
# Create a branch from the current position to save your work
git checkout -b recovery-branch

# Then switch back to your branch
git checkout dev
```

:::info
Detached HEAD occurs when you checkout a specific commit, tag, or remote branch directly. Any commits made in this state are not on a branch and will be lost if you switch away without creating a branch first.
:::

### Merge Conflicts During Rebase

If you encounter conflicts during `git rebase`:

```bash
# 1. Resolve conflicts in your editor
# 2. Stage the resolved files
git add <resolved-files>

# 3. Continue the rebase
git rebase --continue

# Or abort if the rebase is too complex
git rebase --abort
```

:::warning
During a rebase, do not use `git commit` to resolve conflicts. Use `git add` followed by `git rebase --continue` — the rebase process handles the commit creation.
:::

### Accidentally Committed to the Wrong Branch

If you committed to `dev` instead of a feature branch:

```bash
# 1. Create a new branch from the current position (saves the commit)
git checkout -b feat/your-feature-name

# 2. Switch back to dev
git checkout dev

# 3. Remove the commit from dev
git reset --hard HEAD~1
```

:::important
This only works if you have not pushed the commit yet. If you have already pushed to `origin`, use `git revert` instead of `git reset` to avoid force-pushing.
:::

### Push Rejected (Non-Fast-Forward)

If `git push` is rejected because the remote has diverged:

```bash
# Rebase your changes on top of the remote
git pull --rebase upstream dev

# Then push again
git push origin feat/your-feature-name
```

:::note
This typically happens when another developer has pushed commits to the same branch. Rebase re-applies your commits on top of their changes, resolving the divergence.
:::
