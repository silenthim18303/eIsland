using System.Management;

namespace eIslandBrightnessHelper;

/// <summary>
/// 屏幕亮度查询与设置控制器
/// </summary>
public static class BrightnessController
{
    /// <summary>
    /// 获取当前屏幕亮度
    /// </summary>
    public static BrightnessInfo? GetBrightness()
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("root\\wmi", "SELECT * FROM WmiMonitorBrightness");
            foreach (ManagementObject obj in searcher.Get())
            {
                return new BrightnessInfo
                {
                    CurrentBrightness = (byte)obj["CurrentBrightness"],
                    Levels = obj["Level"] as byte[],
                    InstanceName = obj["InstanceName"] as string
                };
            }
        }
        catch
        {
            // 忽略
        }
        return null;
    }

    /// <summary>
    /// 设置屏幕亮度
    /// </summary>
    /// <param name="brightness">目标亮度 (0-100)</param>
    /// <returns>是否成功</returns>
    public static bool SetBrightness(byte brightness)
    {
        try
        {
            using var searcher = new ManagementObjectSearcher("root\\wmi", "SELECT * FROM WmiMonitorBrightnessMethods");
            foreach (ManagementObject obj in searcher.Get())
            {
                var inParams = obj.GetMethodParameters("WmiSetBrightness");
                inParams["Brightness"] = brightness;
                inParams["Timeout"] = 0;
                obj.InvokeMethod("WmiSetBrightness", inParams, null);
                return true;
            }
        }
        catch
        {
            // 忽略
        }
        return false;
    }
}
