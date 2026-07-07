---
title: ServiceStatusService
---

# ServiceStatusService

:::info
Service layer for managing API endpoint availability status with Spring Cache integration.
:::

## Overview

`ServiceStatusService` provides CRUD operations for API status records. It uses Spring `@Cacheable` / `@CacheEvict` annotations to cache individual and list queries, automatically invalidating on updates.

## Methods

| Method | Cache | Description |
|---|---|---|
| `getByApiName(apiName)` | `service-status` | Query a single API's status by name; null results are not cached |
| `listAll()` | `service-status-list` | Query all API status records |
| `updateStatus(apiName, status, message, remark)` | Evicts both caches | Update existing record or insert new one (upsert) |

## Cache Strategy

- **Read**: `@Cacheable` on `getByApiName` and `listAll`
- **Write**: `@Caching(evict = ...)` on `updateStatus` invalidates both the individual key and the `all` list key
- **Null handling**: `getByApiName` does not cache null results (`unless = "#result == null"`)

## Update Behavior

```
updateStatus(apiName, status, message, remark)
  ├─ Record exists → update fields + set updatedAt
  └─ Record missing → insert new record
```

:::tip
The upsert pattern in `updateStatus` eliminates the need for separate create/update endpoints.
:::
