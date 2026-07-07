---
title: StaticAssetUrlService
---

# StaticAssetUrlService

:::info
`@Service` that rewrites static asset URLs across multiple cloud storage providers (Cloudflare R2, Aliyun OSS, Tencent COS) based on user tier and node preference.
:::

## Overview

Parses incoming asset URLs, identifies the storage provider and resource type (avatar, wallpaper, feedback, admin-avatar), and rewrites them to the preferred CDN node. Pro users can choose their preferred node; regular users always get R2.

## Methods

| Method | Description |
|---|---|
| `rewriteUrl(url, requestedNode, proUser)` | Rewrite a single URL to the preferred node |
| `resolvePreferredNode(requestedNode, proUser)` | Determine target node based on user tier |

## Asset Nodes

| Enum Value | Aliases | Description |
|---|---|---|
| `R2` | (default) | Cloudflare R2 -- default for all users |
| `COS` | `cos`, `tencent-cos` | Tencent COS -- Pro users only |
| `OSS` | `oss`, `aliyun-oss` | Aliyun OSS -- Pro users only |

## Resource Types

| Type | Description |
|---|---|
| `avatar` | User avatars |
| `wallpaper` | Wallpaper assets |
| `feedback` | Feedback logs and screenshots |
| `admin-avatar` | Admin avatars (mapped to `avatar` for COS/R2) |

## Configuration Properties

### Cloudflare R2

| Prefix | Properties |
|---|---|
| `cloudflare.r2.*` | `endpoint`, `bucket-name`, `public-domain` (avatars) |
| `cloudflare.wallpaper-r2.*` | `endpoint`, `bucket-name`, `public-domain` (wallpapers) |
| `cloudflare.feedback-r2.*` | `endpoint`, `bucket-name`, `public-domain` (feedback) |

### Aliyun OSS

| Prefix | Properties |
|---|---|
| `aliyun.oss.admin-avatar.*` | `endpoint`, `bucket-name`, `domain` |
| `aliyun.oss.avatar.*` | `endpoint`, `bucket-name`, `domain` |
| `aliyun.oss.wallpaper.*` | `endpoint`, `bucket-name`, `domain` |
| `aliyun.oss.feedback.*` | `endpoint`, `bucket-name`, `domain` |

### Tencent COS

| Prefix | Properties |
|---|---|
| `tencent.cos.avatar.*` | `region`, `bucket-name`, `domain` |
| `tencent.cos.wallpaper.*` | `region`, `bucket-name`, `domain` |
| `tencent.cos.feedback.*` | `region`, `bucket-name`, `domain` |

## URL Detection

The service detects asset URLs by matching known domain/endpoint prefixes. As a fallback, it infers the resource type from folder names in the URL path (`/wallpapers/`, `/user-avatars/`, `/admin-avatars/`, `/feedback-logs/`, `/feedback-screenshots/`).

## Fallback Behavior

If the preferred node's configuration is missing, the service falls back to R2. If R2 is also unavailable, the original URL is returned unchanged.
