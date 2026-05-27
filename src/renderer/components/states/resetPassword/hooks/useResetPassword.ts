import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../../store/slices';
import { sendUserEmailCode } from '../../../../api/user/userAccountApi';
import { runSliderCaptcha } from '../../../../utils/sliderCaptcha';
import { EMAIL_PATTERN, type Feedback } from '../config/resetPasswordConfig';

export function useResetPassword() {
  const { t } = useTranslation();
  const { setLogin, setRegister, returnFromAuth } = useIslandStore();
  const [email, setEmail] = useState('');
  const [emailCode, setEmailCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [sendCooldownSeconds, setSendCooldownSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    if (sendCooldownSeconds <= 0) return;
    const timer = window.setTimeout(() => {
      setSendCooldownSeconds((v) => (v > 0 ? v - 1 : 0));
    }, 1000);
    return () => {
      window.clearTimeout(timer);
    };
  }, [sendCooldownSeconds]);

  const handleSendCode = async (): Promise<void> => {
    if (sendingCode || sendCooldownSeconds > 0) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.emailInvalid', { defaultValue: '请输入有效邮箱地址' }) });
      return;
    }
    setSendingCode(true);
    let captchaTicket = '';
    let captchaRandstr = '';
    let captchaSign = '';
    try {
      const captcha = await runSliderCaptcha(cleanEmail);
      if (!captcha) {
        setSendingCode(false);
        setFeedback({ type: 'error', text: t('settings.user.feedback.captchaCancelled', { defaultValue: '请完成滑块验证后再发送验证码' }) });
        return;
      }
      captchaTicket = captcha.ticket;
      captchaRandstr = captcha.randstr;
      captchaSign = captcha.sign;
    } catch (err) {
      setSendingCode(false);
      const msg = err instanceof Error ? err.message : t('settings.user.feedback.emailCodeSendFailed', { defaultValue: '验证码发送失败' });
      setFeedback({ type: 'error', text: msg });
      return;
    }
    const result = await sendUserEmailCode(cleanEmail, 'RESET_PASSWORD', { ticket: captchaTicket, randstr: captchaRandstr, sign: captchaSign });
    setSendingCode(false);
    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message || t('settings.user.feedback.emailCodeSendFailed', { defaultValue: '验证码发送失败' }) });
      return;
    }
    const cooldown = Math.max(0, Number(result.data?.retryAfterSeconds || 60));
    if (cooldown > 0) {
      setSendCooldownSeconds(cooldown);
    }
    setFeedback({ type: 'success', text: t('settings.user.feedback.emailCodeSent', { defaultValue: '验证码已发送，请查收邮箱' }) });
  };

  const handleSubmit = (): void => {
    if (submitting) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(cleanEmail)) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.emailInvalid', { defaultValue: '请输入有效邮箱地址' }) });
      return;
    }
    if (!emailCode.trim()) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.emailCodeRequired', { defaultValue: '请输入邮箱验证码' }) });
      return;
    }
    if (!newPassword) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.passwordRequired', { defaultValue: '请输入密码' }) });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.passwordTooShort', { defaultValue: '密码至少 8 位且包含字母与数字' }) });
      return;
    }
    if (!confirmPassword) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.confirmPasswordRequired', { defaultValue: '请再次输入密码' }) });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: t('settings.user.feedback.passwordNotMatch', { defaultValue: '两次输入的密码不一致' }) });
      return;
    }
    setSubmitting(true);
    setFeedback({
      type: 'info',
      text: t('settings.user.feedback.resetPasswordGuidance', {
        defaultValue: '验证码校验流程已就绪，请前往用户中心完成密码修改。',
      }),
    });
    setSubmitting(false);
  };

  return {
    email,
    setEmail,
    emailCode,
    setEmailCode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    newPasswordVisible,
    setNewPasswordVisible,
    confirmPasswordVisible,
    setConfirmPasswordVisible,
    sendingCode,
    sendCooldownSeconds,
    submitting,
    feedback,
    handleSendCode,
    handleSubmit,
    setLogin,
    setRegister,
    returnFromAuth,
    t,
  };
}
