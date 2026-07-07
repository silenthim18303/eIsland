---
title: AgentBillingDlqLogMapper
---

# AgentBillingDlqLogMapper

:::info
MyBatis `@Mapper` interface for the Agent billing dead-letter queue log table.
:::

## Methods

| Method | Return | Description |
|---|---|---|
| `insert(log)` | `int` | Create new DLQ record |
| `selectAll()` | `List<AgentBillingDlqLog>` | List all records (newest first) |
| `selectByStatus(status)` | `List<AgentBillingDlqLog>` | Filter by status (`pending`/`resolved`/`ignored`) |
| `updateStatus(id, status, resolvedBy, resolvedAt)` | `int` | Update record status (manual resolution) |
| `countPending()` | `int` | Count records with `pending` status |
