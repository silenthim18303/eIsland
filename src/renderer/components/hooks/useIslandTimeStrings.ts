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

import { useEffect, useMemo, useState } from 'react';
import { formatTime, formatFullTime, getDayName, getLunarDate } from '../../utils/timeUtils';

interface UseIslandTimeStringsOptions {
  t: (key: string, options?: { defaultValue?: string }) => string;
  language: string | undefined;
}

interface IslandTimeStrings {
  timeStr: string;
  dayStr: string;
  fullTimeStr: string;
  lunarStr: string;
}

export function useIslandTimeStrings(options: UseIslandTimeStringsOptions): IslandTimeStrings {
  const { t, language } = options;

  const formatWeekday = useMemo(() => {
    return (date: Date): string => t(`overview.time.weekdays.${date.getDay()}`, { defaultValue: getDayName(date) });
  }, [t, language]);

  const [timeStr, setTimeStr] = useState(() => formatTime(new Date()));
  const [dayStr, setDayStr] = useState(() => formatWeekday(new Date()));
  const [fullTimeStr, setFullTimeStr] = useState(() => formatFullTime(new Date()));
  const [lunarStr, setLunarStr] = useState(() => getLunarDate(new Date()));

  useEffect(() => {
    const update = (): void => {
      const now = new Date();
      setTimeStr(formatTime(now));
      setDayStr(formatWeekday(now));
      setFullTimeStr(formatFullTime(now));
      setLunarStr(getLunarDate(now));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [formatWeekday]);

  return {
    timeStr,
    dayStr,
    fullTimeStr,
    lunarStr,
  };
}
