---
title: ServiceStatusMapper
---

# ServiceStatusMapper

:::info
MyBatis mapper interface for API status record CRUD operations.
:::

## Overview

`ServiceStatusMapper` provides data access for the `service_status` table, supporting single lookup, list query, update, and insert operations.

## Methods

| Method | Description | Returns |
|---|---|---|
| `selectByApiName(apiName)` | Query status by API name | `ServiceStatus` or null |
| `selectAll()` | Query all status records | `List<ServiceStatus>` |
| `update(serviceStatus)` | Update an existing status record | Affected rows |
| `insert(serviceStatus)` | Insert a new status record | Affected rows |
