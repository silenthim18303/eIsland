---
watermark: true
title: Windows Performance Monitor
icon: gauge-high
---

# Windows Performance Monitor

`@eisland/windows-performance-monitor` · v26.0.1

:::info
CPU, memory, and hardware temperature monitoring via C N-API native addon + .NET helper.
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Type Alias | [TemperatureCategory](temperature-category.md) | Temperature reading category |
| Interface | [CpuSnapshot](cpu-snapshot.md) | CPU usage data |
| Interface | [MemorySnapshot](memory-snapshot.md) | Memory usage data |
| Interface | [TemperatureReading](temperature-reading.md) | Single temperature reading |
| Interface | [TemperatureSnapshot](temperature-snapshot.md) | Temperature readings collection |
| Interface | [HardwareDevice](hardware-device.md) | Hardware device info |
| Interface | [HardwareListSnapshot](hardware-list-snapshot.md) | CPU/GPU device list |
| Function | [getCpu](get-cpu.md) | Get CPU usage |
| Function | [getMemory](get-memory.md) | Get memory usage |
| Function | [getTemperature](get-temperature.md) | Get hardware temperatures |
| Function | [getHardwareList](get-hardware-list.md) | Get CPU/GPU device list |
