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
 * @file SoundSettingsPage.tsx
 * @description 设置页面 - 软件设置声音子界面
 * @author 鸡哥
 */

import { useEffect, useState, type ChangeEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ALARM_SOUND_VOLUME_STORE_KEY,
  clampVolume,
  EFFECT_SOUND_VOLUME_STORE_KEY,
  GLOBAL_SOUND_VOLUME_STORE_KEY,
} from '../../../../../../../../utils/audio/volume';

function toPercent(volume: number): number {
  return Math.round(clampVolume(volume) * 100);
}

function fromPercent(percent: number): number {
  return clampVolume(percent / 100);
}

/**
 * 渲染声音设置页面
 * @returns 声音设置页面
 */
export function SoundSettingsPage(): ReactElement {
  const { t } = useTranslation();
  const [globalVolumePercent, setGlobalVolumePercent] = useState(100);
  const [alarmVolumePercent, setAlarmVolumePercent] = useState(100);
  const [effectVolumePercent, setEffectVolumePercent] = useState(100);

  useEffect(() => {
    let cancelled = false;
    window.api.storeRead(GLOBAL_SOUND_VOLUME_STORE_KEY).then((value) => {
      if (cancelled || typeof value !== 'number') return;
      setGlobalVolumePercent(toPercent(value));
    }).catch(() => {});
    window.api.storeRead(ALARM_SOUND_VOLUME_STORE_KEY).then((value) => {
      if (cancelled || typeof value !== 'number') return;
      setAlarmVolumePercent(toPercent(value));
    }).catch(() => {});
    window.api.storeRead(EFFECT_SOUND_VOLUME_STORE_KEY).then((value) => {
      if (cancelled || typeof value !== 'number') return;
      setEffectVolumePercent(toPercent(value));
    }).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChangeVolume = (
    setter: (next: number) => void,
    storeKey: string,
  ) => (event: ChangeEvent<HTMLInputElement>): void => {
    const percent = Math.max(0, Math.min(100, Number(event.target.value) || 0));
    setter(percent);
    void window.api.storeWrite(storeKey, fromPercent(percent));
  };

  return (
    <div className="settings-sound-page-panel">
      <div className="settings-cards">
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.sound.global.title', { defaultValue: '全局音量' })}</div>
            <div className="settings-card-subtitle">{t('settings.sound.global.hint', { defaultValue: '影响闹钟与音效的整体输出音量。' })}</div>
          </div>
          <div className="settings-opacity-slider-row">
            <input
              className="settings-opacity-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={globalVolumePercent}
              onChange={handleChangeVolume(setGlobalVolumePercent, GLOBAL_SOUND_VOLUME_STORE_KEY)}
            />
            <span className="settings-opacity-slider-value">{globalVolumePercent}%</span>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.sound.alarmVolume.title', { defaultValue: '闹钟音量' })}</div>
            <div className="settings-card-subtitle">{t('settings.sound.alarmVolume.hint', { defaultValue: '仅影响闹钟响铃与试听音量。' })}</div>
          </div>
          <div className="settings-opacity-slider-row">
            <input
              className="settings-opacity-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={alarmVolumePercent}
              onChange={handleChangeVolume(setAlarmVolumePercent, ALARM_SOUND_VOLUME_STORE_KEY)}
            />
            <span className="settings-opacity-slider-value">{alarmVolumePercent}%</span>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-title">{t('settings.sound.effectVolume.title', { defaultValue: '音效音量' })}</div>
            <div className="settings-card-subtitle">{t('settings.sound.effectVolume.hint', { defaultValue: '影响 STT 触发音与木鱼敲击音。' })}</div>
          </div>
          <div className="settings-opacity-slider-row">
            <input
              className="settings-opacity-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={effectVolumePercent}
              onChange={handleChangeVolume(setEffectVolumePercent, EFFECT_SOUND_VOLUME_STORE_KEY)}
            />
            <span className="settings-opacity-slider-value">{effectVolumePercent}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
