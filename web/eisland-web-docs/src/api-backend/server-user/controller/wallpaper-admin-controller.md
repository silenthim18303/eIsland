---
title: Wallpaper Admin API
---

# Wallpaper Admin API

:::info
Admin wallpaper management endpoints under `/v1/admin/wallpapers/`. Requires `ROLE_ADMIN` authorization.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /v1/admin/wallpapers/list | List all wallpapers |
| PUT | /v1/admin/wallpapers/metadata | Update wallpaper metadata |
| PUT | /v1/admin/wallpapers/review | Review wallpaper |
| GET | /v1/admin/wallpapers/reports | List wallpaper reports |
| PUT | /v1/admin/wallpapers/reports/resolve | Resolve wallpaper report |
| GET | /v1/admin/wallpapers/ratings | List wallpaper ratings |
| DELETE | /v1/admin/wallpapers/ratings | Delete wallpaper rating |
| DELETE | /v1/admin/wallpapers/delete | Delete wallpaper |

:::warning
Admin deletions are permanent and cannot be undone. Review reports carefully before taking action.
:::
