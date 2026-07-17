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
 * @file TodoItem.tsx
 * @description 待办条目组件：标题行 + 展开详情（描述编辑、子任务列表）。
 * @author 鸡哥
 */

import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { PRIORITIES, SIZES } from '../config/todoConfig';
import type { TodoItemProps } from '../types/todoTypes';
import { formatCreatedTime } from '../utils/todoUtils';
import { TodoSubItem } from './TodoSubItem';

/**
 * 待办条目
 * @description 显示单条待办的标题行，展开后可编辑描述和管理子任务
 */
export function TodoItem({
  todo, isExpanded, editingDescId, descDraft, setDescDraft, descRef,
  subInput, setSubInput, subPriority, setSubPriority, subSize, setSubSize, subInputRef,
  onToggleDone, onRemove, onToggleExpand, onStartEditDesc, onSaveDesc,
  onAddSubTodo, onToggleSubDone, onRemoveSubTodo,
}: TodoItemProps): ReactElement {
  const { t } = useTranslation();
  const subs = todo.subTodos ?? [];
  const subDone = subs.filter(s => s.done).length;

  return (
    <div className={`expand-todo-item ${todo.done ? 'done' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* 标题行 */}
      <div className="expand-todo-row" onClick={() => onToggleExpand(todo.id)}>
        <button
          className="expand-todo-check"
          onClick={(e) => { e.stopPropagation(); onToggleDone(todo.id); }}
          aria-label={todo.done
            ? t('todo.markUndone', { defaultValue: '标记未完成' })
            : t('todo.markDone', { defaultValue: '标记完成' })}
        >
          {todo.done ? '✓' : '○'}
        </button>
        <div className="expand-todo-body">
          <span className="expand-todo-text">{todo.text}</span>
          {todo.priority && (
            <span
              className="expand-todo-priority-badge"
              style={{ '--tag-color': PRIORITIES.find(p => p.value === todo.priority)?.color } as React.CSSProperties}
            >
              {todo.priority}
            </span>
          )}
          {todo.size && (
            <span
              className="expand-todo-size-badge"
              style={{ '--tag-color': SIZES.find(s => s.value === todo.size)?.color } as React.CSSProperties}
            >
              {todo.size}
            </span>
          )}
          {subs.length > 0 && (
            <span className="expand-todo-progress-wrap">
              <span className="expand-todo-progress-bar">
                <span className="expand-todo-progress-fill" style={{ width: `${subs.length > 0 ? (subDone / subs.length) * 100 : 0}%` }} />
              </span>
              <span className="expand-todo-progress-label">{subDone}/{subs.length}</span>
            </span>
          )}
          <span className="expand-todo-time">{formatCreatedTime(todo.createdAt ?? todo.id)}</span>
        </div>
        {!isExpanded && todo.description && (
          <span className="expand-todo-desc-preview" title={todo.description}>{todo.description}</span>
        )}
        <span className={`expand-todo-arrow ${isExpanded ? 'open' : ''}`}>›</span>
        <button
          className="expand-todo-delete"
          onClick={(e) => { e.stopPropagation(); onRemove(todo.id); }}
          aria-label={t('todo.delete', { defaultValue: '删除' })}
        >
          ×
        </button>
      </div>

      {/* 展开详情 */}
      {isExpanded && (
        <div className="expand-todo-detail" onClick={(e) => e.stopPropagation()}>
          {/* 描述区域 */}
          <div className="expand-todo-desc-area">
            {editingDescId === todo.id ? (
              <>
                <textarea
                  ref={descRef}
                  className="expand-todo-desc"
                  placeholder={t('todo.descPlaceholder', { defaultValue: '添加详细描述...' })}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onSaveDesc(todo.id); }
                  }}
                  rows={3}
                />
                <button className="expand-todo-desc-btn save" onClick={() => onSaveDesc(todo.id)} title={t('todo.saveTitle', { defaultValue: '保存 (Ctrl+Enter)' })}>{t('todo.save', { defaultValue: '保存' })}</button>
              </>
            ) : (
              <>
                <div className="expand-todo-desc-text">
                  {todo.description ? todo.description : <span className="expand-todo-desc-empty">{t('todo.noDesc', { defaultValue: '暂无描述' })}</span>}
                </div>
                <button className="expand-todo-desc-btn edit" onClick={() => onStartEditDesc(todo)} title={t('todo.editDescTitle', { defaultValue: '编辑描述' })}>{t('todo.edit', { defaultValue: '编辑' })}</button>
              </>
            )}
          </div>

          {/* 子待办列表 */}
          <div className="expand-todo-subs">
            <div className="expand-todo-subs-header">
              <span className="expand-todo-subs-title">{t('todo.subtasks', { defaultValue: '子任务' })}</span>
              {subs.length > 0 && <span className="expand-todo-subs-progress">{subDone}/{subs.length}</span>}
            </div>
            {subs.map(sub => (
              <TodoSubItem
                key={sub.id}
                sub={sub}
                parentId={todo.id}
                onToggleSubDone={onToggleSubDone}
                onRemoveSubTodo={onRemoveSubTodo}
              />
            ))}
            {/* 添加子待办 */}
            <div className="expand-todo-sub-add">
              <input
                ref={subInputRef}
                className="expand-todo-sub-input"
                type="text"
                placeholder={t('todo.addSubPlaceholder', { defaultValue: '添加子任务...' })}
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); onAddSubTodo(todo.id); }
                }}
              />
              <div className="expand-todo-selector">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    className={`expand-todo-tag ${subPriority === p.value ? 'active' : ''}`}
                    style={{ '--tag-color': p.color } as React.CSSProperties}
                    onClick={() => setSubPriority(subPriority === p.value ? undefined : p.value)}
                    title={p.label}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="expand-todo-selector">
                {SIZES.map(s => (
                  <button
                    key={s.value}
                    className={`expand-todo-tag size ${subSize === s.value ? 'active' : ''}`}
                    style={{ '--tag-color': s.color } as React.CSSProperties}
                    onClick={() => setSubSize(subSize === s.value ? undefined : s.value)}
                    title={s.label}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <button className="expand-todo-sub-add-btn" onClick={() => onAddSubTodo(todo.id)}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
