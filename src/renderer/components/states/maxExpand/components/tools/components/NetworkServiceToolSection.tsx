/*
 * eIsland - A sleek, Apple Dynamic Island inspired floating widget for Windows,
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
 * @file NetworkServiceToolSection.tsx
 * @description 工具箱网络服务模块（IP 信息查询）
 * @author 鸡哥
 */

import { useCallback, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

interface IpInfoData {
  ip?: string;
  region?: string;
  isp?: string;
  llc?: string;
  asn?: string;
  latitude?: number;
  longitude?: number;
  beginip?: string;
  endip?: string;
  [key: string]: unknown;
}

interface IpInfoResponse {
  code?: number;
  msg?: string;
  message?: string;
  data?: IpInfoData;
}

const IPINFO_ENDPOINT = 'https://uapis.cn/api/v1/network/ipinfo';

export function NetworkServiceToolSection(): ReactElement {
  const { t } = useTranslation();
  const [ipInput, setIpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [result, setResult] = useState<IpInfoData | null>(null);
  const [rawJson, setRawJson] = useState('');

  const handleQueryIpInfo = useCallback(async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const trimmedIp = ipInput.trim();
      if (!trimmedIp) {
        setErrorMessage(t('maxExpand.toolbox.networkService.ipinfo.emptyIp'));
        setLoading(false);
        return;
      }
      const url = `${IPINFO_ENDPOINT}?ip=${encodeURIComponent(trimmedIp)}`;
      const response = await window.api.netFetch(url, {
        method: 'GET',
        timeoutMs: 10000,
      });

      if (!response.ok) {
        setResult(null);
        setRawJson(response.body || '');
        setErrorMessage(t('maxExpand.toolbox.networkService.ipinfo.httpError', { status: response.status }));
        return;
      }

      if (response.body.trimStart().startsWith('<')) {
        setResult(null);
        setRawJson(response.body);
        setErrorMessage(t('maxExpand.toolbox.networkService.ipinfo.nonJson'));
        return;
      }

      const parsed = JSON.parse(response.body) as IpInfoResponse;
      if ((typeof parsed.code === 'number' && parsed.code !== 200) || !parsed.data) {
        setResult(null);
        setRawJson(JSON.stringify(parsed, null, 2));
        setErrorMessage(parsed.msg || parsed.message || t('maxExpand.toolbox.networkService.ipinfo.failed'));
        return;
      }

      setResult(parsed.data);
      setRawJson(JSON.stringify(parsed, null, 2));
    } catch {
      setResult(null);
      setRawJson('');
      setErrorMessage(t('maxExpand.toolbox.networkService.ipinfo.failed'));
    } finally {
      setLoading(false);
    }
  }, [loading, ipInput, t]);

  return (
    <div className="settings-cards">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-title">{t('maxExpand.toolbox.networkService.title')}</div>
          <div className="settings-card-subtitle">{t('maxExpand.toolbox.networkService.subtitle')}</div>
        </div>
        <div className="settings-card-body">
          <div className="file-hash-row">
            <input
              type="text"
              className="file-hash-input"
              placeholder={t('maxExpand.toolbox.networkService.ipinfo.ipPlaceholder')}
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleQueryIpInfo(); }}
            />
          </div>

          <div className="settings-hotkey-row">
            <button
              className={`settings-lyrics-source-btn download-start-btn-full ${loading ? 'disabled' : ''}`}
              type="button"
              disabled={loading}
              onClick={handleQueryIpInfo}
            >
              {loading
                ? t('maxExpand.toolbox.networkService.ipinfo.querying')
                : t('maxExpand.toolbox.networkService.ipinfo.queryBtn')}
            </button>
          </div>

          {errorMessage && <div className="download-status-text">{errorMessage}</div>}

          {result && (
            <div className="file-hash-result">
              <div className="file-hash-result-header">
                <span className="file-hash-result-algo">{t('maxExpand.toolbox.networkService.ipinfo.resultTitle')}</span>
              </div>
              <div className="file-hash-result-value">IP: {String(result.ip || '-')}</div>
              <div className="file-hash-result-value">{t('maxExpand.toolbox.networkService.ipinfo.region')}: {String(result.region || '-')}</div>
              <div className="file-hash-result-value">ISP: {String(result.isp || '-')}</div>
              <div className="file-hash-result-value">{t('maxExpand.toolbox.networkService.ipinfo.llc')}: {String(result.llc || '-')}</div>
              <div className="file-hash-result-value">ASN: {String(result.asn || '-')}</div>
              <div className="file-hash-result-value">{t('maxExpand.toolbox.networkService.ipinfo.latitude')}: {result.latitude != null ? String(result.latitude) : '-'}</div>
              <div className="file-hash-result-value">{t('maxExpand.toolbox.networkService.ipinfo.longitude')}: {result.longitude != null ? String(result.longitude) : '-'}</div>
              <div className="file-hash-result-value">{t('maxExpand.toolbox.networkService.ipinfo.ipRange')}: {String(result.beginip || '-')} ~ {String(result.endip || '-')}</div>
            </div>
          )}

          {rawJson && (
            <div className="file-hash-row" style={{ marginTop: 8 }}>
              <textarea
                className="translate-textarea translate-textarea-result"
                value={rawJson}
                readOnly
                rows={8}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
