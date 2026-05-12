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
 * @file MiniMusicIsland.tsx
 * @description 迷你音乐岛演示组件 — 布局与样式完全参照 LyricsContent
 * @author 鸡哥
 */

import React, { useEffect, useState } from 'react';
import i18n from '../../../../i18n';
import { getSampleLyrics, type MiniMusicDemo } from '../config/guideContentConfig';
import { extractDominantColor } from '../utils/guideContentUtils';
import albumArt from '../../../../assets/avatar/T.jpg';

/** 迷你音乐岛演示组件 — 布局与样式完全参照 LyricsContent */
export function MiniMusicIsland({ demo }: { demo: MiniMusicDemo }): React.ReactElement {
  const tr = (key: string, fallback: string): string => i18n.t(key, { defaultValue: fallback });
  const sampleLyrics = getSampleLyrics(i18n.t.bind(i18n));
  const [state, setState] = useState<'idle' | 'hover'>(demo === 'smtc' ? 'idle' : 'hover');
  const [lyricIdx, setLyricIdx] = useState(0);
  const [rgb, setRgb] = useState<[number, number, number]>([100, 100, 100]);
  const [sweepProg, setSweepProg] = useState(0);

  useEffect(() => { extractDominantColor(albumArt).then(setRgb); }, []);

  useEffect(() => {
    if (demo === 'smtc') {
      let expanded = false;
      const id = setInterval(() => {
        expanded = !expanded;
        setState(expanded ? 'hover' : 'idle');
      }, 1500);
      return () => clearInterval(id);
    }
    if (demo === 'lyrics' || demo === 'karaoke') setState('hover');
    return undefined;
  }, [demo]);

  useEffect(() => {
    if (demo !== 'lyrics') return;
    const id = setInterval(() => {
      setLyricIdx((prev) => (prev + 1) % sampleLyrics.length);
    }, 2000);
    return () => clearInterval(id);
  }, [demo, sampleLyrics.length]);

  useEffect(() => {
    if (demo !== 'karaoke') return;
    let raf: number;
    const duration = 3000;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) % duration;
      setSweepProg((elapsed / duration) * 100);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [demo]);

  const [r, g, b] = rgb;

  return (
    <div className="mini-island-wrapper">
      <div className={`mini-marquee-frame${state === 'hover' ? ' marquee-active' : ''}`} style={{ '--marquee-rgb': `${r}, ${g}, ${b}` } as React.CSSProperties}>
        <div className={`mini-island mini-music-${state}`}>
          {/* 背景光晕 — 与 idle-glow 一致 */}
          <div
            className={`mini-music-glow${state === 'hover' ? ' active' : ''}`}
            style={{ background: `radial-gradient(ellipse at 10% 50%, rgba(${r}, ${g}, ${b}, 0.35) 0%, transparent 60%)` }}
          />

          {/* 左侧：专辑封面（仅播放状态显示） */}
          {state === 'hover' && (
            <div
              className="mini-music-cover"
              style={{
                backgroundImage: `url(${albumArt})`,
                boxShadow: `0 0 8px 2px rgba(${r}, ${g}, ${b}, 0.5)`,
              }}
            />
          )}

          {/* 右侧：歌词区 */}
          {state === 'hover' && (
            <div className="mini-music-lyrics">
              {demo === 'smtc' && (
                <span className="mini-music-text mini-music-fade">♪ {tr('guide.mini.music.playing', '正在播放')}</span>
              )}
              {demo === 'lyrics' && (
                <span className="mini-music-text mini-music-fade" key={lyricIdx}>
                  {sampleLyrics[lyricIdx]}
                </span>
              )}
              {demo === 'karaoke' && (
                <span
                  className="mini-music-text mini-music-sweep"
                  style={{ '--lrc-prog': `${sweepProg.toFixed(1)}%` } as React.CSSProperties}
                >
                  {tr('guide.mini.music.karaokeSample', '这是一句歌词')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
