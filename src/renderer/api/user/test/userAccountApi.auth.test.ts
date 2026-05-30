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
 * @file userAccountApi.auth.test.ts
 * @description 用户账号认证相关接口单元测试。
 * @author 鸡哥
 */

import { describe, expect, it, vi } from 'vitest';

const mockRequest = vi.hoisted(() => vi.fn());

vi.mock('../userAccountApi.client', () => ({
  request: mockRequest,
}));

import {
  createUserCaptchaChallenge,
  fetchUserCaptchaConfig,
  loginUser,
  loginUserByAccount,
  loginUserByEmail,
  loginUserByEmailWithCode,
  refreshUserToken,
  registerUser,
  registerUserWithCode,
  resetUserPassword,
  sendUserEmailCode,
  verifyUserEmailCode,
} from '../userAccountApi.auth';

describe('userAccountApi.auth', () => {
  const okResult = { ok: true, code: 200, message: 'success', data: undefined };

  describe('loginUserByAccount', () => {
    it('sends POST to /auth/user/login/account with credentials', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByAccount('alice', 's3cret', '123456');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/account', {
        method: 'POST',
        body: { username: 'alice', password: 's3cret', emailCode: '123456' },
      });
    });

    it('omits emailCode when not provided', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByAccount('alice', 's3cret');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/account', {
        method: 'POST',
        body: { username: 'alice', password: 's3cret', emailCode: undefined },
      });
    });

    it('omits emailCode when only whitespace', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByAccount('alice', 's3cret', '   ');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/account', {
        method: 'POST',
        body: { username: 'alice', password: 's3cret', emailCode: undefined },
      });
    });

    it('trims emailCode before sending', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByAccount('alice', 's3cret', '  654321  ');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/account', {
        method: 'POST',
        body: { username: 'alice', password: 's3cret', emailCode: '654321' },
      });
    });
  });

  describe('loginUserByEmail', () => {
    it('sends POST to /auth/user/login/email with empty emailCode', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByEmail('a@b.com', 'pw');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/email', {
        method: 'POST',
        body: { email: 'a@b.com', password: 'pw', emailCode: '' },
      });
    });
  });

  describe('loginUserByEmailWithCode', () => {
    it('sends POST to /auth/user/login/email with emailCode', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUserByEmailWithCode('a@b.com', 'pw', '999');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/email', {
        method: 'POST',
        body: { email: 'a@b.com', password: 'pw', emailCode: '999' },
      });
    });
  });

  describe('loginUser', () => {
    it('routes to email login when account contains @', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUser('a@b.com', 'pw');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/email', {
        method: 'POST',
        body: { email: 'a@b.com', password: 'pw', emailCode: '' },
      });
    });

    it('routes to account login when account does not contain @', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await loginUser('alice', 'pw');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/login/account', {
        method: 'POST',
        body: { username: 'alice', password: 'pw', emailCode: undefined },
      });
    });
  });

  describe('refreshUserToken', () => {
    it('sends POST to /auth/user/token/refresh with auth token', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await refreshUserToken('my-jwt');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/token/refresh', {
        method: 'POST',
        auth: 'my-jwt',
      });
    });
  });

  describe('registerUser', () => {
    it('sends POST to /auth/user/register with empty emailCode', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await registerUser('bob', 'b@c.com', 'pw123');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/register', {
        method: 'POST',
        body: { username: 'bob', email: 'b@c.com', password: 'pw123', emailCode: '' },
      });
    });
  });

  describe('registerUserWithCode', () => {
    it('sends POST to /auth/user/register with emailCode', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await registerUserWithCode('bob', 'b@c.com', 'pw123', '111');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/register', {
        method: 'POST',
        body: { username: 'bob', email: 'b@c.com', password: 'pw123', emailCode: '111' },
      });
    });
  });

  describe('fetchUserCaptchaConfig', () => {
    it('sends GET to /auth/user/email-code/captcha-config', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await fetchUserCaptchaConfig();

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/email-code/captcha-config', {
        method: 'GET',
      });
    });
  });

  describe('createUserCaptchaChallenge', () => {
    it('sends POST to /auth/user/email-code/captcha-challenge with account', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await createUserCaptchaChallenge('alice');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/email-code/captcha-challenge', {
        method: 'POST',
        body: { account: 'alice' },
      });
    });
  });

  describe('sendUserEmailCode', () => {
    it('sends POST with email, scene, and flattened captcha fields', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await sendUserEmailCode('a@b.com', 'REGISTER', {
        ticket: 't1',
        randstr: 'r1',
        sign: 's1',
      });

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/email-code/send', {
        method: 'POST',
        body: {
          email: 'a@b.com',
          scene: 'REGISTER',
          captchaTicket: 't1',
          captchaRandstr: 'r1',
          captchaSign: 's1',
        },
      });
    });
  });

  describe('resetUserPassword', () => {
    it('sends POST with email, emailCode, and password', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await resetUserPassword('a@b.com', '555', 'newPw');

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/password/reset', {
        method: 'POST',
        body: { email: 'a@b.com', emailCode: '555', password: 'newPw' },
      });
    });
  });

  describe('verifyUserEmailCode', () => {
    it('sends POST with all fields and default consume=true', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await verifyUserEmailCode('a@b.com', 'LOGIN', '1234', {
        ticket: 'tk',
        randstr: 'rd',
        sign: 'sg',
      });

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/email-code/verify', {
        method: 'POST',
        body: {
          email: 'a@b.com',
          scene: 'LOGIN',
          code: '1234',
          consume: true,
          captchaTicket: 'tk',
          captchaRandstr: 'rd',
          captchaSign: 'sg',
        },
      });
    });

    it('passes consume=false when specified', async () => {
      mockRequest.mockResolvedValueOnce(okResult);

      await verifyUserEmailCode('a@b.com', 'LOGIN', '1234', {
        ticket: 'tk',
        randstr: 'rd',
        sign: 'sg',
      }, false);

      expect(mockRequest).toHaveBeenCalledWith('/auth/user/email-code/verify', {
        method: 'POST',
        body: {
          email: 'a@b.com',
          scene: 'LOGIN',
          code: '1234',
          consume: false,
          captchaTicket: 'tk',
          captchaRandstr: 'rd',
          captchaSign: 'sg',
        },
      });
    });
  });
});
