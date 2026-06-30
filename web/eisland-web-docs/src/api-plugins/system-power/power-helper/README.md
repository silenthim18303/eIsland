---
watermark: true
title: Windows Power Helper
icon: battery-half
---

# Windows Power Helper

`@eisland/windows-power-helper` · v26.0.0

:::info
Battery and power status monitoring via .NET NativeAOT DLL (koffi FFI).
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Enum | [BatteryStatus](battery-status.md) | Battery charge status |
| Enum | [PowerSupplyStatus](power-supply-status.md) | Power supply status |
| Enum | [EnergySaverStatus](energy-saver-status.md) | Energy saver status |
| Interface | [PowerInfo](power-info.md) | Power status data structure |
| Function | [getPowerInfo](get-power-info.md) | Get current power status snapshot |
| Class | [PowerMonitor](power-monitor.md) | Real-time power change monitor |
