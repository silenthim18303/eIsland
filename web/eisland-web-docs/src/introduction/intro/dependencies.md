---
title: Project Dependencies
icon: box
---

# Project Dependencies

:::info
This document provides a non-technical overview of the libraries and tools that power eIsland. Each dependency is explained by what it does for the user, not how it works internally.
:::

## Core Framework

These are the foundational technologies that eIsland is built upon.

| Technology | What It Does |
|------------|--------------|
| **Electron** | The engine that lets eIsland run as a native Windows desktop application using web technologies. It combines a browser window with system-level access, so the island can float on your desktop while still interacting with the operating system. |
| **React** | The UI toolkit used to build all of eIsland's visual components — the island itself, widgets, settings panels, and everything you see and interact with. |
| **TypeScript** | A safer version of JavaScript that catches errors before the app runs, helping developers write more reliable code. |

:::tip
Electron is the same technology behind popular apps like Discord, VS Code, and Slack. It allows developers to build desktop applications using web technologies while still accessing native Windows features.
:::

## Visual & Animation

Libraries that make the island look and feel smooth.

| Library | What It Does |
|---------|--------------|
| **GSAP** | A professional animation engine that powers the island's smooth transitions — expanding, collapsing, morphing between states, and widget animations. |
| **Tailwind CSS** | A styling system that defines the visual appearance of every element, from colors and spacing to layout and typography. |
| **Lucide React** | Provides all the icons you see throughout the app — settings gears, music notes, weather symbols, and more. |
| **Color Thief** | Extracts the dominant color from album art or images, allowing the island to match its color theme to what you're listening to or viewing. |

:::details How Color Thief Works — Visual Example
When you play a song with a blue album cover, Color Thief analyzes the image and tells the island to use a matching blue tint. This creates a visually cohesive experience where the island feels like part of the music.
:::

## Data Visualization & Content

Libraries that help display information inside the island.

| Library | What It Does |
|---------|--------------|
| **Highcharts** | Renders interactive charts and graphs used in widgets like system monitoring and stock tracking. |
| **React Markdown** | Displays formatted text (bold, links, lists, code blocks) in areas like the AI assistant's responses. |
| **React Date Picker** | Provides the calendar and date selection interface used in scheduling and reminder features. |

## State Management

How the app remembers and coordinates information.

| Library | What It Does |
|---------|--------------|
| **Zustand** | Acts as the app's shared memory. When you change a setting or the music changes track, Zustand makes sure every part of the island instantly knows about the update. |

:::important
State management is critical to eIsland's responsiveness. Zustand ensures that when one part of the island changes (e.g., music starts playing), all related components (lyrics display, album art, notification) update instantly without delay.
:::

## Widget Data Sources

These libraries fetch real-world data for the island's widgets.

| Library | What It Powers |
|---------|----------------|
| **OpenMeteo** | **Weather Widget** — fetches current weather conditions and forecasts from the Open-Meteo weather service. |
| **Stock API** | **Stock Widget** — retrieves real-time stock market prices and trends. |
| **ImapFlow & MailParser** | **Email Widget** — connects to your email inbox (via IMAP) and reads incoming messages. |
| **System Information** | **System Monitor Widget** — reads your computer's CPU usage, memory, disk space, network speed, and battery level. |
| **Lunar JavaScript** | **Calendar Widget** — calculates Chinese lunar calendar dates, holidays, and solar terms. |
| **Lyric Resolver** | **Music Widget** — processes and synchronizes song lyrics with playback. |
| **Fetch Installed Software** | Detects which applications are installed on your system (used for app-aware features). |
| **Get Windows** | Detects which windows are currently open on your desktop. |

:::warning
Widget data sources that connect to the internet (Weather, Stocks, Email) require an active network connection. If you are offline, these widgets will display cached data or show a connection error.
:::

:::details Email Widget — Privacy Note
The Email Widget connects directly to your email provider's IMAP server. Your email credentials are stored locally on your device and are never sent to eIsland's servers. The `ImapFlow` library handles the secure connection, and `MailParser` processes the message content for display.
:::

## Internationalization

| Library | What It Does |
|---------|--------------|
| **i18next & React i18next** | Powers the app's multi-language support. Allows eIsland to display all text in the user's preferred language. |

:::tip
To contribute a new language translation, developers add translation files to the project's `locales` directory. The i18next library automatically loads the correct language based on your system settings.
:::

## Security

| Library | What It Does |
|---------|--------------|
| **DOMPurify** | Sanitizes any external HTML content (like web data or user input) before displaying it, preventing malicious code from running inside the app. |

:::danger
Security is a top priority. DOMPurify acts as a safety filter — it removes any potentially harmful code from external content before the app displays it. This protects users from cross-site scripting (XSS) attacks that could otherwise compromise the application.
:::

## Windows Native Plugins

eIsland uses four custom-built plugins that communicate directly with the Windows operating system for features that web technologies alone cannot provide.

| Plugin | What It Does |
|--------|--------------|
| **Windows Fullscreen Detector** | Detects when a fullscreen application (like a game or video) is running, so the island can automatically hide itself and avoid blocking your view. |
| **Windows Performance Monitor** | Reads your computer's CPU usage, memory consumption, and temperature sensors with minimal overhead, providing data for the system monitor widget. |
| **Windows Toast Listener** | Monitors Windows notification center for new toast notifications, allowing the island to display notification previews. |
| **Windows Processes Attacker** | Manages Windows processes — used to close specific applications when needed (e.g., during cleanup or automation). |

:::note
These plugins are written in C and C++ for maximum performance and use Windows system libraries (kernel32, user32, dwmapi) to access low-level operating system features.
:::

:::warning
Windows Native Plugins are only available on Windows. They require the Windows SDK and a C/C++ compiler (node-gyp) to build from source. These plugins will not work on macOS or Linux.
:::

:::details Native System Libraries Used by Plugins
Each plugin links against specific Windows system libraries:

- **kernel32.lib** — Used by `windows-processes-attacker` for process management (creating, terminating, and querying processes).
- **user32.lib** — Used by `windows-fullscreen-detector` for window management APIs (finding windows, checking their state).
- **dwmapi.lib** — Used by `windows-fullscreen-detector` for Desktop Window Manager APIs (detecting fullscreen mode).
- **runtimeobject.lib** — Used by `windows-toast-listener` for Windows Runtime APIs (accessing the notification center).
:::

## Auto-Update

| Library | What It Does |
|---------|--------------|
| **Electron Updater** | Handles automatic updates. When a new version of eIsland is available, it downloads and installs the update in the background so you always have the latest features and fixes. |

:::tip
Auto-updates run silently in the background. You will see a notification when an update is ready to install. You can also manually check for updates in the Settings panel.
:::

## Media Processing

| Library | What It Does |
|---------|--------------|
| **FFmpeg** | A media processing toolkit bundled with the app. Handles audio and video operations needed by the music and media widgets. |

:::note
FFmpeg is bundled as a static binary — it does not require a separate installation on your system. The app includes only the components it needs, keeping the installer size reasonable.
:::

## Build & Development Tools

These are tools developers use to build, test, and package eIsland. They are not part of the app users interact with.

| Tool | What It Does |
|------|--------------|
| **Vite & Electron Vite** | The build system that compiles all the source code into the final application. Think of it as the "factory" that assembles eIsland. |
| **Electron Builder** | Packages the compiled application into a Windows installer (`.exe`) that users can download and install. |
| **Vitest** | The testing framework that runs thousands of automated tests to verify everything works correctly before each release. |
| **Node-Gyp** | Compiles the native C/C++ plugins into binaries that Windows can execute. |
| **ESLint** | A code quality checker that enforces consistent coding style and catches common mistakes. |

:::details How the Build Pipeline Works
The build process follows these steps:

1. **TypeScript Compilation** — TypeScript code is compiled into JavaScript.
2. **Vite Bundling** — Vite bundles all JavaScript, CSS, and assets into optimized packages.
3. **Native Plugin Compilation** — Node-Gyp compiles C/C++ plugin source code into Windows binaries.
4. **Electron Packaging** — Electron Builder packages everything into a single `.exe` installer.
5. **Testing** — Vitest runs automated tests to verify the build is correct.
:::

## Documentation Website

The tools used to build and host this documentation site.

| Tool | What It Does |
|------|--------------|
| **VuePress** | The static site generator that turns these Markdown documents into a browsable website with navigation, search, and theming. |
| **VuePress Theme Hope** | The theme that provides the documentation site's layout, sidebar, dark mode, and additional features like watermarks. |
| **Slim Search** | Adds client-side search to the documentation, allowing visitors to quickly find information across all pages. |
