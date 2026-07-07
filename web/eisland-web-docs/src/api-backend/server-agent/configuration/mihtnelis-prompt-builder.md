---
title: Mihtnelis Prompt Builder
---

# Mihtnelis Prompt Builder

:::info
Builds system prompts for the default Mihtnelis AI assistant persona. The most comprehensive prompt builder with full eIsland project knowledge.
:::

## Class

`MihtnelisPromptBuilder` — `@Component`

## Key Features

- Full eIsland project knowledge base (UI states, settings keys, feature modules, user tiers)
- 60+ tool descriptions with usage guides
- ReAct JSON protocol with CoT reasoning
- Native tool-call mode support
- Workspace sandboxing
- Pro-user gating for premium tools
- Snapshot mode (max 3 sentences)
- Local mode (no internet access)
- User skill injection

## Methods

| Method | Description |
|---|---|
| `buildSystemPrompt(proUser, workspaces, skills, snapshotMode)` | ReAct mode prompt |
| `buildSystemPrompt(proUser, workspaces, skills, snapshotMode, localMode)` | ReAct mode with local flag |
| `buildNativeToolSystemPrompt(proUser, workspaces, skills, snapshotMode)` | Native tool-call mode |

## Agent Modes

The `LangChainWorkflowService` routes to this builder when `agentMode` is:
- `mihtnelis` (default)
- Any unrecognized mode

:::tip
This builder is the default choice. Use `edoc` for code-focused tasks or `r1pxc` for roleplay.
:::

## Source

- `MihtnelisPromptBuilder.java`
- `LangChainWorkflowService.java` — `buildSystemPrompt()`
