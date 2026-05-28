import type { ReactElement } from 'react';
import type { useHover } from '../hooks/useHover';
import { NAV_DOTS } from '../config/hoverConfig';
import { TimeTab } from './TimeTab';
import { LyricsTab } from './LrcTab';
import { WeatherTab } from './WeatherTab';

type HoverFormProps = ReturnType<typeof useHover>;

export function HoverForm(props: HoverFormProps): ReactElement {
  const {
    fullTimeStr,
    lunarStr,
    t,
    hoverTab,
    setHoverTab,
    setExpanded,
    contentRef,
    getDotLabel,
  } = props;

  return (
    <div className="hover-content" ref={contentRef}>
      <div className="hover-nav-dots">
        {NAV_DOTS.map((tab) => (
          <button
            key={tab}
            className={`hover-nav-dot ${hoverTab === tab ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); if (tab === 'expand') { setExpanded(); } else { setHoverTab(tab); } }}
            title={getDotLabel(tab)}
            aria-label={t('hover.nav.switchToPage', { defaultValue: '切换到{{label}}页面', label: getDotLabel(tab) })}
          />
        ))}
      </div>

      <div className="hover-tab-content" onClick={(e) => e.stopPropagation()}>
        {hoverTab === 'time' && (
          <TimeTab
            fullTimeStr={fullTimeStr}
            lunarStr={lunarStr}
          />
        )}
        {hoverTab === 'o3ics' && <LyricsTab />}
        {hoverTab === 'weather' && <WeatherTab />}
      </div>
    </div>
  );
}
