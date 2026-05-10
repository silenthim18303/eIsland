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
 * @file useDownloadTasks.ts
 * @description 工具箱下载任务状态与实时更新
 * @author 鸡哥
 */

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import type { DownloadTaskSnapshot } from '../config/toolboxConfig';

interface UseDownloadTasksResult {
  tasks: DownloadTaskSnapshot[];
  setTasks: Dispatch<SetStateAction<DownloadTaskSnapshot[]>>;
  defaultDir: string;
  nowMs: number;
  activeTask: DownloadTaskSnapshot | null;
}

/**
 * 管理下载任务列表、默认目录与实时状态。
 */
export function useDownloadTasks(): UseDownloadTasksResult {
  const [tasks, setTasks] = useState<DownloadTaskSnapshot[]>([]);
  const [defaultDir, setDefaultDir] = useState('');
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    let disposed = false;
    window.api.downloadGetDefaultDir().then((dir) => {
      if (disposed) return;
      setDefaultDir(dir || '');
    }).catch(() => {});
    window.api.downloadList().then((list) => {
      if (disposed) return;
      setTasks((list || []).slice().sort((a, b) => b.createdAt - a.createdAt));
    }).catch(() => {});
    const off = window.api.onDownloadTaskUpdated((task) => {
      setTasks((prev) => {
        const exists = prev.some((item) => item.id === task.id);
        const next = exists
          ? prev.map((item) => (item.id === task.id ? task : item))
          : [task, ...prev];
        return next.slice().sort((a, b) => b.createdAt - a.createdAt);
      });
    });

    return () => {
      disposed = true;
      off();
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const activeTask = useMemo(() => {
    return tasks.find((task) => task.status === 'downloading') || null;
  }, [tasks]);

  return {
    tasks,
    setTasks,
    defaultDir,
    nowMs,
    activeTask,
  };
}
