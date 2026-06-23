{
  "targets": [
    {
      "target_name": "eisland_windows_toast_listener",
      "sources": ["src/toast_listener.cpp"],
      "defines": ["WIN32_LEAN_AND_MEAN", "NAPI_VERSION=8", "NOMINMAX"],
      "libraries": ["runtimeobject.lib"],
      "msvs_settings": {
        "VCCLCompilerTool": {
          "AdditionalOptions": ["/utf-8"]
        }
      }
    }
  ]
}