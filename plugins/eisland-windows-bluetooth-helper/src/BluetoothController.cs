/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows, built with Electron.
 * https://github.com/JNTMTMTM/eIsland
 *
 * Copyright (C) 2026 JNTMTMTM
 * Copyright (C) 2026 pyisland.com
 *
 * Original author: JNTMTMTM[](https://github.com/JNTMTMTM)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

using Windows.Devices.Bluetooth;
using Windows.Devices.Bluetooth.GenericAttributeProfile;
using Windows.Devices.Enumeration;

namespace eIslandBluetoothHelper;

/// <summary>
/// 蓝牙设备查询控制器
/// </summary>
public static class BluetoothController
{
    /// <summary>
    /// 查询经典蓝牙 + BLE 设备，合并去重
    /// </summary>
    private static DeviceInformation[] FindAllBluetoothDevices(string? extraFilter = null)
    {
        var results = new Dictionary<string, DeviceInformation>();

        // 经典蓝牙
        try
        {
            var selector = BluetoothDevice.GetDeviceSelector();
            if (extraFilter != null) selector = $"({selector}) AND ({extraFilter})";
            var devices = DeviceInformation.FindAllAsync(selector).GetAwaiter().GetResult();
            foreach (var d in devices) results.TryAdd(d.Id, d);
        }
        catch { /* 忽略 */ }

        // BLE
        try
        {
            var selector = BluetoothLEDevice.GetDeviceSelector();
            if (extraFilter != null) selector = $"({selector}) AND ({extraFilter})";
            var devices = DeviceInformation.FindAllAsync(selector).GetAwaiter().GetResult();
            foreach (var d in devices) results.TryAdd(d.Id, d);
        }
        catch { /* 忽略 */ }

        return results.Values.ToArray();
    }

    /// <summary>
    /// 获取所有已配对的蓝牙设备
    /// </summary>
    public static BluetoothDeviceInfo[] GetPairedDevices()
    {
        try
        {
            return FindAllBluetoothDevices().Select(BuildDeviceInfo).ToArray();
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// 获取所有已连接的蓝牙设备
    /// </summary>
    public static BluetoothDeviceInfo[] GetConnectedDevices()
    {
        try
        {
            return FindAllBluetoothDevices("System.Devices.Aep.IsConnected:=System.StructuredQueryType.Boolean#True")
                .Select(BuildDeviceInfo).ToArray();
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// 获取所有可见蓝牙设备（已配对 + 附近 BLE 广播）
    /// </summary>
    public static BluetoothDeviceInfo[] GetAllDevices()
    {
        try
        {
            return FindAllBluetoothDevices().Select(BuildDeviceInfo).ToArray();
        }
        catch
        {
            return [];
        }
    }

    /// <summary>
    /// 获取单个设备快照
    /// </summary>
    /// <param name="deviceId">Windows DeviceInformation ID</param>
    public static BluetoothDeviceInfo? GetDevice(string deviceId)
    {
        try
        {
            var device = DeviceInformation.CreateFromIdAsync(deviceId).GetAwaiter().GetResult();
            return device != null ? BuildDeviceInfo(device) : null;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// 获取经典蓝牙设备的 AQS 选择器（用于 DeviceWatcher）
    /// </summary>
    public static string GetClassicSelector() => BluetoothDevice.GetDeviceSelector();

    /// <summary>
    /// 获取 BLE 设备的 AQS 选择器（用于 DeviceWatcher）
    /// </summary>
    public static string GetBleSelector() => BluetoothLEDevice.GetDeviceSelector();

    /// <summary>
    /// 从 DeviceInformation 构建 BluetoothDeviceInfo
    /// </summary>
    public static BluetoothDeviceInfo BuildDeviceInfo(DeviceInformation device)
    {
        // 基础属性（FindAllAsync 默认返回）
        string? address = null;
        int? rssi = null;
        int? deviceClass = null;
        int? appearance = null;
        string[] serviceUuids = [];
        bool isConnected = false;
        bool isPaired = false;
        int? batteryLevel = null;

        // 尝试从 Properties 读取（需要 ExtraProperties 才有值）
        try { if (device.Properties["System.Devices.Aep.DeviceAddress"] is string addr && !string.IsNullOrEmpty(addr)) address = addr; } catch { }
        try { if (device.Properties["System.Devices.Aep.SignalStrength"] is int signal) rssi = signal; } catch { }
        try { if (device.Properties["System.Devices.Aep.IsConnected"] is bool conn) isConnected = conn; } catch { }
        try { if (device.Properties["System.Devices.Aep.IsPaired"] is bool paired) isPaired = paired; } catch { }

        // CoD、Appearance、ServiceGuids 不支持 FindAllAsync 的规范名，通过 EnrichFromBluetoothDevice 补充
        EnrichFromBluetoothDevice(device.Id, ref isConnected, ref isPaired, ref address, ref rssi,
            ref deviceClass, ref appearance, ref serviceUuids, ref batteryLevel);

        return new BluetoothDeviceInfo
        {
            DeviceId = device.Id,
            Name = device.Name,
            BluetoothAddress = address,
            IsConnected = isConnected,
            IsPaired = isPaired,
            SignalStrength = rssi,
            DeviceClass = deviceClass,
            Appearance = appearance,
            ServiceUuids = serviceUuids,
            DeviceType = DeriveDeviceType(deviceClass, appearance),
            BatteryLevel = batteryLevel,
        };
    }

    /// <summary>
    /// 推导可读设备类型；优先 BLE Appearance，回退到经典蓝牙 CoD（Major + Minor Class）
    /// </summary>
    /// <param name="cod">经典蓝牙 Class of Device（BluetoothClassOfDevice 原始值）</param>
    /// <param name="appearance">BLE Appearance（BluetoothLEAppearance 原始值）</param>
    private static string? DeriveDeviceType(int? cod, int? appearance)
    {
        // BLE 设备：从 Appearance 的 Category 字段（bits 6-15）推导（蓝牙 SIG Assigned Numbers）
        if (appearance is > 0)
        {
            int category = appearance.Value >> 6;
            string? bleType = category switch
            {
                0x01 => "Phone",
                0x02 => "Computer",
                0x03 => "Watch",
                0x04 => "Clock",
                0x05 => "Display",
                0x06 => "RemoteControl",
                0x07 => "Eyeglasses",
                0x08 => "Tag",
                0x09 => "Keyring",
                0x0A => "MediaPlayer",
                0x0B => "BarcodeScanner",
                0x0C => "Thermometer",
                0x0D => "HeartRate",
                0x0E => "BloodPressure",
                0x0F => "HID",
                0x10 => "Glucose",
                0x11 => "RunningWalking",
                0x12 => "Cycling",
                0x13 => "ControlDevice",
                0x14 => "Sensor",
                0x15 => "LightFixtures",
                0x16 => "Fan",
                0x17 => "HVAC",
                0x18 => "AirConditioning",
                0x19 => "Humidifier",
                0x1A => "Heating",
                0x1B => "AccessControl",
                0x1C => "MotorizedDevice",
                0x1D => "PowerTool",
                0x1E => "LightSource",
                0x1F => "WindowCovering",
                0x20 => "AudioSink",
                0x21 => "AudioSource",
                0x51 => "PulseOximeter",
                0x52 => "WeightScale",
                0x53 => "OutdoorSports",
                _ => null,
            };
            if (bleType != null) return bleType;
        }

        // 经典蓝牙：从 CoD 的 Major Device Class（bits 8-12）+ Minor Device Class（bits 2-7）推导
        // 参考：蓝牙 SIG Assigned Numbers — Device Class
        if (cod is > 0)
        {
            int major = (cod.Value >> 8) & 0x1F;
            int minor = (cod.Value >> 2) & 0x3F;

            return major switch
            {
                0x00 => "Miscellaneous",
                0x01 => minor switch // Computer
                {
                    0x01 => "Desktop",
                    0x02 => "Server",
                    0x03 => "Laptop",
                    0x04 => "HandheldPC",
                    0x05 => "PalmSizePC",
                    0x06 => "WearableComputer",
                    0x07 => "Tablet",
                    _ => "Computer",
                },
                0x02 => minor switch // Phone
                {
                    0x01 => "Cellular",
                    0x02 => "Cordless",
                    0x03 => "Smartphone",
                    0x04 => "WiredModem",
                    0x05 => "ISDNAccess",
                    _ => "Phone",
                },
                0x03 => "LAN",
                0x04 => minor switch // Audio/Video
                {
                    0x01 => "Headset",         // Wearable Headset
                    0x02 => "Handsfree",       // Hands-free
                    0x04 => "Microphone",      // Microphone
                    0x05 => "Speaker",         // Loudspeaker
                    0x06 => "Headphones",      // Headphones
                    0x07 => "PortableAudio",   // Portable Audio
                    0x08 => "CarAudio",        // Car Audio
                    0x09 => "SetTopBox",       // Set-top box
                    0x0A => "HiFiAudio",       // HiFi Audio Device
                    0x0B => "VCR",             // VCR
                    0x0C => "VideoCamera",     // Video Camera
                    0x0D => "Camcorder",       // Camcorder
                    0x0E => "VideoMonitor",    // Video Monitor
                    0x0F => "VideoLoudspeaker",// Video Display and Loudspeaker
                    0x10 => "VideoConferencing",// Video Conferencing
                    0x12 => "GamingToy",       // Gaming/Toy
                    _ => "Audio",
                },
                0x05 => minor switch // Peripheral
                {
                    0x04 => "Joystick",
                    0x08 => "Gamepad",
                    0x0C => "RemoteControl",
                    0x10 => "SensingDevice",
                    0x14 => "DigitizerTablet",
                    0x18 => "CardReader",
                    _ => "Peripheral",
                },
                0x06 => minor switch // Imaging — bit flags: bit5=Display, bit4=Camera, bit3=Scanner, bit2=Printer
                {
                    0x04 => "Printer",
                    0x08 => "Scanner",
                    0x10 => "Camera",
                    0x20 => "ImagingDisplay",
                    _ => "Imaging",
                },
                0x07 => minor switch // Wearable
                {
                    0x01 => "Wristwatch",
                    0x02 => "Pager",
                    0x03 => "Jacket",
                    0x04 => "Helmet",
                    0x05 => "Glasses",
                    _ => "Wearable",
                },
                0x08 => minor switch // Toy
                {
                    0x01 => "Robot",
                    0x02 => "Vehicle",
                    0x03 => "Doll",
                    0x04 => "ToyController",
                    0x05 => "ToyGame",
                    _ => "Toy",
                },
                0x09 => minor switch // Health
                {
                    0x01 => "BloodPressureMonitor",
                    0x02 => "HealthThermometer",
                    0x03 => "WeighingScale",
                    0x04 => "GlucoseMeter",
                    0x05 => "PulseOximeter",
                    0x06 => "HeartRateMonitor",
                    0x07 => "HealthDataDisplay",
                    0x08 => "StepCounter",
                    0x09 => "BodyComposition",
                    0x0A => "PeakFlowMonitor",
                    0x0B => "MedicationMonitor",
                    0x0C => "KneeProsthesis",
                    0x0D => "AnkleProsthesis",
                    0x0E => "GenericHealthManager",
                    0x0F => "PersonalMobilityDevice",
                    0x10 => "ContinuousGlucoseMonitor",
                    _ => "Health",
                },
                _ => null,
            };
        }

        return null;
    }

    /// <summary>
    /// 通过 BluetoothDevice / BluetoothLEDevice 对象补充属性；BLE 设备同时读取电量
    /// </summary>
    private static void EnrichFromBluetoothDevice(
        string deviceId,
        ref bool isConnected,
        ref bool isPaired,
        ref string? address,
        ref int? rssi,
        ref int? deviceClass,
        ref int? appearance,
        ref string[] serviceUuids,
        ref int? batteryLevel)
    {
        // 尝试 BLE（优先，可获取电量、Appearance、ServiceUuids）
        try
        {
            var ble = BluetoothLEDevice.FromIdAsync(deviceId).GetAwaiter().GetResult();
            if (ble != null)
            {
                isConnected = ble.ConnectionStatus == BluetoothConnectionStatus.Connected;
                isPaired = true;
                address = ble.BluetoothAddress.ToString("X12");

                // BLE Appearance（BluetoothLEAppearance）
                try { if (ble.Appearance != null) appearance = ble.Appearance.RawValue; } catch { }

                // GATT Service UUIDs
                try
                {
                    var svcResult = ble.GetGattServicesAsync(BluetoothCacheMode.Cached).GetAwaiter().GetResult();
                    if (svcResult.Status == GattCommunicationStatus.Success && svcResult.Services.Count > 0)
                        serviceUuids = svcResult.Services.Select(s => s.Uuid.ToString()).ToArray();
                }
                catch { }

                batteryLevel = ReadBleBatteryLevel(ble);
                return;
            }
        }
        catch { /* 非 BLE 设备，忽略 */ }

        // 尝试经典蓝牙
        try
        {
            var bt = BluetoothDevice.FromIdAsync(deviceId).GetAwaiter().GetResult();
            if (bt != null)
            {
                isConnected = bt.ConnectionStatus == BluetoothConnectionStatus.Connected;
                isPaired = true;
                address = bt.BluetoothAddress.ToString("X12");

                // 经典蓝牙 Class of Device
                try { if (bt.ClassOfDevice != null) deviceClass = (int)bt.ClassOfDevice.RawValue; } catch { }

                return;
            }
        }
        catch { /* 忽略 */ }
    }

    /// <summary>
    /// 通过 GATT Battery Service (0x180F) 读取 BLE 设备电量百分比
    /// </summary>
    private static int? ReadBleBatteryLevel(BluetoothLEDevice ble)
    {
        GattDeviceService? service = null;
        try
        {
            var result = ble.GetGattServicesAsync(BluetoothCacheMode.Cached).GetAwaiter().GetResult();
            if (result.Status != GattCommunicationStatus.Success) return null;

            // 查找 Battery Service (UUID 0x180F)
            service = result.Services.FirstOrDefault(s =>
                s.Uuid == GattServiceUuids.Battery);
            if (service == null) return null;

            var characteristics = service.GetCharacteristicsAsync(BluetoothCacheMode.Cached).GetAwaiter().GetResult();
            if (characteristics.Status != GattCommunicationStatus.Success) return null;

            // Battery Level characteristic (UUID 0x2A19)
            var batteryChar = characteristics.Characteristics.FirstOrDefault(c =>
                c.Uuid == GattCharacteristicUuids.BatteryLevel);
            if (batteryChar == null) return null;

            if (!batteryChar.CharacteristicProperties.HasFlag(GattCharacteristicProperties.Read))
                return null;

            var valueResult = batteryChar.ReadValueAsync().GetAwaiter().GetResult();
            if (valueResult.Status != GattCommunicationStatus.Success) return null;

            var reader = Windows.Storage.Streams.DataReader.FromBuffer(valueResult.Value);
            return reader.ReadByte(); // 0–100
        }
        catch
        {
            return null;
        }
        finally
        {
            service?.Dispose();
        }
    }
}
