using System.Text.Json;
using LibreHardwareMonitor.Hardware;

var computer = new Computer
{
    IsCpuEnabled = true,
    IsGpuEnabled = true,
    IsMotherboardEnabled = true,
    IsStorageEnabled = true,
};

var readings = new List<TemperatureReading>();
var jsonOptions = new JsonSerializerOptions(JsonSerializerDefaults.Web);

try
{
    computer.Open();

    foreach (var hardware in computer.Hardware)
    {
        CollectHardwareTemperatures(hardware, readings);
    }

    var snapshot = new TemperatureSnapshot
    {
        IsAvailable = readings.Count > 0,
        Readings = readings,
        MaxTemperatureCelsius = readings.Count == 0 ? null : readings.Max(reading => reading.TemperatureCelsius),
    };

    Console.WriteLine(JsonSerializer.Serialize(snapshot, jsonOptions));
}
catch
{
    Console.WriteLine(JsonSerializer.Serialize(TemperatureSnapshot.Empty, jsonOptions));
}
finally
{
    computer.Close();
}

static void CollectHardwareTemperatures(IHardware hardware, List<TemperatureReading> readings)
{
    hardware.Update();

    foreach (var subHardware in hardware.SubHardware)
    {
        CollectHardwareTemperatures(subHardware, readings);
    }

    foreach (var sensor in hardware.Sensors)
    {
        if (sensor.SensorType != SensorType.Temperature || sensor.Value is null)
        {
            continue;
        }

        readings.Add(new TemperatureReading
        {
            Id = $"{hardware.Identifier}/{sensor.Identifier}",
            Label = string.IsNullOrWhiteSpace(sensor.Name) ? hardware.Name : $"{hardware.Name} {sensor.Name}",
            Category = MapCategory(hardware.HardwareType),
            TemperatureCelsius = Math.Round(sensor.Value.Value, 1),
            Source = "libre-hardware-monitor",
        });
    }
}

static string MapCategory(HardwareType hardwareType) => hardwareType switch
{
    HardwareType.Cpu => "cpu",
    HardwareType.GpuAmd or HardwareType.GpuIntel or HardwareType.GpuNvidia => "gpu",
    HardwareType.Motherboard => "motherboard",
    HardwareType.Storage => "storage",
    _ => "unknown",
};

sealed class TemperatureSnapshot
{
    public static TemperatureSnapshot Empty { get; } = new()
    {
        IsAvailable = false,
        Readings = [],
        MaxTemperatureCelsius = null,
    };

    public required bool IsAvailable { get; init; }
    public required List<TemperatureReading> Readings { get; init; }
    public required double? MaxTemperatureCelsius { get; init; }
}

sealed class TemperatureReading
{
    public required string Id { get; init; }
    public required string Label { get; init; }
    public required string Category { get; init; }
    public required double TemperatureCelsius { get; init; }
    public required string Source { get; init; }
}