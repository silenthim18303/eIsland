# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

Before any uncertain operation:
- If an operation could be risky, ambiguous, or has unclear impact, pause and ask the user before proceeding.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Agent Prompt Sync (Global Rule)

**When feature scope changes, agent prompts must be updated in the same task.**

- If you add/remove/change any user-facing eIsland feature, also sync corresponding agent prompt descriptions in `eisland-server/server`.
- Treat prompt sync as part of Definition of Done; do not mark the task complete if prompts are stale.
- At minimum, verify all affected prompt builders mention the new capability consistently.
- If uncertain which prompts are affected, explicitly ask and confirm before finishing.

## 6. i18n Completeness (UI Change Gate)

**Every user-facing string must have translations. No exceptions.**

After any UI change (new component, new text, modified labels, new feedback messages):
1. Scan all `t('...')` calls in changed files for translation keys.
2. Check both `i18n/zh-CN.json` and `i18n/en-US.json` — every key must exist in both.
3. If a key is missing, add it to both files before marking the task done.
4. Hard-coded Chinese/English strings in UI code are forbidden — wrap them in `t()`.

Verification: `grep -rn "defaultValue" src/renderer/components/<changed-dir>/` should show `t()` wrappers, not raw strings.

## 7. Comment Standards (Code Change Gate)

**All code must comply with `docs/COMMENT_STANDARDS.md`. No exceptions.**

After any TS/TSX file creation or modification:
1. **File header required**: Every `.ts`/`.tsx` file must start with GPL-3.0 copyright block + JSDoc `@file`/`@description`/`@author` (author: 鸡哥).
2. **Exported functions**: Every exported function/class/method must have JSDoc with `@param` and `@returns`.
3. **Explain "why"**: Comments should explain business logic and design decisions, not restate what the code does.
4. **No over-commenting**: Don't comment trivial getters, self-explanatory assignments, or simple React skeletons.

Verification: new/changed files must pass the header check (`head -20` shows copyright + JSDoc block).

## 8. Frontend Standards (Code Change Gate)

**All frontend code must comply with `docs/FRONTEND_STANDARDS.md`. No exceptions.**

Key rules enforced on every frontend change:

| Category | Rule | Forbidden | Use instead |
|----------|------|-----------|-------------|
| Variables | `const`/`let` only | `var` | `const` / `let` |
| Types | Strict typing | `any`, `Function`, `Object` | explicit types / `unknown` |
| Equality | Strict comparison | `==` / `!=` | `===` / `!==` |
| Strings | Single quotes + template literals | double quotes in JS/TS, `+` concatenation | `'str'` / `` `tmpl` `` |
| Security | No injection | `eval()`, `innerHTML`, `javascript:` URLs | safe DOM APIs / sanitization |
| React | No Props spreading | `...props` | explicit prop passing |
| React | Stable list keys | array index as `key` | unique ID |
| CSS | No `!important` | `!important` | restructure selectors |
| CSS | No ID selectors | `#id` in CSS | class selectors |
| Tailwind | Utility-first | custom classnames | atomic utility classes |
| Format | 2-space indent, semicolons required | inconsistent formatting | match existing style |

When in doubt, refer to the full document at `docs/FRONTEND_STANDARDS.md`.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
