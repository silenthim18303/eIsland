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
 * @file countdownTypes.ts
 * @description 倒数日模块类型定义。
 * @author 鸡哥
 */

/** 事件类型 */
export type EventType = 'countdown' | 'anniversary' | 'birthday' | 'holiday' | 'exam';

/** 倒数日数据 */
export interface CountdownItem {
  id: number;
  name: string;
  date: string;
  color: string;
  type: EventType;
  description?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
}

/** useCountdownItems 返回值类型 */
export interface UseCountdownItemsReturn {
  items: CountdownItem[];
  setItems: React.Dispatch<React.SetStateAction<CountdownItem[]>>;
  loaded: boolean;
  removeItem: (id: number) => void;
}

/** useCountdownForm 返回值类型 */
export interface UseCountdownFormReturn {
  selectedDate: Date | null;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date | null>>;
  newName: string;
  setNewName: React.Dispatch<React.SetStateAction<string>>;
  newColor: string;
  setNewColor: React.Dispatch<React.SetStateAction<string>>;
  newType: EventType;
  setNewType: React.Dispatch<React.SetStateAction<EventType>>;
  newDesc: string;
  setNewDesc: React.Dispatch<React.SetStateAction<string>>;
  newBgImage: string | undefined;
  setNewBgImage: React.Dispatch<React.SetStateAction<string | undefined>>;
  newBgOpacity: number;
  setNewBgOpacity: React.Dispatch<React.SetStateAction<number>>;
  editingId: number | null;
  setEditingId: React.Dispatch<React.SetStateAction<number | null>>;
  editData: Partial<CountdownItem>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<CountdownItem>>>;
  editBgImage: string | undefined;
  setEditBgImage: React.Dispatch<React.SetStateAction<string | undefined>>;
  editBgOpacity: number;
  setEditBgOpacity: React.Dispatch<React.SetStateAction<number>>;
  addItem: () => void;
  startEdit: (item: CountdownItem) => void;
  saveEdit: () => void;
  handleEditColorInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddColorInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editCustomColorRef: React.RefObject<HTMLInputElement | null>;
  addCustomColorRef: React.RefObject<HTMLInputElement | null>;
}

/** CountdownCalendar 组件入参 */
export interface CountdownCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  highlightDates: Date[];
}

/** CountdownForm 组件入参 */
export interface CountdownFormProps {
  /** 是否为编辑模式 */
  editing: boolean;
  /** 日历选中日期（新建模式） */
  selectedDate: Date | null;
  /** 编辑中的条目（编辑模式） */
  editItem: CountdownItem | null;
  resolvedCoverImage: string | null;
  form: UseCountdownFormReturn;
  onAdd: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  getEventTypeLabel: (type: EventType) => string;
}

/** CountdownCard 组件入参 */
export interface CountdownCardProps {
  item: CountdownItem;
  color: string;
  type: EventType;
  name: string;
  description?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  dateText: string;
  daysText: string;
  showDelete?: boolean;
  onDelete?: (e: React.MouseEvent) => void;
  onClick?: () => void;
  getEventTypeLabel: (type: EventType) => string;
}

/** CountdownPreview 组件入参 */
export interface CountdownPreviewProps {
  editItem: CountdownItem | null;
  editData: Partial<CountdownItem>;
  editBgImage: string | undefined;
  editBgOpacity: number;
  newType: EventType;
  newColor: string;
  newName: string;
  newDesc: string;
  newBgImage: string | undefined;
  newBgOpacity: number;
  selectedDate: Date | null;
  getEventTypeLabel: (type: EventType) => string;
  formatDayText: (days: number) => string;
}

/** CountdownCardList 组件入参 */
export interface CountdownCardListProps {
  items: CountdownItem[];
  onStartEdit: (item: CountdownItem) => void;
  onRemove: (id: number) => void;
  getEventTypeLabel: (type: EventType) => string;
  formatDayText: (days: number) => string;
  cardsRef: React.RefObject<HTMLDivElement | null>;
  onWheel: (e: React.WheelEvent) => void;
}
