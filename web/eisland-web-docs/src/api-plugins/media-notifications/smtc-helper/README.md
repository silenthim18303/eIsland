---
watermark: true
title: Windows SMTC Helper
icon: music
---

# Windows SMTC Helper

`@eisland/windows-smtc-helper` · v26.0.0

:::info
System Media Transport Controls via .NET NativeAOT DLL (koffi FFI).
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Interface | [TimelineProperties](timeline-properties.md) | Media timeline bounds |
| Interface | [PlaybackControls](playback-controls.md) | Available playback controls |
| Interface | [MediaStatus](media-status.md) | Full media status snapshot |
| Interface | [CommandResult](command-result.md) | Command execution result |
| Interface | [TimestampInfo](timestamp-info.md) | Lightweight timestamp data |
| Interface | [MediaProps](media-props.md) | Media metadata properties |
| Interface | [PlaybackInfo](playback-info.md) | Playback state info |
| Interface | [TimelineProps](timeline-props.md) | Timeline position/duration |
| Interface | [SessionSnapshot](session-snapshot.md) | Media session snapshot |
| Function | [play](play.md) | Resume playback |
| Function | [pause](pause.md) | Pause playback |
| Function | [next](next.md) | Next track |
| Function | [previous](previous.md) | Previous track |
| Function | [getStatus](get-status.md) | Get full media status |
| Function | [getTimestamp](get-timestamp.md) | Get lightweight timestamp |
| Function | [seek](seek.md) | Seek to position |
| Function | [stop](stop.md) | Stop playback |
| Function | [setShuffle](set-shuffle.md) | Toggle shuffle mode |
| Function | [setRepeatMode](set-repeat-mode.md) | Set repeat mode |
| Function | [setPlaybackRate](set-playback-rate.md) | Set playback rate |
| Class | [SmtcMonitor](smtc-monitor.md) | Real-time media session monitor |
