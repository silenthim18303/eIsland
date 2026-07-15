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
 * @file chatUtils.test.ts
 * @description chatUtils 单元测试。
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AiChatMessage } from '../../../../../../../store/types';

/* ------------------------------------------------------------------ */
/*  helpers                                                           */
/* ------------------------------------------------------------------ */

const makeStreamResponse = (body: string): Response => {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(body);
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
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

const makeMultiChunkStreamResponse = (chunks: string[]): Response => {
  const encoder = new TextEncoder();
  const encodedChunks = chunks.map((c) => encoder.encode(c));
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers(),
    body: {
      getReader: () => {
        let index = 0;
        return {
          read: async () => {
            if (index >= encodedChunks.length)
              return { done: true, value: undefined };
            return { done: false, value: encodedChunks[index++] };
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
    headers: new Headers(),
    text: async () => body,
  }) as unknown as Response;

/* ------------------------------------------------------------------ */
/*  tests                                                             */
/* ------------------------------------------------------------------ */

describe('chatUtils', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  /* ============================================================= */
  /*  MAX_MIHTNELIS_CONTEXT_CHARS                                   */
  /* ============================================================= */

  describe('MAX_MIHTNELIS_CONTEXT_CHARS', () => {
    it('is exported as a number constant', async () => {
      const mod = await import('../chatUtils');
      expect(typeof mod.MAX_MIHTNELIS_CONTEXT_CHARS).toBe('number');
    });

    it('equals 1_000_000', async () => {
      const mod = await import('../chatUtils');
      expect(mod.MAX_MIHTNELIS_CONTEXT_CHARS).toBe(1_000_000);
    });
  });

  /* ============================================================= */
  /*  buildMihtnelisContext                                         */
  /* ============================================================= */

  describe('buildMihtnelisContext', () => {
    it('returns empty string for non-array input', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      expect(buildMihtnelisContext(null as unknown as AiChatMessage[])).toBe('');
      expect(buildMihtnelisContext(undefined as unknown as AiChatMessage[])).toBe('');
      expect(buildMihtnelisContext('str' as unknown as AiChatMessage[])).toBe('');
    });

    it('returns empty string for empty array', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      expect(buildMihtnelisContext([])).toBe('');
    });

    it('skips messages with empty or whitespace-only content', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'user', content: '' },
        { role: 'assistant', content: '   ' },
        { role: 'user', content: 'hello' },
      ];
      expect(buildMihtnelisContext(messages)).toBe('user: hello');
    });

    it('skips messages with non-string content', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages = [
        { role: 'user', content: 123 },
        { role: 'assistant', content: 'hi' },
      ] as unknown as AiChatMessage[];
      expect(buildMihtnelisContext(messages)).toBe('assistant: hi');
    });

    it('maps non-assistant roles to "user"', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'user' as AiChatMessage['role'], content: 'q' },
      ];
      expect(buildMihtnelisContext(messages)).toBe('user: q');
    });

    it('maps assistant role correctly', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'assistant', content: 'answer' },
      ];
      expect(buildMihtnelisContext(messages)).toBe('assistant: answer');
    });

    it('trims content from each message', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'user', content: '  hello  ' },
        { role: 'assistant', content: '  world  ' },
      ];
      const result = buildMihtnelisContext(messages);
      expect(result).toBe('user: hello\n\nassistant: world');
    });

    it('preserves chronological order', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'user', content: 'first' },
        { role: 'assistant', content: 'second' },
        { role: 'user', content: 'third' },
      ];
      const result = buildMihtnelisContext(messages);
      expect(result).toBe('user: first\n\nassistant: second\n\nuser: third');
    });

    it('truncates context from the beginning when exceeding MAX_MIHTNELIS_CONTEXT_CHARS', async () => {
      const { buildMihtnelisContext, MAX_MIHTNELIS_CONTEXT_CHARS } =
        await import('../chatUtils');
      const bigContent = 'x'.repeat(MAX_MIHTNELIS_CONTEXT_CHARS + 500);
      const messages: AiChatMessage[] = [
        { role: 'user', content: 'old message' },
        { role: 'assistant', content: bigContent },
      ];
      const result = buildMihtnelisContext(messages);
      expect(result.length).toBeLessThanOrEqual(MAX_MIHTNELIS_CONTEXT_CHARS);
      expect(result).toContain('x'.repeat(100));
    });

    it('breaks early when roughLength exceeds cap + 4096', async () => {
      const { buildMihtnelisContext, MAX_MIHTNELIS_CONTEXT_CHARS } =
        await import('../chatUtils');
      const bigContent = 'a'.repeat(MAX_MIHTNELIS_CONTEXT_CHARS + 5000);
      const messages: AiChatMessage[] = [
        { role: 'user', content: 'small' },
        { role: 'assistant', content: bigContent },
      ];
      const result = buildMihtnelisContext(messages);
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('returns empty string when all messages have empty content', async () => {
      const { buildMihtnelisContext } = await import('../chatUtils');
      const messages: AiChatMessage[] = [
        { role: 'user', content: '' },
        { role: 'assistant', content: '   ' },
      ];
      expect(buildMihtnelisContext(messages)).toBe('');
    });
  });

  /* ============================================================= */
  /*  unwrapJsonEnvelope                                            */
  /* ============================================================= */

  describe('unwrapJsonEnvelope', () => {
    it('returns non-JSON string as-is', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      expect(unwrapJsonEnvelope('hello world')).toBe('hello world');
    });

    it('returns string without braces as-is', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      expect(unwrapJsonEnvelope('[1, 2, 3]')).toBe('[1, 2, 3]');
    });

    it('returns content that starts with { but not ends with } as-is', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      expect(unwrapJsonEnvelope('{ not closed')).toBe('{ not closed');
    });

    it('extracts answer from valid JSON envelope', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = JSON.stringify({ answer: 'the answer', other: 'data' });
      expect(unwrapJsonEnvelope(envelope)).toBe('the answer');
    });

    it('returns original content when JSON has no answer field', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = JSON.stringify({ result: 'no answer field' });
      expect(unwrapJsonEnvelope(envelope)).toBe(envelope);
    });

    it('returns original content when answer is empty string', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = JSON.stringify({ answer: '' });
      expect(unwrapJsonEnvelope(envelope)).toBe(envelope);
    });

    it('returns original content when answer is whitespace only', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = JSON.stringify({ answer: '   ' });
      expect(unwrapJsonEnvelope(envelope)).toBe(envelope);
    });

    it('repairs control characters (newlines) inside JSON strings', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const brokenJson = '{"answer":"line1\nline2"}';
      expect(unwrapJsonEnvelope(brokenJson)).toBe('line1\nline2');
    });

    it('repairs tabs inside JSON strings', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const brokenJson = '{"answer":"col1\tcol2"}';
      expect(unwrapJsonEnvelope(brokenJson)).toBe('col1\tcol2');
    });

    it('repairs carriage returns inside JSON strings', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const brokenJson = '{"answer":"line1\rline2"}';
      expect(unwrapJsonEnvelope(brokenJson)).toBe('line1\rline2');
    });

    it('preserves already-escaped control characters', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = '{"answer":"line1\\\\nline2"}';
      expect(unwrapJsonEnvelope(envelope)).toBe('line1\\nline2');
    });

    it('handles answer containing Chinese characters', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = JSON.stringify({ answer: '你好世界' });
      expect(unwrapJsonEnvelope(envelope)).toBe('你好世界');
    });

    it('returns original when repair also fails to parse', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const broken = '{"answer": "unterminated';
      expect(unwrapJsonEnvelope(broken)).toBe(broken);
    });

    it('trims whitespace before checking envelope', async () => {
      const { unwrapJsonEnvelope } = await import('../chatUtils');
      const envelope = '  {"answer":"ok"}  ';
      expect(unwrapJsonEnvelope(envelope)).toBe('ok');
    });
  });

  /* ============================================================= */
  /*  toPrettyJson                                                  */
  /* ============================================================= */

  describe('toPrettyJson', () => {
    it('returns "{}" for null', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      expect(toPrettyJson(null)).toBe('{}');
    });

    it('returns "{}" for undefined', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      expect(toPrettyJson(undefined)).toBe('{}');
    });

    it('returns string values as-is', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      expect(toPrettyJson('hello')).toBe('hello');
    });

    it('pretty-prints an object with 2-space indent', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      const obj = { a: 1, b: [2, 3] };
      const result = toPrettyJson(obj);
      expect(result).toBe(JSON.stringify(obj, null, 2));
    });

    it('pretty-prints an array', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      const arr = [1, 2, 3];
      expect(toPrettyJson(arr)).toBe('[\n  1,\n  2,\n  3\n]');
    });

    it('returns String(value) when JSON.stringify throws', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      const circular: Record<string, unknown> = {};
      circular.self = circular;
      const result = toPrettyJson(circular);
      expect(result).toBe(String(circular));
    });

    it('pretty-prints a number', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      expect(toPrettyJson(42)).toBe('42');
    });

    it('pretty-prints a boolean', async () => {
      const { toPrettyJson } = await import('../chatUtils');
      expect(toPrettyJson(true)).toBe('true');
    });
  });

  /* ============================================================= */
  /*  normalizeMarkdownCodeFences                                   */
  /* ============================================================= */

  describe('normalizeMarkdownCodeFences', () => {
    it('returns empty string as-is', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      expect(normalizeMarkdownCodeFences('')).toBe('');
    });

    it('returns content without backticks as-is', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      expect(normalizeMarkdownCodeFences('no fences here')).toBe('no fences here');
    });

    it('inserts newline before fence preceded by whitespace and text before newline', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = 'some text ```\ncode\n```';
      const result = normalizeMarkdownCodeFences(input);
      expect(result).toBe('some text\n```\ncode\n```');
    });

    it('does not add newline when fence is already on its own line', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = 'text\n```js\ncode\n```';
      expect(normalizeMarkdownCodeFences(input)).toBe(input);
    });

    it('handles fence at end of string with preceding whitespace', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = 'some text ```';
      const result = normalizeMarkdownCodeFences(input);
      expect(result).toBe('some text\n```');
    });

    it('handles CRLF line endings', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = 'text\r\n```js\r\ncode\r\n```';
      const result = normalizeMarkdownCodeFences(input);
      expect(result).toBe(input);
    });

    it('preserves multiple fences that are already properly formatted', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = '```js\ncode1\n```\n\n```py\ncode2\n```';
      expect(normalizeMarkdownCodeFences(input)).toBe(input);
    });

    it('fixes multiple fences missing newlines', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      const input = 'text1 ```\ncode1\n```\ntext2 ```\ncode2\n```';
      const result = normalizeMarkdownCodeFences(input);
      expect(result).toBe('text1\n```\ncode1\n```\ntext2\n```\ncode2\n```');
    });

    it('returns null/undefined as-is', async () => {
      const { normalizeMarkdownCodeFences } = await import('../chatUtils');
      expect(normalizeMarkdownCodeFences(null as unknown as string)).toBe(null);
      expect(normalizeMarkdownCodeFences(undefined as unknown as string)).toBe(undefined);
    });
  });

  /* ============================================================= */
  /*  streamChatCompletion                                          */
  /* ============================================================= */

  describe('streamChatCompletion', () => {
    const endpoint = 'https://api.example.com/v1';
    const apiKey = 'test-key';
    const model = 'gpt-4';
    const messages = [{ role: 'user', content: 'hi' }];
    const errorMessages = {
      apiRequestFailed: 'API request failed: {{status}} - {{detail}}',
      cannotReadResponseStream: 'Cannot read response stream',
    };

    it('calls fetch with correct URL and headers', async () => {
      fetchMock.mockResolvedValue(makeStreamResponse(''));
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages);

      expect(fetchMock).toHaveBeenCalledOnce();
      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.example.com/v1/chat/completions');
      expect(opts.method).toBe('POST');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer test-key');
      expect(opts.signal).toBeInstanceOf(AbortSignal);
    });

    it('strips trailing slashes from endpoint', async () => {
      fetchMock.mockResolvedValue(makeStreamResponse(''));
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion('https://api.example.com/v1///', apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages);

      const [url] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.example.com/v1/chat/completions');
    });

    it('sends stream: true in request body', async () => {
      fetchMock.mockResolvedValue(makeStreamResponse(''));
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages);

      const [, opts] = fetchMock.mock.calls[0];
      const body = JSON.parse(opts.body);
      expect(body.model).toBe('gpt-4');
      expect(body.stream).toBe(true);
      expect(body.messages).toEqual(messages);
    });

    it('calls onChunk for each delta content in SSE stream', async () => {
      const sse = 'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" World"}}]}\n\n';
      fetchMock.mockResolvedValue(makeStreamResponse(sse));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(2);
      expect(onChunk).toHaveBeenCalledWith('Hello');
      expect(onChunk).toHaveBeenCalledWith(' World');
    });

    it('stops processing on [DONE] marker', async () => {
      const sse = 'data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n\n';
      fetchMock.mockResolvedValue(makeStreamResponse(sse));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith('ok');
    });

    it('skips malformed JSON chunks', async () => {
      const sse = 'data: {invalid json}\n\ndata: {"choices":[{"delta":{"content":"valid"}}]}\n\n';
      fetchMock.mockResolvedValue(makeStreamResponse(sse));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith('valid');
    });

    it('skips chunks without delta content', async () => {
      const sse = 'data: {"choices":[{"delta":{}}]}\n\ndata: {"choices":[{"delta":{"content":"text"}}]}\n\n';
      fetchMock.mockResolvedValue(makeStreamResponse(sse));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith('text');
    });

    it('skips lines that do not start with "data: "', async () => {
      const sse = 'event: ping\nid: 1\n\ndata: {"choices":[{"delta":{"content":"ok"}}]}\n\n';
      fetchMock.mockResolvedValue(makeStreamResponse(sse));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith('ok');
    });

    it('throws on non-ok response with status and body', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(401, 'Unauthorized'));
      const { streamChatCompletion } = await import('../chatUtils');
      await expect(
        streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages),
      ).rejects.toThrow('401');
    });

    it('uses statusText when body is empty on error', async () => {
      const response = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        text: async () => '',
      } as unknown as Response;
      fetchMock.mockResolvedValue(response);

      const { streamChatCompletion } = await import('../chatUtils');
      await expect(
        streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages),
      ).rejects.toThrow('Internal Server Error');
    });

    it('throws when body.getReader returns null', async () => {
      const response = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Headers(),
        body: null,
      } as unknown as Response;
      fetchMock.mockResolvedValue(response);

      const { streamChatCompletion } = await import('../chatUtils');
      await expect(
        streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages),
      ).rejects.toThrow('Cannot read response stream');
    });

    it('handles data split across multiple read() calls', async () => {
      const chunk1 = 'data: {"choices":[{"delta":{"content":"Hel';
      const chunk2 = 'lo"}}]}\n\n';
      fetchMock.mockResolvedValue(makeMultiChunkStreamResponse([chunk1, chunk2]));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).toHaveBeenCalledTimes(1);
      expect(onChunk).toHaveBeenCalledWith('Hello');
    });

    it('replaces {{status}} and {{detail}} in error message', async () => {
      fetchMock.mockResolvedValue(makeErrorResponse(422, 'Validation Error'));
      const { streamChatCompletion } = await import('../chatUtils');
      await expect(
        streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), new AbortController().signal, errorMessages),
      ).rejects.toThrow('API request failed: 422 - Validation Error');
    });

    it('does not call onChunk when stream is empty', async () => {
      fetchMock.mockResolvedValue(makeStreamResponse(''));
      const onChunk = vi.fn();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, onChunk, new AbortController().signal, errorMessages);

      expect(onChunk).not.toHaveBeenCalled();
    });

    it('passes abort signal to fetch', async () => {
      fetchMock.mockResolvedValue(makeStreamResponse(''));
      const controller = new AbortController();
      const { streamChatCompletion } = await import('../chatUtils');
      await streamChatCompletion(endpoint, apiKey, model, messages, vi.fn(), controller.signal, errorMessages);

      const [, opts] = fetchMock.mock.calls[0];
      expect(opts.signal).toBe(controller.signal);
    });
  });
});
