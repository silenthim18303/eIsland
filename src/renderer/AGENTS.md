# AGENTS Instructions for `src/renderer`

## Translation consistency requirement

- Any change under this scope that adds/changes/removes user-facing text must include an i18n check.
- Verify translation keys exist and are correct for all supported locales.
- At minimum, keep `i18n/zh-CN.json` and `i18n/en-US.json` in sync for affected keys.
- Do not leave new UI text relying on fallback/default text when a proper translation key should be added.
