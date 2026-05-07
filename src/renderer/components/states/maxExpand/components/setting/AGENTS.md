# Setting Module Agent Rules

Scope: `src/renderer/components/states/maxExpand/components/setting/**`

## Search Registration Requirement

- Any new settings configuration item (new card, field group, or selectable option exposed in settings UI) must be registered in:
  - `src/renderer/components/states/maxExpand/components/setting/utils/settingsConfig.ts`
- Specifically, add/update entries in `SEARCHABLE_SETTINGS` so it can be discovered by settings search.
- Keep the search entry aligned with real UI copy:
  - `label`: use the exact config item title shown in UI.
  - `desc`: use the exact config item subtitle/description shown in UI.

## Search I18n Requirement

- Settings search must support current UI language.
- For every new searchable item in `SEARCHABLE_SETTINGS`, register:
  - `labelKey`: i18n key of item title.
  - `descKey`: i18n key of item subtitle/description.
- Do not leave searchable items with hardcoded Chinese-only text when i18n keys already exist in component UI.

## Translation Sync Requirement

- When introducing a new searchable settings item or search-related control text, update both locale files:
  - `i18n/zh-CN.json`
  - `i18n/en-US.json`
- Search-related controls (placeholder / empty state / clear button aria label) must always have complete translations in both locales.

