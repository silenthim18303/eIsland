---
title: TranslateResult
---

# TranslateResult

:::info
Result of a Tencent TMT translation request.
:::

## Definition

:::details Source — `TencentTmtTranslateService.java`
```java
public record TranslateResult(
    String targetText,
    String source,
    String target,
    String requestId
) {}
```
:::

## Fields

| Field | Type | Description |
|---|---|---|
| `targetText` | String | Translated text |
| `source` | String | Source language code |
| `target` | String | Target language code |
| `requestId` | String | Tencent API request ID |

## Used By

- `TencentTmtTranslateService.translate()`
- `ToolboxTranslateController` — response data
