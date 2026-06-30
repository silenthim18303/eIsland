using System.Runtime.InteropServices;

namespace eIslandBrightnessCtypes;

/// <summary>
/// Native AOT 导出函数，供 koffi FFI 调用
/// </summary>
public static class BrightExports
{
    private static string lastError = "";

    private static IntPtr StringToCoTaskMem(string str)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(str + '\0');
        var ptr = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, ptr, bytes.Length);
        return ptr;
    }

    // ── 查询接口 ──────────────────────────────────────────

    /// <summary>获取当前屏幕亮度 JSON</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_get_brightness")]
    public static IntPtr GetBrightness()
    {
        try
        {
            var info = eIslandBrightnessHelper.BrightnessController.GetBrightness();
            if (info == null) return IntPtr.Zero;
            var json = System.Text.Json.JsonSerializer.Serialize(info, BrightJsonContext.Default.BrightnessInfo);
            return StringToCoTaskMem(json);
        }
        catch (Exception ex)
        {
            lastError = ex.ToString();
            return IntPtr.Zero;
        }
    }

    // ── 设置接口 ──────────────────────────────────────────

    /// <summary>设置屏幕亮度，brightness 为 0-100。返回 1=成功, 0=失败</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_set_brightness")]
    public static int SetBrightness(byte brightness)
    {
        try
        {
            return eIslandBrightnessHelper.BrightnessController.SetBrightness(brightness) ? 1 : 0;
        }
        catch (Exception ex)
        {
            lastError = ex.ToString();
            return 0;
        }
    }

    // ── 监控接口 ──────────────────────────────────────────

    /// <summary>启动亮度事件监控。0=成功, -1=已在运行, -2=错误</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_start_monitoring")]
    public static int StartMonitoring()
    {
        try { return eIslandBrightnessHelper.BrightnessMonitor.StartMonitoring(); }
        catch { return -2; }
    }

    /// <summary>停止亮度事件监控。0=成功, -1=未在运行</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_stop_monitoring")]
    public static int StopMonitoring()
    {
        try { return eIslandBrightnessHelper.BrightnessMonitor.StopMonitoring(); }
        catch { return -1; }
    }

    /// <summary>阻塞等待亮度变化。返回变化计数，0=超时无变化</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_wait_for_changes")]
    public static int WaitForChanges(int timeoutMs)
    {
        try { return eIslandBrightnessHelper.BrightnessMonitor.WaitForChanges(timeoutMs); }
        catch { return 0; }
    }

    /// <summary>获取最后一次事件中的亮度值</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_get_last_brightness")]
    public static byte GetLastBrightness()
    {
        try { return eIslandBrightnessHelper.BrightnessMonitor.GetLastBrightness(); }
        catch { return 0; }
    }

    /// <summary>是否正在监控。1=是, 0=否</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_is_running")]
    public static int IsRunning()
    {
        try { return eIslandBrightnessHelper.BrightnessMonitor.IsRunning() ? 1 : 0; }
        catch { return 0; }
    }

    /// <summary>获取最后一次错误信息</summary>
    [UnmanagedCallersOnly(EntryPoint = "bright_get_last_error")]
    public static IntPtr GetLastError()
    {
        return StringToCoTaskMem(lastError);
    }
}
