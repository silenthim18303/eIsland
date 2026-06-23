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

#include "toast_listener_changed.h"
#include "toast_listener_helpers.h"

#include <cstring>
#include <new>

/* Global threadsafe callback — defined in toast_listener.cpp */
extern napi_threadsafe_function g_threadsafe_callback;

napi_value make_changed_event(napi_env env, const ToastChangedEvent* event) {
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

void call_js_changed_callback(napi_env env, napi_value js_callback, void* context, void* data) {
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

ToastChangedHandlerImpl* create_changed_handler(void) {
  return new (std::nothrow) ToastChangedHandlerImpl();
}
