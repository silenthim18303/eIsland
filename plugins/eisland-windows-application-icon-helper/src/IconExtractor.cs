using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace eIslandAppIconHelper;

/// <summary>
/// 图标提取器：从进程名、PID 或可执行文件路径获取图标
/// </summary>
internal static class IconExtractor
{

    [DllImport("shell32.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    private static extern IntPtr ExtractAssociatedIconW(IntPtr hInst, string pszIconPath, ref ushort piIcon);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern IntPtr OpenProcess(uint dwDesiredAccess, bool bInheritHandle, uint dwProcessId);

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    private static extern bool QueryFullProcessImageNameW(IntPtr hProcess, uint dwFlags, char[] lpExName, ref uint lpdwSize);

    [DllImport("kernel32.dll", SetLastError = true)]
    private static extern bool CloseHandle(IntPtr hObject);

    private const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;

    /// <summary>根据进程名获取图标</summary>
    internal static byte[]? GetIconByProcessName(string processName)
    {
        var exePath = FindProcessPath(processName);
        return exePath != null ? GetIconFromPath(exePath) : null;
    }

    /// <summary>根据 PID 获取图标</summary>
    internal static byte[]? GetIconByPid(uint pid)
    {
        var exePath = GetProcessPath(pid);
        return exePath != null ? GetIconFromPath(exePath) : null;
    }

    /// <summary>根据可执行文件路径获取图标</summary>
    internal static byte[]? GetIconByPath(string exePath)
    {
        if (!File.Exists(exePath))
            return null;
        return GetIconFromPath(exePath);
    }

    /// <summary>通过进程名查找可执行文件路径（遍历所有同名进程）</summary>
    private static string? FindProcessPath(string processName)
    {
        try
        {
            var name = Path.GetFileNameWithoutExtension(processName);
            var processes = Process.GetProcessesByName(name);
            foreach (var proc in processes)
            {
                try
                {
                    var path = proc.MainModule?.FileName;
                    if (path != null) return path;
                }
                catch { /* 无权限访问该进程 */ }
                finally { proc.Dispose(); }
            }
        }
        catch { /* 进程不存在 */ }
        return null;
    }

    /// <summary>通过 PID 获取可执行文件路径</summary>
    private static string? GetProcessPath(uint pid)
    {
        // 先尝试 .NET API
        try
        {
            var proc = Process.GetProcessById((int)pid);
            try
            {
                var path = proc.MainModule?.FileName;
                if (path != null) return path;
            }
            finally { proc.Dispose(); }
        }
        catch { /* 可能无权限 */ }

        // 降级到 Win32 API
        IntPtr hProc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);
        if (hProc == IntPtr.Zero) return null;

        try
        {
            var buffer = new char[1024];
            uint size = (uint)buffer.Length;
            if (QueryFullProcessImageNameW(hProc, 0, buffer, ref size) && size > 0)
                return new string(buffer, 0, (int)size);
        }
        finally
        {
            CloseHandle(hProc);
        }
        return null;
    }

    /// <summary>从可执行文件路径提取图标并转换为 PNG 字节数组</summary>
    private static byte[]? GetIconFromPath(string exePath)
    {
        try
        {
            ushort iconIndex = 0;
            IntPtr hIcon = ExtractAssociatedIconW(IntPtr.Zero, exePath, ref iconIndex);
            if (hIcon == IntPtr.Zero) return null;

            try
            {
                using var icon = Icon.FromHandle(hIcon);
                using var bmp = icon.ToBitmap();
                using var ms = new MemoryStream();
                bmp.Save(ms, ImageFormat.Png);
                return ms.ToArray();
            }
            finally
            {
                DestroyIcon(hIcon);
            }
        }
        catch
        {
            return null;
        }
    }

    [DllImport("user32.dll", SetLastError = true)]
    private static extern bool DestroyIcon(IntPtr hIcon);
}
