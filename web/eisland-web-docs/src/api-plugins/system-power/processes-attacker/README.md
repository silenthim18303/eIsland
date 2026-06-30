---
watermark: true
title: Windows Processes Attacker
icon: skull-crossbones
---

# Windows Processes Attacker

`@eisland/windows-processes-attacker` · v26.0.0

:::warning
Process termination utilities via C N-API native addon. Use with caution — terminated processes cannot be recovered.
:::

## API Reference

| Type | Name | Description |
|------|------|-------------|
| Interface | [ProcessCloseResult](process-close-result.md) | Process close operation result |
| Interface | [ProcessFailure](process-failure.md) | Individual process failure info |
| Function | [closeProcess](close-process.md) | Terminate processes matching a target |
| Function | [closeProcesses](close-processes.md) | Terminate processes for multiple targets |
