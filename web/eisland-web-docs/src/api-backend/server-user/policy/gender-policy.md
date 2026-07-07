---
title: GenderPolicy
---

# GenderPolicy

:::info
Utility class for normalizing gender and birthday fields with support for custom gender descriptions.
:::

## Overview

A stateless policy class that normalizes user profile gender and birthday inputs. Supports a custom gender description field that is only retained when gender is set to `"custom"`.

## Constants

| Constant | Value | Description |
|---|---|---|
| `DEFAULT` | `"undisclosed"` | Default gender when input is blank or invalid |
| `ALLOWED` | `{"male", "female", "custom", "undisclosed"}` | Set of valid gender identifiers |

## Methods

| Method | Return | Description |
|---|---|---|
| `normalize(gender)` | `String` | Normalize gender to one of the allowed values; defaults to `"undisclosed"` |
| `normalizeCustom(gender, genderCustom)` | `String \| null` | Return trimmed custom description (max 64 chars) if `gender == "custom"`, else `null` |
| `parseBirthday(birthday)` | `LocalDate \| null` | Parse ISO date string; rejects future dates and dates before 1900-01-01 |

## Validation Rules

### Gender
- Null or blank input returns `"undisclosed"`
- Case-insensitive matching against `ALLOWED` set
- Unrecognized values return `"undisclosed"`

### Custom Gender Description
- Only retained when `gender == "custom"`
- Trimmed to maximum 64 characters
- Returns `null` if blank or gender is not `"custom"`

### Birthday
- Must be ISO-8601 format (`yyyy-MM-dd`)
- Must not be in the future
- Must not be before `1900-01-01`
- Returns `null` for blank or invalid input
