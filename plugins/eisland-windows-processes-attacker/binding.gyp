{
  "targets": [
    {
      "target_name": "eisland_windows_processes_attacker",
      "sources": ["src/processes_attacker.c"],
      "defines": ["WIN32_LEAN_AND_MEAN", "NAPI_VERSION=8"],
      "libraries": ["kernel32.lib"]
    }
  ]
}