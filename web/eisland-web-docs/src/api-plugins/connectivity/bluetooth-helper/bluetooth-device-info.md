---
watermark: true
title: BluetoothDeviceInfo
icon: fa6-solid:table
---

# BluetoothDeviceInfo

:::info
This document describes the `BluetoothDeviceInfo` interface returned by all Bluetooth Helper query functions and monitor events. The `deviceType` field is derived from BLE Appearance or Classic Bluetooth Class of Device (CoD).
:::

## Interface

```typescript
interface BluetoothDeviceInfo {
  deviceId: string;
  name: string | null;
  bluetoothAddress: string | null;
  isConnected: boolean;
  isPaired: boolean;
  signalStrength: number | null;
  deviceClass: number | null;
  appearance: number | null;
  serviceUuids: string[];
  deviceType: string | null;
  batteryLevel: number | null;
}
```

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `deviceId` | `string` | Windows DeviceInformation ID |
| `name` | `string \| null` | Device friendly name |
| `bluetoothAddress` | `string \| null` | Bluetooth MAC address (hex string) |
| `isConnected` | `boolean` | Whether the device is currently connected |
| `isPaired` | `boolean` | Whether the device is paired |
| `signalStrength` | `number \| null` | RSSI in dBm, `null` if unavailable |
| `deviceClass` | `number \| null` | Raw Class of Device value (Classic Bluetooth) |
| `appearance` | `number \| null` | Raw BLE Appearance value |
| `serviceUuids` | `string[]` | GATT service UUIDs (BLE devices only) |
| `deviceType` | `string \| null` | Human-readable device type (see below) |
| `batteryLevel` | `number \| null` | Battery percentage 0–100 (BLE only), `null` if unavailable |

## Device Type Derivation

The `deviceType` field is resolved by `DeriveDeviceType()` using two standards, checked in priority order:

1. **BLE Appearance** — Category field (bits 6–15) of the `BluetoothLEAppearance` raw value
2. **Classic Bluetooth CoD** — Major Device Class (bits 8–12) + Minor Device Class (bits 2–7) of the `BluetoothClassOfDevice` raw value

If neither source yields a value, `deviceType` is `null`.

### BLE Appearance Types

| Category (hex) | `deviceType` | Description |
|----------------|--------------|-------------|
| `0x01` | `"Phone"` | Phone |
| `0x02` | `"Computer"` | Computer |
| `0x03` | `"Watch"` | Watch |
| `0x04` | `"Clock"` | Clock |
| `0x05` | `"Display"` | Display |
| `0x06` | `"RemoteControl"` | Remote Control |
| `0x07` | `"Eyeglasses"` | Eyeglasses |
| `0x08` | `"Tag"` | Tag |
| `0x09` | `"Keyring"` | Keyring |
| `0x0A` | `"MediaPlayer"` | Media Player |
| `0x0B` | `"BarcodeScanner"` | Barcode Scanner |
| `0x0C` | `"Thermometer"` | Thermometer |
| `0x0D` | `"HeartRate"` | Heart Rate Sensor |
| `0x0E` | `"BloodPressure"` | Blood Pressure Monitor |
| `0x0F` | `"HID"` | Human Interface Device |
| `0x10` | `"Glucose"` | Glucose Monitor |
| `0x11` | `"RunningWalking"` | Running / Walking Sensor |
| `0x12` | `"Cycling"` | Cycling Sensor |
| `0x51` | `"PulseOximeter"` | Pulse Oximeter |
| `0x52` | `"WeightScale"` | Weight Scale |
| `0x53` | `"OutdoorSports"` | Outdoor Sports Activity |

### Classic Bluetooth CoD Types

#### Major Class `0x01` — Computer

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"Computer"` | Desktop, laptop, server, etc. |

#### Major Class `0x02` — Phone

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"Phone"` | Cellular, smartphone, modem, etc. |

#### Major Class `0x03` — LAN / Network

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"LAN"` | Network access point |

#### Major Class `0x04` — Audio / Video

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Headset"` | Wearable headset |
| `0x02` | `"Handsfree"` | Hands-free device |
| `0x04` | `"Microphone"` | Microphone |
| `0x05` | `"Speaker"` | Loudspeaker |
| `0x06` | `"Headphones"` | Headphones |
| `0x07` | `"PortableAudio"` | Portable audio device |
| `0x08` | `"CarAudio"` | Car audio device |
| `0x0A` | `"HiFiAudio"` | Hi-Fi audio device |
| `0x0B` | `"VCR"` | VCR / video recorder |
| _(other)_ | `"Audio"` | Other audio/video device |

#### Major Class `0x05` — Peripheral

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Joystick"` | Joystick |
| `0x02` | `"Gamepad"` | Gamepad / game controller |
| `0x03` | `"RemoteControl"` | Remote control |
| `0x04` | `"Keyboard"` | Keyboard |
| _(other)_ | `"Peripheral"` | Other peripheral device |

#### Major Class `0x06` — Imaging

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x04` | `"Printer"` | Printer |
| _(other)_ | `"Imaging"` | Display, camera, scanner, etc. |

#### Other Major Classes

| Major Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x07` | `"Wearable"` | Wearable device |
| `0x08` | `"Toy"` | Toy |
| `0x09` | `"Health"` | Health device |

:::tip
BLE devices report finer-grained types via the Appearance standard (e.g., `"Headphones"`, `"Speaker"` are distinguishable). Classic Bluetooth devices use the CoD Minor Class for the same distinction — both produce consistent type strings where the standards overlap.
:::

:::warning
Some BLE headphones or speakers may not advertise a specific Appearance category, in which case `deviceType` will be `null`. The CoD-based fallback only applies to Classic Bluetooth devices.
:::
