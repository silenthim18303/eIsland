---
title: OssService
---

# OssService

:::info
Alibaba Cloud OSS storage implementation with multi-bucket routing for admin-avatar, avatar, wallpaper, feedback, and identity resources.
:::

## Overview

`OssService` implements `ObjectStorageClient` for Alibaba Cloud OSS. It routes uploads to five separate buckets based on business context, with independent credential sets per resource type. Supports both custom domain and virtual-host-style URL generation.

## Provider

`StorageProvider.OSS`

## Bucket Routing

| Resource Type | Detection Logic | Config Prefix |
|---|---|---|
| `admin-avatar` | bizType contains "admin"+"avatar", fieldName contains "admin"+"avatar", key starts with "admin-avatars/"/"admin-avatar/" | `aliyun.oss.admin-avatar.*` |
| `avatar` | Default fallback | `aliyun.oss.avatar.*` |
| `wallpaper` | bizType contains "wallpaper", fieldName contains "thumb"/"originalUrl", key starts with "wallpapers/" | `aliyun.oss.wallpaper.*` |
| `feedback` | bizType contains "feedback", fieldName contains "feedback", key starts with "feedback-"/"feedback/"/"issue-feedback/" | `aliyun.oss.feedback.*` |
| `identity` | bizType contains "identity", key starts with "identity-material/" | `aliyun.oss.identity.*` |

## Configuration (per bucket)

| Property | Description |
|---|---|
| `aliyun.oss.{resource}.endpoint` | OSS endpoint |
| `aliyun.oss.{resource}.access-key-id` | Access key ID |
| `aliyun.oss.{resource}.access-key-secret` | Access key secret |
| `aliyun.oss.{resource}.bucket-name` | Bucket name |
| `aliyun.oss.{resource}.domain` | Custom domain (optional) |

## URL Generation

- Custom domain: `https://{domain}/{objectKey}`
- No domain (virtual-host): `https://{bucket}.{endpoint}/{objectKey}`

:::tip
Endpoints without a scheme prefix are automatically normalized to `https://`.
:::
