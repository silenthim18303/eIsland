---
title: Wallpaper Tag API
---

# Wallpaper Tag API

:::info
Wallpaper tag management endpoints. User endpoints under `/v1/user/tags/`. Admin endpoints under `/v1/admin/tags/`.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/user/tags/search | Search tags (user) |
| GET | /v1/admin/tags/list | List all tags (admin) |
| PUT | /v1/admin/tags/update | Update tag name (admin) |
| PUT | /v1/admin/tags/enable | Enable/disable tag (admin) |
| DELETE | /v1/admin/tags/delete | Delete tag (admin) |

:::tip
Users can search tags when uploading wallpapers. Admins can manage all tag operations.
:::
