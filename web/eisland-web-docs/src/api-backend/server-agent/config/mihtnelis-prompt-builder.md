---
title: Mihtnelis Prompt Builder
---

# Mihtnelis Prompt Builder

:::info
Default AI assistant prompt builder for mihtnelis agent mode.
:::

## Overview

The Mihtnelis prompt builder constructs system prompts for the default AI assistant mode. It includes:

- Agent personality and behavior rules
- Available tools and their descriptions
- Pro-user feature gating
- Workspace and skill context

## Methods

| Method | Description |
|---|---|
| buildSystemPrompt(proUser, workspaces, skills, snapshotMode, localMode) | Build system prompt |
| buildNativeToolSystemPrompt(proUser, workspaces, skills, snapshotMode) | Build system prompt for native tool calling |

## Prompt Structure

1. **Base Personality** — Agent identity and core behavior
2. **Tool Descriptions** — Available tools with parameters
3. **Pro Features** — Features gated behind Pro role
4. **Workspace Context** — User workspace information
5. **Skill Context** — Custom skill definitions
6. **Snapshot Mode** — TodoList snapshot behavior

:::tip
The prompt builder automatically adjusts tool availability based on user role (Pro vs regular).
:::
