---
title: ToolboxSoftwareMapper
---

# ToolboxSoftwareMapper

:::info
MyBatis `@Mapper` interface for the toolbox software entries table.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `selectAll()` | `List<ToolboxSoftware>` | List all software (ordered by sort_order ASC) |
| `selectEnabled()` | `List<ToolboxSoftware>` | List enabled software (ordered by sort_order ASC) |
| `selectById(id)` | `ToolboxSoftware` | Lookup by ID |
| `insert(software)` | `int` | Create new entry |
| `updateById(id, name, description, url, iconUrl, sortOrder, enabled, updatedAt)` | `int` | Update existing entry |
| `deleteById(id)` | `int` | Delete entry |
