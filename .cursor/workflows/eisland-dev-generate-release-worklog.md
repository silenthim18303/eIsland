export const meta = {
  name: 'eisland-dev-generate-release-worklog',
  author: 'JNTMTMTM',
  description: 'Generate a version worklog and announcement markdown (beautified, no emoji)',
  phases: [
    { title: 'Collect', detail: 'Gather unreleased changes from git log and CHANGELOG' },
    { title: 'Draft', detail: 'Group, rewrite, and generate announcement markdown' },
  ],
}

phase('Collect')

const today = args?.date || '2026-05-31'
const version = args?.version || 'V26.5.13'
const projectRoot = 'C:/Users/Administrator/Desktop/pyisland_project/eIsland'
const sinceDate = args?.since || '2026-05-27'

// Collect recent git commits since last release
const gitLog = await agent(
  `In the eIsland project at ${projectRoot}:
1. Run: git log --oneline --since="${sinceDate}"
2. Read docs/CHANGE_LOG.md lines 1-50 for the latest released version context.
3. Return the raw commit list grouped by type prefix (feat/fix/refactor/test/docs/i18n/style/chore).`,
  { label: 'collect-git-log', phase: 'Collect' }
)

// Read the 2 most recent announcements for style reference
const styleRef = await agent(
  `Read ${projectRoot}/docs/announcement/V26.5.12.md and ${projectRoot}/docs/announcement/V26.5.11.md. Extract and return:
1. The exact template structure (title, metadata blockquote, summary, sections, closing)
2. The tone and phrasing patterns used in bullet items
3. The section ordering convention`,
  { label: 'collect-style-ref', phase: 'Collect' }
)

phase('Draft')

const announcement = await agent(
  `Generate a release announcement for eIsland ${version} (date: ${today}).

## Recent git commits (since ${sinceDate}):
${gitLog}

## Style reference from recent announcements:
${styleRef}

## Instructions:
1. Group the commits into user-facing sections: 新功能, 体验优化, 问题修复, 文档更新. Only include sections that have items.
2. Rewrite each commit into a concise user-facing bullet point in Chinese:
   - One sentence per item
   - No internal implementation details (no class names, file paths, function names)
   - Focus on user-visible behavior changes and benefits
   - Match the tone of the style reference
3. Generate the full announcement markdown with this exact structure (no top-level # title):
   - Metadata blockquote (single line, English only, date and repo wrapped in italic backticks):
     > **Release Date:** *\`${today}\`* **GitHub Repository:** *\`https://github.com/JNTMTMTM/eIsland\`*
   - Summary paragraph: Chinese in **bold** on one line, English in *italic* on the next line
   - Chinese sections (top):
     - Sections with ## headings in Chinese only: 新功能, 体验优化, 问题修复, 文档更新
     - All bullet items in Chinese
     - Closing in Chinese after the last Chinese section:
       感谢大家持续反馈与支持。若你在升级后发现新问题，欢迎继续反馈，我们会尽快跟进。
   - English sections (bottom, immediately after Chinese closing, no divider):
     - Sections with ## headings in English only: New Features, Improvements, Bug Fixes, Documentation
     - All bullet items in English (translated from the Chinese section)
     - Closing in English at the very end:
       Thank you for your continued feedback and support. If you encounter new issues after upgrading, please continue to report them — we will follow up as soon as possible.
4. General rules:
   - No emoji anywhere
   - No # title at the top of the file
   - No --- divider anywhere
   - Sub-items use 2-space indent
   - No empty entries, no duplicates
   - Keep bullet items concise (one sentence each)
   - Chinese and English sections are interleaved in order but grouped by language — all Chinese sections first, then all English sections
   - Each section heading uses only one language (no bilingual headings like ## 新功能 / New Features)

After generating the markdown, write it to: ${projectRoot}/docs/announcement/${version}.md

After writing the file, run the following git commands in ${projectRoot}:
1. git add docs/announcement/${version}.md
2. git commit -m "docs(announcement): add ${version} release notes"

Return the output file path and the git commit hash when done.`,
  { label: 'draft-and-write', phase: 'Draft' }
)

return { version, date: today, result: announcement }
