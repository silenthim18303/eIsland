---
name: eisland-dev-generate-release-worklog
author: JNTMTMTM
description: >
  Generate a release announcement markdown for eIsland. Use this skill whenever the user asks
  to "generate release notes", "create announcement", "写更新日志", "生成发布公告",
  "draft release notes", or mentions preparing a new version release document.
---

# Generate Release Worklog

Generate a versioned release announcement markdown file for eIsland, following the project's established format and tone.

## When to use

- The user asks to generate release notes or an announcement for a new version
- The user mentions "更新日志", "发布公告", "release notes", "announcement"
- A release is being prepared and documentation is needed

## Process

### Step 1: Gather parameters

Confirm these values with the user (use defaults if not specified):

| Parameter | Description | Default |
|-----------|-------------|---------|
| `version` | Version string (e.g., `V26.5.14`) | Ask user |
| `date` | Release date (`YYYY-MM-DD`) | Today |
| `sinceDate` | Git log start date | Previous version's date |

### Step 2: Collect recent git commits

Run in the eIsland project root:

```bash
git log --oneline --since="<sinceDate>"
```

Also read `docs/CHANGE_LOG.md` (lines 1-50) for the latest released version context.

Group the commits by type prefix: `feat`, `fix`, `refactor`, `test`, `docs`, `i18n`, `style`, `chore`.

### Step 3: Read style reference

Read the bundled reference file `references/V26.5.13.md` to extract the canonical format:
1. The exact template structure (metadata blockquote, summary, sections, closing)
2. The tone and phrasing patterns used in bullet items
3. The section ordering convention (Chinese first, English second)

Also read the 2 most recent announcement files in `docs/announcement/` for additional style context.

### Step 4: Generate the announcement

Group commits into user-facing sections: **新功能**, **体验优化**, **问题修复**, **文档更新**. Only include sections that have items.

Rewrite each commit into a concise user-facing bullet point in Chinese:
- One sentence per item
- No internal implementation details (no class names, file paths, function names)
- Focus on user-visible behavior changes and benefits
- Match the tone of the style reference

### Step 5: Format the output

Generate the markdown with this exact structure:

```
> **Release Date:** *`<date>`* **GitHub Repository:** *`https://github.com/JNTMTMTM/eIsland`*

**<Chinese summary in bold>**

*<English summary in italic>*

## 新功能

- <Chinese bullet>

## 体验优化

- <Chinese bullet>

## 问题修复

- <Chinese bullet>

## 文档更新

- <Chinese bullet>

感谢大家持续反馈与支持。若你在升级后发现新问题，欢迎继续反馈，我们会尽快跟进。

## New Features

- <English translation of bullet>

## Improvements

- <English translation of bullet>

## Bug Fixes

- <English translation of bullet>

## Documentation

- <English translation of bullet>

Thank you for your continued feedback and support. If you encounter new issues after upgrading, please continue to report them — we will follow up as soon as possible.
```

#### Format rules

- No emoji anywhere
- No `#` title at the top of the file
- No `---` divider anywhere
- Sub-items use 2-space indent
- No empty entries, no duplicates
- Keep bullet items concise (one sentence each)
- Chinese sections first, then English sections (grouped by language)
- Each section heading uses only one language (no bilingual headings like `## 新功能 / New Features`)
- Metadata blockquote is a single line, English only, date and repo wrapped in italic backticks
- Summary: Chinese in **bold**, English in *italic*
- Chinese closing after the last Chinese section
- English sections follow immediately after Chinese closing (no divider)
- English closing at the very end

### Step 6: Write and commit

Write the file to `docs/announcement/<version>.md`, then commit:

```bash
git add docs/announcement/<version>.md
git commit -m "docs(announcement): add <version> release notes"
```

## Output format

Return:
- The output file path
- The git commit hash
- A brief summary of what was included (section counts)
