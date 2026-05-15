import React from 'react';
import type { MaxExpandTab } from '../../../store/types';
import { MaxExpandContentShell } from './MaxExpandContentShell';

const AiChatTab = React.lazy(() => import('./components/AiChatTab').then((module) => ({ default: module.AiChatTab })));
const TodoTab = React.lazy(() => import('./components/TodoTab').then((module) => ({ default: module.TodoTab })));
const UrlFavoritesTab = React.lazy(() => import('./components/UrlFavoritesTab').then((module) => ({ default: module.UrlFavoritesTab })));
const LocalFileSearchTab = React.lazy(() => import('./components/LocalFileSearchTab').then((module) => ({ default: module.LocalFileSearchTab })));
const ClipboardHistoryTab = React.lazy(() => import('./components/ClipboardHistoryTab').then((module) => ({ default: module.ClipboardHistoryTab })));
const AlbumTab = React.lazy(() => import('./components/AlbumTab').then((module) => ({ default: module.AlbumTab })));
const MailTab = React.lazy(() => import('./components/MailTab').then((module) => ({ default: module.MailTab })));
const SettingsTab = React.lazy(() => import('./components/SettingsTab').then((module) => ({ default: module.SettingsTab })));
const CountdownTab = React.lazy(() => import('./components/CountdownTab').then((module) => ({ default: module.CountdownTab })));
const MemoTab = React.lazy(() => import('./components/MemoTab').then((module) => ({ default: module.MemoTab })));
const AlarmTab = React.lazy(() => import('./components/AlarmTab').then((module) => ({ default: module.AlarmTab })));
const ToolboxTab = React.lazy(() => import('./components/ToolboxTab').then((module) => ({ default: module.ToolboxTab })));

function renderLazyActiveTab(activeTab: MaxExpandTab, loadingFallback: React.ReactElement, contentReady: boolean): React.ReactElement | null {
  if (!contentReady) return loadingFallback;
  let content: React.ReactElement | null = null;
  if (activeTab === 'aiChat') content = <AiChatTab />;
  if (activeTab === 'todo') content = <TodoTab />;
  if (activeTab === 'urlFavorites') content = <UrlFavoritesTab />;
  if (activeTab === 'localFileSearch') content = <LocalFileSearchTab />;
  if (activeTab === 'clipboardHistory') content = <ClipboardHistoryTab />;
  if (activeTab === 'album') content = <AlbumTab />;
  if (activeTab === 'mail') content = <MailTab />;
  if (activeTab === 'memo') content = <MemoTab />;
  if (activeTab === 'countdown') content = <CountdownTab />;
  if (activeTab === 'alarm') content = <AlarmTab />;
  if (activeTab === 'toolbox') content = <ToolboxTab />;
  if (activeTab === 'settings') content = <SettingsTab />;
  return <React.Suspense fallback={loadingFallback}>{content}</React.Suspense>;
}

export function MaxExpandContentLazy(): React.ReactElement {
  return <MaxExpandContentShell renderActiveTab={renderLazyActiveTab} />;
}
