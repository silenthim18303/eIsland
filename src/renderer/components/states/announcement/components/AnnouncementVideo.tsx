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
 * @file AnnouncementVideo.tsx
 * @description 公告 B站视频嵌入组件
 * @author 鸡哥
 */

import type { ReactElement } from 'react';

interface AnnouncementVideoProps {
  /** B站视频 BV 号 */
  bvid: string;
  /** 多 P 视频指定 cid */
  cid?: string;
  /** 默认第几 P，默认 1 */
  page?: number;
  className?: string;
  autoplay?: boolean;
  showDanmaku?: boolean;
  /** 从指定秒数开始播放 */
  startTime?: number;
  /** 宽高比 (height / width)，默认 9/16 = 0.5625 */
  aspectRatio?: number;
}

/**
 * 嵌入 B站播放器 iframe。
 * @param props - 视频播放参数。
 * @returns B站播放器节点。
 */
export function AnnouncementVideo({
  bvid,
  cid,
  page = 1,
  className = '',
  autoplay = false,
  showDanmaku = false,
  startTime = 0,
  aspectRatio = 9 / 16,
}: AnnouncementVideoProps): ReactElement {
  const params = new URLSearchParams({
    bvid,
    page: page.toString(),
    high_quality: '1',
    danmaku: showDanmaku ? '1' : '0',
    autoplay: autoplay ? '1' : '0',
    as_wide: '1',
    ...(cid && { cid }),
    ...(startTime > 0 && { t: startTime.toString() }),
  });

  const src = `https://player.bilibili.com/player.html?${params.toString()}`;

  return (
    <div className={`announcement-video-wrapper ${className}`.trim()}>
      <div
        className="announcement-video-container"
        style={{
          position: 'relative',
          paddingTop: `${aspectRatio * 100}%`,
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
      >
        <iframe
          className="announcement-video-iframe"
          src={src}
          allowFullScreen
          scrolling="no"
          frameBorder={0}
          title="announcement-video"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
}
