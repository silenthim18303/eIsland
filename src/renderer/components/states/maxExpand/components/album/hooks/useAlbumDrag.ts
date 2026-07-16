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
 * @file useAlbumDrag.ts
 * @description 相册拖拽导入 hook — 拖拽进入/离开/放下状态与 handlers。
 * @author 鸡哥
 */

import { useState } from 'react';
import type { DragEvent } from 'react';

/** useAlbumDrag 返回值类型 */
export interface UseAlbumDragReturn {
  dragOverPage: boolean;
  handleDragOver: (event: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
}

/** 相册拖拽导入 hook */
export function useAlbumDrag(onDropFiles: (files: FileList | File[] | null) => void): UseAlbumDragReturn {
  const [dragOverPage, setDragOverPage] = useState(false);

  const handleDragOver = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    if (!dragOverPage) setDragOverPage(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>): void => {
    if (event.currentTarget === event.target) setDragOverPage(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setDragOverPage(false);
    const files = event.dataTransfer?.files;
    if (files) onDropFiles(files);
  };

  return { dragOverPage, handleDragOver, handleDragLeave, handleDrop };
}
