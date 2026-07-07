---
title: Server Version
icon: tag
---

# Server Version

:::info
The `server-version` module handles application version management and update tracking.
:::

## Overview

The server-version module provides version management services:

- **Version CRUD** — Create, read, update, and delete versions
- **Update Tracking** — Track application update counts

:::tip
Version management endpoints require `ROLE_ADMIN` authorization. Public endpoints are available for version checking.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Version API](./version-api/) | Version management endpoints |
