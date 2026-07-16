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
 * @file AlbumViewer.tsx
 * @description 单图/视频查看器：工具栏、画布（缩放平移）、视频控制条、元数据侧栏。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { SvgIcon } from '../../../../../../utils/SvgIcon';
import { ZOOM_MAX, ZOOM_MIN, ZOOM_STEP } from '../config/albumConfig';
import type { AlbumViewerProps } from '../types/albumTypes';
import { formatDuration } from '../utils/albumUtils';
import { AlbumMetaPanel } from './AlbumMetaPanel';

/**
 * 控制按钮内部图标。
 */
function AlbumControlIcon({ src }: { src: string }): ReactElement {
  return <img className="album-svg-icon-img" src={src} alt="" aria-hidden="true" draggable={false} />;
}

/**
 * 单图/视频查看器。
 */
export function AlbumViewer({
  viewer, filteredCount, onBack, onOriginalZoom,
  onOpenInExplorer, onSaveAs, onSetAsIslandBackground,
}: AlbumViewerProps): ReactElement {
  const { t } = useTranslation();

  const {
    zoom, pan, isPanning, viewerSlideDir,
    videoPlaying, videoMuted, videoVolume, videoCurrentTime, videoDuration, videoControlsCollapsed,
    viewerVideoRef, activeItem, activeMeta, activeIsVideo, activeVideoUrl,
    navigateInViewer, handleViewerWheel, handleViewerMouseDown, handleViewerMouseMove, handleViewerMouseUp,
    handleVideoLoadedMetadata, handleVideoTimeUpdate, handleToggleVideoPlay, handleVideoSeek,
    handleToggleVideoMute, handleVideoVolumeChange, handleToggleVideoControls, handleZoom, handleResetZoom, handleVideoEnded,
  } = viewer;

  if (!activeItem) return <></>;

  return (
    <div className="album-viewer">
      {/* 顶部工具栏 */}
      <div className="album-viewer-toolbar">
        <button
          className="album-icon-btn"
          type="button"
          onClick={onBack}
          title={t('albumTab.viewer.back')}
        >
          <AlbumControlIcon src={SvgIcon.RETURN} />
        </button>
        <button
          className="album-icon-btn"
          type="button"
          onClick={() => navigateInViewer(-1)}
          disabled={filteredCount <= 1}
          title={t('albumTab.viewer.prev')}
        >
          <AlbumControlIcon src={SvgIcon.PREVIOUS} />
        </button>
        <button
          className="album-icon-btn"
          type="button"
          onClick={() => navigateInViewer(1)}
          disabled={filteredCount <= 1}
          title={t('albumTab.viewer.next')}
        >
          <AlbumControlIcon src={SvgIcon.NEXT} />
        </button>
        <span className="album-viewer-name" title={activeItem.path}>{activeItem.name}</span>
        {!activeIsVideo ? (
          <div className="album-viewer-zoom-group">
            <button
              className="album-icon-btn"
              type="button"
              onClick={() => handleZoom(-ZOOM_STEP)}
              disabled={zoom <= ZOOM_MIN + 0.001}
              title={t('albumTab.viewer.zoomOut')}
            >
              -
            </button>
            <span className="album-viewer-zoom-value">{Math.round(zoom * 100)}%</span>
            <button
              className="album-icon-btn"
              type="button"
              onClick={() => handleZoom(ZOOM_STEP)}
              disabled={zoom >= ZOOM_MAX - 0.001}
              title={t('albumTab.viewer.zoomIn')}
            >
              +
            </button>
            <button
              className="album-text-btn"
              type="button"
              onClick={onOriginalZoom}
              title={t('albumTab.viewer.zoomOne')}
            >
              1:1
            </button>
            <button
              className="album-text-btn"
              type="button"
              onClick={handleResetZoom}
              title={t('albumTab.viewer.zoomFit')}
            >
              {t('albumTab.viewer.fit')}
            </button>
          </div>
        ) : null}
        <div className="album-viewer-actions">
          <button
            className="album-text-btn"
            type="button"
            onClick={() => onOpenInExplorer(activeItem)}
            title={t('albumTab.viewer.openInExplorer')}
          >
            {t('albumTab.viewer.openInExplorer')}
          </button>
          <button
            className="album-text-btn"
            type="button"
            onClick={() => onSaveAs(activeItem)}
            title={t('albumTab.viewer.saveAs')}
          >
            {t('albumTab.viewer.saveAs')}
          </button>
        </div>
      </div>

      {/* 主图 + 元数据侧栏 */}
      <div className="album-viewer-body">
        <div
          className={`album-viewer-canvas${!activeIsVideo && zoom > 1 ? ' album-viewer-canvas--pannable' : ''}${!activeIsVideo && isPanning ? ' album-viewer-canvas--panning' : ''}${activeIsVideo ? ' album-viewer-canvas--video' : ''}`}
          onWheel={activeIsVideo ? undefined : handleViewerWheel}
          onMouseDown={activeIsVideo ? undefined : handleViewerMouseDown}
          onMouseMove={activeIsVideo ? undefined : handleViewerMouseMove}
          onMouseUp={activeIsVideo ? undefined : handleViewerMouseUp}
          onMouseLeave={activeIsVideo ? undefined : handleViewerMouseUp}
          onDoubleClick={activeIsVideo ? undefined : handleResetZoom}
        >
          <div className={`album-viewer-media-layer album-viewer-media-layer--${viewerSlideDir}`} key={activeItem.id}>
            {activeIsVideo && activeVideoUrl ? (
              <div className="album-viewer-video-wrap">
                <video
                  ref={viewerVideoRef}
                  className="album-viewer-video"
                  src={activeVideoUrl}
                  autoPlay
                  playsInline
                  preload="metadata"
                  onLoadedMetadata={handleVideoLoadedMetadata}
                  onTimeUpdate={handleVideoTimeUpdate}
                  onEnded={handleVideoEnded}
                />
                <div className={`album-video-controls${videoControlsCollapsed ? ' album-video-controls--collapsed' : ''}`}>
                  <button
                    className="album-text-btn album-video-control-btn album-video-control-btn--icon album-video-control-btn--toggle"
                    type="button"
                    onClick={handleToggleVideoControls}
                    aria-label={videoControlsCollapsed ? t('albumTab.viewer.showControls') : t('albumTab.viewer.hideControls')}
                    title={videoControlsCollapsed ? t('albumTab.viewer.showControls') : t('albumTab.viewer.hideControls')}
                  >
                    <AlbumControlIcon src={videoControlsCollapsed ? SvgIcon.VISIBLE : SvgIcon.INVISIBLE} />
                  </button>
                  {!videoControlsCollapsed ? (
                    <>
                      <button
                        className="album-text-btn album-video-control-btn album-video-control-btn--icon"
                        type="button"
                        onClick={handleToggleVideoPlay}
                        aria-label={videoPlaying ? t('albumTab.viewer.pause') : t('albumTab.viewer.play')}
                        title={videoPlaying ? t('albumTab.viewer.pause') : t('albumTab.viewer.play')}
                      >
                        <AlbumControlIcon src={videoPlaying ? SvgIcon.PAUSE : SvgIcon.CONTINUE} />
                      </button>
                      <span className="album-video-time">
                        {formatDuration(videoCurrentTime)} / {formatDuration(videoDuration)}
                      </span>
                      <input
                        className="album-video-seek"
                        type="range"
                        min={0}
                        max={videoDuration > 0 ? videoDuration : 0}
                        step={0.1}
                        value={Math.min(videoCurrentTime, videoDuration || 0)}
                        onChange={handleVideoSeek}
                        aria-label={t('albumTab.viewer.seek')}
                        disabled={videoDuration <= 0}
                      />
                      <button
                        className="album-text-btn album-video-control-btn album-video-control-btn--icon"
                        type="button"
                        onClick={handleToggleVideoMute}
                        aria-label={videoMuted ? t('albumTab.viewer.unmute') : t('albumTab.viewer.mute')}
                        title={videoMuted ? t('albumTab.viewer.unmute') : t('albumTab.viewer.mute')}
                      >
                        <AlbumControlIcon src={videoMuted ? SvgIcon.MUTE : SvgIcon.UNMUTE} />
                      </button>
                      <input
                        className="album-video-volume"
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={videoMuted ? 0 : videoVolume}
                        onChange={handleVideoVolumeChange}
                        aria-label={t('albumTab.viewer.volume')}
                      />
                    </>
                  ) : null}
                </div>
              </div>
            ) : activeMeta?.dataUrl ? (
              <img
                className="album-viewer-image"
                src={activeMeta.dataUrl}
                alt={activeItem.name}
                draggable={false}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                }}
              />
            ) : activeMeta?.loadFailed ? (
              <span className="album-viewer-fallback">{t('albumTab.viewer.failed')}</span>
            ) : (
              <span className="album-viewer-fallback">{t('albumTab.viewer.loading')}</span>
            )}
          </div>
        </div>

        <AlbumMetaPanel
          activeItem={activeItem}
          activeMeta={activeMeta}
          onSetAsIslandBackground={onSetAsIslandBackground}
        />
      </div>
    </div>
  );
}
