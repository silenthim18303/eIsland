using System.Text.Json.Serialization;

namespace eIslandBrightnessHelper;

/// <summary>
/// 显示器亮度信息
/// </summary>
public sealed class BrightnessInfo
{
    /// <summary>
    /// 当前亮度百分比 (0-100)
    /// </summary>
    [JsonPropertyName("currentBrightness")]
    public byte CurrentBrightness { get; init; }

    /// <summary>
    /// 显示器支持的亮度级别数组 (0-100)
    /// </summary>
    [JsonPropertyName("levels")]
    public byte[]? Levels { get; init; }

    /// <summary>
    /// 显示器实例名称
    /// </summary>
    [JsonPropertyName("instanceName")]
    public string? InstanceName { get; init; }
}
