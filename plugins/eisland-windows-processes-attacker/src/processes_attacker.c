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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 */

/**
 * @file processes_attacker.c
 * @description Windows process management Node-API binding.
 * @description Terminates Windows processes by process name or PID.
 * @author JNTMTMTM
 */

#include <node_api.h>
#include <windows.h>
#include <tlhelp32.h>
#include <stdbool.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <wchar.h>

#define MAX_PROCESS_NAME_LENGTH 260
#define EXIT_CODE_TERMINATED_BY_EISLAND 1

typedef enum ProcessTargetKind {
  PROCESS_TARGET_PID,
  PROCESS_TARGET_NAME
} ProcessTargetKind;

typedef struct ProcessTarget {
  ProcessTargetKind kind;
  DWORD pid;
  WCHAR name[MAX_PROCESS_NAME_LENGTH];
  WCHAR normalized_name[MAX_PROCESS_NAME_LENGTH];
} ProcessTarget;

typedef struct ProcessFailure {
  DWORD pid;
  DWORD error_code;
  WCHAR name[MAX_PROCESS_NAME_LENGTH];
} ProcessFailure;

typedef struct ProcessCloseResult {
  DWORD matched_count;
  DWORD terminated_count;
  DWORD failed_count;
  ProcessFailure* failures;
} ProcessCloseResult;

static napi_value make_uint32(napi_env env, uint32_t value) {
  napi_value result;
  napi_create_uint32(env, value, &result);
  return result;
}

static napi_value make_wide_string(napi_env env, const WCHAR* value) {
  napi_value result;
  napi_create_string_utf16(env, (const char16_t*)value, NAPI_AUTO_LENGTH, &result);
  return result;
}

static napi_value make_target_value(napi_env env, const ProcessTarget* target) {
  napi_value result;

  if (target->kind == PROCESS_TARGET_PID) {
    napi_create_uint32(env, target->pid, &result);
    return result;
  }

  return make_wide_string(env, target->name);
}

static bool string_ends_with_exe(const WCHAR* value) {
  size_t length = wcslen(value);

  if (length < 4) {
    return false;
  }

  return _wcsicmp(value + length - 4, L".exe") == 0;
}

static void normalize_process_name(const WCHAR* source, WCHAR* output, size_t output_length) {
  size_t source_length;

  if (output_length == 0) {
    return;
  }

  output[0] = L'\0';
  wcsncpy_s(output, output_length, source, _TRUNCATE);
  source_length = wcslen(output);

  if (source_length > 0 && !string_ends_with_exe(output)) {
    wcscat_s(output, output_length, L".exe");
  }
}

static bool process_name_matches(const ProcessTarget* target, const WCHAR* process_name) {
  if (target->kind != PROCESS_TARGET_NAME) {
    return false;
  }

  if (_wcsicmp(target->name, process_name) == 0) {
    return true;
  }

  return target->normalized_name[0] != L'\0' && _wcsicmp(target->normalized_name, process_name) == 0;
}

static bool append_failure(ProcessCloseResult* result, DWORD pid, const WCHAR* name, DWORD error_code) {
  ProcessFailure* next_failures;
  size_t next_size = ((size_t)result->failed_count + 1) * sizeof(ProcessFailure);

  next_failures = (ProcessFailure*)realloc(result->failures, next_size);
  if (next_failures == NULL) {
    return false;
  }

  result->failures = next_failures;
  result->failures[result->failed_count].pid = pid;
  result->failures[result->failed_count].error_code = error_code;
  wcsncpy_s(result->failures[result->failed_count].name, MAX_PROCESS_NAME_LENGTH, name, _TRUNCATE);
  result->failed_count += 1;
  return true;
}

static void close_process_by_entry(const PROCESSENTRY32W* entry, ProcessCloseResult* result) {
  HANDLE process_handle;
  DWORD error_code;

  result->matched_count += 1;
  process_handle = OpenProcess(PROCESS_TERMINATE, FALSE, entry->th32ProcessID);

  if (process_handle == NULL) {
    error_code = GetLastError();
    append_failure(result, entry->th32ProcessID, entry->szExeFile, error_code);
    return;
  }

  if (TerminateProcess(process_handle, EXIT_CODE_TERMINATED_BY_EISLAND)) {
    result->terminated_count += 1;
    CloseHandle(process_handle);
    return;
  }

  error_code = GetLastError();
  CloseHandle(process_handle);
  append_failure(result, entry->th32ProcessID, entry->szExeFile, error_code);
}

static bool entry_matches_target(const PROCESSENTRY32W* entry, const ProcessTarget* target) {
  if (target->kind == PROCESS_TARGET_PID) {
    return entry->th32ProcessID == target->pid;
  }

  return process_name_matches(target, entry->szExeFile);
}

static bool close_matching_processes(const ProcessTarget* target, ProcessCloseResult* result) {
  HANDLE snapshot;
  PROCESSENTRY32W entry;

  memset(result, 0, sizeof(ProcessCloseResult));

  snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (snapshot == INVALID_HANDLE_VALUE) {
    append_failure(result, 0, L"", GetLastError());
    return false;
  }

  memset(&entry, 0, sizeof(entry));
  entry.dwSize = sizeof(PROCESSENTRY32W);

  if (!Process32FirstW(snapshot, &entry)) {
    append_failure(result, 0, L"", GetLastError());
    CloseHandle(snapshot);
    return false;
  }

  do {
    if (entry_matches_target(&entry, target)) {
      close_process_by_entry(&entry, result);
    }
  } while (Process32NextW(snapshot, &entry));

  CloseHandle(snapshot);
  return true;
}

static napi_value make_failure(napi_env env, const ProcessFailure* failure) {
  napi_value object;

  napi_create_object(env, &object);
  napi_set_named_property(env, object, "pid", make_uint32(env, failure->pid));
  napi_set_named_property(env, object, "name", make_wide_string(env, failure->name));
  napi_set_named_property(env, object, "errorCode", make_uint32(env, failure->error_code));
  return object;
}

static napi_value make_result(napi_env env, const ProcessTarget* target, const ProcessCloseResult* close_result) {
  napi_value object;
  napi_value failures;
  DWORD index;

  napi_create_object(env, &object);
  napi_set_named_property(env, object, "target", make_target_value(env, target));
  napi_set_named_property(env, object, "matchedCount", make_uint32(env, close_result->matched_count));
  napi_set_named_property(env, object, "terminatedCount", make_uint32(env, close_result->terminated_count));
  napi_set_named_property(env, object, "failedCount", make_uint32(env, close_result->failed_count));

  napi_create_array_with_length(env, close_result->failed_count, &failures);
  for (index = 0; index < close_result->failed_count; index += 1) {
    napi_set_element(env, failures, index, make_failure(env, &close_result->failures[index]));
  }
  napi_set_named_property(env, object, "failures", failures);

  return object;
}

static bool read_string_target(napi_env env, napi_value value, ProcessTarget* target) {
  size_t copied_length;
  napi_status status;

  status = napi_get_value_string_utf16(env, value, (char16_t*)target->name, MAX_PROCESS_NAME_LENGTH, &copied_length);
  if (status != napi_ok || copied_length == 0) {
    napi_throw_type_error(env, NULL, "Process name must be a non-empty string.");
    return false;
  }

  target->kind = PROCESS_TARGET_NAME;
  target->pid = 0;
  target->name[MAX_PROCESS_NAME_LENGTH - 1] = L'\0';
  normalize_process_name(target->name, target->normalized_name, MAX_PROCESS_NAME_LENGTH);
  return true;
}

static bool read_number_target(napi_env env, napi_value value, ProcessTarget* target) {
  uint32_t pid;
  napi_status status = napi_get_value_uint32(env, value, &pid);

  if (status != napi_ok || pid == 0) {
    napi_throw_type_error(env, NULL, "Process id must be a positive integer.");
    return false;
  }

  target->kind = PROCESS_TARGET_PID;
  target->pid = (DWORD)pid;
  target->name[0] = L'\0';
  target->normalized_name[0] = L'\0';
  return true;
}

static bool read_target(napi_env env, napi_value value, ProcessTarget* target) {
  napi_valuetype value_type;

  memset(target, 0, sizeof(ProcessTarget));
  napi_typeof(env, value, &value_type);

  if (value_type == napi_string) {
    return read_string_target(env, value, target);
  }

  if (value_type == napi_number) {
    return read_number_target(env, value, target);
  }

  napi_throw_type_error(env, NULL, "Process target must be a process name string or process id number.");
  return false;
}

static napi_value close_single_process(napi_env env, napi_callback_info callback_info) {
  size_t argc = 1;
  napi_value args[1];
  napi_value result;
  ProcessTarget target;
  ProcessCloseResult close_result;

  napi_get_cb_info(env, callback_info, &argc, args, NULL, NULL);
  if (argc < 1) {
    napi_throw_type_error(env, NULL, "closeProcess requires one process target.");
    napi_get_undefined(env, &result);
    return result;
  }

  if (!read_target(env, args[0], &target)) {
    napi_get_undefined(env, &result);
    return result;
  }

  close_matching_processes(&target, &close_result);
  result = make_result(env, &target, &close_result);
  free(close_result.failures);
  return result;
}

static napi_value close_multiple_processes(napi_env env, napi_callback_info callback_info) {
  size_t argc = 1;
  uint32_t length;
  uint32_t index;
  bool is_array;
  napi_value args[1];
  napi_value results;

  napi_get_cb_info(env, callback_info, &argc, args, NULL, NULL);
  if (argc < 1) {
    napi_throw_type_error(env, NULL, "closeProcesses requires one process target array.");
    napi_get_undefined(env, &results);
    return results;
  }

  napi_is_array(env, args[0], &is_array);
  if (!is_array) {
    napi_throw_type_error(env, NULL, "closeProcesses requires an array of process targets.");
    napi_get_undefined(env, &results);
    return results;
  }

  napi_get_array_length(env, args[0], &length);
  napi_create_array_with_length(env, length, &results);

  for (index = 0; index < length; index += 1) {
    napi_value item;
    napi_value item_result;
    ProcessTarget target;
    ProcessCloseResult close_result;

    napi_get_element(env, args[0], index, &item);
    if (!read_target(env, item, &target)) {
      return results;
    }

    close_matching_processes(&target, &close_result);
    item_result = make_result(env, &target, &close_result);
    napi_set_element(env, results, index, item_result);
    free(close_result.failures);
  }

  return results;
}

static napi_value init(napi_env env, napi_value exports) {
  napi_property_descriptor descriptors[] = {
    { "closeProcess", NULL, close_single_process, NULL, NULL, NULL, napi_default, NULL },
    { "closeProcesses", NULL, close_multiple_processes, NULL, NULL, NULL, napi_default, NULL }
  };

  napi_define_properties(env, exports, sizeof(descriptors) / sizeof(descriptors[0]), descriptors);
  return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, init)