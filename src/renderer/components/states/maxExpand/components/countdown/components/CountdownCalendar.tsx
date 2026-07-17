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
 * @file CountdownCalendar.tsx
 * @description 倒数日日历选择器组件。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { CountdownCalendarProps } from '../types/countdownTypes';

/** 日历选择器，支持高亮已有事件日期 */
export function CountdownCalendar({ selectedDate, onSelectDate, highlightDates }: CountdownCalendarProps): ReactElement {
  return (
    <div className="cd-calendar-wrap countdown-calendar-wrap">
      <DatePicker
        selected={selectedDate}
        onChange={(date: Date | null) => onSelectDate(date)}
        inline
        highlightDates={highlightDates}
        calendarClassName="countdown-calendar"
      />
    </div>
  );
}
