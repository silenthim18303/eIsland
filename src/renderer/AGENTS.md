# AGENTS Instructions for `src/renderer`

## Translation consistency requirement

- Any change under this scope that adds/changes/removes user-facing text must include an i18n check.
- Verify translation keys exist and are correct for all supported locales.
- At minimum, keep `i18n/zh-CN.json` and `i18n/en-US.json` in sync for affected keys.
- Do not leave new UI text relying on fallback/default text when a proper translation key should be added.

## SVG icon adaptive color strategy

- All control/widget SVG icons must adapt to dark and light themes.
- Dark mode: apply `filter: brightness(0) invert(1)` to make icons white.
- Light mode: apply `[data-theme='light'] .icon-class { filter: brightness(0) invert(0); }` to make icons black.
- Never hardcode a single `filter: invert(1)` without a corresponding `[data-theme='light']` override.
- Prefer adding a shared CSS class (e.g. a `-icon-img` suffix class) to `<img>` elements referencing SVG icons, then style that class with the above filter rules.
- If an icon is multi-color or should not be theme-inverted, add a `.no-filter` class and set `filter: none; opacity: 1;` for both themes.
