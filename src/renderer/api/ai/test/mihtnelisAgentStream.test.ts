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
 * @file mihtnelisAgentStream.test.ts
 * @description mihtnelisAgentStream 单元测试。
 * @author 鸡哥
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ------------------------------------------------------------------ */
/*  hoisted mocks                                                     */
/* ------------------------------------------------------------------ */

const { buildReplayHeadersMock, resolveClientVersionMock, BASE_URL } = vi.hoisted(() => ({
  buildReplayHeadersMock: vi.fn(() => ({
    'X-Timestamp': '1234567890',
    'X-Nonce': 'abcdef1234567890abcdef1234567890',
  })),
  resolveClientVersionMock: vi.fn(async () => '1.0.0'),
  BASE_URL: 'https://api.test.pyisland.com',
}));

vi.mock('../../user/userAccountApi.client', () => ({
  buildReplayHeaders: buildReplayHeadersMock,
  resolveClientVersion: resolveClientVersionMock,
  USER_ACCOUNT_API_BASE: BASE_URL,
}));

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */

const makeHeaders = (overrides?: Record<string, string>): Headers => {
  const map = new Headers({
    'x-trace-id': 'trace-abc-123',
    ...overrides,
  });
  return map;
};

const makeOkResponse = (body: string, headers?: Headers): Response => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(body);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: headers ?? makeHeaders(),
    body: {
      getReader: () => {
        let sent = false;
        return {
          read: async () => {
            if (sent) return { done: true, value: undefined };
            sent = true;
            return { done: false, value: encoded };
          },
        };
      },
    },
  } as unknown as Response;
};

const makeErrorResponse = (status: number, body: string): Response =>
  ({
    ok: false,
    status,
    statusText: 'Error',
    headers: makeHeaders(),
    text: async () => body,
  }) as unknown as Response;

const makeJsonOkResponse = (data: unknown, headers?: Headers): Response =>
  ({
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: headers ?? makeHeaders(),
    json: async () => data,
  }) as unknown as Response;

/* ------------------------------------------------------------------ */
/*  tests                                                             */
/* ------------------------------------------------------------------ */

describe('mihtnelisAgentStream', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetModules();
    buildReplayHeadersMock.mockClear();
    resolveClientVersionMock.mockClear();
    buildReplayHeadersMock.mockReturnValue({
      'X-Timestamp': '1234567890',
      'X-Nonce': 'abcdef1234567890abcdef1234567890',
    });
    resolveClientVersionMock.mockResolvedValue('1.0.0');

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  /* ============================================================= */
  /*  streamMihtnelisAgent                                          */
  /* ============================================================= */

  describe('streamMihtnelisAgent', () => {
    it('throws when token is empty', async () => {
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: '', message: 'hello' }))
        .rejects.toThrow('未登录');
    });

    it('throws when token is whitespace only', async () => {
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: '   ', message: 'hello' }))
        .rejects.toThrow('未登录');
    });

    it('throws when message is empty', async () => {
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: 'tok', message: '' }))
        .rejects.toThrow('message 不能为空');
    });

    it('throws when message is whitespace only', async () => {
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: 'tok', message: '   ' }))
        .rejects.toThrow('message 不能为空');
    });

    it('calls fetch with correct URL and headers', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: hello\n\n'),
      );

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({ token: 'my-token', message: 'hi' });

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, opts] = fetchMock.mock.calls[0];

      expect(url).toBe(`${BASE_URL}/v1/user/ai/agent/stream`);
      expect(opts.method).toBe('POST');
      expect(opts.headers.Accept).toBe('text/event-stream');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer my-token');
      expect(opts.headers['X-App-Name']).toBe('eisland');
      expect(opts.headers['X-Timestamp']).toBe('1234567890');
      expect(opts.headers['X-Nonce']).toBe('abcdef1234567890abcdef1234567890');
      expect(opts.headers['X-Client-Version']).toBe('1.0.0');

      const body = JSON.parse(opts.body);
      expect(body.message).toBe('hi');
    });

    it('omits X-Client-Version header when version resolves to falsy', async () => {
      resolveClientVersionMock.mockResolvedValue(null);
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: hello\n\n'),
      );

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({ token: 'tok', message: 'hi' });

      const [, opts] = fetchMock.mock.calls[0];
      expect(opts.headers['X-Client-Version']).toBeUndefined();
    });

    it('throws on non-ok response with body text', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(502, 'Bad Gateway'));

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: 'tok', message: 'hi' }))
        .rejects.toThrow('502');
    });

    it('throws on non-ok response with status code', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(403, ''));

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await expect(streamMihtnelisAgent({ token: 'tok', message: 'hi' }))
        .rejects.toThrow('403');
    });

    it('parses SSE chunk events correctly', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: hello world\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('chunk');
      expect(events[0].payload).toBe('hello world');
    });

    it('parses JSON payload in SSE data field', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: final\ndata: {"content":"done","count":3}\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('final');
      expect(events[0].payload).toMatchObject({ content: 'done', count: 3 });
    });

    it('parses multiple SSE events from a single chunk', async () => {
      const sse = [
        'event: meta',
        'data: {"model":"gpt-4o"}',
        '',
        'event: chunk',
        'data: part1',
        '',
        'event: chunk',
        'data: part2',
        '',
      ].join('\n');
      fetchMock.mockResolvedValue(makeOkResponse(sse));

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('meta');
      expect(events[1].type).toBe('chunk');
      expect(events[1].payload).toBe('part1');
      expect(events[2].type).toBe('chunk');
      expect(events[2].payload).toBe('part2');
    });

    it('ignores unknown event types', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: unknown_type\ndata: ignored\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(0);
    });

    it('ignores lines without event or data prefix', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('id: 123\nevent: chunk\ndata: hello\nretry: 5000\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('chunk');
      expect(events[0].payload).toBe('hello');
    });

    it('resets current event type on blank line separator', async () => {
      const sse = [
        'event: chunk',
        'data: first',
        '',
        'data: second',
        '',
      ].join('\n');
      fetchMock.mockResolvedValue(makeOkResponse(sse));

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('chunk');
      expect(events[0].payload).toBe('first');
    });

    it('handles data with JSON array payload', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: tool\ndata: [1,2,3]\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('tool');
      expect(events[0].payload).toEqual([1, 2, 3]);
    });

    it('handles data with non-JSON text payload', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: think\ndata: just plain text\n\n'),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('think');
      expect(events[0].payload).toBe('just plain text');
    });

    it('injects traceId into final event from response headers', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse(
          'event: final\ndata: {"content":"done"}\n\n',
          makeHeaders({ 'x-trace-id': 'server-trace-42' }),
        ),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(1);
      const payload = events[0].payload as Record<string, unknown>;
      expect(payload.traceId).toBe('server-trace-42');
      expect(payload.content).toBe('done');
    });

    it('preserves existing traceId in final event payload', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse(
          'event: final\ndata: {"content":"done","traceId":"client-trace"}\n\n',
        ),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      const payload = events[0].payload as Record<string, unknown>;
      expect(payload.traceId).toBe('client-trace');
    });

    it('does not inject traceId into non-final events', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse(
          'event: chunk\ndata: {"content":"partial"}\n\n',
          makeHeaders({ 'x-trace-id': 'server-trace-99' }),
        ),
      );

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      const payload = events[0].payload as Record<string, unknown>;
      expect(payload.traceId).toBeUndefined();
    });

    it('passes signal option to fetch', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: ok\n\n'),
      );

      const controller = new AbortController();
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        signal: controller.signal,
      });

      const [, opts] = fetchMock.mock.calls[0];
      expect(opts.signal).toBe(controller.signal);
    });

    it('does not call onEvent when no events are received', async () => {
      fetchMock.mockResolvedValue(makeOkResponse(''));

      const onEvent = vi.fn();
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({ token: 'tok', message: 'hi', onEvent });

      expect(onEvent).not.toHaveBeenCalled();
    });

    it('sends request body with all optional fields', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: ok\n\n'),
      );

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        sessionId: 'sess-1',
        provider: 'openai',
        model: 'gpt-4o',
        agentMode: 'chat',
        context: 'ctx',
        workspaces: ['ws1'],
        skills: [{ name: 's1', content: 'c1' }],
        thinking: true,
        reasoningEffort: 'high',
        timestamp: '2026-01-01',
        location: 'CN',
        snapshotMode: true,
        customApiKey: 'key',
        customEndpoint: 'https://custom.api',
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.sessionId).toBe('sess-1');
      expect(body.provider).toBe('openai');
      expect(body.model).toBe('gpt-4o');
      expect(body.agentMode).toBe('chat');
      expect(body.context).toBe('ctx');
      expect(body.workspaces).toEqual(['ws1']);
      expect(body.skills).toEqual([{ name: 's1', content: 'c1' }]);
      expect(body.thinking).toBe(true);
      expect(body.reasoningEffort).toBe('high');
      expect(body.timestamp).toBe('2026-01-01');
      expect(body.location).toBe('CN');
      expect(body.snapshotMode).toBe(true);
      expect(body.customApiKey).toBe('key');
      expect(body.customEndpoint).toBe('https://custom.api');
    });

    it('omits empty arrays and falsy optional fields from body', async () => {
      fetchMock.mockResolvedValue(
        makeOkResponse('event: chunk\ndata: ok\n\n'),
      );

      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        workspaces: [],
        skills: [],
        thinking: false,
        snapshotMode: false,
        customApiKey: '  ',
        customEndpoint: '  ',
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.workspaces).toBeUndefined();
      expect(body.skills).toBeUndefined();
      expect(body.thinking).toBe(false);
      expect(body.snapshotMode).toBeUndefined();
      expect(body.customApiKey).toBeUndefined();
      expect(body.customEndpoint).toBeUndefined();
    });

    it('handles multi-chunk SSE stream across multiple reader.read() calls', async () => {
      const chunk1 = 'event: meta\ndata: {"model":"gpt"}\n\n';
      const chunk2 = 'event: chunk\ndata: hello\n\nevent: final\ndata: {"done":true}\n\n';
      const encoder = new TextEncoder();
      const encoded1 = encoder.encode(chunk1);
      const encoded2 = encoder.encode(chunk2);

      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: makeHeaders(),
        body: {
          getReader: () => {
            let index = 0;
            const chunks = [encoded1, encoded2];
            return {
              read: async () => {
                if (index >= chunks.length) return { done: true, value: undefined };
                return { done: false, value: chunks[index++] };
              },
            };
          },
        },
      } as unknown as Response;

      fetchMock.mockResolvedValue(response);

      const events: Array<{ type: string; payload: unknown }> = [];
      const { streamMihtnelisAgent } = await import('../mihtnelisAgentStream');
      await streamMihtnelisAgent({
        token: 'tok',
        message: 'hi',
        onEvent: (e) => events.push(e),
      });

      expect(events).toHaveLength(3);
      expect(events[0].type).toBe('meta');
      expect(events[1].type).toBe('chunk');
      expect(events[1].payload).toBe('hello');
      expect(events[2].type).toBe('final');
    });
  });

  /* ============================================================= */
  /*  resolveMihtnelisWebAccess                                     */
  /* ============================================================= */

  describe('resolveMihtnelisWebAccess', () => {
    it('throws when token is empty', async () => {
      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisWebAccess({ token: '', requestId: 'r1', allow: true }))
        .rejects.toThrow('未登录');
    });

    it('throws when requestId is empty', async () => {
      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisWebAccess({ token: 'tok', requestId: '', allow: true }))
        .rejects.toThrow('requestId 不能为空');
    });

    it('throws when requestId is whitespace only', async () => {
      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisWebAccess({ token: 'tok', requestId: '   ', allow: true }))
        .rejects.toThrow('requestId 不能为空');
    });

    it('calls fetch with correct URL and method', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisWebAccess({ token: 'tok', requestId: 'r1', allow: true });

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/v1/user/ai/agent/web-access/resolve`);
      expect(opts.method).toBe('POST');
      expect(opts.headers.Accept).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer tok');
      expect(opts.headers['X-App-Name']).toBe('eisland');
      expect(opts.headers['X-Client-Version']).toBe('1.0.0');
    });

    it('sends requestId and allow in body', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisWebAccess({ token: 'tok', requestId: 'req-42', allow: false });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.requestId).toBe('req-42');
      expect(body.allow).toBe(false);
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(500, 'Internal Error'));

      const { resolveMihtnelisWebAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisWebAccess({ token: 'tok', requestId: 'r1', allow: true }))
        .rejects.toThrow('500');
    });
  });

  /* ============================================================= */
  /*  resolveMihtnelisLocalToolResult                               */
  /* ============================================================= */

  describe('resolveMihtnelisLocalToolResult', () => {
    it('throws when token is empty', async () => {
      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolResult({
        token: '', requestId: 'r1', success: true, result: {}, error: '', durationMs: 100,
      })).rejects.toThrow('未登录');
    });

    it('throws when requestId is empty', async () => {
      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolResult({
        token: 'tok', requestId: '', success: true, result: {}, error: '', durationMs: 100,
      })).rejects.toThrow('requestId 不能为空');
    });

    it('calls fetch with correct URL', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisLocalToolResult({
        token: 'tok', requestId: 'r1', success: true, result: {}, error: '', durationMs: 100,
      });

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/v1/user/ai/agent/tool-result`);
    });

    it('sends correct body with success/result/error/durationMs', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisLocalToolResult({
        token: 'tok',
        requestId: 'r1',
        success: true,
        result: { output: 'ok' },
        error: '',
        durationMs: 250,
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.requestId).toBe('r1');
      expect(body.success).toBe(true);
      expect(body.result).toEqual({ output: 'ok' });
      expect(body.error).toBe('');
      expect(body.durationMs).toBe(250);
    });

    it('defaults result to empty object and durationMs to 0 when omitted', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisLocalToolResult({
        token: 'tok', requestId: 'r1', success: false,
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.result).toEqual({});
      expect(body.error).toBe('');
      expect(body.durationMs).toBe(0);
    });

    it('clamps negative durationMs to 0', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisLocalToolResult({
        token: 'tok', requestId: 'r1', success: true, durationMs: -50,
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.durationMs).toBe(0);
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(422, 'Validation failed'));

      const { resolveMihtnelisLocalToolResult } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolResult({
        token: 'tok', requestId: 'r1', success: true, result: {}, error: '', durationMs: 100,
      })).rejects.toThrow('422');
    });
  });

  /* ============================================================= */
  /*  resolveMihtnelisLocalToolAccess                               */
  /* ============================================================= */

  describe('resolveMihtnelisLocalToolAccess', () => {
    it('throws when token is empty', async () => {
      const { resolveMihtnelisLocalToolAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolAccess({ token: '', requestId: 'r1', allow: true }))
        .rejects.toThrow('未登录');
    });

    it('throws when requestId is empty', async () => {
      const { resolveMihtnelisLocalToolAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolAccess({ token: 'tok', requestId: '', allow: true }))
        .rejects.toThrow('requestId 不能为空');
    });

    it('calls fetch with correct URL and body', async () => {
      fetchMock.mockResolvedValue({ ok: true, status: 200, text: async () => '' });

      const { resolveMihtnelisLocalToolAccess } = await import('../mihtnelisAgentStream');
      await resolveMihtnelisLocalToolAccess({ token: 'tok', requestId: 'r1', allow: true });

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/v1/user/ai/agent/local-tool/resolve`);
      expect(opts.method).toBe('POST');

      const body = JSON.parse(opts.body);
      expect(body.requestId).toBe('r1');
      expect(body.allow).toBe(true);
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(500, 'Server Error'));

      const { resolveMihtnelisLocalToolAccess } = await import('../mihtnelisAgentStream');
      await expect(resolveMihtnelisLocalToolAccess({ token: 'tok', requestId: 'r1', allow: true }))
        .rejects.toThrow('500');
    });
  });

  /* ============================================================= */
  /*  fetchAgentPrompt                                              */
  /* ============================================================= */

  describe('fetchAgentPrompt', () => {
    it('throws when token is empty', async () => {
      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: '' }))
        .rejects.toThrow('未登录');
    });

    it('throws when token is whitespace only', async () => {
      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: '   ' }))
        .rejects.toThrow('未登录');
    });

    it('calls fetch with correct URL and method', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: true, systemPrompt: 'You are a helpful assistant.' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await fetchAgentPrompt({ token: 'tok' });

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe(`${BASE_URL}/v1/user/ai/agent/prompt`);
      expect(opts.method).toBe('POST');
      expect(opts.headers.Accept).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer tok');
      expect(opts.headers['X-App-Name']).toBe('eisland');
      expect(opts.headers['X-Client-Version']).toBe('1.0.0');
    });

    it('returns systemPrompt on success', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: true, systemPrompt: 'You are an agent.' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      const result = await fetchAgentPrompt({ token: 'tok' });

      expect(result.success).toBe(true);
      expect(result.systemPrompt).toBe('You are an agent.');
    });

    it('sends optional fields in request body', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: true, systemPrompt: 'p' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await fetchAgentPrompt({
        token: 'tok',
        agentMode: 'chat',
        snapshotMode: true,
        localMode: true,
        workspaces: ['ws1'],
        skills: [{ name: 's1', content: 'c1' }],
      });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.agentMode).toBe('chat');
      expect(body.snapshotMode).toBe(true);
      expect(body.localMode).toBe(true);
      expect(body.workspaces).toEqual(['ws1']);
      expect(body.skills).toEqual([{ name: 's1', content: 'c1' }]);
    });

    it('omits falsy optional fields from body', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: true, systemPrompt: 'p' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await fetchAgentPrompt({ token: 'tok', snapshotMode: false, localMode: false, workspaces: [], skills: [] });

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.agentMode).toBeUndefined();
      expect(body.snapshotMode).toBeUndefined();
      expect(body.localMode).toBeUndefined();
      expect(body.workspaces).toBeUndefined();
      expect(body.skills).toBeUndefined();
    });

    it('throws on non-ok response', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(500, 'Server Error'));

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: 'tok' }))
        .rejects.toThrow('500');
    });

    it('extracts error detail from JSON error body on non-ok response', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: makeHeaders(),
        text: async () => JSON.stringify({ error: 'Invalid agent mode' }),
      } as unknown as Response);

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: 'tok' }))
        .rejects.toThrow('Invalid agent mode');
    });

    it('throws when response is ok but success is false', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: false, systemPrompt: '', error: 'prompt generation failed' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: 'tok' }))
        .rejects.toThrow('prompt generation failed');
    });

    it('throws default message when success is false and error is empty', async () => {
      fetchMock.mockResolvedValue(
        makeJsonOkResponse({ success: false, systemPrompt: '' }),
      );

      const { fetchAgentPrompt } = await import('../mihtnelisAgentStream');
      await expect(fetchAgentPrompt({ token: 'tok' }))
        .rejects.toThrow('获取 agent prompt 失败');
    });
  });
});
