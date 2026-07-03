---
watermark: true
title: BluetoothDeviceInfo
icon: fa6-solid:table
---

# BluetoothDeviceInfo

:::info
This document describes the `BluetoothDeviceInfo` interface returned by all Bluetooth Helper query functions and monitor events. The `deviceType` field is derived from BLE Appearance or Classic Bluetooth Class of Device (CoD), following the [Bluetooth SIG Assigned Numbers](https://www.bluetooth.com/specifications/assigned-numbers/).
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
| `0x51` | `"PulseOximeter"` | Pulse Oximeter |
| `0x52` | `"WeightScale"` | Weight Scale |
| `0x53` | `"OutdoorSports"` | Outdoor Sports Activity |

---

### Classic Bluetooth CoD Types

#### Major Class `0x00` — Miscellaneous

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"Miscellaneous"` | Uncategorized device |

#### Major Class `0x01` — Computer

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

#### Major Class `0x02` — Phone

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Cellular"` | Cellular phone |
| `0x02` | `"Cordless"` | Cordless phone |
| `0x03` | `"Smartphone"` | Smartphone |
| `0x04` | `"WiredModem"` | Wired modem or voice gateway |
| `0x05` | `"ISDNAccess"` | Common ISDN access |
| _(other)_ | `"Phone"` | Other phone |

#### Major Class `0x03` — LAN / Network

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| _(any)_ | `"LAN"` | Network access point (minor encodes utilization) |

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

#### Major Class `0x05` — Peripheral

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x04` | `"Joystick"` | Joystick |
| `0x08` | `"Gamepad"` | Gamepad / game controller |
| `0x0C` | `"RemoteControl"` | Remote control |
| `0x10` | `"SensingDevice"` | Sensing device |
| `0x14` | `"DigitizerTablet"` | Digitizer tablet |
| `0x18` | `"CardReader"` | Card reader (e.g., SIM) |
| _(other)_ | `"Peripheral"` | Other peripheral device |

#### Major Class `0x06` — Imaging

:::note
The Imaging minor class uses bit flags: bit 5 = Display, bit 4 = Camera, bit 3 = Scanner, bit 2 = Printer. Multiple flags can be set simultaneously.
:::

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x04` | `"Printer"` | Printer |
| `0x08` | `"Scanner"` | Scanner |
| `0x10` | `"Camera"` | Camera |
| `0x20` | `"ImagingDisplay"` | Display |
| _(other)_ | `"Imaging"` | Other imaging device or combination |

#### Major Class `0x07` — Wearable

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Wristwatch"` | Wristwatch |
| `0x02` | `"Pager"` | Pager |
| `0x03` | `"Jacket"` | Jacket |
| `0x04` | `"Helmet"` | Helmet |
| `0x05` | `"Glasses"` | Glasses |
| _(other)_ | `"Wearable"` | Other wearable device |

#### Major Class `0x08` — Toy

| Minor Class (hex) | `deviceType` | Description |
|--------------------|--------------|-------------|
| `0x01` | `"Robot"` | Robot |
| `0x02` | `"Vehicle"` | Vehicle |
| `0x03` | `"Doll"` | Doll / Action figure |
| `0x04` | `"ToyController"` | Controller |
| `0x05` | `"ToyGame"` | Game |
| _(other)_ | `"Toy"` | Other toy |

#### Major Class `0x09` — Health

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
BLE devices report types via the Appearance standard (35 categories). Classic Bluetooth devices use CoD Major + Minor Class (9 major classes, 80+ minor types). Both produce consistent type strings where the standards overlap — e.g., `"Phone"`, `"Computer"`, `"Headphones"`.
:::

:::warning
Some BLE headphones or speakers may not advertise a specific Appearance category, in which case `deviceType` will be `null`. The CoD-based classification only applies to Classic Bluetooth devices.
:::
