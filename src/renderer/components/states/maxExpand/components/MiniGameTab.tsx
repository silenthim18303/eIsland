import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function MiniGameTab(): ReactElement {
  const { t } = useTranslation();

  return (
    <div
      className="mini-game-tab-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        height: '100%',
        gap: '8px',
      }}
    >
      <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4 }}>{t('miniGameTab.title')}</div>
      <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.5 }}>{t('miniGameTab.subtitle')}</div>
    </div>
  );
}
