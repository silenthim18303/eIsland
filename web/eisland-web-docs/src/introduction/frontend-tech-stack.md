---
title: Frontend Tech Stack
icon: layer-group
---

# Frontend Tech Stack

This document provides an overview of the frontend technologies used in the eIsland project.

## Core Framework

### Electron + React + TypeScript

eIsland is built as a desktop application using **Electron** as the runtime environment. The UI layer is implemented with **React 19**, leveraging modern hooks-based patterns for component state and lifecycle management.

**TypeScript** is used throughout the project for type safety and improved developer experience. The codebase uses strict type checking with separate configurations for:

- **Web/Renderer**: `tsconfig.web.json` - Configured for React JSX and bundler module resolution
- **Node/Main**: `tsconfig.node.json` - For Electron main process code

## Build System

### Vite + electron-vite

The project uses **electron-vite**, a specialized build tool that integrates Vite with Electron. This provides:

- Fast hot module replacement during development
- Optimized production builds
- Separate build configurations for main, preload, and renderer processes

```typescript
// electron.vite.config.ts
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/main' }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: { outDir: 'out/preload' }
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    build: { outDir: 'out/renderer' }
  }
});
```

## State Management

### Zustand

**Zustand** is used for global state management. The store is organized using a slice pattern for modularity:

```typescript
// store/slices/index.ts
const useIslandStore = create<IIslandStore>()((set, get, store) => ({
  ...createIslandSlice(set, get, store),
  ...createWeatherSlice(set, get, store),
  ...createTimerSlice(set, get, store),
  ...createNotificationSlice(set, get, store),
  ...createMediaSlice(set, get, store),
  ...createAiSlice(set, get, store),
  ...createPomodoroSlice(set, get, store),
}));
```

Key store slices include:

| Slice | Responsibility |
|-------|---------------|
| `islandSlice` | Core island state and transitions |
| `weatherSlice` | Weather data and location |
| `timerSlice` | Timers and alarms |
| `notificationSlice` | Notification management |
| `mediaSlice` | Music playback state |
| `aiSlice` | AI agent configuration |
| `pomodoroSlice` | Pomodoro timer logic |

## Styling

### Tailwind CSS + CSS Modules

The project uses a hybrid styling approach:

- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
- **Custom CSS**: Modular CSS files for complex component styles

Styles are organized by feature:

```
src/renderer/styles/
├── reset/           # CSS reset
├── shell/           # Island shell styles
├── hover/           # Hover state styles
├── expanded/        # Expanded state styles
├── notification/    # Notification styles
├── agent/           # AI agent styles
├── settings/        # Settings panel styles
└── ...
```

Tailwind is integrated via the `@tailwindcss/vite` plugin for optimal build performance.

## Internationalization

### i18next + react-i18next

The application supports multiple languages using **i18next**:

- **Chinese (zh-CN)**: Primary language
- **English (en-US)**: Secondary language

Language detection and switching:

```typescript
// i18n/index.ts
i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'zh-CN',
  });
```

Translation files are located in `i18n/` directory and loaded at build time.

## Animation

### GSAP (GreenSock Animation Platform)

**GSAP** is used for smooth, performant animations throughout the island's state transitions:

- Morphing between different island states
- Widget entrance/exit animations
- Interactive micro-animations

The animation system supports configurable speeds:

```typescript
const MORPH_DURATION_BY_SPEED = {
  slow: 1100,    // Dramatic transitions
  medium: 550,   // Standard interactions
  fast: 280      // Quick responses
};
```

## UI Components

### Lucide React

**Lucide React** provides a comprehensive set of customizable icons used throughout the application. The icon library offers:

- Consistent design language
- Tree-shakeable imports
- Easy customization via props

## Testing

### Vitest

**Vitest** is used as the testing framework, configured for:

- Unit testing of utility functions
- Component testing
- Mock management with automatic cleanup

```typescript
// vitest.config.ts
export default {
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
};
```

## Additional Libraries

### Data Visualization

- **Highcharts**: Used for performance monitoring charts and data visualization
- **Highcharts React Official**: React wrapper for Highcharts

### Rich Content

- **React Markdown**: Renders markdown content in AI chat responses
- **Remark GFM**: GitHub Flavored Markdown support
- **DOMPurify**: Sanitizes HTML content for security

### Date & Time

- **Lunar JavaScript**: Chinese lunar calendar support
- **React DatePicker**: Date selection components

### Media

- **Color Thief**: Extracts dominant colors from album artwork
- **Lyric Resolver**: Parses and synchronizes song lyrics

### System Integration

- **System Information**: Retrieves system metrics for performance monitoring
- **Electron Updater**: Handles application updates

## Development Tools

### Code Quality

- **TypeScript**: Static type checking
- **ESLint**: Code linting (implied by project structure)
- **Prettier**: Code formatting (implied by project structure)

### Build & Package

- **Electron Builder**: Packages the application for distribution
- **Electron Vite**: Development and build tooling

## Performance Considerations

The frontend stack is optimized for:

1. **Fast Development**: Vite's HMR provides instant feedback during development
2. **Small Bundle Size**: Tree-shaking and code splitting reduce application size
3. **Smooth Animations**: GSAP ensures 60fps animations even on lower-end hardware
4. **Efficient Rendering**: React's virtual DOM minimizes unnecessary re-renders

## Browser Compatibility

As an Electron application, eIsland runs on:

- **Chromium**: Latest stable version (bundled with Electron)
- **Node.js**: LTS version for main process

This ensures consistent behavior across all Windows 10/11 systems without browser compatibility concerns.

---

For detailed API documentation, refer to the source code comments and TypeScript definitions.
