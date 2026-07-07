---
title: CosStorageService
---

# CosStorageService

:::info
Tencent Cloud COS storage implementation with multi-bucket routing for avatar, wallpaper, feedback, and identity resources.
:::

## Overview

`CosStorageService` implements `ObjectStorageClient` for Tencent Cloud COS. It routes uploads to different buckets based on business context (bizType, fieldName, or objectKey prefix), with separate credential sets per resource type.

## Provider

`StorageProvider.COS`

## Bucket Routing

| Resource Type | Detection Logic | Config Prefix |
|---|---|---|
| `avatar` | Default fallback | `tencent.cos.avatar.*` |
| `wallpaper` | bizType contains "wallpaper", fieldName contains "thumb"/"originalUrl", key starts with "wallpapers/" | `tencent.cos.wallpaper.*` |
| `feedback` | bizType contains "feedback", fieldName contains "feedback", key starts with "feedback-"/"feedback/"/"issue-feedback/" | `tencent.cos.feedback.*` |
| `identity` | bizType contains "identity", key starts with "identity-material/" | `tencent.cos.identity.*` |

## Configuration (per bucket)

| Property | Description |
|---|---|
| `tencent.cos.{resource}.region` | COS region (e.g. `ap-guangzhou`) |
| `tencent.cos.{resource}.secret-id` | Secret ID |
| `tencent.cos.{resource}.secret-key` | Secret Key |
| `tencent.cos.{resource}.bucket-name` | Bucket name |
| `tencent.cos.{resource}.domain` | Custom domain (optional) |

## URL Generation

- Custom domain configured: `https://{domain}/{objectKey}`
- No domain: `https://{bucket}.cos.{region}.myqcloud.com/{objectKey}`

:::warning
Each upload creates a new `COSClient` instance and shuts it down in a `finally` block. For high-throughput scenarios, consider connection pooling.
:::
