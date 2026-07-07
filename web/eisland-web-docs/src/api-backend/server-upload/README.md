---
title: Server Upload
icon: upload
---

# Server Upload

:::info
The `server-upload` module handles file uploads for avatars, feedback logs, and screenshots.
:::

## Overview

The server-upload module provides file upload services:

- **Avatar Uploads** — Admin and user avatar uploads
- **Feedback Uploads** — Feedback log and screenshot uploads

:::tip
All upload endpoints require JWT authentication. File size and type restrictions apply.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Upload API](./upload-api/) | File upload endpoints |
