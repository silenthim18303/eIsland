#include <node_api.h>
#include <windows.h>
#include <dwmapi.h>
#include <stdint.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

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

static BOOL get_window_bounds(HWND hwnd, RECT* bounds) {
  HRESULT result = DwmGetWindowAttribute(hwnd, DWMWA_EXTENDED_FRAME_BOUNDS, bounds, sizeof(RECT));
  if (SUCCEEDED(result)) {
    return TRUE;
  }
  return GetWindowRect(hwnd, bounds);
}

static LONG rect_width(const RECT* rect) {
  return rect->right - rect->left;
}

static LONG rect_height(const RECT* rect) {
  return rect->bottom - rect->top;
}

static BOOL is_rect_close_to_monitor(const RECT* window_rect, const RECT* monitor_rect) {
  return abs(window_rect->left - monitor_rect->left) <= FULLSCREEN_TOLERANCE_PX &&
    abs(window_rect->top - monitor_rect->top) <= FULLSCREEN_TOLERANCE_PX &&
    abs(window_rect->right - monitor_rect->right) <= FULLSCREEN_TOLERANCE_PX &&
    abs(window_rect->bottom - monitor_rect->bottom) <= FULLSCREEN_TOLERANCE_PX;
}

static BOOL is_candidate_window(HWND hwnd) {
  LONG_PTR style;
  LONG_PTR ex_style;

  if (!IsWindow(hwnd) || !IsWindowVisible(hwnd) || IsIconic(hwnd)) {
    return FALSE;
  }

  style = GetWindowLongPtrW(hwnd, GWL_STYLE);
  ex_style = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);

  if ((style & WS_DISABLED) != 0) {
    return FALSE;
  }

  if ((ex_style & WS_EX_TOOLWINDOW) != 0) {
    return FALSE;
  }

  return TRUE;
}

static BOOL get_fullscreen_info(HWND hwnd, FullscreenWindowInfo* info) {
  RECT bounds;
  HMONITOR monitor;
  MONITORINFO monitor_info;

  if (!is_candidate_window(hwnd)) {
    return FALSE;
  }

  if (!get_window_bounds(hwnd, &bounds)) {
    return FALSE;
  }

  if (rect_width(&bounds) <= 0 || rect_height(&bounds) <= 0) {
    return FALSE;
  }

  monitor = MonitorFromWindow(hwnd, MONITOR_DEFAULTTONEAREST);
  if (monitor == NULL) {
    return FALSE;
  }

  memset(&monitor_info, 0, sizeof(monitor_info));
  monitor_info.cbSize = sizeof(monitor_info);
  if (!GetMonitorInfoW(monitor, &monitor_info)) {
    return FALSE;
  }

  if (!is_rect_close_to_monitor(&bounds, &monitor_info.rcMonitor)) {
    return FALSE;
  }

  memset(info, 0, sizeof(*info));
  info->hwnd = hwnd;
  info->bounds = bounds;
  info->monitor_info = monitor_info;
  GetWindowThreadProcessId(hwnd, &info->process_id);
  GetWindowTextW(hwnd, info->title, TITLE_BUFFER_LENGTH);
  return TRUE;
}

static BOOL append_window(WindowList* list, const FullscreenWindowInfo* info) {
  FullscreenWindowInfo* next_items;
  size_t next_capacity;

  if (list->length == list->capacity) {
    next_capacity = list->capacity == 0 ? 8 : list->capacity * 2;
    next_items = (FullscreenWindowInfo*)realloc(list->items, next_capacity * sizeof(FullscreenWindowInfo));
    if (next_items == NULL) {
      return FALSE;
    }
    list->items = next_items;
    list->capacity = next_capacity;
  }

  list->items[list->length] = *info;
  list->length += 1;
  return TRUE;
}

static BOOL CALLBACK enum_windows_callback(HWND hwnd, LPARAM lparam) {
  WindowList* list = (WindowList*)lparam;
  FullscreenWindowInfo info;

  if (get_fullscreen_info(hwnd, &info)) {
    if (!append_window(list, &info)) {
      return FALSE;
    }
  }

  return TRUE;
}

static napi_value make_number(napi_env env, int32_t value) {
  napi_value result;
  napi_create_int32(env, value, &result);
  return result;
}

static napi_value make_bool(napi_env env, bool value) {
  napi_value result;
  napi_get_boolean(env, value, &result);
  return result;
}

static napi_value make_wide_string(napi_env env, const WCHAR* value) {
  napi_value result;
  napi_create_string_utf16(env, (const char16_t*)value, NAPI_AUTO_LENGTH, &result);
  return result;
}

static napi_value make_rect(napi_env env, const RECT* rect) {
  napi_value object;
  napi_create_object(env, &object);
  napi_set_named_property(env, object, "left", make_number(env, rect->left));
  napi_set_named_property(env, object, "top", make_number(env, rect->top));
  napi_set_named_property(env, object, "right", make_number(env, rect->right));
  napi_set_named_property(env, object, "bottom", make_number(env, rect->bottom));
  napi_set_named_property(env, object, "width", make_number(env, rect_width(rect)));
  napi_set_named_property(env, object, "height", make_number(env, rect_height(rect)));
  return object;
}

static napi_value make_monitor_info(napi_env env, const MONITORINFO* monitor_info) {
  napi_value object = make_rect(env, &monitor_info->rcMonitor);
  napi_set_named_property(env, object, "isPrimary", make_bool(env, (monitor_info->dwFlags & MONITORINFOF_PRIMARY) != 0));
  return object;
}

static napi_value make_hwnd_string(napi_env env, HWND hwnd) {
  char buffer[32];
  napi_value result;
#if defined(_WIN64)
  snprintf(buffer, sizeof(buffer), "0x%llx", (unsigned long long)(uintptr_t)hwnd);
#else
  snprintf(buffer, sizeof(buffer), "0x%lx", (unsigned long)(uintptr_t)hwnd);
#endif
  napi_create_string_utf8(env, buffer, NAPI_AUTO_LENGTH, &result);
  return result;
}

static napi_value make_fullscreen_info(napi_env env, const FullscreenWindowInfo* info, BOOL is_foreground) {
  napi_value object;
  napi_create_object(env, &object);
  napi_set_named_property(env, object, "hwnd", make_hwnd_string(env, info->hwnd));
  napi_set_named_property(env, object, "title", make_wide_string(env, info->title));
  napi_set_named_property(env, object, "processId", make_number(env, (int32_t)info->process_id));
  napi_set_named_property(env, object, "bounds", make_rect(env, &info->bounds));
  napi_set_named_property(env, object, "monitor", make_monitor_info(env, &info->monitor_info));
  napi_set_named_property(env, object, "isForeground", make_bool(env, is_foreground));
  return object;
}

static napi_value get_foreground_fullscreen_window(napi_env env, napi_callback_info callback_info) {
  HWND foreground = GetForegroundWindow();
  FullscreenWindowInfo info;
  napi_value result;

  (void)callback_info;

  if (foreground != NULL && get_fullscreen_info(foreground, &info)) {
    return make_fullscreen_info(env, &info, TRUE);
  }

  napi_get_null(env, &result);
  return result;
}

static napi_value get_fullscreen_windows(napi_env env, napi_callback_info callback_info) {
  WindowList list;
  HWND foreground;
  napi_value result;
  size_t index;

  (void)callback_info;

  memset(&list, 0, sizeof(list));
  foreground = GetForegroundWindow();

  EnumWindows(enum_windows_callback, (LPARAM)&list);
  napi_create_array_with_length(env, list.length, &result);

  for (index = 0; index < list.length; index += 1) {
    napi_value item = make_fullscreen_info(env, &list.items[index], list.items[index].hwnd == foreground);
    napi_set_element(env, result, (uint32_t)index, item);
  }

  free(list.items);
  return result;
}

static napi_value is_any_fullscreen_window(napi_env env, napi_callback_info callback_info) {
  HWND foreground = GetForegroundWindow();
  FullscreenWindowInfo info;
  BOOL is_fullscreen;

  (void)callback_info;

  is_fullscreen = foreground != NULL && get_fullscreen_info(foreground, &info);
  return make_bool(env, is_fullscreen != FALSE);
}

static napi_value init(napi_env env, napi_value exports) {
  napi_property_descriptor descriptors[] = {
    { "getForegroundFullscreenWindow", NULL, get_foreground_fullscreen_window, NULL, NULL, NULL, napi_default, NULL },
    { "getFullscreenWindows", NULL, get_fullscreen_windows, NULL, NULL, NULL, napi_default, NULL },
    { "isAnyFullscreenWindow", NULL, is_any_fullscreen_window, NULL, NULL, NULL, napi_default, NULL }
  };

  napi_define_properties(env, exports, sizeof(descriptors) / sizeof(descriptors[0]), descriptors);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)