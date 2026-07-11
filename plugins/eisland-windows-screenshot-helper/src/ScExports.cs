using System.Runtime.InteropServices;
using System.Text;

namespace eIslandScreenshotHelper;

public static class ScExports
{
    private static string lastError = "";

    [UnmanagedCallersOnly(EntryPoint = "sc_free_string")]
    public static void FreeString(IntPtr ptr)
    {
        if (ptr != IntPtr.Zero)
        {
            Marshal.FreeCoTaskMem(ptr);
        }
    }

    [UnmanagedCallersOnly(EntryPoint = "sc_get_last_error")]
    public static IntPtr GetLastError()
    {
        return StringToCoTaskMem(lastError);
    }

    [UnmanagedCallersOnly(EntryPoint = "sc_capture_primary_display_png")]
    public static IntPtr CapturePrimaryDisplayPng()
    {
        try
        {
            var png = ScreenCapture.CapturePrimaryDisplayPng();
            return png.Length == 0 ? IntPtr.Zero : StringToCoTaskMem(Convert.ToBase64String(png));
        }
        catch (Exception ex)
        {
            lastError = ex.ToString();
            return IntPtr.Zero;
        }
    }

    private static IntPtr StringToCoTaskMem(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value + '\0');
        var ptr = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, ptr, bytes.Length);
        return ptr;
    }
}