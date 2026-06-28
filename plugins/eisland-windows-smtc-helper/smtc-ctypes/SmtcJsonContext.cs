using System.Text.Json;
using System.Text.Json.Serialization;

namespace eIslandSmtcHelper;

[JsonSerializable(typeof(MediaStatus))]
[JsonSerializable(typeof(CommandResult))]
[JsonSerializable(typeof(TimelineProperties))]
[JsonSerializable(typeof(PlaybackControls))]
[JsonSourceGenerationOptions(PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase)]
internal partial class SmtcJsonContext : JsonSerializerContext
{
}
