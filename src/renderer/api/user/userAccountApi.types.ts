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
 * @file userAccountApi.types.ts
 * @description 用户账号 API 相关类型定义。
 * @author 鸡哥
 */

import type { UserAccountResult } from '../../types/api/user/UserAccountResult';
import type { UserAccountLoginData } from '../../types/api/user/UserAccountLoginData';
import type { UserCaptchaConfig } from '../../types/api/user/UserCaptchaConfig';
import type { UserCaptchaChallenge } from '../../types/api/user/UserCaptchaChallenge';
import type { UserCaptchaPayload } from '../../types/api/user/UserCaptchaPayload';
import type { WallpaperMarketItem } from '../../types/api/user/WallpaperMarketItem';
import type { WallpaperMarketListData } from '../../types/api/user/WallpaperMarketListData';
import type { UploadWallpaperPayload } from '../../types/api/user/UploadWallpaperPayload';
import type { UploadWallpaperOptions } from '../../types/api/user/UploadWallpaperOptions';
import type { WallpaperTagItem } from '../../types/api/user/WallpaperTagItem';
import type { UserIssueFeedbackItem } from '../../types/api/user/UserIssueFeedbackItem';
import type { UserIssueFeedbackListData } from '../../types/api/user/UserIssueFeedbackListData';
import type { SubmitUserIssueFeedbackPayload } from '../../types/api/user/SubmitUserIssueFeedbackPayload';
import type { UserFeedbackUploadOptions } from '../../types/api/user/UserFeedbackUploadOptions';
import type { UpdateUserProfilePayload } from '../../types/api/user/UpdateUserProfilePayload';
import type { UpdateUserPasswordPayload } from '../../types/api/user/UpdateUserPasswordPayload';
import type { UserPaymentPricingData } from '../../types/api/user/UserPaymentPricingData';
import type { UserPaymentChannelsData } from '../../types/api/user/UserPaymentChannelsData';
import type { UserPaymentOrderData } from '../../types/api/user/UserPaymentOrderData';

export type {
  UserAccountResult,
  UserAccountLoginData,
  UserCaptchaConfig,
  UserCaptchaChallenge,
  UserCaptchaPayload,
  WallpaperMarketItem,
  WallpaperMarketListData,
  UploadWallpaperPayload,
  UploadWallpaperOptions,
  WallpaperTagItem,
  UserIssueFeedbackItem,
  UserIssueFeedbackListData,
  SubmitUserIssueFeedbackPayload,
  UserFeedbackUploadOptions,
  UpdateUserProfilePayload,
  UpdateUserPasswordPayload,
  UserPaymentPricingData,
  UserPaymentChannelsData,
  UserPaymentOrderData,
};

export type { UserAccountGender, UserAccountProfile } from '../../utils/userAccount';

export type UserEmailCodeScene = 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD' | 'CHANGE_EMAIL' | 'UNREGISTER';
