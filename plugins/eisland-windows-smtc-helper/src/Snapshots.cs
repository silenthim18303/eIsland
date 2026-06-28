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

namespace eIslandSmtcHelper;

public class TimelineProperties
{
    public double StartTime { get; init; }
    public double EndTime { get; init; }
    public double Position { get; init; }
    public double MinSeekTime { get; init; }
    public double MaxSeekTime { get; init; }
}

public class PlaybackControls
{
    public bool IsPlayEnabled { get; init; }
    public bool IsPauseEnabled { get; init; }
    public bool IsNextEnabled { get; init; }
    public bool IsPreviousEnabled { get; init; }
    public bool IsStopEnabled { get; init; }
    public bool IsRecordEnabled { get; init; }
    public bool IsFastForwardEnabled { get; init; }
    public bool IsRewindEnabled { get; init; }
    public bool IsChannelUpEnabled { get; init; }
    public bool IsChannelDownEnabled { get; init; }
}

public class MediaStatus
{
    public required bool IsAvailable { get; init; }
    public string? Title { get; init; }
    public string? Artist { get; init; }
    public string? AlbumTitle { get; init; }
    public string? AlbumArtist { get; init; }
    public int? TrackNumber { get; init; }
    public string[]? Genres { get; init; }
    public string? PlaybackStatus { get; init; }
    public bool? IsShuffleActive { get; init; }
    public int? RepeatMode { get; init; }
    public double? PlaybackRate { get; init; }
    public string? SourceAppUserModelId { get; init; }
    public string? Thumbnail { get; init; }
    public TimelineProperties? Timeline { get; init; }
    public PlaybackControls? Controls { get; init; }

    public static MediaStatus Empty => new() { IsAvailable = false };
}

public class CommandResult
{
    public required bool Success { get; init; }
    public string? Error { get; init; }

    public static CommandResult Ok => new() { Success = true };
    public static CommandResult Fail(string error) => new() { Success = false, Error = error };
}
