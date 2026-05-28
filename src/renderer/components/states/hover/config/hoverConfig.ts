import type { HoverTab } from '../../../../store/types';

export interface HoverContentProps {
  fullTimeStr: string;
  lunarStr: string;
}

export const NAV_DOTS: HoverTab[] = ['time', 'o3ics', 'weather', 'expand'];
