---
title: Plugins Tech Stack
icon: toolbox
---

# Plugins Tech Stack

:::warning
This document provides an overview of the native Node.js addon plugins used in the eIsland application. All plugins are **Windows-only**, built with **C** and **Node-API (N-API)** via **node-gyp**, and exposed to the Electron main process as synchronous native modules.
:::

## Overview

The eIsland plugin system consists of four native addons that provide low-level Windows system capabilities unavailable through standard Node.js APIs:

| Plugin | Package | Purpose |
|--------|---------|---------|
| **Processes Attacker** | `@eisland/windows-processes-attacker` | Terminate processes by name or PID |
| **Fullscreen Detector** | `@eisland/windows-fullscreen-detector` | Detect foreground fullscreen windows |
| **Performance Monitor** | `@eisland/windows-performance-monitor` | CPU, memory, and temperature snapshots |
| **SMTC Helper** | `@eisland/windows-smtc-helper` | System Media Transport Controls (play, pause, next, previous, status) |

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

:::danger
Provides the ability to terminate Windows processes by name or process ID. Used by the eIsland AI agent's `win.close` tool and the `hide-process` IPC domain. This plugin has high-risk operation permissions — use with caution.
:::

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

:::info
Temperature and hardware enumeration use a separate **.NET 10 console application** (`eIslandTemperatureReader.exe`) that wraps **LibreHardwareMonitorLib**. It operates as a CLI tool — invoked via `spawnSync`, reads hardware sensors, outputs JSON to stdout, then exits.
:::

#### Why a Separate Process?

- LibreHardwareMonitorLib requires COM interop and WMI access, which can destabilize a long-running process
- Cannot be safely loaded into the Electron main process (crash risk, memory leaks, handle leaks)
- Separate process provides crash isolation — if it fails, the main app continues unaffected
- `spawnSync` with a 5-second timeout ensures the main process never blocks indefinitely
- Process exits after each invocation — no lingering state or resource accumulation

#### Entry Point

```csharp
// Program.cs
var command = args.FirstOrDefault() ?? "temperature";
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
computer.Close();
```

**CLI Modes:**

| Invocation | Mode | Output |
|------------|------|--------|
| `eIslandTemperatureReader.exe` | Temperature (default) | `TemperatureSnapshot` JSON |
| `eIslandTemperatureReader.exe temperature` | Temperature | `TemperatureSnapshot` JSON |
| `eIslandTemperatureReader.exe hardware-list` | Hardware enumeration | `HardwareListSnapshot` JSON |

The `Computer` object from LibreHardwareMonitorLib is configured to enable all hardware categories (CPU, GPU, motherboard, storage). `computer.Open()` initializes WMI subscriptions and COM interfaces; `computer.Close()` releases them.

#### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Program.cs                                                 │
│  CLI entry point — parses args, opens Computer, dispatches  │
└────────────┬──────────────────────────┬─────────────────────┘
             │                          │
    ┌────────▼───────────┐    ┌────────▼──────────────────┐
    │ TemperatureCollector│    │ HardwareListCollector      │
    │ .Collect(computer)  │    │ .Collect(computer)         │
    └────────┬────────────┘    └────────┬──────────────────┘
             │                          │
    ┌────────▼──────────────────────────▼──────────────────┐
    │ HardwareCategoryMapper                               │
    │ Maps HardwareType → category string                   │
    └──────────────────────────────────────────────────────┘
             │
    ┌────────▼────────────┐
    │ Snapshots.cs         │
    │ Data models (POCOs)  │
    └──────────────────────┘
```

#### TemperatureCollector

Recursively traverses the hardware tree and collects all temperature sensor readings:

```csharp
static class TemperatureCollector
{
    public static TemperatureSnapshot Collect(Computer computer)
    {
        var readings = new List<TemperatureReading>();

        foreach (var hardware in computer.Hardware)
        {
            CollectHardwareTemperatures(hardware, readings);
        }

        return new TemperatureSnapshot
        {
            IsAvailable = readings.Count > 0,
            Readings = readings,
            MaxTemperatureCelsius = readings.Count == 0
                ? null
                : readings.Max(r => r.TemperatureCelsius),
        };
    }

    private static void CollectHardwareTemperatures(
        IHardware hardware, List<TemperatureReading> readings)
    {
        hardware.Update();  // Refresh sensor values

        // Recurse into sub-hardware (e.g., CPU cores under a CPU package)
        foreach (var sub in hardware.SubHardware)
            CollectHardwareTemperatures(sub, readings);

        // Collect temperature sensors
        foreach (var sensor in hardware.Sensors)
        {
            if (sensor.SensorType != SensorType.Temperature || sensor.Value is null)
                continue;

            readings.Add(new TemperatureReading
            {
                Id = $"{hardware.Identifier}/{sensor.Identifier}",
                Label = string.IsNullOrWhiteSpace(sensor.Name)
                    ? hardware.Name
                    : $"{hardware.Name} {sensor.Name}",
                Category = HardwareCategoryMapper.Map(hardware.HardwareType),
                TemperatureCelsius = Math.Round(sensor.Value.Value, 1),
                Source = "libre-hardware-monitor",
            });
        }
    }
}
```

**Key behaviors:**

- **Recursive traversal**: `hardware.SubHardware` contains child devices (e.g., individual CPU cores, GPU memory controllers). The collector walks the full tree.
- **`hardware.Update()`**: Triggers a fresh read of all sensors for this hardware node. Must be called before accessing `sensor.Value`.
- **Sensor filtering**: Only `SensorType.Temperature` sensors with non-null values are collected.
- **ID format**: `{hardware.Identifier}/{sensor.Identifier}` — unique across the hardware tree, e.g., `cpu/0/temperature/2`.
- **Label fallback**: If `sensor.Name` is empty, uses `hardware.Name` alone.
- **Precision**: Temperature values are rounded to 1 decimal place (`Math.Round(value, 1)`).

#### HardwareListCollector

Enumerates CPU and GPU devices from the hardware tree:

```csharp
static class HardwareListCollector
{
    public static HardwareListSnapshot Collect(Computer computer)
    {
        var cpus = new List<HardwareDevice>();
        var gpus = new List<HardwareDevice>();

        foreach (var hardware in computer.Hardware)
        {
            CollectHardwareDevice(hardware, cpus, gpus);
        }

        return new HardwareListSnapshot
        {
            IsAvailable = cpus.Count > 0 || gpus.Count > 0,
            Cpus = cpus,
            Gpus = gpus,
        };
    }

    private static void CollectHardwareDevice(
        IHardware hardware, List<HardwareDevice> cpus, List<HardwareDevice> gpus)
    {
        hardware.Update();

        var category = HardwareCategoryMapper.Map(hardware.HardwareType);
        if (category == "cpu")
            cpus.Add(CreateHardwareDevice(hardware, category));
        else if (category == "gpu")
            gpus.Add(CreateHardwareDevice(hardware, category));

        // Recurse into sub-hardware
        foreach (var sub in hardware.SubHardware)
            CollectHardwareDevice(sub, cpus, gpus);
    }

    private static HardwareDevice CreateHardwareDevice(
        IHardware hardware, string category) => new()
    {
        Id = hardware.Identifier.ToString(),
        Name = hardware.Name,
        Category = category,
        HardwareType = hardware.HardwareType.ToString(),
        Source = "libre-hardware-monitor",
    };
}
```

**Key behaviors:**

- **Category filtering**: Only `"cpu"` and `"gpu"` devices are collected. Motherboard and storage devices are excluded from the hardware list (but their temperature sensors are still collected by `TemperatureCollector`).
- **`HardwareType` mapping**: The raw `HardwareType` enum value (e.g., `GpuNvidia`, `GpuAmd`, `GpuIntel`) is preserved as a string in the `HardwareType` field for downstream differentiation.

#### HardwareCategoryMapper

Maps LibreHardwareMonitor's `HardwareType` enum to simplified category strings:

```csharp
static class HardwareCategoryMapper
{
    public static string Map(HardwareType hardwareType) => hardwareType switch
    {
        HardwareType.Cpu                            => "cpu",
        HardwareType.GpuAmd
            or HardwareType.GpuIntel
            or HardwareType.GpuNvidia               => "gpu",
        HardwareType.Motherboard                    => "motherboard",
        HardwareType.Storage                        => "storage",
        _                                           => "unknown",
    };
}
```

**Mapping Table:**

| `HardwareType` | Category | Examples |
|----------------|----------|----------|
| `Cpu` | `cpu` | Intel Core, AMD Ryzen |
| `GpuNvidia` | `gpu` | NVIDIA GeForce, RTX series |
| `GpuAmd` | `gpu` | AMD Radeon, RX series |
| `GpuIntel` | `gpu` | Intel Arc, integrated graphics |
| `Motherboard` | `motherboard` | ASUS, MSI, Gigabyte boards |
| `Storage` | `storage` | NVMe SSDs, SATA drives |
| _(other)_ | `unknown` | SuperIO, TBalancer, etc. |

#### Snapshots (Data Models)

All data models use C# `required` init-only properties and provide static `Empty` singletons for fallback scenarios:

```csharp
sealed class TemperatureSnapshot
{
    public static TemperatureSnapshot Empty { get; } = new()
    {
        IsAvailable = false,
        Readings = [],
        MaxTemperatureCelsius = null,
    };

    public required bool IsAvailable { get; init; }
    public required List<TemperatureReading> Readings { get; init; }
    public required double? MaxTemperatureCelsius { get; init; }
}

sealed class TemperatureReading
{
    public required string Id { get; init; }
    public required string Label { get; init; }
    public required string Category { get; init; }
    public required double TemperatureCelsius { get; init; }
    public required string Source { get; init; }
}

sealed class HardwareListSnapshot
{
    public static HardwareListSnapshot Empty { get; } = new()
    {
        IsAvailable = false,
        Cpus = [],
        Gpus = [],
    };

    public required bool IsAvailable { get; init; }
    public required List<HardwareDevice> Cpus { get; init; }
    public required List<HardwareDevice> Gpus { get; init; }
}

sealed class HardwareDevice
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string Category { get; init; }
    public required string HardwareType { get; init; }
    public required string Source { get; init; }
}
```

**Design decisions:**

- **`sealed` classes**: No inheritance needed; enables JIT optimizations.
- **`required` init-only properties**: Enforced at compile time — prevents incomplete construction.
- **`Empty` singletons**: Used as fallback when the helper binary is missing or crashes. Serialized to JSON as `{"isAvailable":false,"readings":[],...}`.
- **JSON serialization**: Uses `JsonSerializerDefaults.Web` for camelCase property naming (matching the TypeScript interfaces).

#### JSON Output Format

**Temperature mode** (`eIslandTemperatureReader.exe`):

```json
{
  "isAvailable": true,
  "readings": [
    {
      "id": "cpu/0/temperature/0",
      "label": "CPU Package",
      "category": "cpu",
      "temperatureCelsius": 52.3,
      "source": "libre-hardware-monitor"
    },
    {
      "id": "gpu-nvidia/0/temperature/0",
      "label": "NVIDIA GeForce RTX 4070 GPU Core",
      "category": "gpu",
      "temperatureCelsius": 41.0,
      "source": "libre-hardware-monitor"
    }
  ],
  "maxTemperatureCelsius": 52.3
}
```

**Hardware list mode** (`eIslandTemperatureReader.exe hardware-list`):

```json
{
  "isAvailable": true,
  "cpus": [
    {
      "id": "cpu/0",
      "name": "Intel Core i7-13700K",
      "category": "cpu",
      "hardwareType": "Cpu",
      "source": "libre-hardware-monitor"
    }
  ],
  "gpus": [
    {
      "id": "gpu-nvidia/0",
      "name": "NVIDIA GeForce RTX 4070",
      "category": "gpu",
      "hardwareType": "GpuNvidia",
      "source": "libre-hardware-monitor"
    }
  ]
}
```

#### Invocation from Node.js

The main plugin's `index.js` bridges the .NET helper via synchronous child process execution:

```js
function readHelperSnapshot(args, fallback) {
  const readerPath = findTemperatureReader();
  if (!readerPath) return fallback;

  const result = spawnSync(readerPath, args, {
    encoding: 'utf8',
    windowsHide: true,    // Hide console window on Windows
    timeout: 5000,         // 5-second hard timeout
  });

  if (result.status !== 0 || result.error || !result.stdout) {
    return fallback;
  }

  return JSON.parse(result.stdout);
}
```

**Binary resolution order:**

```js
const temperatureReaderCandidates = [
  path.join(__dirname, 'temperature-helper', 'bin', 'Release', 'net10.0', 'eIslandTemperatureReader.exe'),
  path.join(__dirname, 'temperature-helper', 'bin', 'Debug', 'net10.0', 'eIslandTemperatureReader.exe'),
];
```

**Fallback Behavior:**

| Condition | Result |
|-----------|--------|
| Binary not found | `emptyTemperatureSnapshot` / `emptyHardwareListSnapshot` |
| Process exits with non-zero status | Fallback |
| Process times out (>5s) | Fallback |
| stdout is empty | Fallback |
| JSON parse error | Fallback |
| Success | Parsed snapshot object |

#### Dependencies

```xml
<!-- eIslandTemperatureReader.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="LibreHardwareMonitorLib" Version="0.9.6" />
  </ItemGroup>
</Project>
```

| Dependency | Version | Purpose |
|------------|---------|---------|
| **.NET** | 10.0 | Runtime |
| **LibreHardwareMonitorLib** | 0.9.6 | Hardware sensor access via WMI/COM |

#### Build

The .NET helper is built alongside the native addon:

```bash
# Build native addon + .NET helper
npm run build

# Equivalent to:
node-gyp rebuild
dotnet build temperature-helper/eIslandTemperatureReader.csproj -c Release
```

Output: `temperature-helper/bin/Release/net10.0/eIslandTemperatureReader.exe`

### Source Files

| File | Responsibility |
|------|---------------|
| `performance_monitor.c` | N-API binding layer, exports `getCpu` and `getMemory` |
| `performance_core.c` | Core implementation using Win32 APIs |
| `performance_types.h` | Shared type definitions (`CpuSnapshot`, `MemorySnapshot`) |
| `index.js` | Entry point, loads native binding, adds `getTemperature`/`getHardwareList` |
| `index.d.ts` | TypeScript type declarations |
| `temperature-helper/Program.cs` | .NET CLI entry point, opens `Computer`, dispatches to collectors |
| `temperature-helper/TemperatureCollector.cs` | Recursive temperature sensor collection |
| `temperature-helper/HardwareListCollector.cs` | CPU/GPU device enumeration |
| `temperature-helper/HardwareCategoryMapper.cs` | `HardwareType` → category string mapping |
| `temperature-helper/Snapshots.cs` | Data models with `Empty` fallback singletons |

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
| **SMTC Helper** | `smtc-helper.test.ts`, `smtc-helper.play.test.ts`, `smtc-helper.pause.test.ts`, `smtc-helper.next.test.ts`, `smtc-helper.previous.test.ts` | Shape validation, export verification, command tests |

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

:::tip
Performance characteristics and optimization recommendations for each plugin:
:::

| Plugin | Call Latency | Notes |
|--------|-------------|-------|
| **Processes Attacker** | ~1–5ms | Snapshot-based enumeration, single `TerminateProcess` call per match |
| **Fullscreen Detector** | ~1–3ms | `EnumWindows` iterates all top-level windows; early-exit for `isAnyFullscreenWindow` |
| **Performance Monitor (CPU)** | <0.1ms | `GetSystemTimes` is a single kernel call |
| **Performance Monitor (Memory)** | <0.1ms | `GlobalMemoryStatusEx` is a single kernel call |
| **Performance Monitor (Temperature)** | ~500–2000ms | Spawns a .NET process; includes process startup + WMI queries |
| **SMTC Helper** | ~50–200ms | Spawns a .NET process; WinRT session manager + media property reads |

**Optimization Notes:**

- CPU and memory snapshots are nearly zero-cost — suitable for polling at 1-second intervals
- Temperature queries are expensive due to the .NET helper process — recommended at 5–10 second intervals
- The fullscreen detector avoids COM/WMI — pure Win32 window API calls
- SMTC queries spawn a .NET process; recommended polling interval is 1–2 seconds for status updates

:::warning
Temperature queries involve .NET process startup and WMI queries, resulting in high latency (500–2000ms). Recommended polling interval is 5–10 seconds to avoid frequent calls impacting performance.
:::

## Plugin: Windows SMTC Helper

### Package

```
@eisland/windows-smtc-helper
```

### Purpose

Provides control over Windows System Media Transport Controls (SMTC) — the standard media playback interface that appears in the Windows notification center and on the lock screen. Used by eIsland to display and control currently playing media from any source (Spotify, QQ Music, Chrome, etc.).

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  JavaScript Layer (index.js)                                │
│  play() / pause() / next() / previous() / getStatus()       │
└──────────────────────────┬──────────────────────────────────┘
                           │ spawnSync (JSON-over-stdout)
┌──────────────────────────▼──────────────────────────────────┐
│  eIslandSmtcHelper.exe                                      │
│  .NET 10 + Windows.Media.Control                            │
├─────────────────────────────────────────────────────────────┤
│  SmtcController.cs                                          │
│  GlobalSystemMediaTransportControlsSessionManager            │
│  → GetCurrentSession() → TryPlayAsync / TryPauseAsync / ... │
└─────────────────────────────────────────────────────────────┘
```

:::info
Unlike other plugins that use C + N-API, the SMTC Helper is a **pure C# .NET console application** invoked via `spawnSync`. No native addon or `binding.gyp` is needed — the `GlobalSystemMediaTransportControlsSessionManager` API is only available through WinRT projections in .NET.
:::

### Exported Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `play` | `() → CommandResult` | Resume playback of the current media session |
| `pause` | `() → CommandResult` | Pause the current media session |
| `next` | `() → CommandResult` | Skip to the next track |
| `previous` | `() → CommandResult` | Skip to the previous track |
| `getStatus` | `() → MediaStatus` | Get the full snapshot of the current media session |

### MediaStatus

```ts
interface MediaStatus {
  isAvailable: boolean;
  title: string | null;
  artist: string | null;
  albumTitle: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  genres: string[] | null;
  playbackStatus: 'playing' | 'paused' | 'stopped' | 'closed' | 'opened' | 'changing' | 'unknown';
  isShuffleActive: boolean | null;
  repeatMode: number | null;
  playbackRate: number | null;
  sourceAppUserModelId: string | null;
  thumbnail: string | null;               // data:image/jpeg;base64,...
  timeline: TimelineProperties | null;
  controls: PlaybackControls | null;
}

interface TimelineProperties {
  startTime: number;       // seconds
  endTime: number;         // seconds
  position: number;        // seconds
  minSeekTime: number;     // seconds
  maxSeekTime: number;     // seconds
}

interface PlaybackControls {
  isPlayEnabled: boolean;
  isPauseEnabled: boolean;
  isNextEnabled: boolean;
  isPreviousEnabled: boolean;
  isStopEnabled: boolean;
  isRecordEnabled: boolean;
  isFastForwardEnabled: boolean;
  isRewindEnabled: boolean;
  isChannelUpEnabled: boolean;
  isChannelDownEnabled: boolean;
}

interface CommandResult {
  success: boolean;
  error: string | null;
}
```

### C# Implementation

#### SmtcController

The core controller uses `GlobalSystemMediaTransportControlsSessionManager` to access the active media session:

```csharp
public static class SmtcController
{
    private static async Task<GlobalSystemMediaTransportControlsSession?> GetCurrentSessionAsync()
    {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        return manager.GetCurrentSession();
    }

    public static async Task<CommandResult> PlayAsync()
    {
        var session = await GetCurrentSessionAsync();
        if (session == null)
            return CommandResult.Fail("No active media session.");

        var success = await session.TryPlayAsync();
        return success ? CommandResult.Ok : CommandResult.Fail("Play command was rejected.");
    }

    // Pause, Next, Previous follow the same pattern...
}
```

**Key behaviors:**

- `RequestAsync()` acquires the session manager — requires a UI thread or `CoreApplication` context
- `GetCurrentSession()` returns `null` if no app is currently playing media
- `TryPlayAsync()` / `TryPauseAsync()` return `false` if the media source rejects the command
- `SourceAppUserModelId` identifies the media source (e.g., `"QQMusic.exe"`, `"Spotify.exe"`)
- Thumbnail is read as a stream, converted to base64, and returned as a `data:image/jpeg;base64,...` data URI

#### Timeline Properties

Timeline data is read from `session.GetTimelineProperties()` and converted to seconds:

```csharp
var timeline = session.GetTimelineProperties();
var timelineProperties = new TimelineProperties
{
    StartTime = timeline.StartTime.TotalSeconds,
    EndTime = timeline.EndTime.TotalSeconds,
    Position = timeline.Position.TotalSeconds,
    MinSeekTime = timeline.MinSeekTime.TotalSeconds,
    MaxSeekTime = timeline.MaxSeekTime.TotalSeconds,
};
```

:::note
Some media sources (like QQ Music) report `minSeekTime` and `maxSeekTime` as 0, even though seeking works. This is a limitation of the media source's SMTC implementation, not the plugin.
:::

#### Playback Controls

The `PlaybackControls` object reports which transport buttons the media source has enabled:

```csharp
var controls = new PlaybackControls
{
    IsPlayEnabled = playbackInfo.Controls.IsPlayEnabled,
    IsPauseEnabled = playbackInfo.Controls.IsPauseEnabled,
    IsNextEnabled = playbackInfo.Controls.IsNextEnabled,
    IsPreviousEnabled = playbackInfo.Controls.IsPreviousEnabled,
    // ... and so on
};
```

### CLI Modes

| Invocation | Mode | Output |
|------------|------|--------|
| `eIslandSmtcHelper.exe status` | Status (default) | `MediaStatus` JSON |
| `eIslandSmtcHelper.exe play` | Play | `CommandResult` JSON |
| `eIslandSmtcHelper.exe pause` | Pause | `CommandResult` JSON |
| `eIslandSmtcHelper.exe next` | Next | `CommandResult` JSON |
| `eIslandSmtcHelper.exe previous` | Previous | `CommandResult` JSON |

### Source Files

| File | Responsibility |
|------|---------------|
| `src/Program.cs` | CLI entry point, argument parsing, JSON output |
| `src/SmtcController.cs` | SMTC session management and command execution |
| `src/Snapshots.cs` | Data models (`MediaStatus`, `CommandResult`, `TimelineProperties`, `PlaybackControls`) |

### Build

```bash
cd plugins/eisland-windows-smtc-helper
npm run build    # Runs: dotnet build src/eIslandSmtcHelper.csproj -c Release
```

Output: `src/bin/Release/net10.0-windows10.0.19041.0/eIslandSmtcHelper.exe`

:::warning
The SMTC helper targets `net10.0-windows10.0.19041.0` to access WinRT APIs. This requires the Windows 10 SDK (10.0.19041.0) or later installed alongside the .NET 10 SDK.
:::

### Dependencies

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0-windows10.0.19041.0</TargetFramework>
  </PropertyGroup>
</Project>
```

| Dependency | Version | Purpose |
|------------|---------|---------|
| **.NET** | 10.0 | Runtime |
| **Windows 10 SDK** | 10.0.19041.0+ | WinRT API projections for `Windows.Media.Control` |

### Example Output

**getStatus() with QQ Music playing:**

```json
{
  "isAvailable": true,
  "title": "Chasing Gold and Gloory",
  "artist": "Gruup24",
  "albumTitle": "Chasing Gold and Gloory",
  "albumArtist": "",
  "trackNumber": 0,
  "genres": null,
  "playbackStatus": "playing",
  "isShuffleActive": null,
  "repeatMode": null,
  "playbackRate": null,
  "sourceAppUserModelId": "QQMusic.exe",
  "thumbnail": "data:image/jpeg;base64,/9j/4AAQ...",
  "timeline": {
    "startTime": 0,
    "endTime": 229.277,
    "position": 134.091,
    "minSeekTime": 0,
    "maxSeekTime": 0
  },
  "controls": {
    "isPlayEnabled": false,
    "isPauseEnabled": true,
    "isNextEnabled": true,
    "isPreviousEnabled": true,
    "isStopEnabled": false,
    "isRecordEnabled": false,
    "isFastForwardEnabled": false,
    "isRewindEnabled": false,
    "isChannelUpEnabled": false,
    "isChannelDownEnabled": false
  }
}
```
