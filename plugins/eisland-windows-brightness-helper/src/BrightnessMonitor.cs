using System.Management;
using System.Collections.Concurrent;
using System.Runtime.InteropServices;

namespace eIslandBrightnessHelper;

/// <summary>
/// 屏幕亮度事件监控器，基于 WmiMonitorBrightnessEvent
/// </summary>
public static class BrightnessMonitor
{
    private static ManagementEventWatcher? _watcher;
    private static readonly object _lock = new();
    private static volatile bool _isRunning;
    private static int _changeCount;

    // Win32 事件句柄，用于跨线程通知
    private static IntPtr _eventHandle = IntPtr.Zero;

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr CreateEventW(IntPtr lpEventAttributes, bool bManualReset, bool bInitialState, IntPtr lpName);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool SetEvent(IntPtr hEvent);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool ResetEvent(IntPtr hEvent);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern uint WaitForSingleObject(IntPtr hHandle, uint dwMilliseconds);

    /// <summary>
    /// 最新亮度值 (由事件更新)
    /// </summary>
    private static byte _lastBrightness;

    /// <summary>
    /// 启动亮度事件监控
    /// </summary>
    /// <returns>0=成功, -1=已在运行, -2=错误</returns>
    public static int StartMonitoring()
    {
        lock (_lock)
        {
            if (_isRunning) return -1;

            try
            {
                _eventHandle = CreateEventW(IntPtr.Zero, true, false, IntPtr.Zero);
                if (_eventHandle == IntPtr.Zero) return -2;

                _changeCount = 0;
                _lastBrightness = 0;

                _watcher = new ManagementEventWatcher("root\\wmi", "SELECT * FROM WmiMonitorBrightnessEvent");
                _watcher.EventArrived += OnBrightnessEvent;
                _watcher.Start();

                _isRunning = true;
                return 0;
            }
            catch
            {
                return -2;
            }
        }
    }

    /// <summary>
    /// 停止亮度事件监控
    /// </summary>
    /// <returns>0=成功, -1=未在运行</returns>
    public static int StopMonitoring()
    {
        lock (_lock)
        {
            if (!_isRunning) return -1;

            try
            {
                _watcher?.Stop();
                _watcher?.Dispose();
                _watcher = null;

                if (_eventHandle != IntPtr.Zero)
                {
                    SetEvent(_eventHandle); // 唤醒等待线程
                    // 注意: 不在此处关闭句柄，由 GC 或进程退出处理
                    _eventHandle = IntPtr.Zero;
                }

                _isRunning = false;
                _changeCount = 0;
                return 0;
            }
            catch
            {
                return -1;
            }
        }
    }

    /// <summary>
    /// 等待亮度变化事件（阻塞直到变化或超时）
    /// </summary>
    /// <param name="timeoutMs">超时毫秒数</param>
    /// <returns>变化计数，0=超时无变化</returns>
    public static int WaitForChanges(int timeoutMs)
    {
        if (!_isRunning || _eventHandle == IntPtr.Zero) return 0;

        WaitForSingleObject(_eventHandle, (uint)timeoutMs);
        ResetEvent(_eventHandle);

        return _changeCount;
    }

    /// <summary>
    /// 获取当前亮度值（由最后一次事件记录）
    /// </summary>
    public static byte GetLastBrightness() => _lastBrightness;

    /// <summary>
    /// 是否正在监控
    /// </summary>
    public static bool IsRunning() => _isRunning;

    /// <summary>
    /// WmiMonitorBrightnessEvent 回调
    /// </summary>
    private static void OnBrightnessEvent(object sender, EventArrivedEventArgs e)
    {
        try
        {
            var brightness = (byte)e.NewEvent.Properties["Brightness"].Value;
            _lastBrightness = brightness;
            Interlocked.Increment(ref _changeCount);
            if (_eventHandle != IntPtr.Zero)
                SetEvent(_eventHandle);
        }
        catch
        {
            // 忽略单次事件解析失败
        }
    }
}
