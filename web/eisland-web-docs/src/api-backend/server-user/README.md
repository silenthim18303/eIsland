---
title: Server User
icon: users
---

# Server User

:::info
The `server-user` module handles user management, announcements, identity verification, toolbox software, and wallpaper services.
:::

## Overview

The server-user module provides comprehensive user-related services:

- **User Management** — User CRUD, role management, profile updates
- **Announcements** — System announcement management
- **Identity Verification** — User identity verification flow
- **Toolbox Software** — Software listing and management
- **Wallpaper Services** — Wallpaper upload, management, rating, and reporting

:::tip
All admin endpoints require `ROLE_ADMIN` authorization. User endpoints require valid JWT authentication.
:::

## Module Structure

| Layer | Description |
|---|---|
| [User API](./user-api/) | User profile and account management |
| [User Admin API](./user-admin-api/) | Admin user management |
| [App User API](./app-user-api/) | App user statistics and management |
| [Announcement API](./announcement-api/) | System announcement management |
| [Identity Verification API](./identity-verification-api/) | User identity verification |
| [Identity Admin API](./identity-admin-api/) | Admin identity verification management |
| [Toolbox Software API](./toolbox-software-api/) | Toolbox software management |
| [Wallpaper User API](./wallpaper-user-api/) | User wallpaper operations |
| [Wallpaper Admin API](./wallpaper-admin-api/) | Admin wallpaper management |
| [Wallpaper Tag API](./wallpaper-tag-api/) | Wallpaper tag management |
