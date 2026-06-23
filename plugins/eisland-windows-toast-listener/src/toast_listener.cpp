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

#include <node_api.h>
#include <windows.h>
#include <roapi.h>
#include <windows.ui.notifications.management.h>
#include <windows.ui.notifications.h>
#include <asyncinfo.h>
#include <windows.data.xml.dom.h>
#include <windows.applicationmodel.h>

#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <cwchar>
#include <new>
#include <string>
#include <vector>

#define TOAST_LISTENER_CLASS_NAME L"Windows.UI.Notifications.Management.UserNotificationListener"
#define ASYNC_ACCESS_TIMEOUT_MS 60000
#define ASYNC_ACCESS_POLL_MS 25

typedef __x_ABI_CWindows_CUI_CNotifications_CManagement_CIUserNotificationListener ToastListener;
typedef __x_ABI_CWindows_CUI_CNotifications_CManagement_CIUserNotificationListenerStatics ToastListenerStatics;
typedef __x_ABI_CWindows_CUI_CNotifications_CIUserNotificationChangedEventArgs ToastChangedArgs;
typedef __x_ABI_CWindows_CUI_CNotifications_CIUserNotification UserNotification;
typedef __x_ABI_CWindows_CApplicationModel_CIAppInfo AppInfo;
typedef __x_ABI_CWindows_CApplicationModel_CIAppDisplayInfo AppDisplayInfo;
typedef __x_ABI_CWindows_CUI_CNotifications_CINotification Notification;
typedef __x_ABI_CWindows_CUI_CNotifications_CINotificationVisual NotificationVisual;
typedef __x_ABI_CWindows_CUI_CNotifications_CINotificationBinding NotificationBinding;
typedef __x_ABI_CWindows_CUI_CNotifications_CIAdaptiveNotificationText AdaptiveNotificationText;
typedef __FITypedEventHandler_2_Windows__CUI__CNotifications__CManagement__CUserNotificationListener_Windows__CUI__CNotifications__CUserNotificationChangedEventArgs ToastChangedHandler;
typedef __FIAsyncOperation_1_Windows__CUI__CNotifications__CManagement__CUserNotificationListenerAccessStatus AccessStatusOperation;
typedef __FIAsyncOperation_1___FIVectorView_1_Windows__CUI__CNotifications__CUserNotification NotificationVectorOperation;
typedef __FIVectorView_1_Windows__CUI__CNotifications__CUserNotification NotificationVector;
typedef __FIVectorView_1_Windows__CUI__CNotifications__CAdaptiveNotificationText AdaptiveTextVector;
typedef __FIVector_1_Windows__CUI__CNotifications__CNotificationBinding BindingVector;
using AccessStatus = ABI::Windows::UI::Notifications::Management::UserNotificationListenerAccessStatus;
using ToastChangedKind = ABI::Windows::UI::Notifications::UserNotificationChangedKind;
using NotificationKinds = ABI::Windows::UI::Notifications::NotificationKinds;

typedef struct ToastChangedEvent {
  char kind[16];
  uint32_t notification_id;
} ToastChangedEvent;

struct ToastChangedHandlerImpl final : ToastChangedHandler {
  ToastChangedHandlerImpl() : ref_count(1) {}

  HRESULT STDMETHODCALLTYPE QueryInterface(REFIID riid, void** object) override;
  ULONG STDMETHODCALLTYPE AddRef() override;
  ULONG STDMETHODCALLTYPE Release() override;
  HRESULT STDMETHODCALLTYPE Invoke(ToastListener* sender, ToastChangedArgs* args) override;

 private:
  LONG ref_count;
};

static INIT_ONCE g_init_once = INIT_ONCE_STATIC_INIT;
static CRITICAL_SECTION g_listener_lock;
static napi_threadsafe_function g_threadsafe_callback = NULL;
static ToastListener* g_listener = NULL;
static ToastChangedHandlerImpl* g_changed_handler = NULL;
static EventRegistrationToken g_changed_token;
static bool g_is_listening = false;

static BOOL CALLBACK initialize_once(PINIT_ONCE init_once, PVOID parameter, PVOID* context) {
  (void)init_once;
  (void)parameter;
  (void)context;
  InitializeCriticalSection(&g_listener_lock);
  memset(&g_changed_token, 0, sizeof(g_changed_token));
  return TRUE;
}

static void ensure_initialized(void) {
  InitOnceExecuteOnce(&g_init_once, initialize_once, NULL, NULL);
  RoInitialize(RO_INIT_MULTITHREADED);
}

static napi_value make_boolean(napi_env env, bool value) {
  napi_value result;
  napi_get_boolean(env, value, &result);
  return result;
}

static napi_value make_string(napi_env env, const char* value) {
  napi_value result;
  napi_create_string_utf8(env, value, NAPI_AUTO_LENGTH, &result);
  return result;
}

static void throw_error(napi_env env, const char* message) {
  napi_throw_error(env, NULL, message);
}

static const char* access_status_to_string(AccessStatus status) {
  switch (status) {
    case 0:
      return "unspecified";
    case 1:
      return "allowed";
    case 2:
      return "denied";
    default:
      return "unknown";
  }
}

static const char* changed_kind_to_string(ToastChangedKind kind) {
  switch (kind) {
    case 0:
      return "added";
    case 1:
      return "removed";
    default:
      return "unknown";
  }
}

static napi_value make_changed_event(napi_env env, const ToastChangedEvent* event) {
  napi_value object;
  napi_value kind;
  napi_value notification_id;

  napi_create_object(env, &object);
  napi_create_string_utf8(env, event->kind, NAPI_AUTO_LENGTH, &kind);
  napi_create_uint32(env, event->notification_id, &notification_id);
  napi_set_named_property(env, object, "kind", kind);
  napi_set_named_property(env, object, "notificationId", notification_id);
  return object;
}

static void call_js_changed_callback(napi_env env, napi_value js_callback, void* context, void* data) {
  ToastChangedEvent* event = (ToastChangedEvent*)data;
  napi_value undefined;
  napi_value argv[1];

  (void)context;

  if (env == NULL || js_callback == NULL || event == NULL) {
    free(event);
    return;
  }

  napi_get_undefined(env, &undefined);
  argv[0] = make_changed_event(env, event);
  napi_call_function(env, undefined, js_callback, 1, argv, NULL);
  free(event);
}

HRESULT STDMETHODCALLTYPE ToastChangedHandlerImpl::QueryInterface(REFIID riid, void** object) {
  if (object == NULL) {
    return E_POINTER;
  }

  if (IsEqualIID(riid, __uuidof(IUnknown)) ||
      IsEqualIID(riid, __uuidof(ToastChangedHandler))) {
    *object = static_cast<ToastChangedHandler*>(this);
    AddRef();
    return S_OK;
  }

  *object = NULL;
  return E_NOINTERFACE;
}

ULONG STDMETHODCALLTYPE ToastChangedHandlerImpl::AddRef() {
  return (ULONG)InterlockedIncrement(&ref_count);
}

ULONG STDMETHODCALLTYPE ToastChangedHandlerImpl::Release() {
  LONG count = InterlockedDecrement(&ref_count);

  if (count == 0) {
    delete this;
  }

  return (ULONG)count;
}

HRESULT STDMETHODCALLTYPE ToastChangedHandlerImpl::Invoke(ToastListener* sender, ToastChangedArgs* args) {
  ToastChangedKind kind = (ToastChangedKind)0;
  uint32_t notification_id = 0;
  ToastChangedEvent* event;
  napi_status status;

  (void)sender;

  if (args == NULL || g_threadsafe_callback == NULL) {
    return S_OK;
  }

  args->get_ChangeKind(&kind);
  args->get_UserNotificationId(&notification_id);

  event = (ToastChangedEvent*)calloc(1, sizeof(ToastChangedEvent));
  if (event == NULL) {
    return E_OUTOFMEMORY;
  }

  strncpy(event->kind, changed_kind_to_string(kind), sizeof(event->kind) - 1);
  event->notification_id = notification_id;

  status = napi_call_threadsafe_function(g_threadsafe_callback, event, napi_tsfn_nonblocking);
  if (status != napi_ok) {
    free(event);
  }

  return S_OK;
}

static ToastChangedHandlerImpl* create_changed_handler(void) {
  return new (std::nothrow) ToastChangedHandlerImpl();
}

static HRESULT get_current_listener(ToastListener** listener) {
  HSTRING class_name = NULL;
  ToastListenerStatics* statics = NULL;
  HRESULT hr;

  if (listener == NULL) {
    return E_POINTER;
  }

  *listener = NULL;
  hr = WindowsCreateString(TOAST_LISTENER_CLASS_NAME, (UINT32)wcslen(TOAST_LISTENER_CLASS_NAME), &class_name);
  if (FAILED(hr)) {
    return hr;
  }

  hr = RoGetActivationFactory(class_name, __uuidof(ToastListenerStatics), (void**)&statics);
  WindowsDeleteString(class_name);

  if (FAILED(hr)) {
    return hr;
  }

  hr = statics->get_Current(listener);
  statics->Release();
  return hr;
}

static HRESULT wait_for_access_result(AccessStatusOperation* operation, AccessStatus* status) {
  IAsyncInfo* async_info = NULL;
  AsyncStatus async_status = Started;
  HRESULT hr;
  DWORD waited_ms = 0;

  if (operation == NULL || status == NULL) {
    return E_POINTER;
  }

  hr = operation->QueryInterface(__uuidof(IAsyncInfo), (void**)&async_info);
  if (FAILED(hr)) {
    return hr;
  }

  while (waited_ms < ASYNC_ACCESS_TIMEOUT_MS) {
    hr = async_info->get_Status(&async_status);
    if (FAILED(hr)) {
      async_info->Release();
      return hr;
    }

    if (async_status != Started) {
      break;
    }

    Sleep(ASYNC_ACCESS_POLL_MS);
    waited_ms += ASYNC_ACCESS_POLL_MS;
  }

  async_info->Release();

  if (async_status != Completed) {
    return HRESULT_FROM_WIN32(WAIT_TIMEOUT);
  }

  return operation->GetResults(status);
}

static HRESULT wait_for_notification_vector_result(NotificationVectorOperation* operation, NotificationVector** result) {
  IAsyncInfo* async_info = NULL;
  AsyncStatus async_status = Started;
  HRESULT hr;
  DWORD waited_ms = 0;

  if (operation == NULL || result == NULL) {
    return E_POINTER;
  }

  *result = NULL;

  hr = operation->QueryInterface(__uuidof(IAsyncInfo), (void**)&async_info);
  if (FAILED(hr)) {
    return hr;
  }

  while (waited_ms < ASYNC_ACCESS_TIMEOUT_MS) {
    hr = async_info->get_Status(&async_status);
    if (FAILED(hr)) {
      async_info->Release();
      return hr;
    }

    if (async_status != Started) {
      break;
    }

    Sleep(ASYNC_ACCESS_POLL_MS);
    waited_ms += ASYNC_ACCESS_POLL_MS;
  }

  async_info->Release();

  if (async_status != Completed) {
    return HRESULT_FROM_WIN32(WAIT_TIMEOUT);
  }

  return operation->GetResults(result);
}

static napi_value request_access(napi_env env, napi_callback_info callback_info) {
  ToastListener* listener = NULL;
  AccessStatusOperation* operation = NULL;
  AccessStatus status = (AccessStatus)0;
  HRESULT hr;

  (void)callback_info;
  ensure_initialized();

  hr = get_current_listener(&listener);
  if (FAILED(hr)) {
    throw_error(env, "Failed to get Windows notification listener.");
    return NULL;
  }

  hr = listener->RequestAccessAsync(&operation);
  listener->Release();

  if (FAILED(hr) || operation == NULL) {
    throw_error(env, "Failed to request Windows notification listener access.");
    return NULL;
  }

  hr = wait_for_access_result(operation, &status);
  operation->Release();

  if (FAILED(hr)) {
    throw_error(env, "Failed to read Windows notification listener access result.");
    return NULL;
  }

  return make_string(env, access_status_to_string(status));
}

static napi_value get_access_status(napi_env env, napi_callback_info callback_info) {
  ToastListener* listener = NULL;
  AccessStatus status = (AccessStatus)0;
  HRESULT hr;

  (void)callback_info;
  ensure_initialized();

  hr = get_current_listener(&listener);
  if (FAILED(hr)) {
    throw_error(env, "Failed to get Windows notification listener.");
    return NULL;
  }

  hr = listener->GetAccessStatus(&status);
  listener->Release();

  if (FAILED(hr)) {
    throw_error(env, "Failed to read Windows notification listener access status.");
    return NULL;
  }

  return make_string(env, access_status_to_string(status));
}

static const char* hstring_to_utf8(HSTRING hs) {
  UINT32 len = 0;
  const wchar_t* raw = WindowsGetStringRawBuffer(hs, &len);
  if (raw == NULL || len == 0) {
    return "";
  }

  int utf8_len = WideCharToMultiByte(CP_UTF8, 0, raw, (int)len, NULL, 0, NULL, NULL);
  if (utf8_len <= 0) {
    return "";
  }

  char* buf = (char*)malloc((size_t)utf8_len + 1);
  if (buf == NULL) {
    return "";
  }

  WideCharToMultiByte(CP_UTF8, 0, raw, (int)len, buf, utf8_len, NULL, NULL);
  buf[utf8_len] = '\0';
  return buf;
}

static napi_value get_notifications(napi_env env, napi_callback_info callback_info) {
  ToastListener* listener = NULL;
  NotificationVectorOperation* vector_operation = NULL;
  NotificationVector* notifications = NULL;
  napi_value result;
  HRESULT hr;
  UINT32 count = 0;

  (void)callback_info;
  ensure_initialized();

  hr = get_current_listener(&listener);
  if (FAILED(hr)) {
    throw_error(env, "Failed to get Windows notification listener.");
    return NULL;
  }

  hr = listener->GetNotificationsAsync((NotificationKinds)1, &vector_operation);
  listener->Release();

  if (FAILED(hr) || vector_operation == NULL) {
    throw_error(env, "Failed to get Windows notifications.");
    return NULL;
  }

  hr = wait_for_notification_vector_result(vector_operation, &notifications);
  vector_operation->Release();

  if (FAILED(hr) || notifications == NULL) {
    napi_create_array_with_length(env, 0, &result);
    return result;
  }

  notifications->get_Size(&count);
  napi_create_array_with_length(env, count, &result);

  for (UINT32 i = 0; i < count; i++) {
    UserNotification* user_notification = NULL;
    AppInfo* app_info = NULL;
    Notification* notification = NULL;
    NotificationVisual* visual = NULL;
    BindingVector* bindings = NULL;
    napi_value item;
    napi_value js_id, js_app_user_model_id, js_app_display_name;
    napi_value js_title, js_body, js_texts, js_created_at;
    UINT32 notification_id = 0;

    if (FAILED(notifications->GetAt(i, &user_notification)) || user_notification == NULL) {
      continue;
    }

    napi_create_object(env, &item);

    napi_create_string_utf8(env, "", NAPI_AUTO_LENGTH, &js_app_user_model_id);
    napi_create_string_utf8(env, "", NAPI_AUTO_LENGTH, &js_app_display_name);
    napi_set_named_property(env, item, "appUserModelId", js_app_user_model_id);
    napi_set_named_property(env, item, "appDisplayName", js_app_display_name);

    user_notification->get_Id(&notification_id);
    napi_create_uint32(env, notification_id, &js_id);
    napi_set_named_property(env, item, "id", js_id);

    hr = user_notification->get_AppInfo(&app_info);

    if (SUCCEEDED(hr) && app_info != NULL) {
      HSTRING app_user_model_id_hs = NULL;
      app_info->get_AppUserModelId(&app_user_model_id_hs);
      const char* app_user_model_id_str = hstring_to_utf8(app_user_model_id_hs);
      napi_create_string_utf8(env, app_user_model_id_str, NAPI_AUTO_LENGTH, &js_app_user_model_id);
      napi_set_named_property(env, item, "appUserModelId", js_app_user_model_id);
      if (app_user_model_id_str[0] != '\0') {
        free((void*)app_user_model_id_str);
      }
      WindowsDeleteString(app_user_model_id_hs);

      AppDisplayInfo* display_info = NULL;
      hr = app_info->get_DisplayInfo(&display_info);

      if (SUCCEEDED(hr) && display_info != NULL) {
        HSTRING display_name_hs = NULL;
        display_info->get_DisplayName(&display_name_hs);
        const char* display_name_str = hstring_to_utf8(display_name_hs);
        napi_create_string_utf8(env, display_name_str, NAPI_AUTO_LENGTH, &js_app_display_name);
        napi_set_named_property(env, item, "appDisplayName", js_app_display_name);
        if (display_name_str[0] != '\0') {
          free((void*)display_name_str);
        }
        WindowsDeleteString(display_name_hs);
        display_info->Release();
      }

      app_info->Release();
    }

    napi_create_array_with_length(env, 0, &js_texts);
    napi_create_string_utf8(env, "", NAPI_AUTO_LENGTH, &js_title);
    napi_create_string_utf8(env, "", NAPI_AUTO_LENGTH, &js_body);
    napi_set_named_property(env, item, "texts", js_texts);
    napi_set_named_property(env, item, "title", js_title);
    napi_set_named_property(env, item, "body", js_body);

    hr = user_notification->get_Notification(&notification);

    if (SUCCEEDED(hr) && notification != NULL) {
      hr = notification->get_Visual(&visual);

      if (SUCCEEDED(hr) && visual != NULL) {
        hr = visual->get_Bindings(&bindings);

        if (SUCCEEDED(hr) && bindings != NULL) {
          UINT32 binding_count = 0;
          bindings->get_Size(&binding_count);

          if (binding_count > 0) {
            NotificationBinding* first_binding = NULL;
            if (SUCCEEDED(bindings->GetAt(0, &first_binding)) && first_binding != NULL) {
              AdaptiveTextVector* text_items = NULL;
              hr = first_binding->GetTextElements(&text_items);

              if (SUCCEEDED(hr) && text_items != NULL) {
                UINT32 text_count = 0;
                text_items->get_Size(&text_count);

                for (UINT32 j = 0; j < text_count; j++) {
                  AdaptiveNotificationText* text_item = NULL;
                  if (SUCCEEDED(text_items->GetAt(j, &text_item)) && text_item != NULL) {
                    HSTRING text_hs = NULL;
                    text_item->get_Text(&text_hs);
                    const char* text_str = hstring_to_utf8(text_hs);
                    napi_value js_text;
                    napi_create_string_utf8(env, text_str, NAPI_AUTO_LENGTH, &js_text);
                    napi_set_element(env, js_texts, j, js_text);
                    if (text_str[0] != '\0') {
                      free((void*)text_str);
                    }
                    WindowsDeleteString(text_hs);
                    text_item->Release();
                  }
                }

                if (text_count > 0) {
                  AdaptiveNotificationText* first_text = NULL;
                  if (SUCCEEDED(text_items->GetAt(0, &first_text)) && first_text != NULL) {
                    HSTRING title_hs = NULL;
                    first_text->get_Text(&title_hs);
                    const char* title_str = hstring_to_utf8(title_hs);
                    napi_create_string_utf8(env, title_str, NAPI_AUTO_LENGTH, &js_title);
                    napi_set_named_property(env, item, "title", js_title);
                    if (title_str[0] != '\0') {
                      free((void*)title_str);
                    }
                    WindowsDeleteString(title_hs);
                    first_text->Release();
                  }
                }

                if (text_count > 1) {
                  AdaptiveNotificationText* second_text = NULL;
                  if (SUCCEEDED(text_items->GetAt(1, &second_text)) && second_text != NULL) {
                    HSTRING body_hs = NULL;
                    second_text->get_Text(&body_hs);
                    const char* body_str = hstring_to_utf8(body_hs);
                    napi_create_string_utf8(env, body_str, NAPI_AUTO_LENGTH, &js_body);
                    napi_set_named_property(env, item, "body", js_body);
                    if (body_str[0] != '\0') {
                      free((void*)body_str);
                    }
                    WindowsDeleteString(body_hs);
                    second_text->Release();
                  }
                }

                text_items->Release();
              }

              first_binding->Release();
            }
          }

          bindings->Release();
        }

        visual->Release();
      }

      notification->Release();
    }

    ABI::Windows::Foundation::DateTime creation_time;
    memset(&creation_time, 0, sizeof(creation_time));
    user_notification->get_CreationTime(&creation_time);
    napi_create_int64(env, creation_time.UniversalTime, &js_created_at);
    napi_set_named_property(env, item, "createdAt", js_created_at);

    user_notification->Release();
    napi_set_element(env, result, i, item);
  }

  notifications->Release();
  return result;
}

static napi_value start_listening(napi_env env, napi_callback_info callback_info) {
  size_t argc = 1;
  napi_value argv[1];
  napi_valuetype callback_type;
  napi_value resource_name;
  napi_status napi_result;
  ToastListener* listener = NULL;
  ToastChangedHandlerImpl* handler = NULL;
  EventRegistrationToken token;
  HRESULT hr;

  ensure_initialized();

  napi_get_cb_info(env, callback_info, &argc, argv, NULL, NULL);
  if (argc < 1) {
    throw_error(env, "startListening requires a callback.");
    return NULL;
  }

  napi_typeof(env, argv[0], &callback_type);
  if (callback_type != napi_function) {
    throw_error(env, "startListening callback must be a function.");
    return NULL;
  }

  EnterCriticalSection(&g_listener_lock);

  if (g_is_listening) {
    LeaveCriticalSection(&g_listener_lock);
    return make_boolean(env, false);
  }

  napi_create_string_utf8(env, "eisland-windows-toast-listener", NAPI_AUTO_LENGTH, &resource_name);
  napi_result = napi_create_threadsafe_function(
    env,
    argv[0],
    NULL,
    resource_name,
    0,
    1,
    NULL,
    NULL,
    NULL,
    call_js_changed_callback,
    &g_threadsafe_callback
  );

  if (napi_result != napi_ok) {
    LeaveCriticalSection(&g_listener_lock);
    throw_error(env, "Failed to create notification listener callback bridge.");
    return NULL;
  }

  hr = get_current_listener(&listener);
  if (FAILED(hr)) {
    napi_release_threadsafe_function(g_threadsafe_callback, napi_tsfn_abort);
    g_threadsafe_callback = NULL;
    LeaveCriticalSection(&g_listener_lock);
    throw_error(env, "Failed to get Windows notification listener.");
    return NULL;
  }

  handler = create_changed_handler();
  if (handler == NULL) {
    listener->Release();
    napi_release_threadsafe_function(g_threadsafe_callback, napi_tsfn_abort);
    g_threadsafe_callback = NULL;
    LeaveCriticalSection(&g_listener_lock);
    throw_error(env, "Failed to create Windows notification changed handler.");
    return NULL;
  }

  memset(&token, 0, sizeof(token));
  hr = listener->add_NotificationChanged(handler, &token);
  if (FAILED(hr)) {
    handler->Release();
    listener->Release();
    napi_release_threadsafe_function(g_threadsafe_callback, napi_tsfn_abort);
    g_threadsafe_callback = NULL;
    LeaveCriticalSection(&g_listener_lock);
    throw_error(env, "Failed to start Windows notification listener.");
    return NULL;
  }

  g_listener = listener;
  g_changed_handler = handler;
  g_changed_token = token;
  g_is_listening = true;

  LeaveCriticalSection(&g_listener_lock);
  return make_boolean(env, true);
}

static napi_value stop_listening(napi_env env, napi_callback_info callback_info) {
  bool stopped = false;

  (void)callback_info;
  ensure_initialized();

  EnterCriticalSection(&g_listener_lock);

  if (g_is_listening) {
    if (g_listener != NULL) {
      g_listener->remove_NotificationChanged(g_changed_token);
      g_listener->Release();
      g_listener = NULL;
    }

    if (g_changed_handler != NULL) {
      g_changed_handler->Release();
      g_changed_handler = NULL;
    }

    if (g_threadsafe_callback != NULL) {
      napi_release_threadsafe_function(g_threadsafe_callback, napi_tsfn_abort);
      g_threadsafe_callback = NULL;
    }

    memset(&g_changed_token, 0, sizeof(g_changed_token));
    g_is_listening = false;
    stopped = true;
  }

  LeaveCriticalSection(&g_listener_lock);
  return make_boolean(env, stopped);
}

static napi_value is_listening(napi_env env, napi_callback_info callback_info) {
  bool listening;

  (void)callback_info;
  ensure_initialized();

  EnterCriticalSection(&g_listener_lock);
  listening = g_is_listening;
  LeaveCriticalSection(&g_listener_lock);

  return make_boolean(env, listening);
}

static void finalize_module(void* data) {
  (void)data;
  ensure_initialized();

  EnterCriticalSection(&g_listener_lock);

  if (g_listener != NULL) {
    g_listener->remove_NotificationChanged(g_changed_token);
    g_listener->Release();
    g_listener = NULL;
  }

  if (g_changed_handler != NULL) {
    g_changed_handler->Release();
    g_changed_handler = NULL;
  }

  if (g_threadsafe_callback != NULL) {
    napi_release_threadsafe_function(g_threadsafe_callback, napi_tsfn_abort);
    g_threadsafe_callback = NULL;
  }

  memset(&g_changed_token, 0, sizeof(g_changed_token));
  g_is_listening = false;

  LeaveCriticalSection(&g_listener_lock);
}

static napi_value init(napi_env env, napi_value exports) {
  napi_property_descriptor descriptors[] = {
    { "requestAccess", NULL, request_access, NULL, NULL, NULL, napi_default, NULL },
    { "getAccessStatus", NULL, get_access_status, NULL, NULL, NULL, napi_default, NULL },
    { "getNotifications", NULL, get_notifications, NULL, NULL, NULL, napi_default, NULL },
    { "startListening", NULL, start_listening, NULL, NULL, NULL, napi_default, NULL },
    { "stopListening", NULL, stop_listening, NULL, NULL, NULL, napi_default, NULL },
    { "isListening", NULL, is_listening, NULL, NULL, NULL, napi_default, NULL }
  };

  ensure_initialized();
  napi_define_properties(env, exports, sizeof(descriptors) / sizeof(descriptors[0]), descriptors);
  napi_add_env_cleanup_hook(env, finalize_module, NULL);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)