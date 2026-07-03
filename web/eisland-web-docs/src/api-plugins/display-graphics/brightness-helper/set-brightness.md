---
watermark: true
title: setBrightness
icon: fa6-solid:code
---

# setBrightness

:::info
Sets the screen brightness to the specified percentage via WMI.
:::

## Signature

```typescript
function setBrightness(brightness: number): boolean
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `brightness` | `number` | Target brightness percentage (0–100) |

## Return Value

`true` if brightness was set successfully, `false` otherwise.

:::tip
Brightness changes are applied immediately and persist until the next change or system sleep.
:::

## Example

```typescript
import { setBrightness, getBrightness } from '@eisland/windows-brightness-helper';

// Set brightness to 75%
const success = setBrightness(75);
console.log(success ? 'Brightness updated' : 'Failed to set brightness');

// Verify
const info = getBrightness();
console.log(`Now at: ${info?.currentBrightness}%`);
```
