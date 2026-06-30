using System.Management;
using System.Text.Json;
using System.Text.Json.Serialization;

var command = args.FirstOrDefault() ?? "get";
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

try
{
    switch (command)
    {
        case "get":
            Console.WriteLine(JsonSerializer.Serialize(BrightnessHelper.GetBrightness(), jsonOptions));
            break;
        case "set" when args.Length > 1 && byte.TryParse(args[1], out var brightness):
            Console.WriteLine(JsonSerializer.Serialize(BrightnessHelper.SetBrightness(brightness), jsonOptions));
            break;
        case "set":
            Console.WriteLine(JsonSerializer.Serialize(new { success = false, error = "Missing or invalid brightness value" }, jsonOptions));
            break;
        case "monitor":
            BrightnessHelper.Monitor();
            break;
        default:
            Console.WriteLine(JsonSerializer.Serialize(new { error = $"Unknown command: {command}" }, jsonOptions));
            break;
    }
}
catch (Exception ex)
{
    Console.WriteLine(JsonSerializer.Serialize(new { error = ex.Message }, jsonOptions));
}

static class BrightnessHelper
{
    public static object? GetBrightness()
    {
        using var searcher = new ManagementObjectSearcher(@"root\wmi", "SELECT * FROM WmiMonitorBrightness");
        foreach (ManagementObject obj in searcher.Get())
        {
            var rawLevels = obj["Level"] as byte[];
            return new
            {
                currentBrightness = (byte)obj["CurrentBrightness"],
                levels = rawLevels?.Select(b => (int)b).ToArray(),
                instanceName = obj["InstanceName"] as string
            };
        }
        return null;
    }

    public static object SetBrightness(byte brightness)
    {
        using var searcher = new ManagementObjectSearcher(@"root\wmi", "SELECT * FROM WmiMonitorBrightnessMethods");
        foreach (ManagementObject obj in searcher.Get())
        {
            var inParams = obj.GetMethodParameters("WmiSetBrightness");
            inParams["Brightness"] = brightness;
            inParams["Timeout"] = (uint)0;
            obj.InvokeMethod("WmiSetBrightness", inParams, null);
            return new { success = true, brightness };
        }
        return new { success = false, error = "No monitor found" };
    }

    public static void Monitor()
    {
        using var watcher = new ManagementEventWatcher(@"root\wmi", "SELECT * FROM WmiMonitorBrightnessEvent");
        watcher.EventArrived += (sender, e) =>
        {
            try
            {
                var brightness = (byte)e.NewEvent.Properties["Brightness"].Value;
                var json = JsonSerializer.Serialize(new { brightness, timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() });
                Console.WriteLine(json);
                Console.Out.Flush();
            }
            catch { /* ignore parse errors */ }
        };
        watcher.Start();

        // 保持进程运行，直到 stdin 关闭或收到退出信号
        Console.CancelKeyPress += (sender, e) =>
        {
            e.Cancel = true;
            watcher.Stop();
            Environment.Exit(0);
        };

        // 阻塞等待（stdin 关闭时进程自然退出）
        try { while (Console.In.Peek() != -1) Console.In.Read(); }
        catch { /* stdin closed */ }

        watcher.Stop();
    }
}
