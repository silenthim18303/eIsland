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
 * @file userAccountApi.profile.test.ts
 * @description 用户资料相关接口单元测试。
 * @author 鸡哥
 */

import { describe, expect, it, vi } from 'vitest';

const mockRequest = vi.hoisted(() => vi.fn());
const mockGenerateTotpFromBase32Seed = vi.hoisted(() => vi.fn());
const mockDefaultTotpDigits = vi.hoisted(() => 6);
const mockDefaultTotpPeriodSeconds = vi.hoisted(() => 30);

vi.mock('../userAccountApi.client', () => ({
  request: mockRequest,
}));

vi.mock('../../../utils/security', () => ({
  generateTotpFromBase32Seed: mockGenerateTotpFromBase32Seed,
  DEFAULT_TOTP_DIGITS: mockDefaultTotpDigits,
  DEFAULT_TOTP_PERIOD_SECONDS: mockDefaultTotpPeriodSeconds,
}));

import {
  fetchUpdateSourceUrl,
  fetchUserProfile,
  logoutUser,
  unregisterUser,
  updateUserPassword,
  updateUserProfile,
} from '../userAccountApi.profile';

describe('userAccountApi.profile', () => {
  const okResult = { ok: true, code: 200, message: 'success', data: undefined };

  describe('fetchUserProfile', () => {
    it('sends GET to /v1/user/profile with auth token', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await fetchUserProfile('my-token');

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/profile', {
        method: 'GET',
        auth: 'my-token',
      });
    });
  });

  describe('updateUserProfile', () => {
    it('sends PUT to /v1/user/profile with auth token and body', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await updateUserProfile('my-token', {
        avatar: 'https://example.com/avatar.png',
        gender: 'male',
        genderCustom: null,
        birthday: '2000-01-01',
      });

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/profile', {
        method: 'PUT',
        auth: 'my-token',
        body: {
          avatar: 'https://example.com/avatar.png',
          gender: 'male',
          genderCustom: null,
          birthday: '2000-01-01',
        },
      });
    });

    it('omits undefined fields from body', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await updateUserProfile('my-token', { gender: 'female' });

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/profile', {
        method: 'PUT',
        auth: 'my-token',
        body: { gender: 'female' },
      });
    });

    it('includes avatar when provided', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await updateUserProfile('my-token', { avatar: 'url' });

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/profile', {
        method: 'PUT',
        auth: 'my-token',
        body: { avatar: 'url' },
      });
    });
  });

  describe('updateUserPassword', () => {
    it('fetches TOTP seed, generates code, and submits password', async () => {
      const seedResult = {
        ok: true,
        code: 200,
        message: 'success',
        data: { seed: 'BASE32SEED' },
      };
      mockRequest.mockResolvedValueOnce(seedResult);
      mockGenerateTotpFromBase32Seed.mockResolvedValueOnce('123456');
      mockRequest.mockResolvedValueOnce(okResult);

      const result = await updateUserPassword('my-token', {
        password: 'newPw',
        emailCode: '999',
      });

      expect(mockRequest).toHaveBeenNthCalledWith(1, '/v1/user/profile/password/totp-seed', {
        method: 'GET',
        auth: 'my-token',
      });
      expect(mockGenerateTotpFromBase32Seed).toHaveBeenCalledWith(
        'BASE32SEED',
        expect.any(Number),
        mockDefaultTotpPeriodSeconds,
        mockDefaultTotpDigits,
      );
      expect(mockRequest).toHaveBeenNthCalledWith(2, '/v1/user/profile/password', {
        method: 'POST',
        auth: 'my-token',
        body: {
          password: 'newPw',
          emailCode: '999',
          totpCode: '123456',
        },
      });
      expect(result).toEqual(okResult);
    });

    it('returns error when TOTP seed request fails', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: false,
        code: 403,
        message: 'Forbidden',
      });

      const result = await updateUserPassword('my-token', {
        password: 'newPw',
        emailCode: '999',
      });

      expect(result).toEqual({
        ok: false,
        code: 403,
        message: 'Forbidden',
      });
      expect(mockGenerateTotpFromBase32Seed).not.toHaveBeenCalled();
    });

    it('returns error when TOTP seed data has no seed field', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: true,
        code: 200,
        message: '',
        data: { seed: '' },
      });

      const result = await updateUserPassword('my-token', {
        password: 'newPw',
        emailCode: '999',
      });

      expect(result).toEqual({
        ok: false,
        code: 200,
        message: 'TOTP Seed 获取失败',
      });
    });

    it('returns error when TOTP generation throws', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: true,
        code: 200,
        message: 'success',
        data: { seed: 'VALID_SEED' },
      });
      mockGenerateTotpFromBase32Seed.mockRejectedValueOnce(new Error('bad seed'));

      const result = await updateUserPassword('my-token', {
        password: 'newPw',
        emailCode: '999',
      });

      expect(result).toEqual({
        ok: false,
        code: 500,
        message: 'TOTP 生成失败',
      });
    });
  });

  describe('logoutUser', () => {
    it('sends POST to /v1/user/logout with auth token', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await logoutUser('my-token');

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/logout', {
        method: 'POST',
        auth: 'my-token',
        body: {},
      });
    });
  });

  describe('unregisterUser', () => {
    it('sends DELETE to /v1/user/account with password and emailCode', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await unregisterUser('my-token', 'pw123', '456');

      expect(mockRequest).toHaveBeenCalledWith('/v1/user/account', {
        method: 'DELETE',
        auth: 'my-token',
        body: { password: 'pw123', emailCode: '456' },
      });
    });
  });

  describe('fetchUpdateSourceUrl', () => {
    it('sends GET to /v1/user/update-source with encoded source param', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: true,
        code: 200,
        message: 'success',
        data: { url: 'https://cdn.example.com/file.zip' },
      });

      await fetchUpdateSourceUrl('my-token', 'tencent-cos');

      expect(mockRequest).toHaveBeenCalledWith(
        '/v1/user/update-source?source=tencent-cos',
        {
          method: 'GET',
          auth: 'my-token',
        },
      );
    });

    it('encodes special characters in source parameter', async () => {
      mockRequest.mockResolvedValueOnce({
        ok: true,
        code: 200,
        message: 'success',
        data: { url: 'https://cdn.example.com/file.zip' },
      });

      await fetchUpdateSourceUrl('my-token', 'special&value');

      expect(mockRequest).toHaveBeenCalledWith(
        '/v1/user/update-source?source=special%26value',
        {
          method: 'GET',
          auth: 'my-token',
        },
      );
    });
  });
});
