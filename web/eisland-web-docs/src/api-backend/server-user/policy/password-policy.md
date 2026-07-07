---
title: PasswordPolicy
---

# PasswordPolicy

:::info
Utility class enforcing password strength requirements: 8-128 characters, must contain both letters and digits, no whitespace.
:::

## Overview

A stateless policy class that validates password strength at registration and password-change time.

## Constants

| Constant | Value | Description |
|---|---|---|
| `MIN_LENGTH` | `8` | Minimum password length |
| `MAX_LENGTH` | `128` | Maximum password length |

## Validation Rules

| Rule | Error Message |
|---|---|
| Must not be null or blank | `"密码不能为空"` |
| Minimum 8 characters | `"密码长度不能少于 8 位"` |
| Maximum 128 characters | `"密码长度不能超过 128 位"` |
| No whitespace characters | `"密码不能包含空白字符"` |
| Must contain at least one letter | `"密码必须同时包含字母和数字"` |
| Must contain at least one digit | `"密码必须同时包含字母和数字"` |

## Methods

| Method | Return | Description |
|---|---|---|
| `validate(password)` | `String \| null` | Returns error message if invalid, `null` if valid |
