---
title: Wallpaper User API
---

# Wallpaper User API

:::info
User wallpaper endpoints under `/v1/user/wallpapers/`. Requires JWT authentication with USER, PRO, or ADMIN role.
:::

## Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /v1/user/wallpapers/upload | Upload wallpaper |
| GET | /v1/user/wallpapers/list | List wallpapers |
| GET | /v1/user/wallpapers/mine | List user's own wallpapers |
| GET | /v1/user/wallpapers/detail | Get wallpaper details |
| PUT | /v1/user/wallpapers/metadata | Update wallpaper metadata |
| PUT | /v1/user/wallpapers/replace-source | Replace wallpaper source |
| DELETE | /v1/user/wallpapers/delete | Delete wallpaper |
| POST | /v1/user/wallpapers/apply | Apply wallpaper |
| POST | /v1/user/wallpapers/rate | Rate wallpaper |
| POST | /v1/user/wallpapers/report | Report wallpaper |

:::tip
Users can only edit/delete their own wallpapers. Reports are reviewed by admins.
:::
