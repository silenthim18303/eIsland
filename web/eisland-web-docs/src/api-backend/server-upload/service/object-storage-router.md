---
title: ObjectStorageRouter
---

# ObjectStorageRouter

:::info
Registry component that routes storage operations to the correct provider implementation by `StorageProvider` enum.
:::

## Overview

`ObjectStorageRouter` collects all `ObjectStorageClient` implementations via Spring injection and indexes them by their `StorageProvider` enum value. Callers request a client by provider name, eliminating direct dependency on concrete implementations.

## Methods

| Method | Description |
|---|---|
| `get(StorageProvider)` | Returns the client for the given provider; throws `IllegalArgumentException` if unsupported |

## Supported Providers

| Enum | Client | Description |
|---|---|---|
| `R2` | `R2StorageService` | Cloudflare R2 |
| `OSS` | `OssService` | Alibaba Cloud OSS |
| `COS` | `CosStorageService` | Tencent Cloud COS |

:::tip
The router uses an `EnumMap` internally for O(1) provider lookup.
:::
