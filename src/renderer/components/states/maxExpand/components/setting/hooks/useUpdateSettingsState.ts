import { useEffect, useState } from 'react';
import type { TFunction } from 'i18next';
import { fetchUpdateSourceUrl } from '../../../../../../api/user/userAccountApi';
import { writeAnnouncementShowMode, type AnnouncementShowMode } from '../../../../../../api/announcement/announcementApi';
import {
  UPDATE_SOURCE_STORE_KEY,
  UPDATE_AUTO_PROMPT_STORE_KEY,
  UPDATE_SOURCES,
  isProOnlyUpdateSource,
  type UpdateDownloadProgress,
  type UpdateSourceKey,
  type UpdateStatus,
} from '../config/settingsTabConfig';

interface UseUpdateSettingsStateArgs {
  t: TFunction;
  isProUser: boolean;
  sessionToken: string | null;
}

export function useUpdateSettingsState({ t, isProUser, sessionToken }: UseUpdateSettingsStateArgs) {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('idle');
  const [updateVersion, setUpdateVersion] = useState<string>('');
  const [updateError, setUpdateError] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<UpdateDownloadProgress | null>(null);
  const [updateAutoPromptEnabled, setUpdateAutoPromptEnabled] = useState<boolean>(true);
  const [announcementShowMode, setAnnouncementShowMode] = useState<AnnouncementShowMode>('version-update-only');
  const [updateSource, setUpdateSource] = useState<UpdateSourceKey>('cloudflare-r2');

  const currentSourceLabel = UPDATE_SOURCES.find((s) => s.key === updateSource)?.label ?? updateSource;

  const handleUpdateSourceChange = (value: string): void => {
    const nextSource: UpdateSourceKey = value === 'github'
      ? 'github'
      : value === 'tencent-cos'
        ? 'tencent-cos'
        : value === 'aliyun-oss'
          ? 'aliyun-oss'
          : 'cloudflare-r2';

    if (isProOnlyUpdateSource(nextSource) && !isProUser) {
      setUpdateStatus('error');
      setUpdateError(t('settings.update.proOnlyError', { defaultValue: '该更新源仅 PRO 用户可用' }));
      return;
    }

    setUpdateSource(nextSource);
    setUpdateError('');
    window.api.storeWrite(UPDATE_SOURCE_STORE_KEY, nextSource).catch(() => {});
  };

  useEffect(() => {
    if (isProUser) return;
    if (!isProOnlyUpdateSource(updateSource)) return;
    setUpdateSource('cloudflare-r2');
    window.api.storeWrite(UPDATE_SOURCE_STORE_KEY, 'cloudflare-r2').catch(() => {});
  }, [isProUser, updateSource]);

  const resolveUpdateSourceUrl = async (source: UpdateSourceKey): Promise<string | undefined> => {
    if (!isProOnlyUpdateSource(source)) {
      return undefined;
    }
    if (!isProUser) {
      throw new Error(t('settings.update.proOnlyError', { defaultValue: '该更新源仅 PRO 用户可用' }));
    }
    if (!sessionToken) {
      throw new Error(t('settings.update.proOnlyNeedLogin', { defaultValue: '请先登录 PRO 账号后再使用该更新源' }));
    }

    const result = await fetchUpdateSourceUrl(sessionToken, source);
    if (!result.ok || !result.data?.url) {
      throw new Error(result.message || t('settings.update.sourceResolveFailed', { defaultValue: '获取更新源地址失败' }));
    }
    return result.data.url;
  };

  const handleUpdateAutoPromptEnabledChange = (enabled: boolean): void => {
    setUpdateAutoPromptEnabled(enabled);
    window.api.storeWrite(UPDATE_AUTO_PROMPT_STORE_KEY, enabled).catch(() => {});
  };

  const handleAnnouncementShowModeChange = (mode: AnnouncementShowMode): void => {
    setAnnouncementShowMode(mode);
    void writeAnnouncementShowMode(mode);
  };

  return {
    updateStatus,
    setUpdateStatus,
    updateVersion,
    setUpdateVersion,
    updateError,
    setUpdateError,
    downloadProgress,
    setDownloadProgress,
    updateAutoPromptEnabled,
    setUpdateAutoPromptEnabled,
    announcementShowMode,
    setAnnouncementShowMode,
    updateSource,
    setUpdateSource,
    currentSourceLabel,
    handleUpdateSourceChange,
    handleUpdateAutoPromptEnabledChange,
    handleAnnouncementShowModeChange,
    resolveUpdateSourceUrl,
  };
}
