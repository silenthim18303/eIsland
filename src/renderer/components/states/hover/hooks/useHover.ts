import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import useIslandStore from '../../../../store/slices';
import type { HoverTab } from '../../../../store/types';
import { NAV_DOTS, type HoverContentProps } from '../config/hoverConfig';

export function useHover(props: HoverContentProps) {
  const { t } = useTranslation();
  const { hoverTab, setHoverTab, setExpanded } = useIslandStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const getDotLabel = (tab: HoverTab): string => t(`hover.nav.${tab}`, {
    defaultValue: tab === 'time' ? '工具' : tab === 'o3ics' ? '歌曲' : tab === 'weather' ? '天气' : '展开',
  });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent): void => {
      const target = e.target as HTMLElement;
      if (hoverTab === 'time' && target.closest('.timer-inputs')) return;
      e.preventDefault();
      const currentIndex = NAV_DOTS.findIndex(d => d === hoverTab);
      let nextTab: HoverTab;
      if (e.deltaY > 0) {
        nextTab = NAV_DOTS[(currentIndex + 1) % NAV_DOTS.length];
      } else {
        nextTab = NAV_DOTS[(currentIndex - 1 + NAV_DOTS.length) % NAV_DOTS.length];
      }
      if (nextTab === 'expand') {
        setExpanded();
        return;
      }
      setHoverTab(nextTab);
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [hoverTab, setHoverTab]);

  return {
    ...props,
    t,
    hoverTab,
    setHoverTab,
    setExpanded,
    contentRef,
    getDotLabel,
  };
}
