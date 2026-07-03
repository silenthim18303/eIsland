---
title: Comment Quality Review
icon: comments
---

# Comment Quality Review

:::info
This document defines the JSDoc comment standards for the eIsland project. All TypeScript/TSX files must comply with these rules — no exceptions.
:::

## File-Level Comments

Every TypeScript/TSX file must begin with a copyright header block followed by a JSDoc file comment using `@file`, `@description`, and `@author` tags.

### Copyright Header

The copyright block must appear at the very top of every file, containing:

- Project name and repository URL
- `Copyright (C)` line
- License declaration (GPL-3.0)

```typescript
/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */
```

:::important
The copyright header is **mandatory** and must be placed at the very top of the file, before any other code or comments.
:::

### JSDoc File Comment

Immediately after the copyright header, add a JSDoc block describing the file:

```typescript
/**
 * @file effects.ts
 * @description Three.js animation effect helper functions
 * @description Provides color interpolation, numeric interpolation, breathing effects, and rainbow glow calculations
 * @author 鸡哥
 */
```

**Tag details:**

- `@description` — can have multiple lines for detailed file descriptions
- `@author` — always set to **鸡哥** (project default author)

:::note
Both the copyright header and file-level JSDoc comment are **required** for every file.
:::

---

## Function / Method / Class Comments

Every exported function and class method must have a complete JSDoc comment.

### Standard Format

```typescript
/**
 * Linearly interpolate between two colors
 * @param from - The starting color
 * @param to - The target color
 * @param t - Interpolation factor (0~1)
 * @returns The interpolated color
 */
export function lerpColor(from: Color, to: Color, t: number): Color {
  // ...
}
```

### Available Tags

| Tag | Purpose | Example |
|-----|---------|---------|
| `@description` | Supplementary detail (optional) | `@description Uses Hermite interpolation for ease-in-out effect` |
| `@param` | Parameter documentation | `@param t - Interpolation factor (0~1)` |
| `@returns` | Return value documentation | `@returns The interpolated color` |
| `@example` | Usage example | `@example lerpColor(c1, c2, 0.5)` |

### Parameter Description Rules

- Description follows the `-` separator immediately
- Explain parameter meaning and valid ranges
- For booleans, explain what `true` and `false` mean
- For object parameters, document each field

```typescript
/**
 * Calculate a smooth breathing factor using a sine wave
 * @description Used for breathing animation effects in light rendering
 * @param time - Current time in seconds
 * @param speed - Breathing speed
 * @param phase - Phase offset
 * @param squared - If true, square the result to keep it non-negative
 * @returns Breathing factor (-1~1 or 0~1)
 */
export function getBreathFactor(
  time: number,
  speed: number,
  phase: number = 0,
  squared: boolean = false
): number {
  const value = Math.sin(time * speed + phase);
  return squared ? Math.pow(value, 2) : value;
}
```

---

## Comment Principles

### When to Comment

:::tip
Every rule below is a **hard requirement** — not a suggestion.
:::

- ✅ All exported functions
- ✅ All class methods
- ✅ Every file header (file-level comment)
- ✅ Complex business logic blocks
- ✅ Type definitions (complex types need explanation)

### When NOT to Comment

- ❌ Simple getters/setters
- ❌ Self-explanatory variable assignments
- ❌ Boilerplate code (e.g., simple React component skeletons)
- ❌ Redundant inline comments like `// Set width to 100px`

### Comment Quality Standards

| Principle | Description |
|-----------|-------------|
| **Clear and concise** | Use the fewest words to convey the core meaning |
| **Chinese primary** | The project uses Chinese for comments; English is for code identifiers only |
| **Explain "why"** | Document business logic and design decisions, not "what was done" |
| **Specific parameters** | Document valid ranges, defaults, and semantics |

---

## Templates

### File Header Template

```typescript
/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file [filename].ts
 * @description [File purpose description]
 * @author [Developer name]
 */
```

### Function Template

```typescript
/**
 * [Brief function description]
 * @description [Detailed explanation, optional]
 * @param [paramName] - [Parameter description]
 * @returns [Return value description]
 */
export function [functionName](...): [ReturnType] {
  // ...
}
```

---

## Violation Examples

### ❌ Missing Copyright Header

```typescript
// No copyright block at the top of the file — VIOLATION
/**
 * @file effects.ts
 * @description Animation helpers
 */
```

### ❌ Missing File-Level JSDoc

```typescript
/*
 * eIsland - ...
 * Copyright (C) 2026 JNTMTMTM
 */

// No @file, @description, @author — VIOLATION
import * as THREE from 'three';
```

### ❌ Undocumented Parameters

```typescript
export function lerp(a, b, t) { }
// Parameters have no descriptions — VIOLATION
```

### ❌ Comment Explains "What" Instead of "Why"

```typescript
const width = 100; // Set width to 100px
// This describes the code, not the reason — VIOLATION
```

### ❌ Over-Commenting Simple Code

```typescript
/**
 * Get user name
 * @param user - User object
 * @returns User name
 */
export function getName(user: User): string {
  return user.name; // Return the name
}
// This is trivially obvious — VIOLATION
```

---

## Correct Examples

### ✅ Complete File with Proper Comments

```typescript
/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file effects.ts
 * @description Three.js animation effect helper functions
 * @description Provides color interpolation, numeric interpolation, breathing effects, and rainbow glow calculations
 * @author 鸡哥
 */

import * as THREE from 'three';

/**
 * Linearly interpolate between two THREE.Color instances
 * @param from - The starting color
 * @param to - The target color
 * @param t - Interpolation factor (0~1)
 * @returns The interpolated color
 */
export function lerpColor(from: THREE.Color, to: THREE.Color, t: number): THREE.Color {
  return new THREE.Color().lerpColors(from, to, t);
}

/**
 * Calculate a smooth breathing factor using a sine wave
 * @description Used for breathing animation effects in light rendering
 * @param time - Current time in seconds
 * @param speed - Breathing speed
 * @param phase - Phase offset
 * @param squared - If true, square the result to keep it non-negative
 * @returns Breathing factor (-1~1 or 0~1)
 */
export function getBreathFactor(
  time: number,
  speed: number,
  phase: number = 0,
  squared: boolean = false
): number {
  const value = Math.sin(time * speed + phase);
  return squared ? Math.pow(value, 2) : value;
}
```

---

## Tool Support

Install JSDoc-related plugins in VS Code / Cursor for auto-completion support:

- **ESLint** — automatically checks comment completeness
- **JSDoc Template** — quickly generate comment templates
