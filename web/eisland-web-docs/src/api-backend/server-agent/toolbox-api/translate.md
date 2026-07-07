---
title: Translate Text
---

# POST /v1/toolbox/translate

:::info
Translates text using Tencent Cloud TMT (Text Machine Translation). Requires JWT authentication.
:::

## Request

**Method:** `POST`
**Path:** `/v1/toolbox/translate`
**Content-Type:** `application/json`
**Authentication:** Required (JWT)

### Request Body

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | String | Yes | Text to translate |
| `source` | String | Yes | Source language code (e.g., `zh`, `en`, `ja`) |
| `target` | String | Yes | Target language code |

## Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "targetText": "Hello, world!",
    "source": "zh",
    "target": "en",
    "requestId": "req-abc123"
  }
}
```

| Field | Type | Description |
|---|---|---|
| `data.targetText` | String | Translated text |
| `data.source` | String | Source language code |
| `data.target` | String | Target language code |
| `data.requestId` | String | Tencent API request ID |

:::details Billing
Translation is billed per character. The monthly quota is 5 million characters. When the quota is exceeded, requests are rejected with an error.
:::

:::details Supported Languages
Tencent TMT supports 20+ language pairs including: `zh` (Chinese), `en` (English), `ja` (Japanese), `ko` (Korean), `fr` (French), `de` (German), `es` (Spanish), `ru` (Russian), `ar` (Arabic), and more.
:::

## Source

- `ToolboxTranslateController.java` — `translate()`
- `TencentTmtTranslateService.java` — `translate()`
