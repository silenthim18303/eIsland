# Setting Module Agent Rules

Scope: `src/renderer/components/states/maxExpand/components/setting/**`

## Search Registration Requirement

- Any new settings configuration item (new card, field group, or selectable option exposed in settings UI) must be registered in:
  - `src/renderer/components/states/maxExpand/components/setting/utils/settingsConfig.ts`
- Specifically, add/update entries in `SEARCHABLE_SETTINGS` so it can be discovered by settings search.
- Keep the search entry aligned with real UI copy:
  - `label`: use the exact config item title shown in UI.
  - `desc`: use the exact config item subtitle/description shown in UI.

