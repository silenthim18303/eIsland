---
title: Edoc Prompt Builder
---

# Edoc Prompt Builder

:::info
Builds system prompts for the "edoc" persona — a code-focused programming assistant ("vibe coding" partner).
:::

## Class

`EdocPromptBuilder` — `@Component`

## Key Features

- Code-focused programming assistant personality
- ReAct JSON protocol with structured output
- Workspace sandboxing for code projects
- Web search rules for documentation lookup
- Code editing workflow guidance
- Snapshot mode constraints
- User skill injection

## Methods

| Method | Description |
|---|---|
| `buildSystemPrompt(proUser, workspaces, skills, snapshotMode)` | ReAct mode prompt |
| `buildNativeToolSystemPrompt(proUser, workspaces, skills, snapshotMode)` | Native tool-call mode |

## Agent Mode

The `LangChainWorkflowService` routes to this builder when `agentMode` is `edoc`.

:::tip
Use the `edoc` mode when you need help with coding tasks, debugging, or code review. It has specialized knowledge about software development workflows.
:::

## Source

- `EdocPromptBuilder.java`
