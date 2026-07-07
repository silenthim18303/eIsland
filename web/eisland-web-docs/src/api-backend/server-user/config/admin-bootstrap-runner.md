---
title: AdminBootstrapRunner
---

# AdminBootstrapRunner

:::info
A Spring `@Component` that bootstraps the first admin account on application startup when no admin user exists.
:::

## Overview

`AdminBootstrapRunner` listens for the `ApplicationReadyEvent`. When the `user_account` table contains zero admin users and the configuration properties `admin.bootstrap.username` / `admin.bootstrap.password` are set, it automatically registers the first admin account. This eliminates the need for manual seed scripts in fresh deployments.

## Configuration Properties

| Property | Env / YAML Key | Default | Description |
|---|---|---|---|
| Bootstrap Username | `admin.bootstrap.username` | (empty) | Username for the initial admin |
| Bootstrap Email | `admin.bootstrap.email` | (auto) | Email; falls back to `{username}@admin.local` |
| Bootstrap Password | `admin.bootstrap.password` | (empty) | Plaintext password (hashed on creation) |

## Lifecycle

1. `@EventListener(ApplicationReadyEvent.class)` fires after Spring context is ready.
2. Skips if username or password is blank.
3. Checks `UserService.countByRole(ROLE_ADMIN)` -- exits early if any admin exists.
4. Calls `UserService.register()` with `ROLE_ADMIN`.
5. Logs a warning prompting the admin to change the password after first login.

## Dependencies

- `UserService` -- user registration and role counting.
