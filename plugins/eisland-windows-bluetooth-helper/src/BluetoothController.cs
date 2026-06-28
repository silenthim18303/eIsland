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

        // 尝试从 Properties 读取（需要 ExtraProperties 才有值）
        try { if (device.Properties["System.Devices.Aep.DeviceAddress"] is string addr && !string.IsNullOrEmpty(addr)) address = addr; } catch { }
        try { if (device.Properties["System.Devices.Aep.SignalStrength"] is int signal) rssi = signal; } catch { }
        try { if (device.Properties["System.Devices.Aep.Bluetooth.Cod"] is uint cod) deviceClass = (int)cod; } catch { }
        try { if (device.Properties["System.Devices.Aep.Bluetooth.Appearance"] is uint app) appearance = (int)app; } catch { }
        try { if (device.Properties["System.Devices.Aep.Bluetooth.ServiceGuids"] is string[] guids) serviceUuids = guids; } catch { }
        try { if (device.Properties["System.Devices.Aep.IsConnected"] is bool conn) isConnected = conn; } catch { }
        try { if (device.Properties["System.Devices.Aep.IsPaired"] is bool paired) isPaired = paired; } catch { }

        // 如果 Properties 没有值，尝试通过 BluetoothDevice 对象获取
        if (!isConnected || address == null)
        {
            EnrichFromBluetoothDevice(device.Id, ref isConnected, ref isPaired, ref address, ref rssi);
        }

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
        };
    }

    /// <summary>
    /// 通过 BluetoothDevice / BluetoothLEDevice 对象补充属性
    /// </summary>
    private static void EnrichFromBluetoothDevice(string deviceId, ref bool isConnected, ref bool isPaired, ref string? address, ref int? rssi)
    {
        // 尝试经典蓝牙
        try
        {
            var bt = BluetoothDevice.FromIdAsync(deviceId).GetAwaiter().GetResult();
            if (bt != null)
            {
                isConnected = bt.ConnectionStatus == BluetoothConnectionStatus.Connected;
                isPaired = true; // 能打开 BluetoothDevice 说明已配对
                address = bt.BluetoothAddress.ToString("X12");
                return;
            }
        }
        catch { /* 忽略 */ }

        // 尝试 BLE
        try
        {
            var ble = BluetoothLEDevice.FromIdAsync(deviceId).GetAwaiter().GetResult();
            if (ble != null)
            {
                isConnected = ble.ConnectionStatus == BluetoothConnectionStatus.Connected;
                isPaired = true;
                address = ble.BluetoothAddress.ToString("X12");
                return;
            }
        }
        catch { /* 忽略 */ }
    }
}
