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
#include <asyncinfo.h>

#include <cstdint>
#include <cstdlib>
#include <cstring>
#include <cwchar>
#include <new>

#define TOAST_LISTENER_CLASS_NAME L"Windows.UI.Notifications.Management.UserNotificationListener"
#define ASYNC_ACCESS_TIMEOUT_MS 60000
#define ASYNC_ACCESS_POLL_MS 25

typedef __x_ABI_CWindows_CUI_CNotifications_CManagement_CIUserNotificationListener ToastListener;
typedef __x_ABI_CWindows_CUI_CNotifications_CManagement_CIUserNotificationListenerStatics ToastListenerStatics;
typedef __x_ABI_CWindows_CUI_CNotifications_CIUserNotificationChangedEventArgs ToastChangedArgs;
typedef __FITypedEventHandler_2_Windows__CUI__CNotifications__CManagement__CUserNotificationListener_Windows__CUI__CNotifications__CUserNotificationChangedEventArgs ToastChangedHandler;
typedef __FIAsyncOperation_1_Windows__CUI__CNotifications__CManagement__CUserNotificationListenerAccessStatus AccessStatusOperation;
using AccessStatus = ABI::Windows::UI::Notifications::Management::UserNotificationListenerAccessStatus;
using ToastChangedKind = ABI::Windows::UI::Notifications::UserNotificationChangedKind;

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

static napi_value get_notifications(napi_env env, napi_callback_info callback_info) {
  napi_value result;

  (void)callback_info;
  napi_create_array_with_length(env, 0, &result);
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