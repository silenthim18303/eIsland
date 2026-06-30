using System.Text.Json.Serialization;
using eIslandBrightnessHelper;

namespace eIslandBrightnessCtypes;

/// <summary>
/// 源生成 JSON 序列化上下文，兼容 Native AOT（无反射）
/// </summary>
[JsonSerializable(typeof(BrightnessInfo))]
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
internal partial class BrightJsonContext : JsonSerializerContext { }
