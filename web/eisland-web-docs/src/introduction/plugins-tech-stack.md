---
title: Plugins Tech Stack
icon: layer-group
---

# Plugins Tech Stack

This document provides an overview of the native Node.js addon plugins used in the eIsland application. All plugins are Windows-only, built with **C** and **Node-API (N-API)** via **node-gyp**, and exposed to the Electron main process as synchronous native modules.

## Overview

The eIsland plugin system consists of three native addons that provide low-level Windows system capabilities unavailable through standard Node.js APIs:

| Plugin | Package | Purpose |
|--------|---------|---------|
| **Processes Attacker** | `@eisland/windows-processes-attacker` | Terminate processes by name or PID |
| **Fullscreen Detector** | `@eisland/windows-fullscreen-detector` | Detect foreground fullscreen windows |
| **Performance Monitor** | `@eisland/windows-performance-monitor` | CPU, memory, and temperature snapshots |

**Common Characteristics:**

- **Language**: C (core logic) + Node-API binding layer
- **Build System**: `node-gyp` with `binding.gyp` configuration
- **Platform**: Windows only (`"os": ["win32"]`)
- **Architecture**: x64, arm64, ia32
- **License**: GPL-3.0
- **Module Format**: Synchronous N-API exports (no async callbacks)
- **TypeScript**: `.d.ts` type declarations provided

## Build System

### Node-Gyp Configuration

Each plugin uses a `binding.gyp` file to define compilation targets:

```json
{
  "targets": [
    {
      "target_name": "windows_fullscreen_detector",
      "sources": ["src/fullscreen_detector.c", "src/fullscreen_core.c"],
      "defines": ["WIN32_LEAN_AND_MEAN", "NAPI_VERSION=8"],
      "libraries": ["user32.lib", "dwmapi.lib"]
    }
  ]
}
```

**Build Commands:**

```bash
node-gyp rebuild    # Clean + configure + compile
node-gyp clean      # Remove build artifacts
```

**Output**: `build/Release/{module_name}.node` — a native DLL loaded by Node.js at runtime.

### N-API Version

All plugins target **NAPI_VERSION=8**, providing:

- Stable ABI across Node.js versions (no recompilation needed on Node upgrades)
- `napi_create_int32`, `napi_create_double`, `napi_create_string_utf16` — typed value creation
- `napi_define_properties` — module export registration
- `NAPI_MODULE` macro — automatic module initialization

### Win32 Libraries Used

| Plugin | Libraries | Purpose |
|--------|-----------|---------|
| **Processes Attacker** | `kernel32.lib` | Process enumeration (`CreateToolhelp32Snapshot`), termination (`TerminateProcess`) |
| **Fullscreen Detector** | `user32.lib`, `dwmapi.lib` | Window enumeration (`EnumWindows`), DWM frame bounds (`DwmGetWindowAttribute`) |
| **Performance Monitor** | _(none linked)_ | Uses `GetSystemTimes`, `GlobalMemoryStatusEx` from kernel32 (auto-linked) |

## Plugin: Windows Processes Attacker

### Package

```
@eisland/windows-processes-attacker
```

### Purpose

Provides the ability to terminate Windows processes by name or process ID. Used by the eIsland AI agent's `win.close` tool and the `hide-process` IPC domain.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  JavaScript Layer                                           │
│  closeProcess(target) / closeProcesses(targets[])           │
└──────────────────────────┬──────────────────────────────────┘
                           │ N-API
┌──────────────────────────▼──────────────────────────────────┐
│  napi_binding.c                                             │
│  Argument parsing: string → name target, number → PID target│
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  process_ops.c                                              │
│  CreateToolhelp32Snapshot → Process32FirstW/NextW           │
│  → OpenProcess → TerminateProcess                           │
└─────────────────────────────────────────────────────────────┘
```

### Exported Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `closeProcess` | `(target: string \| number) → ProcessCloseResult` | Terminate all processes matching a single target |
| `closeProcesses` | `(targets: (string \| number)[]) → ProcessCloseResult[]` | Terminate processes for each target in an array |

### Target Types

| Input Type | Matching Strategy | Example |
|------------|-------------------|---------|
| `string` | Process name (case-insensitive, auto-appends `.exe`) | `"notepad"`, `"chrome.exe"` |
| `number` | Process ID (exact match) | `12345` |

### Result Structure

```ts
interface ProcessCloseResult {
  target: string | number;       // Original target
  matchedCount: number;          // Processes found matching target
  terminatedCount: number;       // Successfully terminated
  failedCount: number;           // Failed to terminate
  failures: ProcessFailure[];    // Details of failures
}

interface ProcessFailure {
  pid: number;                   // Process ID
  name: string;                  // Process name
  errorCode: number;             // Win32 error code
}
```

### Key Implementation Details

**Process Enumeration:**

```c
bool close_matching_processes(const ProcessTarget* target, ProcessCloseResult* result) {
  HANDLE snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  PROCESSENTRY32W entry;
  entry.dwSize = sizeof(PROCESSENTRY32W);

  Process32FirstW(snapshot, &entry);
  do {
    if (entry_matches_target(&entry, target)) {
      close_process_by_entry(&entry, result);
    }
  } while (Process32NextW(snapshot, &entry));

  CloseHandle(snapshot);
}
```

**Name Normalization:**

- Automatically appends `.exe` if not present
- Case-insensitive comparison via `_wcsicmp`
- Supports both `"notepad"` and `"notepad.exe"` as input

**Termination:**

- Uses `OpenProcess(PROCESS_TERMINATE, ...)` + `TerminateProcess(handle, 1)`
- Exit code `1` signals termination by eIsland
- Records Win32 error codes for failed terminations

### Source Files

| File | Responsibility |
|------|---------------|
| `processes_attacker.c` | Module entry point, N-API export registration |
| `napi_binding.c` | Argument parsing, JS-to-C type conversion |
| `napi_helpers.c` | JS value creation helpers (objects, arrays, strings) |
| `process_ops.c` | Process enumeration and termination logic |
| `string_utils.c` | Wide-string normalization and matching |
| `types.h` | Shared type definitions (`ProcessTarget`, `ProcessCloseResult`) |

## Plugin: Windows Fullscreen Detector

### Package

```
@eisland/windows-fullscreen-detector
```

### Purpose

Detects whether any window is currently in fullscreen mode. Used by eIsland to auto-hide the dynamic island when a user enters fullscreen (e.g., watching a video, gaming, or presenting).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  JavaScript Layer                                           │
│  getForegroundFullscreenWindow()                            │
│  getFullscreenWindows()                                     │
│  isAnyFullscreenWindow()                                    │
└──────────────────────────┬──────────────────────────────────┘
                           │ N-API
┌──────────────────────────▼──────────────────────────────────┐
│  fullscreen_detector.c                                      │
│  N-API binding: EnumWindows callback → JS array conversion  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│  fullscreen_core.c                                          │
│  Window filtering + monitor bounds comparison               │
│  DwmGetWindowAttribute(DWMWA_EXTENDED_FRAME_BOUNDS)         │
└─────────────────────────────────────────────────────────────┘
```

### Exported Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getForegroundFullscreenWindow` | `() → FullscreenWindowInfo \| null` | Returns the foreground window if it is fullscreen, otherwise `null` |
| `getFullscreenWindows` | `() → FullscreenWindowInfo[]` | Returns all currently fullscreen windows across all monitors |
| `isAnyFullscreenWindow` | `() → boolean` | Quick boolean check — `true` if the foreground window is fullscreen |

### Result Structure

```ts
interface FullscreenWindowInfo {
  hwnd: string;                    // Window handle as hex string (e.g., "0x1a2b3c")
  title: string;                   // Window title
  processId: number;               // Owning process ID
  bounds: NativeRect;              // Window bounds (DWM-adjusted)
  monitor: NativeMonitorInfo;      // Monitor the window is on
  isForeground: boolean;           // Whether this is the foreground window
}

interface NativeRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface NativeMonitorInfo extends NativeRect {
  isPrimary: boolean;              // Whether this is the primary monitor
}
```

### Fullscreen Detection Algorithm

The detection uses a **bounds-comparison approach** with DWM awareness:

```c
BOOL get_fullscreen_info(HWND hwnd, FullscreenWindowInfo* info) {
  // 1. Filter candidate windows
  if (!is_candidate_window(hwnd)) return FALSE;

  // 2. Get DWM-adjusted window bounds
  RECT bounds;
  DwmGetWindowAttribute(hwnd, DWMWA_EXTENDED_FRAME_BOUNDS, &bounds, sizeof(RECT));

  // 3. Get monitor that owns this window
  HMONITOR monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
  GetMonitorInfoW(monitor, &monitor_info);

  // 4. Compare window bounds to monitor bounds (with tolerance)
  if (!is_rect_close_to_monitor(&bounds, &monitor_info.rcMonitor))
    return FALSE;

  // 5. Populate result
  info->hwnd = hwnd;
  info->bounds = bounds;
  info->monitor_info = monitor_info;
  GetWindowThreadProcessId(hwnd, &info->process_id);
  GetWindowTextW(hwnd, info->title, TITLE_BUFFER_LENGTH);
  return TRUE;
}
```

**Window Filtering Rules:**

| Check | API | Purpose |
|-------|-----|---------|
| Valid window | `IsWindow(hwnd)` | Skip destroyed windows |
| Visible | `IsWindowVisible(hwnd)` | Skip hidden windows |
| Not minimized | `!IsIconic(hwnd)` | Skip minimized windows |
| Not disabled | `!(style & WS_DISABLED)` | Skip disabled windows |
| Not tool window | `!(ex_style & WS_EX_TOOLWINDOW)` | Skip floating tool windows |

**Bounds Comparison:**

```c
#define FULLSCREEN_TOLERANCE_PX 2

static BOOL is_rect_close_to_monitor(const RECT* window_rect, const RECT* monitor_rect) {
  return abs(window_rect->left - monitor_rect->left) <= FULLSCREEN_TOLERANCE_PX &&
         abs(window_rect->top - monitor_rect->top) <= FULLSCREEN_TOLERANCE_PX &&
         abs(window_rect->right - monitor_rect->right) <= FULLSCREEN_TOLERANCE_PX &&
         abs(window_rect->bottom - monitor_rect->bottom) <= FULLSCREEN_TOLERANCE_PX;
}
```

A 2-pixel tolerance handles windows that report slightly off-monitor bounds (common with DWM compositing).

**Multi-Monitor Support:**

- `EnumWindows` iterates all top-level windows across all monitors
- `MonitorFromWindow` resolves which monitor owns each window
- Each result includes the monitor's `rcMonitor` bounds and `isPrimary` flag

### Source Files

| File | Responsibility |
|------|---------------|
| `fullscreen_detector.c` | N-API binding layer, JS value construction |
| `fullscreen_core.c` | Core detection logic, window enumeration callback |
| `fullscreen_types.h` | Shared type definitions (`FullscreenWindowInfo`, `WindowList`) |

## Plugin: Windows Performance Monitor

### Package

```
@eisland/windows-performance-monitor
```

### Purpose

Provides low-overhead system performance snapshots for CPU usage, memory utilization, and hardware temperatures. Used by the eIsland system monitoring UI and the AI agent's `monitor.*` tools.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  JavaScript Layer (index.js)                                │
│  getCpu() / getMemory()  ← native binding                   │
│  getTemperature() / getHardwareList() ← .NET helper process │
└────────┬──────────────────────────────────┬─────────────────┘
         │ N-API                            │ spawnSync
┌────────▼───────────────┐    ┌─────────────▼─────────────────┐
│  performance_monitor.c │    │  eIslandTemperatureReader.exe │
│  N-API binding         │    │  .NET 10 + LibreHardware      │
├────────────────────────┤    │  MonitorLib                   │
│  performance_core.c    │    ├───────────────────────────────┤
│  GetSystemTimes        │    │  TemperatureCollector         │
│  GlobalMemoryStatusEx  │    │  HardwareListCollector        │
└────────────────────────┘    └───────────────────────────────┘
```

### Exported Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `getCpu` | `() → CpuSnapshot` | CPU usage percentage (delta-based) |
| `getMemory` | `() → MemorySnapshot` | Memory usage (total, used, available) |
| `getTemperature` | `() → TemperatureSnapshot` | Hardware temperature readings via .NET helper |
| `getHardwareList` | `() → HardwareListSnapshot` | CPU and GPU device enumeration via .NET helper |

### CPU Snapshot

```ts
interface CpuSnapshot {
  usagePercent: number;    // 0–100, CPU usage since last call
  hasBaseline: boolean;    // false on first call (no prior delta)
}
```

**Implementation:**

```c
bool get_cpu_snapshot(CpuSnapshot* snapshot) {
  FILETIME idle_time, kernel_time, user_time;
  GetSystemTimes(&idle_time, &kernel_time, &user_time);

  // Delta calculation
  ULONGLONG total_delta = (kernel - last_kernel) + (user - last_user);
  ULONGLONG idle_delta = idle - last_idle;

  snapshot->usage_percent = clamp_percent(
    (double)(total_delta - idle_delta) * 100.0 / (double)total_delta
  );
}
```

- Uses `GetSystemTimes` for kernel-level CPU time accounting
- **Delta-based**: each call computes usage since the previous call
- First call returns `hasBaseline: false` (no prior data for delta)
- `clamp_percent` ensures values stay within [0, 100]

### Memory Snapshot

```ts
interface MemorySnapshot {
  totalBytes: number;       // Total physical memory
  usedBytes: number;        // Total - Available
  availableBytes: number;   // Available physical memory
  usagePercent: number;     // 0–100
}
```

**Implementation:**

```c
bool get_memory_snapshot(MemorySnapshot* snapshot) {
  MEMORYSTATUSEX status;
  status.dwLength = sizeof(status);
  GlobalMemoryStatusEx(&status);

  snapshot->total_bytes = status.ullTotalPhys;
  snapshot->available_bytes = status.ullAvailPhys;
  snapshot->used_bytes = status.ullTotalPhys - status.ullAvailPhys;
  snapshot->usage_percent = (double)used * 100.0 / (double)total;
}
```

- Uses `GlobalMemoryStatusEx` for system-wide memory stats
- Returns raw bytes (as `double` to avoid JS number precision limits)

### Temperature Snapshot

```ts
interface TemperatureSnapshot {
  isAvailable: boolean;                    // Whether readings were obtained
  readings: TemperatureReading[];          // Individual sensor readings
  maxTemperatureCelsius: number | null;    // Highest temperature across all sensors
}

interface TemperatureReading {
  id: string;                              // Sensor identifier
  label: string;                           // Human-readable label
  category: 'cpu' | 'gpu' | 'motherboard' | 'storage' | 'unknown';
  temperatureCelsius: number;              // Temperature in °C
  source: 'libre-hardware-monitor';        // Data source
}
```

### Hardware List Snapshot

```ts
interface HardwareListSnapshot {
  isAvailable: boolean;       // Whether hardware was enumerated
  cpus: HardwareDevice[];     // CPU devices
  gpus: HardwareDevice[];     // GPU devices
}

interface HardwareDevice {
  id: string;
  name: string;
  category: 'cpu' | 'gpu';
  hardwareType: string;       // e.g., "Cpu", "GpuNvidia", "GpuAmd"
  source: 'libre-hardware-monitor';
}
```

### .NET Temperature Helper

Temperature and hardware enumeration use a separate **.NET 10 console application** (`eIslandTemperatureReader.exe`) that wraps **LibreHardwareMonitorLib**:

```csharp
// Program.cs
var computer = new Computer
{
    IsCpuEnabled = true,
    IsGpuEnabled = true,
    IsMotherboardEnabled = true,
    IsStorageEnabled = true,
};

computer.Open();
var payload = command == "hardware-list"
    ? JsonSerializer.Serialize(HardwareListCollector.Collect(computer))
    : JsonSerializer.Serialize(TemperatureCollector.Collect(computer));
Console.WriteLine(payload);
```

**Why a separate process?**

- LibreHardwareMonitorLib requires COM interop and WMI access
- Cannot be safely loaded into the Electron main process (crash risk, memory leaks)
- Separate process provides isolation — if it crashes, the main app continues
- `spawnSync` with a 5-second timeout ensures the main process never blocks indefinitely

**Invocation from Node.js:**

```js
function readHelperSnapshot(args, fallback) {
  const readerPath = findTemperatureReader();
  if (!readerPath) return fallback;

  const result = spawnSync(readerPath, args, {
    encoding: 'utf8',
    windowsHide: true,
    timeout: 5000,
  });

  if (result.status !== 0 || result.error || !result.stdout) {
    return fallback;
  }

  return JSON.parse(result.stdout);
}
```

**Fallback Behavior:**

- If the .NET helper binary is not found → returns `emptyTemperatureSnapshot`
- If the helper crashes or times out → returns `emptyTemperatureSnapshot`
- If JSON parsing fails → returns `emptyTemperatureSnapshot`

### Source Files

| File | Responsibility |
|------|---------------|
| `performance_monitor.c` | N-API binding layer, exports `getCpu` and `getMemory` |
| `performance_core.c` | Core implementation using Win32 APIs |
| `performance_types.h` | Shared type definitions (`CpuSnapshot`, `MemorySnapshot`) |
| `index.js` | Entry point, loads native binding, adds `getTemperature`/`getHardwareList` |
| `index.d.ts` | TypeScript type declarations |
| `temperature-helper/` | .NET 10 console app for temperature/hardware enumeration |

## Testing

### Test Framework

Plugins with tests use **Vitest** with the following configuration:

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});
```

### Test Commands

```bash
# Run unit tests
npm test

# Run smoke tests (manual verification)
npm run smoke
npm run smoke:polling
```

### Testing Patterns

**Shape Validation Tests:**

Tests verify that exported functions return objects with the correct structure and types:

```ts
it('returns CPU snapshot shape after baseline warmup', () => {
  monitor.getCpu();  // First call: baseline
  const cpu = monitor.getCpu();  // Second call: has delta

  expect(cpu.usagePercent).toBeTypeOf('number');
  expect(cpu.hasBaseline).toBe(true);
  expect(cpu.usagePercent).toBeGreaterThanOrEqual(0);
  expect(cpu.usagePercent).toBeLessThanOrEqual(100);
});
```

**Export Verification:**

Tests confirm all expected functions are exported:

```ts
it('exports detector methods', () => {
  expect(typeof detector.getForegroundFullscreenWindow).toBe('function');
  expect(typeof detector.getFullscreenWindows).toBe('function');
  expect(typeof detector.isAnyFullscreenWindow).toBe('function');
});
```

**Nullable Result Handling:**

Tests handle functions that may return `null` depending on system state:

```ts
const foreground = detector.getForegroundFullscreenWindow();
expect(foreground === null || typeof foreground === 'object').toBe(true);
```

### Test Coverage by Plugin

| Plugin | Test Files | Test Types |
|--------|------------|------------|
| **Processes Attacker** | _(manual testing)_ | — |
| **Fullscreen Detector** | `fullscreen-detector.test.ts`, `fullscreen-detector.polling.test.ts` | Shape validation, export verification |
| **Performance Monitor** | `performance-monitor.test.ts` | Shape validation, range checks |

## Integration with Electron

### Loading Native Plugins

Plugins are loaded in the Electron main process via `require()`:

```ts
// Example: Loading the fullscreen detector
const detector = require('@eisland/windows-fullscreen-detector');

// Check if any window is fullscreen
if (detector.isAnyFullscreenWindow()) {
  // Auto-hide the island
  mainWindow.hide();
}
```

### IPC Domain Integration

Each plugin's capabilities are exposed to the renderer via IPC handlers:

```ts
// Example: Process close via IPC
registerProcessHandlers({ getMainWindow });

// In the handler:
ipcMain.handle('win.close', async (_event, target) => {
  const result = closeProcess(target);
  return result;
});
```

### Usage in AI Agent Tools

Plugins power several AI agent tools:

| Tool | Plugin | Function Used |
|------|--------|---------------|
| `win.close` | Processes Attacker | `closeProcess(target)` |
| `win.list` | Fullscreen Detector | `getFullscreenWindows()` |
| `monitor.cpu` | Performance Monitor | `getCpu()` |
| `monitor.memory` | Performance Monitor | `getMemory()` |

## Performance Characteristics

| Plugin | Call Latency | Notes |
|--------|-------------|-------|
| **Processes Attacker** | ~1–5ms | Snapshot-based enumeration, single `TerminateProcess` call per match |
| **Fullscreen Detector** | ~1–3ms | `EnumWindows` iterates all top-level windows; early-exit for `isAnyFullscreenWindow` |
| **Performance Monitor (CPU)** | <0.1ms | `GetSystemTimes` is a single kernel call |
| **Performance Monitor (Memory)** | <0.1ms | `GlobalMemoryStatusEx` is a single kernel call |
| **Performance Monitor (Temperature)** | ~500–2000ms | Spawns a .NET process; includes process startup + WMI queries |

**Optimization Notes:**

- CPU and memory snapshots are nearly zero-cost — suitable for polling at 1-second intervals
- Temperature queries are expensive due to the .NET helper process — recommended at 5–10 second intervals
- The fullscreen detector avoids COM/WMI — pure Win32 window API calls
