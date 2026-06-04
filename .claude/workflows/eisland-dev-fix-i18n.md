export const meta = {
  name: 'eisland-dev-fix-i18n',
  author: 'JNTMTMTM',
  description: 'Fix all i18n issues: add missing translation keys, wrap hardcoded Chinese strings',
  phases: [
    { title: 'Fix Keys', detail: 'Add missing t() keys to translation files' },
    { title: 'Fix Hardcoded', detail: 'Wrap hardcoded Chinese strings in t()' },
    { title: 'Verify', detail: 'Run i18n:check to confirm all issues resolved' },
    { title: 'Commit', detail: 'Git commit all fixes' },
  ],
}

// Phase 1: Fix missing translation keys
phase('Fix Keys')
await agent(
  `You need to fix 31 missing translation keys in the i18n files.

The following keys are used in source code via t() calls but do NOT exist in the translation files:

announcement.loading, announcement.empty, announcement.title, announcement.subtitle, announcement.defaultTitle, announcement.updatedAt, announcement.close,
aiChat.messages.noModelOutputCustomDirect, aiChat.actions.quote, aiChat.actions.copy, aiChat.localModelGenerated, aiChat.customDirectGenerated, aiChat.modelCard.customApiMode, aiChat.modelCard.customApiModeTitle, aiChat.modelCard.customApiModeRelay, aiChat.modelCard.customApiModeDirect, aiChat.agentMode.switch,
settings.ai.minimaxReasoningEffort, settings.ai.pagination,
mailTab.accounts.unnamed,
miniGameTab.unknownUser,
settings.about.feedback.messages.prefilledFromAgent,
settings.user.feedback.needLogin, settings.user.card.balance,
settings.app.notifications.displayChanged.body,
settings.update.downloadFailed

Steps:
1. Read i18n/zh-CN.json and i18n/en-US.json
2. For each missing key, read the source file that uses it to understand the context
3. Add the key to BOTH zh-CN.json and en-US.json with appropriate translations
4. Place the key in the correct nested location (e.g. "announcement.loading" goes under "announcement" object)
5. If the parent object doesn't exist, create it
6. Write both files back

IMPORTANT:
- Use Write tool to write the complete updated JSON files
- Ensure JSON is valid (no trailing commas)
- Keep existing keys unchanged
- Chinese translations for zh-CN, English translations for en-US
- Make translations contextually appropriate (read the source code to understand usage)`,
  { phase: 'Fix Keys' }
)

// Phase 2: Fix hardcoded Chinese strings
phase('Fix Hardcoded')
await agent(
  `You need to fix hardcoded Chinese strings in TSX source files by wrapping them in t() calls.

Here are the files with hardcoded Chinese:

1. src/renderer/components/states/maxExpand/SettingsTab.tsx - Many lines with hardcoded Chinese in settings
2. src/renderer/components/states/maxExpand/MaxExpandContentShell.tsx - Lines 159-184
3. src/renderer/components/states/stt/SttContent.tsx - Lines 90, 113, 125-129
4. src/renderer/components/states/notification/NotificationContent.tsx - Line 281
5. src/renderer/components/states/agent/components/AgentContentView.tsx - Lines 85-89
6. src/renderer/main.tsx - Line 44
7. src/renderer/standaloneMain.tsx - Line 41

For each file:
1. Read the source file
2. Find the hardcoded Chinese strings
3. Create appropriate translation keys (follow existing naming patterns in the codebase)
4. Wrap the strings in t('key') calls
5. Add the translations to BOTH i18n/zh-CN.json and i18n/en-US.json
6. Write the updated source file and translation files

IMPORTANT RULES:
- Use the existing useTranslation hook or t function already imported in the file
- If t is not imported, add: import { useTranslation } from 'react-i18next' and const { t } = useTranslation()
- For strings in JSX attributes like title="中文", change to title={t('key')}
- For text content like <div>中文</div>, change to <div>{t('key')}</div>
- For string literals in code like setStatusMessage('中文'), change to setStatusMessage(t('key'))
- Keep the original Chinese as zh-CN translation value
- Provide appropriate English translation
- Follow existing key naming conventions in the project (e.g. settings.ai.xxx, announcement.xxx)
- Write complete files using Write tool (not Edit) to avoid conflicts
- After each file, verify the JSON is valid

Do ALL files in this single phase. Process them one by one.`,
  { phase: 'Fix Hardcoded' }
)

// Phase 3: Verify
phase('Verify')
const verifyResult = await agent(
  `Run the i18n check script: npm run i18n:check

If it still reports issues:
1. Read the output carefully
2. Fix any remaining issues (add missing keys or wrap remaining hardcoded strings)
3. Re-run the check
4. Repeat until all checks pass

Return the final output.`,
  { phase: 'Verify' }
)

log('i18n check result: ' + (verifyResult || 'completed'))

// Phase 4: Commit
phase('Commit')
await agent(
  `Create separate commits for each category of fix:

1. First commit - missing translation keys:
   git add i18n/zh-CN.json i18n/en-US.json
   git commit -m "fix(i18n): add missing translation keys"

2. Second commit - hardcoded Chinese fixes per file:
   For each source file that was modified, create a separate commit:
   git add <file> i18n/zh-CN.json i18n/en-US.json
   git commit -m "fix(i18n): wrap hardcoded strings in <filename>"

   Process files in this order:
   - src/renderer/main.tsx
   - src/renderer/standaloneMain.tsx
   - src/renderer/components/states/maxExpand/SettingsTab.tsx
   - src/renderer/components/states/maxExpand/MaxExpandContentShell.tsx
   - src/renderer/components/states/stt/SttContent.tsx
   - src/renderer/components/states/notification/NotificationContent.tsx
   - src/renderer/components/states/agent/components/AgentContentView.tsx

3. Final commit - any remaining fixes:
   git add -A
   git commit -m "fix(i18n): resolve remaining translation issues"

Return all commit hashes.`,
  { phase: 'Commit' }
)

log('All i18n fixes committed')
