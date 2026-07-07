---
title: API Frontend
icon: display
---

# API Frontend

:::info
This section documents the eIsland frontend API surface, including the Electron preload bridge, IPC channels, and renderer-side utilities exposed to the application.
:::

## Overview

The eIsland frontend runs in Electron's renderer process with a secure preload bridge (`window.api`) that wraps IPC communication with the main process. This API surface includes settings management, media controls, system integration, and window management.

:::warning
This section is under construction. Frontend API documentation will be added as the API surface stabilizes.
:::
