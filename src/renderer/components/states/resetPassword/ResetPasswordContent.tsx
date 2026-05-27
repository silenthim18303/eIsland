import type { ReactElement } from 'react';
import { useResetPassword } from './hooks/useResetPassword';
import { ResetPasswordForm } from './components/ResetPasswordForm';
import '../../../styles/settings/settings.css';
import '../../../styles/auth/auth.css';

/** 独立重置密码状态内容 */
export function ResetPasswordContent(): ReactElement {
  const resetPassword = useResetPassword();
  return <ResetPasswordForm {...resetPassword} />;
}
