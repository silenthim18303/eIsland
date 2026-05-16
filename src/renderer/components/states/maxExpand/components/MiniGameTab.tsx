import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import eislandLogo from '../../../../../../resources/icon/eisland.svg';

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
        width: '100%',
        height: '100%',
        textAlign: 'center',
        gap: '10px',
      }}
    >
      <img src={eislandLogo} alt={t('common.appName')} style={{ width: '56px', height: '56px' }} draggable={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '6px' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1.4 }}>{t('miniGameTab.title')}</div>
        <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: 1.5 }}>{t('miniGameTab.subtitle')}</div>
      </div>
    </div>
  );
}
