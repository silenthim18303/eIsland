---
title: FeedbackR2StorageService
---

# FeedbackR2StorageService

:::info
Dedicated Cloudflare R2 storage service for feedback attachments (logs, screenshots).
:::

## Overview

`FeedbackR2StorageService` provides a standalone R2 client for feedback-related file uploads. Unlike the general `R2StorageService`, this service uses a separate R2 bucket with independent credentials, isolating feedback storage from general user uploads.

## Provider

`StorageProvider.R2`

## Configuration

| Property | Description |
|---|---|
| `cloudflare.feedback-r2.endpoint` | R2 S3-compatible endpoint |
| `cloudflare.feedback-r2.access-key-id` | R2 access key ID |
| `cloudflare.feedback-r2.access-key-secret` | R2 access key secret |
| `cloudflare.feedback-r2.bucket-name` | R2 bucket name |
| `cloudflare.feedback-r2.public-domain` | Custom public domain (optional) |

## Methods

| Method | Description |
|---|---|
| `upload(file, folder)` | Upload and return public URL |
| `uploadObject(file, folder)` | Upload and return `StorageUploadResult` |

## URL Generation

- Custom domain: `https://{publicDomain}/{objectKey}`
- No domain: `{endpoint}/{bucketName}/{objectKey}`

:::tip
This service does not implement the `ObjectStorageClient` interface's `putObject` methods. Use the general `R2StorageService` for byte-array uploads.
:::
