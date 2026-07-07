---
title: ObjectStorageClient
---

# ObjectStorageClient

:::info
Unified interface abstracting multi-provider object storage operations (R2, OSS, COS).
:::

## Overview

`ObjectStorageClient` defines the contract that all storage provider implementations must fulfill. It supports file-based uploads (from `MultipartFile`) and byte-array uploads with optional business context for provider-specific bucket routing.

## Methods

| Method | Description |
|---|---|
| `provider()` | Returns the `StorageProvider` enum for this client |
| `uploadObject(file, folder)` | Upload a `MultipartFile` and return a `StorageUploadResult` |
| `putObject(objectKey, content, contentType)` | Write binary content to a specific object key |
| `putObject(objectKey, content, contentType, bizType, fieldName)` | Write with business context for bucket routing (default delegates to basic `putObject`) |

## Implementations

| Class | Provider | Description |
|---|---|---|
| `R2StorageService` | `R2` | Cloudflare R2 (S3-compatible) |
| `OssService` | `OSS` | Alibaba Cloud OSS (multi-bucket) |
| `CosStorageService` | `COS` | Tencent Cloud COS (multi-bucket) |

## StorageUploadResult

| Field | Type | Description |
|---|---|---|
| `provider` | `StorageProvider` | Which provider stored the object |
| `bucketName` | `String` | Storage bucket name |
| `objectKey` | `String` | Object key within the bucket |
| `publicUrl` | `String` | Publicly accessible URL |
| `contentType` | `String` | MIME type |
| `contentLength` | `long` | Content size in bytes |

:::tip
The `putObject` overload with `bizType` and `fieldName` enables provider implementations to route to different buckets based on business context (e.g., avatar vs. wallpaper vs. feedback).
:::
