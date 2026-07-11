using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

namespace eIslandScreenshotHelper;

internal static class ScreenCapture
{
    private const int SM_CXSCREEN = 0;
    private const int SM_CYSCREEN = 1;
    private const int SRCCOPY = 0x00CC0020;
    private const int CAPTUREBLT = 0x40000000;

    public static byte[] CapturePrimaryDisplayPng()
    {
        var width = GetSystemMetrics(SM_CXSCREEN);
        var height = GetSystemMetrics(SM_CYSCREEN);
        if (width <= 0 || height <= 0)
        {
            return Array.Empty<byte>();
        }

        var screenDc = GetDC(IntPtr.Zero);
        if (screenDc == IntPtr.Zero)
        {
            return Array.Empty<byte>();
        }

        var memoryDc = IntPtr.Zero;
        var bitmap = IntPtr.Zero;
        var oldObject = IntPtr.Zero;

        try
        {
            memoryDc = CreateCompatibleDC(screenDc);
            if (memoryDc == IntPtr.Zero)
            {
                return Array.Empty<byte>();
            }

            bitmap = CreateCompatibleBitmap(screenDc, width, height);
            if (bitmap == IntPtr.Zero)
            {
                return Array.Empty<byte>();
            }

            oldObject = SelectObject(memoryDc, bitmap);
            if (!BitBlt(memoryDc, 0, 0, width, height, screenDc, 0, 0, SRCCOPY | CAPTUREBLT))
            {
                return Array.Empty<byte>();
            }

            using var image = Image.FromHbitmap(bitmap);
            using var stream = new MemoryStream();
            image.Save(stream, ImageFormat.Png);
            return stream.ToArray();
        }
        finally
        {
            if (oldObject != IntPtr.Zero)
            {
                SelectObject(memoryDc, oldObject);
            }
            if (bitmap != IntPtr.Zero)
            {
                DeleteObject(bitmap);
            }
            if (memoryDc != IntPtr.Zero)
            {
                DeleteDC(memoryDc);
            }
            ReleaseDC(IntPtr.Zero, screenDc);
        }
    }

    [DllImport("user32.dll")]
    private static extern int GetSystemMetrics(int nIndex);

    [DllImport("user32.dll")]
    private static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    private static extern int ReleaseDC(IntPtr hWnd, IntPtr hDc);

    [DllImport("gdi32.dll")]
    private static extern IntPtr CreateCompatibleDC(IntPtr hDc);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteDC(IntPtr hDc);

    [DllImport("gdi32.dll")]
    private static extern IntPtr CreateCompatibleBitmap(IntPtr hDc, int width, int height);

    [DllImport("gdi32.dll")]
    private static extern IntPtr SelectObject(IntPtr hDc, IntPtr hObject);

    [DllImport("gdi32.dll")]
    private static extern bool DeleteObject(IntPtr hObject);

    [DllImport("gdi32.dll")]
    private static extern bool BitBlt(
        IntPtr hDestDc,
        int x,
        int y,
        int width,
        int height,
        IntPtr hSrcDc,
        int srcX,
        int srcY,
        int rasterOperation);
}