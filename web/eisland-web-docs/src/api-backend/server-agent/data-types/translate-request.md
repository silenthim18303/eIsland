---
title: TranslateRequest
---

# TranslateRequest

:::info
Request DTO for the translation endpoint.
:::

## Definition

:::details Source — `ToolboxTranslateController.java`
```java
public record TranslateRequest(
    String text,
    String source,
    String target
) {}
```
:::

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | String | Yes | Text to translate |
| `source` | String | Yes | Source language code (e.g., `zh`, `en`, `ja`) |
| `target` | String | Yes | Target language code |

## Used By

- `POST /v1/toolbox/translate` — [Translate Text](../toolbox-api/translate.md)
