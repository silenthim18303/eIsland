---
title: R1pxc Prompt Builder
---

# R1pxc Prompt Builder

:::info
Roleplay character prompt builder for r1pxc agent mode.
:::

## Overview

The R1pxc prompt builder constructs system prompts for roleplay character interactions. It includes:

- Character personality definition
- Roleplay scenario context
- Interaction guidelines

## Methods

| Method | Description |
|---|---|
| buildSystemPrompt(proUser, workspaces, skills, snapshotMode) | Build system prompt |
| buildNativeToolSystemPrompt(proUser, workspaces, skills, snapshotMode) | Build system prompt for native tool calling |

## Features

- Character personality customization
- Scenario-based interactions
- Environment metadata integration (time, location)
- Consistent character behavior

:::tip
R1pxc mode extracts timestamp and location as environment metadata rather than mixing into user messages.
:::
