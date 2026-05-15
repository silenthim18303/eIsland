import type { ReactElement } from 'react';
import type { MaxExpandTab } from '../../../store/types';
import { MaxExpandContentShell } from './MaxExpandContentShell';
import { AiChatTab } from './components/AiChatTab';
import { TodoTab } from './components/TodoTab';
import { UrlFavoritesTab } from './components/UrlFavoritesTab';
import { LocalFileSearchTab } from './components/LocalFileSearchTab';
import { ClipboardHistoryTab } from './components/ClipboardHistoryTab';
import { AlbumTab } from './components/AlbumTab';
import { MailTab } from './components/MailTab';
import { SettingsTab } from './components/SettingsTab';
import { CountdownTab } from './components/CountdownTab';
import { MemoTab } from './components/MemoTab';
import { AlarmTab } from './components/AlarmTab';
import { ToolboxTab } from './components/ToolboxTab';

function renderEagerActiveTab(activeTab: MaxExpandTab, loadingFallback: ReactElement, contentReady: boolean): ReactElement | null {
  if (!contentReady) return loadingFallback;
  if (activeTab === 'aiChat') return <AiChatTab />;
  if (activeTab === 'todo') return <TodoTab />;
  if (activeTab === 'urlFavorites') return <UrlFavoritesTab />;
  if (activeTab === 'localFileSearch') return <LocalFileSearchTab />;
  if (activeTab === 'clipboardHistory') return <ClipboardHistoryTab />;
  if (activeTab === 'album') return <AlbumTab />;
  if (activeTab === 'mail') return <MailTab />;
  if (activeTab === 'memo') return <MemoTab />;
  if (activeTab === 'countdown') return <CountdownTab />;
  if (activeTab === 'alarm') return <AlarmTab />;
  if (activeTab === 'toolbox') return <ToolboxTab />;
  if (activeTab === 'settings') return <SettingsTab />;
  return null;
}

export function MaxExpandContentEager(): ReactElement {
  return <MaxExpandContentShell renderActiveTab={renderEagerActiveTab} deferContent={false} />;
}
