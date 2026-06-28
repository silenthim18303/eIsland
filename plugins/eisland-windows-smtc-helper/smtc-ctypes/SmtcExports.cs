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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */

using System.Runtime.InteropServices;
using System.Text.Json;

namespace eIslandSmtcHelper;

public static class SmtcExports
{
    [DllImport("ole32.dll")]
    private static extern int CoInitializeEx(IntPtr pvReserved, uint dwCoInit);

    private const uint COINIT_APARTMENTTHREADED = 0x2;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = false,
        TypeInfoResolver = SmtcJsonContext.Default
    };

    private static IntPtr StringToCoTaskMem(string str)
    {
        var bytes = System.Text.Encoding.UTF8.GetBytes(str + '\0');
        var ptr = Marshal.AllocCoTaskMem(bytes.Length);
        Marshal.Copy(bytes, 0, ptr, bytes.Length);
        return ptr;
    }

    private static T RunOnSTAThread<T>(Func<Task<T>> asyncFunc)
    {
        T result = default!;
        Exception? ex = null;
        var thread = new Thread(() =>
        {
            try
            {
                CoInitializeEx(IntPtr.Zero, COINIT_APARTMENTTHREADED);
                result = asyncFunc().GetAwaiter().GetResult();
            }
            catch (Exception e)
            {
                ex = e;
            }
        });
        thread.SetApartmentState(ApartmentState.STA);
        thread.Start();
        thread.Join();
        if (ex != null) throw ex;
        return result;
    }

    [UnmanagedCallersOnly(EntryPoint = "smtc_free_string")]
    public static void FreeString(IntPtr ptr)
    {
        if (ptr != IntPtr.Zero)
            Marshal.FreeCoTaskMem(ptr);
    }

    [UnmanagedCallersOnly(EntryPoint = "smtc_play")]
    public static int Play()
    {
        try
        {
            var result = RunOnSTAThread(() => SmtcController.PlayAsync());
            return result.Success ? 0 : 1;
        }
        catch { return 1; }
    }

    [UnmanagedCallersOnly(EntryPoint = "smtc_pause")]
    public static int Pause()
    {
        try
        {
            var result = RunOnSTAThread(() => SmtcController.PauseAsync());
            return result.Success ? 0 : 1;
        }
        catch { return 1; }
    }

    [UnmanagedCallersOnly(EntryPoint = "smtc_next")]
    public static int Next()
    {
        try
        {
            var result = RunOnSTAThread(() => SmtcController.NextAsync());
            return result.Success ? 0 : 1;
        }
        catch { return 1; }
    }

    [UnmanagedCallersOnly(EntryPoint = "smtc_previous")]
    public static int Previous()
    {
        try
        {
            var result = RunOnSTAThread(() => SmtcController.PreviousAsync());
            return result.Success ? 0 : 1;
        }
        catch { return 1; }
    }

    /// <summary>
    /// Get full media status as JSON. Returns NULL on failure.
    /// Use smtc_get_last_error() to get error details on failure.
    /// </summary>
    [UnmanagedCallersOnly(EntryPoint = "smtc_get_status")]
    public static IntPtr GetStatus()
    {
        try
        {
            var status = RunOnSTAThread(() => SmtcController.GetStatusAsync());
            var json = JsonSerializer.Serialize(status, SmtcJsonContext.Default.MediaStatus);
            return StringToCoTaskMem(json);
        }
        catch (Exception ex)
        {
            lastError = ex.ToString();
            return IntPtr.Zero;
        }
    }

    private static string lastError = "";

    /// <summary>
    /// Get last error message. Returns empty string if no error.
    /// </summary>
    [UnmanagedCallersOnly(EntryPoint = "smtc_get_last_error")]
    public static IntPtr GetLastError()
    {
        return StringToCoTaskMem(lastError);
    }
}
