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
 * @file useAlbumViewerActions.ts
 * @description 查看器工具栏动作 hook — 资源管理器定位、另存为、设为灵动岛背景。
 * @author 鸡哥
 */

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { resolveBgMediaPreviewUrl } from '../../../../../config/dynamicIslandBackgroundMedia';
import type { AlbumItem, AlbumMeta, IslandBgMediaConfig } from '../types/albumTypes';
import { ISLAND_BG_IMAGE_STORE_KEY, ISLAND_BG_MEDIA_STORE_KEY, LOCAL_ISLAND_BG_SYNC_EVENT } from '../types/albumTypes';

/** useAlbumViewerActions 返回值类型 */
export interface UseAlbumViewerActionsReturn {
  handleOpenInExplorer: (item: AlbumItem) => void;
  handleSaveAs: (item: AlbumItem) => void;
  handleSetAsIslandBackground: (item: AlbumItem) => void;
}

/** 查看器工具栏动作 hook */
export function useAlbumViewerActions(
  activeMeta: AlbumMeta | undefined,
  setStatusMessage: React.Dispatch<React.SetStateAction<string>>,
): UseAlbumViewerActionsReturn {
  const { t } = useTranslation();

  /** 在系统资源管理器中定位当前图片 */
  const handleOpenInExplorer = useCallback((item: AlbumItem): void => {
    window.api.openInExplorer(item.path).then((ok) => {
      if (!ok) setStatusMessage(t('albumTab.status.openInExplorerFailed', { name: item.name }));
    }).catch(() => {
      setStatusMessage(t('albumTab.status.openInExplorerFailed', { name: item.name }));
    });
  }, [t, setStatusMessage]);

  /** 将当前图片另存到用户指定位置 */
  const handleSaveAs = useCallback((item: AlbumItem): void => {
    window.api.saveImageAs(item.path).then((result) => {
      if (result.ok && result.filePath) {
        setStatusMessage(t('albumTab.status.saveAsSuccess', { name: item.name }));
        return;
      }
      if (result.canceled) {
        setStatusMessage(t('albumTab.status.saveAsCanceled'));
        return;
      }
      setStatusMessage(t('albumTab.status.saveAsFailed', { name: item.name }));
    }).catch(() => {
      setStatusMessage(t('albumTab.status.saveAsFailed', { name: item.name }));
    });
  }, [t, setStatusMessage]);

  /** 将当前图片设为灵动岛背景图（复用设置页同一存储与同步机制） */
  const handleSetAsIslandBackground = useCallback((item: AlbumItem): void => {
    const media: IslandBgMediaConfig = { type: item.mediaType, source: item.path };
    const previewPromise = item.mediaType === 'video'
      ? resolveBgMediaPreviewUrl(media)
      : (activeMeta?.dataUrl ? Promise.resolve(activeMeta.dataUrl) : window.api.loadWallpaperFile(item.path));

    previewPromise.then((previewUrl) => {
      if (!previewUrl) {
        setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
        return;
      }
      window.dispatchEvent(new CustomEvent(LOCAL_ISLAND_BG_SYNC_EVENT, {
        detail: { media, previewUrl, image: previewUrl },
      }));
      Promise.all([
        window.api.storeWrite(ISLAND_BG_MEDIA_STORE_KEY, media),
        window.api.storeWrite(ISLAND_BG_IMAGE_STORE_KEY, item.mediaType === 'image' ? item.path : null),
        window.api.settingsPreview('store:island-bg-media', media),
        window.api.settingsPreview('store:island-bg-image', item.mediaType === 'image' ? item.path : null),
      ]).then(() => {
        setStatusMessage(t('albumTab.status.setIslandBackgroundSuccess', { name: item.name }));
      }).catch(() => {
        setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
      });
    }).catch(() => {
      setStatusMessage(t('albumTab.status.setIslandBackgroundFailed'));
    });
  }, [t, setStatusMessage, activeMeta]);

  return { handleOpenInExplorer, handleSaveAs, handleSetAsIslandBackground };
}
