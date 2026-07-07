---
title: API Backend
icon: server
---

# API Backend

:::info
This section documents the eIsland backend API endpoints, including REST and WebSocket interfaces exposed by the eisland-server.
:::

## Overview

The eIsland backend is a Spring Boot application that provides authentication, media synchronization, user settings, and real-time communication services for the desktop client.

## Modules

| Module | Description |
|---|---|
| [Server Agent](./server-agent/) | AI agent, translation, billing, and admin management |
| [Server Auth](./server-auth/) | Authentication, email verification, issue feedback |
| [Server Payment](./server-payment/) | Payment processing, Alipay and WeChat Pay integration |
| [Server User](./server-user/) | User management, announcements, identity verification, wallpapers |
| [Server Mini Game](./server-mini-game/) | Mini-game scores, leaderboards, and sessions |
| [Server Service Status](./server-service-status/) | Service health monitoring and status management |
| [Server Upload](./server-upload/) | File uploads for avatars and feedback |
| [Server Version](./server-version/) | Application version management |
| [Server Weather](./server-weather/) | Weather forecasts, alerts, and quota management |
| [Server App](./server-app/) | Application configuration and startup services |
| [Server Common](./server-common/) | Shared utilities and configurations |
