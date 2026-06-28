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

using Windows.Media;
using Windows.Media.Control;

namespace eIslandSmtcHelper;

public static class SmtcController
{
    private static async Task<GlobalSystemMediaTransportControlsSession?> GetCurrentSessionAsync()
    {
        var manager = await GlobalSystemMediaTransportControlsSessionManager.RequestAsync();
        return manager.GetCurrentSession();
    }

    public static async Task<CommandResult> PlayAsync()
    {
        try
        {
            var session = await GetCurrentSessionAsync();
            if (session == null)
                return CommandResult.Fail("No active media session.");

            var success = await session.TryPlayAsync();
            return success ? CommandResult.Ok : CommandResult.Fail("Play command was rejected.");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public static async Task<CommandResult> PauseAsync()
    {
        try
        {
            var session = await GetCurrentSessionAsync();
            if (session == null)
                return CommandResult.Fail("No active media session.");

            var success = await session.TryPauseAsync();
            return success ? CommandResult.Ok : CommandResult.Fail("Pause command was rejected.");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public static async Task<CommandResult> NextAsync()
    {
        try
        {
            var session = await GetCurrentSessionAsync();
            if (session == null)
                return CommandResult.Fail("No active media session.");

            var success = await session.TrySkipNextAsync();
            return success ? CommandResult.Ok : CommandResult.Fail("Skip-next command was rejected.");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public static async Task<CommandResult> PreviousAsync()
    {
        try
        {
            var session = await GetCurrentSessionAsync();
            if (session == null)
                return CommandResult.Fail("No active media session.");

            var success = await session.TrySkipPreviousAsync();
            return success ? CommandResult.Ok : CommandResult.Fail("Skip-previous command was rejected.");
        }
        catch (Exception ex)
        {
            return CommandResult.Fail(ex.Message);
        }
    }

    public static async Task<MediaStatus> GetStatusAsync()
    {
        try
        {
            var session = await GetCurrentSessionAsync();
            if (session == null)
                return MediaStatus.Empty;

            var playbackInfo = session.GetPlaybackInfo();
            var timelineProperties = session.GetTimelineProperties();

            string? title = null;
            string? artist = null;
            string? album = null;

            try
            {
                var mediaProperties = await session.TryGetMediaPropertiesAsync();
                title = mediaProperties.Title;
                artist = mediaProperties.Artist;
                album = mediaProperties.AlbumTitle;
            }
            catch
            {
                // Media properties may not be available
            }

            var playbackStatus = playbackInfo.PlaybackStatus switch
            {
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing => "playing",
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Paused => "paused",
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Stopped => "stopped",
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Closed => "closed",
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Opened => "opened",
                GlobalSystemMediaTransportControlsSessionPlaybackStatus.Changing => "changing",
                _ => "unknown"
            };

            return new MediaStatus
            {
                IsAvailable = true,
                Title = title,
                Artist = artist,
                Album = album,
                PlaybackStatus = playbackStatus,
                IsShuffleActive = playbackInfo.IsShuffleActive,
                RepeatMode = (int?)playbackInfo.AutoRepeatMode
            };
        }
        catch
        {
            return MediaStatus.Empty;
        }
    }
}
