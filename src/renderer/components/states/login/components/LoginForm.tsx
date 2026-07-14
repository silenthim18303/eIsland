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
 * @file LoginForm.tsx
 * @description 登录表单组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import type { useLogin } from '../hooks/useLogin';
import { renderFeedback } from '../utils/renderFeedback';
import { SvgIcon } from '../../../../utils/SvgIcon';

type LoginFormProps = ReturnType<typeof useLogin>;

/** 登录表单组件 */
export function LoginForm(props: LoginFormProps): ReactElement {
  const {
    account,
    setAccount,
    maskedVerificationEmail,
    emailCode,
    setEmailCode,
    password,
    setPassword,
    passwordVisible,
    setPasswordVisible,
    submitting,
    sendingCode,
    sendCooldownSeconds,
    needsEmailVerification,
    isEmailAccount,
    feedback,
    handleSendCode,
    handleSubmit,
    setRegister,
    setResetPassword,
    returnFromAuth,
    githubLoading,
    handleGitHubLogin,
    microsoftLoading,
    handleMicrosoftLogin,
    wechatLoading,
    handleWechatLogin,
    t,
  } = props;

  return (
    <div className="auth-state-content" onClick={(e) => e.stopPropagation()}>
      <div className="auth-panel">
        <div className="auth-panel-title">{t('settings.user.auth.login', { defaultValue: '登录' })}</div>
        <div className="auth-panel-subtitle">
          {t('settings.user.auth.hint', { defaultValue: '登录注册服务由 eIsland server 提供' })}
        </div>

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.user.fields.account', { defaultValue: '用户名或邮箱' })}</span>
          <input
            className="settings-field-input"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            placeholder={t('settings.user.fields.accountPlaceholder', { defaultValue: '请输入用户名或邮箱' })}
          />
        </label>

        <label className="settings-field">
          <span className="settings-field-label">{t('settings.user.fields.password', { defaultValue: '密码' })}</span>
          <div className="auth-password-input-wrap">
            <input
              className="settings-field-input"
              type={passwordVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('settings.user.fields.passwordPlaceholder', { defaultValue: '至少 8 位，含字母与数字' })}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setPasswordVisible((v) => !v)}
              aria-label={passwordVisible
                ? t('settings.user.actions.hidePassword', { defaultValue: '隐藏密码' })
                : t('settings.user.actions.showPassword', { defaultValue: '显示密码' })}
            >
              {passwordVisible
                ? t('settings.user.actions.hide', { defaultValue: '隐藏' })
                : t('settings.user.actions.show', { defaultValue: '显示' })}
            </button>
          </div>
        </label>

        {needsEmailVerification && (
          <>
            {!isEmailAccount && (
              <label className="settings-field">
                <span className="settings-field-label">{t('settings.user.fields.boundEmail', { defaultValue: '绑定邮箱' })}</span>
                <input
                  className="settings-field-input"
                  value={maskedVerificationEmail}
                  readOnly
                  disabled
                />
              </label>
            )}
            <label className="settings-field">
              <span className="settings-field-label">{t('settings.user.fields.emailCode', { defaultValue: '邮箱验证码' })}</span>
              <div className="auth-password-input-wrap">
                <input
                  className="settings-field-input"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value)}
                  placeholder={t('settings.user.fields.emailCodePlaceholder', { defaultValue: '请输入邮箱验证码' })}
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => void handleSendCode()}
                  disabled={sendingCode || sendCooldownSeconds > 0}
                >
                  {sendingCode
                    ? t('settings.user.feedback.emailCodeSending', { defaultValue: '发送中…' })
                    : sendCooldownSeconds > 0
                      ? t('settings.user.actions.sendCodeCooldown', { defaultValue: '{{seconds}}s后重试', seconds: sendCooldownSeconds })
                      : t('settings.user.actions.sendCode', { defaultValue: '发送验证码' })}
                </button>
              </div>
            </label>
          </>
        )}

        {renderFeedback(feedback)}

        <div className="auth-panel-actions">
          <button
            type="button"
            className="settings-user-primary-btn"
            onClick={() => void handleSubmit()}
            disabled={submitting}
          >
            {submitting
              ? t('settings.user.feedback.submitting', { defaultValue: '处理中…' })
              : t('settings.user.auth.loginBtn', { defaultValue: '登录' })}
          </button>
          <button
            type="button"
            className="settings-user-secondary-btn"
            onClick={() => setRegister()}
            disabled={submitting}
          >
            {t('settings.user.auth.register', { defaultValue: '注册' })}
          </button>
          <button
            type="button"
            className="settings-user-secondary-btn"
            onClick={() => setResetPassword()}
            disabled={submitting}
          >
            {t('settings.user.auth.forgotPassword', { defaultValue: '忘记密码' })}
          </button>
          <button
            type="button"
            className="settings-user-secondary-btn"
            onClick={returnFromAuth}
            disabled={submitting}
          >
            {t('settings.user.actions.cancelLogin', { defaultValue: '取消登录' })}
          </button>
        </div>

        <div className="auth-oauth-divider">
          <span>{t('oauth.divider', { defaultValue: '或' })}</span>
        </div>

        <div className="auth-oauth-buttons">
          {(() => {
            const oauthBusy = submitting || githubLoading || microsoftLoading || wechatLoading;
            return (
              <>
                <button
                  type="button"
                  className="auth-oauth-btn auth-oauth-btn--github"
                  onClick={() => void handleGitHubLogin()}
                  disabled={oauthBusy}
                >
                  <svg className="auth-oauth-icon" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                  </svg>
                  {githubLoading
                    ? t('oauth.github.loading', { defaultValue: '连接中…' })
                    : t('oauth.github.login', { defaultValue: 'GitHub' })}
                </button>
                <button
                  type="button"
                  className="auth-oauth-btn auth-oauth-btn--microsoft"
                  onClick={() => void handleMicrosoftLogin()}
                  disabled={true}
                >
                  <img className="auth-oauth-icon" src={SvgIcon.MICROSOFT} alt="" width={18} height={18} />
                  {microsoftLoading
                    ? t('oauth.microsoft.loading', { defaultValue: '连接中…' })
                    : t('oauth.microsoft.login', { defaultValue: 'Microsoft' })}
                </button>
                <button
                  type="button"
                  className="auth-oauth-btn auth-oauth-btn--wechat"
                  onClick={() => void handleWechatLogin()}
                  disabled={oauthBusy}
                >
                  <img className="auth-oauth-icon" src={SvgIcon.WECHAT} alt="" width={18} height={18} />
                  {wechatLoading
                    ? t('oauth.wechat.loading', { defaultValue: '连接中…' })
                    : t('oauth.wechat.login', { defaultValue: 'WeChat' })}
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
