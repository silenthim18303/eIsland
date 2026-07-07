---
title: R2StorageService
---

# R2StorageService

:::info
Cloudflare R2 storage implementation using the S3-compatible API with legacy URL rewriting support.
:::

## Overview

`R2StorageService` implements `ObjectStorageClient` for Cloudflare R2. It uses the AWS S3 SDK with path-style access and `auto` region. Includes a `rewriteLegacyUrl` method to migrate historical private endpoint URLs and `*.r2.dev` public URLs to the configured public domain.

## Provider

`StorageProvider.R2`

## Configuration

| Property | Description |
|---|---|
| `cloudflare.r2.endpoint` | R2 S3-compatible endpoint |
| `cloudflare.r2.access-key-id` | R2 access key ID |
| `cloudflare.r2.access-key-secret` | R2 access key secret |
| `cloudflare.r2.bucket-name` | R2 bucket name |
| `cloudflare.r2.public-domain` | Custom public domain (optional) |

## Key Methods

| Method | Description |
|---|---|
| `uploadObject(file, folder)` | Upload with UUID-based object key |
| `putObject(objectKey, content, contentType)` | Write binary content to a specific key |
| `rewriteLegacyUrl(url)` | Rewrite old R2 endpoint URLs to current public domain |

## URL Rewriting

`rewriteLegacyUrl` handles two legacy patterns:

1. **`*.r2.dev` domains** — Replaces `pub-xxx.r2.dev` with configured `publicDomain`
2. **Private endpoint URLs** — Replaces `{endpoint}/{bucket}/{key}` with `{publicDomain}/{key}`

## URL Generation

- Custom domain: `https://{publicDomain}/{objectKey}`
- No domain: `{endpoint}/{bucketName}/{objectKey}`

:::tip
The `rewriteLegacyUrl` method is useful for migrating existing database records that stored private R2 endpoint URLs.
:::
