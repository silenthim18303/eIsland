---
title: UserBanBloomService
---

# UserBanBloomService

:::info
`@Service` implementing a Redis-backed bloom filter with exact-set verification for fast user ban lookups.
:::

## Overview

Uses a two-layer approach: a bloom filter (Redis bitmaps) for fast negative checks, and a Redis Set for exact verification. This eliminates false positives while maintaining O(1) lookup performance for the common non-banned case.

## Methods

| Method | Description |
|---|---|
| `isBanned(username)` | Check if user is banned (bloom filter + exact set) |
| `ban(username)` | Add user to both bloom filter and exact set |
| `unban(username)` | Remove user from exact set only (bloom filter bits are not cleared) |

## Configuration Properties

| Property | Default | Description |
|---|---|---|
| `user.ban.bloom.key` | `user:ban:bloom` | Redis key for bloom filter bitmap |
| `user.ban.set.key` | `user:ban:set` | Redis key for exact ban set |
| `user.ban.bloom.bit-size` | `1000003` | Bloom filter bit array size (minimum 1024) |
| `user.ban.bloom.hash-count` | `6` | Number of hash functions (minimum 2) |

## Hash Strategy

- Hash 1: CRC32 of normalized username
- Hash 2: Java `String.hashCode()` with `#ban` salt
- Combined: `hash1 + i * hash2 + i * i` (double hashing technique)

## Behavior Notes

- Usernames are normalized to lowercase before hashing
- `unban()` only removes from the exact set; bloom filter bits remain set (standard bloom filter behavior)
- False negatives are impossible; false positives are eliminated by the exact set check

## Dependencies

- `userBanRedisTemplate` -- Redis operations on dedicated DB 9
