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
 * @file TodoList.tsx
 * @description Todo 列表容器组件：空状态引导 + 待办条目列表。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { TodoListProps } from '../types/todoTypes';
import { TodoItem } from './TodoItem';

/**
 * Todo 列表容器
 * @description 空状态时显示引导界面，有待办时渲染条目列表
 */
export function TodoList({
  todos, expandedId, editingDescId, descDraft, setDescDraft, descRef,
  subInput, setSubInput, subPriority, setSubPriority, subSize, setSubSize, subInputRef,
  listRef,
  onToggleDone, onRemove, onToggleExpand, onStartEditDesc, onSaveDesc,
  onAddSubTodo, onToggleSubDone, onRemoveSubTodo,
}: TodoListProps): ReactElement {
  const { t } = useTranslation();

  return (
    <div className="expand-todo-list" ref={listRef}>
      {todos.length === 0 && (
        <div className="expand-todo-onboarding">
          <div className="expand-todo-onboarding-icon">
            <span className="onboarding-check">✓</span>
            <span className="onboarding-circle" />
          </div>
          <div className="expand-todo-onboarding-title">{t('todo.onboarding.title', { defaultValue: '待办事项' })}</div>
          <div className="expand-todo-onboarding-desc">
            {t('todo.onboarding.desc', { defaultValue: '在这里管理你的任务，保持高效有序' })}
          </div>
          <div className="expand-todo-onboarding-features">
            <div className="onboarding-feature">
              <span className="onboarding-feature-dot" />
              <span>{t('todo.onboarding.feature1', { defaultValue: '创建待办并设置紧急程度与大小' })}</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature-dot" />
              <span>{t('todo.onboarding.feature2', { defaultValue: '点击展开查看详情，添加描述' })}</span>
            </div>
            <div className="onboarding-feature">
              <span className="onboarding-feature-dot" />
              <span>{t('todo.onboarding.feature3', { defaultValue: '拆分子任务，追踪完成进度' })}</span>
            </div>
          </div>
          <div className="expand-todo-onboarding-hint">{t('todo.onboarding.hint', { defaultValue: '在上方输入框添加你的第一个待办 ↑' })}</div>
        </div>
      )}
      {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isExpanded={expandedId === todo.id}
          editingDescId={editingDescId}
          descDraft={descDraft}
          setDescDraft={setDescDraft}
          descRef={descRef}
          subInput={subInput}
          setSubInput={setSubInput}
          subPriority={subPriority}
          setSubPriority={setSubPriority}
          subSize={subSize}
          setSubSize={setSubSize}
          subInputRef={subInputRef}
          onToggleDone={onToggleDone}
          onRemove={onRemove}
          onToggleExpand={onToggleExpand}
          onStartEditDesc={onStartEditDesc}
          onSaveDesc={onSaveDesc}
          onAddSubTodo={onAddSubTodo}
          onToggleSubDone={onToggleSubDone}
          onRemoveSubTodo={onRemoveSubTodo}
        />
      ))}
    </div>
  );
}
