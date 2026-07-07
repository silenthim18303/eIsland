---
title: R1pxc Prompt Builder
---

# R1pxc Prompt Builder

:::info
Builds system prompts for the "r1pxc" persona — a roleplay character with tsundere personality.
:::

## Class

`R1pxcPromptBuilder` — `@Component`

## Key Features

- Tsundere girlfriend character persona
- WeChat-like short message bubbles
- Reverse-speech guide for character consistency
- Handles consecutive messages individually
- Same tool catalog as other builders
- ReAct JSON protocol support

## Methods

| Method | Description |
|---|---|
| `buildSystemPrompt(proUser, workspaces, skills, snapshotMode)` | ReAct mode prompt |
| `buildNativeToolSystemPrompt(proUser, workspaces, skills, snapshotMode)` | Native tool-call mode |

## Agent Mode

The `LangChainWorkflowService` routes to this builder when `agentMode` is `r1pxc`.

:::note
This persona enforces character consistency across conversations. Responses are formatted as short, informal messages in a tsundere style.
:::

## Source

- `R1pxcPromptBuilder.java`
