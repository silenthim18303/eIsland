#ifndef FULLSCREEN_TYPES_H
#define FULLSCREEN_TYPES_H

#include <windows.h>
#include <stddef.h>

#define FULLSCREEN_TOLERANCE_PX 2
#define TITLE_BUFFER_LENGTH 512

typedef struct FullscreenWindowInfo {
  HWND hwnd;
  DWORD process_id;
  RECT bounds;
  MONITORINFO monitor_info;
  WCHAR title[TITLE_BUFFER_LENGTH];
} FullscreenWindowInfo;

typedef struct WindowList {
  FullscreenWindowInfo* items;
  size_t length;
  size_t capacity;
} WindowList;

/* fullscreen_core.c */
LONG rect_width(const RECT* rect);
LONG rect_height(const RECT* rect);
BOOL get_fullscreen_info(HWND hwnd, FullscreenWindowInfo* info);
BOOL CALLBACK enum_windows_callback(HWND hwnd, LPARAM lparam);

#endif
