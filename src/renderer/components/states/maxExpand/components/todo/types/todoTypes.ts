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
 * @file todoTypes.ts
 * @description Todo 模块类型定义。
 * @author 鸡哥
 */

/** 紧急程度 */
export type Priority = 'P0' | 'P1' | 'P2';

/** 事件大小 */
export type Size = 'S' | 'M' | 'L' | 'XL';

/** 子待办 */
export interface SubTodo {
  id: number;
  text: string;
  done: boolean;
  priority?: Priority;
  size?: Size;
}

/** 单条待办 */
export interface TodoItem {
  id: number;
  text: string;
  done: boolean;
  createdAt: number;
  priority?: Priority;
  size?: Size;
  description?: string;
  subTodos?: SubTodo[];
}

/** useTodos hook 返回值类型 */
export interface UseTodosReturn {
  todos: TodoItem[];
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  priority: Priority | undefined;
  setPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>;
  size: Size | undefined;
  setSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  expandedId: number | null;
  subInput: string;
  setSubInput: React.Dispatch<React.SetStateAction<string>>;
  subPriority: Priority | undefined;
  setSubPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>;
  subSize: Size | undefined;
  setSubSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  editingDescId: number | null;
  descDraft: string;
  setDescDraft: React.Dispatch<React.SetStateAction<string>>;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  subInputRef: React.RefObject<HTMLInputElement | null>;
  doneCount: number;
  undoneCount: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
  handleAdd: () => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  toggleDone: (id: number) => void;
  removeTodo: (id: number) => void;
  toggleExpand: (id: number) => void;
  startEditDesc: (todo: TodoItem) => void;
  saveDesc: (id: number) => void;
  addSubTodo: (parentId: number) => void;
  toggleSubDone: (parentId: number, subId: number) => void;
  removeSubTodo: (parentId: number, subId: number) => void;
}

/** TodoHeader 组件入参 */
export interface TodoHeaderProps {
  doneCount: number;
  undoneCount: number;
  p0Count: number;
  p1Count: number;
  p2Count: number;
}

/** TodoInputBar 组件入参 */
export interface TodoInputBarProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  priority: Priority | undefined;
  setPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>;
  size: Size | undefined;
  setSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onAdd: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/** TodoItem 组件入参 */
export interface TodoItemProps {
  todo: TodoItem;
  isExpanded: boolean;
  editingDescId: number | null;
  descDraft: string;
  setDescDraft: React.Dispatch<React.SetStateAction<string>>;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
  subInput: string;
  setSubInput: React.Dispatch<React.SetStateAction<string>>;
  subPriority: Priority | undefined;
  setSubPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>;
  subSize: Size | undefined;
  setSubSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  subInputRef: React.RefObject<HTMLInputElement | null>;
  onToggleDone: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onStartEditDesc: (todo: TodoItem) => void;
  onSaveDesc: (id: number) => void;
  onAddSubTodo: (parentId: number) => void;
  onToggleSubDone: (parentId: number, subId: number) => void;
  onRemoveSubTodo: (parentId: number, subId: number) => void;
}

/** TodoList 组件入参 */
export interface TodoListProps {
  todos: TodoItem[];
  expandedId: number | null;
  editingDescId: number | null;
  descDraft: string;
  setDescDraft: React.Dispatch<React.SetStateAction<string>>;
  descRef: React.RefObject<HTMLTextAreaElement | null>;
  subInput: string;
  setSubInput: React.Dispatch<React.SetStateAction<string>>;
  subPriority: Priority | undefined;
  setSubPriority: React.Dispatch<React.SetStateAction<Priority | undefined>>;
  subSize: Size | undefined;
  setSubSize: React.Dispatch<React.SetStateAction<Size | undefined>>;
  subInputRef: React.RefObject<HTMLInputElement | null>;
  listRef: React.RefObject<HTMLDivElement | null>;
  onToggleDone: (id: number) => void;
  onRemove: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onStartEditDesc: (todo: TodoItem) => void;
  onSaveDesc: (id: number) => void;
  onAddSubTodo: (parentId: number) => void;
  onToggleSubDone: (parentId: number, subId: number) => void;
  onRemoveSubTodo: (parentId: number, subId: number) => void;
}

/** TodoSubItem 组件入参 */
export interface TodoSubItemProps {
  sub: SubTodo;
  parentId: number;
  onToggleSubDone: (parentId: number, subId: number) => void;
  onRemoveSubTodo: (parentId: number, subId: number) => void;
}
