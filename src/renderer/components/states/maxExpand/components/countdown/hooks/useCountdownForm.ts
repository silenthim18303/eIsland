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
 * @file useCountdownForm.ts
 * @description 倒数日表单状态管理 hook：新建/编辑表单、颜色输入、CRUD 操作。
 * @author 鸡哥
 */

import { useState, useCallback, useRef } from 'react';
import { toLocalDateStr } from '../utils/countdownUtils';
import type { CountdownItem, EventType, UseCountdownFormReturn } from '../types/countdownTypes';

/** 管理倒数日新建/编辑表单状态及 CRUD 操作 */
export function useCountdownForm(
  setItems: React.Dispatch<React.SetStateAction<CountdownItem[]>>,
): UseCountdownFormReturn {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#69c0ff');
  const [newType, setNewType] = useState<EventType>('countdown');
  const [newDesc, setNewDesc] = useState('');
  const [newBgImage, setNewBgImage] = useState<string | undefined>(undefined);
  const [newBgOpacity, setNewBgOpacity] = useState(0.5);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CountdownItem>>({});
  const [editBgImage, setEditBgImage] = useState<string | undefined>(undefined);
  const [editBgOpacity, setEditBgOpacity] = useState(0.5);
  const editCustomColorRef = useRef<HTMLInputElement>(null);
  const addCustomColorRef = useRef<HTMLInputElement>(null);
  const colorRafRef = useRef<number | null>(null);

  const handleEditColorInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (colorRafRef.current !== null) cancelAnimationFrame(colorRafRef.current);
    colorRafRef.current = requestAnimationFrame(() => {
      setEditData(prev => ({ ...prev, color: v }));
      colorRafRef.current = null;
    });
  }, []);

  const handleAddColorInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (colorRafRef.current !== null) cancelAnimationFrame(colorRafRef.current);
    colorRafRef.current = requestAnimationFrame(() => {
      setNewColor(v);
      colorRafRef.current = null;
    });
  }, []);

  /** 添加 */
  const addItem = useCallback(() => {
    if (!selectedDate || !newName.trim()) return;
    const dateStr = toLocalDateStr(selectedDate);
    setItems(prev => [...prev, {
      id: Date.now() + Math.random(),
      name: newName.trim(),
      date: dateStr,
      color: newColor,
      type: newType,
      description: newDesc.trim() || undefined,
      backgroundImage: newBgImage,
      backgroundOpacity: newBgImage ? newBgOpacity : undefined,
    }]);
    setNewName('');
    setNewDesc('');
    setNewBgImage(undefined);
    setNewBgOpacity(0.5);
    setSelectedDate(null);
  }, [selectedDate, newName, newColor, newType, newDesc, newBgImage, newBgOpacity, setItems]);

  /** 开始编辑 */
  const startEdit = useCallback((item: CountdownItem) => {
    setEditingId(item.id);
    setEditData({ name: item.name, description: item.description || '', color: item.color, type: item.type });
    setEditBgImage(item.backgroundImage);
    setEditBgOpacity(item.backgroundOpacity ?? 0.5);
  }, []);

  /** 保存编辑 */
  const saveEdit = useCallback(() => {
    if (editingId === null) return;
    setItems(prev => prev.map(i => {
      if (i.id !== editingId) return i;
      return {
        ...i,
        name: (editData.name || '').trim() || i.name,
        description: (editData.description || '').trim() || undefined,
        color: editData.color || i.color,
        type: editData.type || i.type,
        backgroundImage: editBgImage,
        backgroundOpacity: editBgImage ? editBgOpacity : undefined,
      };
    }));
    setEditingId(null);
  }, [editingId, editData, editBgImage, editBgOpacity, setItems]);

  return {
    selectedDate, setSelectedDate,
    newName, setNewName,
    newColor, setNewColor,
    newType, setNewType,
    newDesc, setNewDesc,
    newBgImage, setNewBgImage,
    newBgOpacity, setNewBgOpacity,
    editingId, setEditingId,
    editData, setEditData,
    editBgImage, setEditBgImage,
    editBgOpacity, setEditBgOpacity,
    addItem, startEdit, saveEdit,
    handleEditColorInput, handleAddColorInput,
    editCustomColorRef, addCustomColorRef,
  };
}
