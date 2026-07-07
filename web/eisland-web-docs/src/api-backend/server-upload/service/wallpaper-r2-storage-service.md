---
title: WallpaperR2StorageService
---

# WallpaperR2StorageService

:::info
Dedicated Cloudflare R2 storage service for wallpaper marketplace assets with batch deletion support.
:::

## Overview

`WallpaperR2StorageService` provides a standalone R2 client for wallpaper marketplace file uploads and deletions. Uses a separate R2 bucket with independent credentials. Supports batch deletion by public URL, with intelligent URL-to-object-key extraction across multiple URL formats.

## Provider

`StorageProvider.R2`

## Configuration

| Property | Description |
|---|---|
| `cloudflare.wallpaper-r2.endpoint` | R2 S3-compatible endpoint |
| `cloudflare.wallpaper-r2.access-key-id` | R2 access key ID |
| `cloudflare.wallpaper-r2.access-key-secret` | R2 access key secret |
| `cloudflare.wallpaper-r2.bucket-name` | R2 bucket name |
| `cloudflare.wallpaper-r2.public-domain` | Custom public domain (optional) |

## Methods

| Method | Description |
|---|---|
| `upload(file, folder)` | Upload and return public URL |
| `uploadObject(file, folder)` | Upload and return `StorageUploadResult` |
| `deleteAll(publicUrls)` | Batch delete objects by public URL list |

## URL-to-Key Extraction

`deleteAll` resolves object keys from public URLs by matching against:

1. Custom public domain prefix
2. Endpoint + bucket prefix
3. Legacy `*.r2.dev` domain format

Unrecognized URLs are silently skipped.

:::warning
Failed individual deletions within `deleteAll` are logged as warnings but do not abort the batch. The S3 client is shared across all deletions in the batch.
:::
