---
watermark: true
title: BluetoothDeviceInfo
icon: fa6-solid:table
---

# BluetoothDeviceInfo

:::info Introduction
`BluetoothDeviceInfo` is the core data interface returned by all Bluetooth Helper query functions (`getPairedDevices`, `getConnectedDevices`, `getAllDevices`, `getDevice`) and emitted in every `BluetoothMonitor` event. It represents a snapshot of a single Bluetooth device's state, including identity, connection status, signal strength, and a human-readable device type derived from BLE Appearance or Classic Bluetooth Class of Device (CoD) standards.
:::

## Interface Introduction

`BluetoothDeviceInfo` is encountered whenever you query or monitor Bluetooth devices through `@eisland/windows-bluetooth-helper`. Every function that returns device information produces objects conforming to this interface, and every `BluetoothMonitor` event (except `device-removed` and `error`) delivers one. The `deviceType` field is resolved by the internal `DeriveDeviceType()` function, which checks BLE Appearance first, then falls back to Classic Bluetooth CoD.

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

## Usage

You encounter `BluetoothDeviceInfo` in two scenarios:

1. **Querying devices** -- Call `getPairedDevices()`, `getConnectedDevices()`, `getAllDevices()`, or `getDevice()` to get a snapshot array or single object.
2. **Monitoring devices** -- Subscribe to `BluetoothMonitor` events. The `device-added`, `device-connected`, `device-updated` events deliver a full `BluetoothDeviceInfo` object. The `device-removed` and `device-disconnected` events deliver only the `deviceId` string.

:::tip Best Practice
Use `deviceId` as the unique key when building UI lists or caching device state. It is the Windows `DeviceInformation.ID` and remains stable across reconnections. Do not rely on `name` for identification -- it can be `null` or change.
:::

:::tip Performance Tip
If you only need a single device's current state, call `getDevice(deviceId)` instead of iterating over `getAllDevices()`. The single-device lookup is more efficient and returns `null` if the device is no longer visible.
:::

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `deviceId` | `string` | Windows DeviceInformation ID. Stable unique identifier for the device. |
| `name` | `string \| null` | Device friendly name. `null` if the device does not advertise a name. |
| `bluetoothAddress` | `string \| null` | Bluetooth MAC address as a hex string. `null` if unavailable. |
| `isConnected` | `boolean` | Whether the device is currently connected. |
| `isPaired` | `boolean` | Whether the device is paired with this PC. |
| `signalStrength` | `number \| null` | RSSI in dBm. `null` if the device does not report signal strength. |
| `deviceClass` | `number \| null` | Raw Class of Device value (Classic Bluetooth). `null` for BLE-only devices. |
| `appearance` | `number \| null` | Raw BLE Appearance value. `null` for Classic Bluetooth-only devices. |
| `serviceUuids` | `string[]` | GATT service UUIDs advertised by the device. Empty array for Classic Bluetooth devices. |
| `deviceType` | `string \| null` | Human-readable device type string (see [Device Type Derivation](#device-type-derivation)). `null` if neither BLE Appearance nor CoD yields a recognized type. |
| `batteryLevel` | `number \| null` | Battery percentage (0--100). Only available for BLE devices that expose the Battery Service. `null` otherwise. |

:::note
`serviceUuids` is only populated for BLE devices that advertise GATT services. Classic Bluetooth devices will have an empty array. Similarly, `batteryLevel` requires the BLE device to expose the standard Battery Service (UUID `0x180F`) -- not all BLE devices do.
:::

## Device Type Derivation

The `deviceType` field is resolved using two standards, checked in priority order:

1. **BLE Appearance** -- Category field (bits 6--15) of the `BluetoothLEAppearance` raw value.
2. **Classic Bluetooth CoD** -- Major Device Class (bits 8--12) + Minor Device Class (bits 2--7) of the `BluetoothClassOfDevice` raw value.

If neither source yields a recognized value, `deviceType` is `null`.

---

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
| `0x13` | `"ControlDevice"` | Control Device |
| `0x14` | `"Sensor"` | Generic Sensor |
| `0x15` | `"LightFixtures"` | Light Fixtures |
| `0x16` | `"Fan"` | Fan |
| `0x17` | `"HVAC"` | HVAC |
| `0x18` | `"AirConditioning"` | Air Conditioning |
| `0x19` | `"Humidifier"` | Humidifier |
| `0x1A` | `"Heating"` | Heating |
| `0x1B` | `"AccessControl"` | Access Control |
| `0x1C` | `"MotorizedDevice"` | Motorized Device |
| `0x1D` | `"PowerTool"` | Power Tool |
| `0x1E` | `"LightSource"` | Light Source |
| `0x1F` | `"WindowCovering"` | Window Covering |
| `0x20` | `"AudioSink"` | Audio Sink |
| `0x21` | `"AudioSource"` | Audio Source |
| `0x22` | `"Robot"` | Robot |
| `0x23` | `"Display"` | Display |
| `0x30` | `"Keyboard"` | Keyboard |
| `0x31` | `"Mouse"` | Mouse |
| `0x32` | `"Joystick"` | Joystick |
| `0x33` | `"Gamepad"` | Gamepad |
| `0x40` | `"RemoteControl"` | Remote Control |
| `0x51` | `"PulseOximeter"` | Pulse Oximeter |
| `0x52` | `"WeightScale"` | Weight Scale |
| `0x53` | `"OutdoorSports"` | Outdoor Sports Activity |

---

### Classic Bluetooth CoD Types

#### Major Class `0x00` -- Miscellaneous

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"Miscellaneous"` | Uncategorized device |

#### Major Class `0x01` -- Computer

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Desktop"` | Desktop workstation |
| `0x02` | `"Server"` | Server-class computer |
| `0x03` | `"Laptop"` | Laptop |
| `0x04` | `"HandheldPC"` | Handheld PC / PDA (clam shell) |
| `0x05` | `"PalmSizePC"` | Palm-size PC / PDA |
| `0x06` | `"WearableComputer"` | Wearable computer (watch size) |
| `0x07` | `"Tablet"` | Tablet |
| _(other)_ | `"Computer"` | Other computer |

#### Major Class `0x02` -- Phone

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Cellular"` | Cellular phone |
| `0x02` | `"Cordless"` | Cordless phone |
| `0x03` | `"Smartphone"` | Smartphone |
| `0x04` | `"WiredModem"` | Wired modem or voice gateway |
| `0x05` | `"ISDNAccess"` | Common ISDN access |
| _(other)_ | `"Phone"` | Other phone |

#### Major Class `0x03` -- LAN / Network

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"LAN"` | Network access point (minor encodes utilization) |

#### Major Class `0x04` -- Audio / Video

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Headset"` | Wearable headset |
| `0x02` | `"Handsfree"` | Hands-free device |
| `0x04` | `"Microphone"` | Microphone |
| `0x05` | `"Speaker"` | Loudspeaker |
| `0x06` | `"Headphones"` | Headphones |
| `0x07` | `"PortableAudio"` | Portable audio device |
| `0x08` | `"CarAudio"` | Car audio device |
| `0x09` | `"SetTopBox"` | Set-top box |
| `0x0A` | `"HiFiAudio"` | Hi-Fi audio device |
| `0x0B` | `"VCR"` | VCR |
| `0x0C` | `"VideoCamera"` | Video camera |
| `0x0D` | `"Camcorder"` | Camcorder |
| `0x0E` | `"VideoMonitor"` | Video monitor |
| `0x0F` | `"VideoLoudspeaker"` | Video display and loudspeaker |
| `0x10` | `"VideoConferencing"` | Video conferencing |
| `0x12` | `"GamingToy"` | Gaming / Toy |
| _(other)_ | `"Audio"` | Other audio/video device |

#### Major Class `0x05` -- Peripheral

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x04` | `"Joystick"` | Joystick |
| `0x08` | `"Gamepad"` | Gamepad / game controller |
| `0x0C` | `"RemoteControl"` | Remote control |
| `0x10` | `"SensingDevice"` | Sensing device |
| `0x14` | `"DigitizerTablet"` | Digitizer tablet |
| `0x18` | `"CardReader"` | Card reader (e.g., SIM) |
| `0x1C` | `"DigitalPen"` | Digital pen |
| `0x20` | `"HandheldScanner"` | Handheld scanner |
| `0x24` | `"HandheldGesturalInput"` | Handheld gestural input device |
| _(other)_ | `"Peripheral"` | Other peripheral device |

#### Major Class `0x06` -- Imaging

:::note
The Imaging minor class uses bit flags: bit 2 = Display (`0x04`), bit 3 = Camera (`0x08`), bit 4 = Scanner (`0x10`), bit 5 = Printer (`0x20`). Multiple flags can be set simultaneously -- e.g., `0x24` (Display + Printer) yields `"Display+Printer"`.
:::

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x04` | `"Display"` | Display |
| `0x08` | `"Camera"` | Camera |
| `0x10` | `"Scanner"` | Scanner |
| `0x20` | `"Printer"` | Printer |
| `0x24` | `"Display+Printer"` | Display + Printer |
| `0x28` | `"Camera+Printer"` | Camera + Printer |
| _(combination)_ | `"<flag>+<flag>..."` | Any combination of the above flags |
| _(other)_ | `"Imaging"` | Other imaging device (no recognized flags) |

#### Major Class `0x07` -- Wearable

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Wristwatch"` | Wristwatch |
| `0x02` | `"Pager"` | Pager |
| `0x03` | `"Jacket"` | Jacket |
| `0x04` | `"Helmet"` | Helmet |
| `0x05` | `"Glasses"` | Glasses |
| _(other)_ | `"Wearable"` | Other wearable device |

#### Major Class `0x08` -- Toy

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Robot"` | Robot |
| `0x02` | `"Vehicle"` | Vehicle |
| `0x03` | `"Doll"` | Doll / Action figure |
| `0x04` | `"ToyController"` | Controller |
| `0x05` | `"ToyGame"` | Game |
| _(other)_ | `"Toy"` | Other toy |

#### Major Class `0x09` -- Health

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"BloodPressureMonitor"` | Blood pressure monitor |
| `0x02` | `"HealthThermometer"` | Thermometer |
| `0x03` | `"WeighingScale"` | Weighing scale |
| `0x04` | `"GlucoseMeter"` | Glucose meter |
| `0x05` | `"PulseOximeter"` | Pulse oximeter |
| `0x06` | `"HeartRateMonitor"` | Heart / Pulse rate monitor |
| `0x07` | `"HealthDataDisplay"` | Health data display |
| `0x08` | `"StepCounter"` | Step counter |
| `0x09` | `"BodyComposition"` | Body composition analyzer |
| `0x0A` | `"PeakFlowMonitor"` | Peak flow monitor |
| `0x0B` | `"MedicationMonitor"` | Medication monitor |
| `0x0C` | `"KneeProsthesis"` | Knee prosthesis |
| `0x0D` | `"AnkleProsthesis"` | Ankle prosthesis |
| `0x0E` | `"GenericHealthManager"` | Generic health manager |
| `0x0F` | `"PersonalMobilityDevice"` | Personal mobility device |
| `0x10` | `"ContinuousGlucoseMonitor"` | Continuous glucose monitor |
| _(other)_ | `"Health"` | Other health device |

:::tip
BLE devices report types via the Appearance standard (43 categories). Classic Bluetooth devices use CoD Major + Minor Class (9 major classes, 80+ minor types). Both produce consistent type strings where the standards overlap -- e.g., `"Phone"`, `"Computer"`, `"Headphones"`.
:::

:::warning
Some BLE headphones or speakers may not advertise a specific Appearance category, in which case `deviceType` will be `null`. The CoD-based classification only applies to Classic Bluetooth devices.
:::

## Example

::: code-tabs

@tab TypeScript

```ts
import { getPairedDevices, getDevice } from '@eisland/windows-bluetooth-helper';

// Query all paired devices
const devices = getPairedDevices();

// Iterate over each paired device
for (const device of devices) {
  // Print device name and type, using fallbacks for null values
  console.log(`${device.name ?? 'Unknown'} (${device.deviceType ?? 'N/A'})`);
  // Print connection and pairing status
  console.log(`  Connected: ${device.isConnected}, Paired: ${device.isPaired}`);
  // Print battery level if the BLE device exposes it
  if (device.batteryLevel !== null) {
    console.log(`  Battery: ${device.batteryLevel}%`);
  }
}

// Query a single device by its deviceId
const singleDevice = getDevice('BT_1234567890');
if (singleDevice) {
  // Print the device's GATT service UUIDs
  console.log('Services:', singleDevice.serviceUuids);
}
```

@tab JavaScript

```js
const { getPairedDevices, getDevice } = require('@eisland/windows-bluetooth-helper');

// Query all paired devices
const devices = getPairedDevices();

// Iterate over each paired device
for (const device of devices) {
  // Print device name and type, using fallbacks for null values
  console.log(`${device.name ?? 'Unknown'} (${device.deviceType ?? 'N/A'})`);
  // Print connection and pairing status
  console.log(`  Connected: ${device.isConnected}, Paired: ${device.isPaired}`);
  // Print battery level if the BLE device exposes it
  if (device.batteryLevel !== null) {
    console.log(`  Battery: ${device.batteryLevel}%`);
  }
}

// Query a single device by its deviceId
const singleDevice = getDevice('BT_1234567890');
if (singleDevice) {
  // Print the device's GATT service UUIDs
  console.log('Services:', singleDevice.serviceUuids);
}
```

:::

## Notes

:::note
The `deviceId` value is the Windows `DeviceInformation.ID` string. It is unique per device and stable across reconnections, making it the correct key for caching or tracking devices in your application state.
:::

:::note
`signalStrength` (RSSI) is measured in dBm. Typical values range from -30 dBm (very strong, very close) to -100 dBm (very weak, far away). A `null` value means the device does not report RSSI, which is common for Classic Bluetooth devices.
:::

:::tip
When using `BluetoothMonitor`, the `device-updated` event fires whenever a device's properties change (e.g., connection state flips from disconnected to connected). The event delivers a full `BluetoothDeviceInfo` object, so you can diff it against your cached state to detect what changed.
:::

:::warning
The `batteryLevel` field is only available for BLE devices that expose the standard GATT Battery Service (UUID `0x180F`). Many BLE devices -- including most headphones -- do not expose this service, so `batteryLevel` will be `null` even if the device has a battery.
:::

## Danger Avoidance

:::danger
Do not assume `name` is always a non-null string. Devices that do not advertise a name will have `name: null`. Always use a fallback (e.g., `device.name ?? 'Unknown'`) before displaying or indexing by name. Using `null` names in UI rendering without a guard will cause runtime errors.
:::

:::danger
Do not use `bluetoothAddress` as a persistent unique identifier across sessions. While MAC addresses are typically stable, some BLE devices use rotating addresses for privacy. Use `deviceId` (the Windows DeviceInformation ID) as your stable key instead.
:::
