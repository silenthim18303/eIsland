---
title: Server Service Status
icon: activity
---

# Server Service Status

:::info
The `server-service-status` module provides service health monitoring and status management.
:::

## Overview

The server-service-status module monitors and manages service health:

- **Status Monitoring** — Check service health status
- **Status Management** — Update service status

:::tip
Status endpoints are public for monitoring. Update endpoints require `ROLE_ADMIN` authorization.
:::

## Module Structure

| Layer | Description |
|---|---|
| [Service Status API](./service-status-api/) | Service health and status endpoints |
