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
 * @file AssistantMarkdown.tsx
 * @description AI 助手消息 Markdown 渲染组件，支持 GFM 语法与自定义代码块/链接渲染。
 * @author 鸡哥
 */

import { memo } from 'react';
import type { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownCodeBlock } from './MarkdownCodeBlock';
import { MarkdownSiteLink } from './MarkdownSiteLink';

/** remark-gfm 插件列表（模块级常量，避免每次渲染重建） */
const MARKDOWN_REMARK_PLUGINS = [remarkGfm];

/** 自定义 Markdown 组件映射：code 使用 MarkdownCodeBlock，a 使用 MarkdownSiteLink */
const MARKDOWN_COMPONENTS: import('react-markdown').Components = {
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className ?? '');
    if (!isBlock) {
      return <code className={className}>{children}</code>;
    }
    return <MarkdownCodeBlock className={className}>{children}</MarkdownCodeBlock>;
  },
  a: ({ href, children, onClick, target, rel }) => {
    return (
      <MarkdownSiteLink
        href={typeof href === 'string' ? href : ''}
        children={children}
        onClick={onClick}
        target={target}
        rel={rel}
      />
    );
  },
};

/** 助手消息 Markdown 渲染器（memo 优化，避免父组件重渲染时不必要的更新） */
export const AssistantMarkdown = memo(function AssistantMarkdown({ content }: { content: string }): ReactElement {
  return (
    <ReactMarkdown remarkPlugins={MARKDOWN_REMARK_PLUGINS} components={MARKDOWN_COMPONENTS}>
      {content}
    </ReactMarkdown>
  );
});
