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

public class MediaStatus
{
    public required bool IsAvailable { get; init; }
    public string? Title { get; init; }
    public string? Artist { get; init; }
    public string? Album { get; init; }
    public string? PlaybackStatus { get; init; }
    public bool? IsShuffleActive { get; init; }
    public int? RepeatMode { get; init; }

    public static MediaStatus Empty => new() { IsAvailable = false };
}

public class CommandResult
{
    public required bool Success { get; init; }
    public string? Error { get; init; }

    public static CommandResult Ok => new() { Success = true };
    public static CommandResult Fail(string error) => new() { Success = false, Error = error };
}
