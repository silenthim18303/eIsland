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
 * @file MarqueeText.tsx
 * @description 溢出时自动滚动的文本组件
 * @author 鸡哥
 */

import type { CSSProperties, ReactElement } from 'react';
import type { MarqueeTextProps } from '../types';
import { useMarqueeOverflow } from '../hooks/useMarqueeOverflow';

/**
 * 溢出滚动文本
 * @description 文本超出容器宽度时自动播放滚动动画
 */
export function MarqueeText({ children, className }: MarqueeTextProps): ReactElement {
  const { containerRef, textRef, distance } = useMarqueeOverflow(children);

  const marqueeStyle: CSSProperties | undefined = distance > 0
    ? { '--marquee-distance': `${-distance}px` } as CSSProperties
    : undefined;

  return (
    <div ref={containerRef} className={className}>
      <span
        ref={textRef}
        className={`guide-smtc-marquee-inner${distance > 0 ? ' scrolling' : ''}`}
        style={marqueeStyle}
      >
        {children}
      </span>
    </div>
  );
}
