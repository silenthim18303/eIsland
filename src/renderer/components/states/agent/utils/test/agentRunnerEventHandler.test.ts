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
 * @file agentRunnerEventHandler.test.ts
 * @description agentRunnerEventHandler 单元测试。
 * @author 鸡哥
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ------------------------------------------------------------------ */
/*  hoisted mocks                                                     */
/* ------------------------------------------------------------------ */

const { resolveMihtnelisLocalToolResultMock, isClientLocalToolNameMock, isHighRiskLocalToolNameMock } = vi.hoisted(() => ({
  resolveMihtnelisLocalToolResultMock: vi.fn(async () => {}),
  isClientLocalToolNameMock: vi.fn(() => false),
  isHighRiskLocalToolNameMock: vi.fn(() => false),
}));

vi.mock('../../../../../api/ai/mihtnelisAgentStream', () => ({
  resolveMihtnelisLocalToolResult: resolveMihtnelisLocalToolResultMock,
}));

vi.mock('../agentToolPolicy', () => ({
  isClientLocalToolName: isClientLocalToolNameMock,
  isHighRiskLocalToolName: isHighRiskLocalToolNameMock,
}));

/* ------------------------------------------------------------------ */
/*  types & helpers                                                   */
/* ------------------------------------------------------------------ */

type AgentPhase = 'connecting' | 'thinking' | 'toolCalling' | 'answering' | 'done' | 'error';
type AuthPending = { type: 'web' | 'tool'; requestId: string; description: string; tool?: string; argumentsPayload?: Record<string, unknown> };

interface CreateAgentStreamEventHandlerOptions {
  isActive: () => boolean;
  isOllama: boolean;
  token: string;
  workspaces: string[];
  setPhase: (v: AgentPhase | ((prev: AgentPhase) => AgentPhase)) => void;
  setThinkText: (v: string | ((prev: string) => string)) => void;
  setAnswerText: (v: string | ((prev: string) => string)) => void;
  setErrorMsg: (v: string | ((prev: string) => string)) => void;
  setAuthPending: (v: AuthPending | null | ((prev: AuthPending | null) => AuthPending | null)) => void;
  setToolCallInfo: (v: { tool: string; purpose: string } | null) => void;
  answerAccRef: { current: string };
  thinkAccRef: { current: string };
  traceIdRef: { current: string };
}

function createOptions(overrides?: Partial<CreateAgentStreamEventHandlerOptions>): CreateAgentStreamEventHandlerOptions {
  return {
    isActive: () => true,
    isOllama: false,
    token: 'test-token',
    workspaces: ['/workspace'],
    setPhase: vi.fn(),
    setThinkText: vi.fn(),
    setAnswerText: vi.fn(),
    setErrorMsg: vi.fn(),
    setAuthPending: vi.fn(),
    setToolCallInfo: vi.fn(),
    answerAccRef: { current: '' },
    thinkAccRef: { current: '' },
    traceIdRef: { current: '' },
    ...overrides,
  };
}

type StreamEvent = { type: string; payload?: unknown };

function makeEvent(type: string, payload?: unknown): StreamEvent {
  return { type, payload };
}

/** Dynamically import the module so vi.mock wiring applies correctly. */
async function loadHandler(options?: Partial<CreateAgentStreamEventHandlerOptions>) {
  const mod = await import('../agentRunnerEventHandler');
  const opts = createOptions(options);
  const handler = mod.createAgentStreamEventHandler(opts);
  return { handler, opts };
}

/* ------------------------------------------------------------------ */
/*  tests                                                             */
/* ------------------------------------------------------------------ */

describe('createAgentStreamEventHandler', () => {
  beforeEach(() => {
    // Reset window.api mock
    const g = globalThis as Record<string, Record<string, unknown>>;
    g.window = g.window ?? {};
    g.window.api = undefined;
  });

  /* ========== isActive guard ========== */

  describe('isActive guard', () => {
    it('skips all processing when isActive returns false', async () => {
      const { handler, opts } = await loadHandler({ isActive: () => false });
      handler(makeEvent('think', { text: 'hello' }));
      expect(opts.setPhase).not.toHaveBeenCalled();
      expect(opts.setThinkText).not.toHaveBeenCalled();
    });
  });

  /* ========== think event ========== */

  describe('think event', () => {
    it('sets phase to thinking and accumulates text', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('think', { text: 'abc' }));
      expect(opts.setPhase).toHaveBeenCalledWith('thinking');
      expect(opts.thinkAccRef.current).toBe('abc');
      expect(opts.setThinkText).toHaveBeenCalledWith(expect.any(Function));
    });

    it('calls setThinkText with functional updater that appends', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('think', { text: 'abc' }));
      const updater = (opts.setThinkText as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(updater('prev')).toBe('prevabc');
    });

    it('ignores non-string payload.text', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('think', { text: 123 }));
      expect(opts.thinkAccRef.current).toBe('');
      expect(opts.setThinkText).not.toHaveBeenCalled();
    });

    it('ignores empty string text', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('think', { text: '' }));
      expect(opts.thinkAccRef.current).toBe('');
      expect(opts.setThinkText).not.toHaveBeenCalled();
    });

    it('handles missing payload gracefully', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('think'));
      expect(opts.setPhase).toHaveBeenCalledWith('thinking');
      expect(opts.thinkAccRef.current).toBe('');
    });
  });

  /* ========== chunk event ========== */

  describe('chunk event', () => {
    it('sets phase to answering and clears toolCallInfo', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('chunk', { text: 'hello' }));
      expect(opts.setPhase).toHaveBeenCalledWith('answering');
      expect(opts.setToolCallInfo).toHaveBeenCalledWith(null);
    });

    it('accumulates answer text via functional updater', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('chunk', { text: 'world' }));
      expect(opts.answerAccRef.current).toBe('world');
      const updater = (opts.setAnswerText as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(updater('prefix')).toBe('prefixworld');
    });

    it('ignores non-string payload.text', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('chunk', { text: false }));
      expect(opts.answerAccRef.current).toBe('');
      expect(opts.setAnswerText).not.toHaveBeenCalled();
    });

    it('handles missing payload gracefully', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('chunk'));
      expect(opts.setPhase).toHaveBeenCalledWith('answering');
      expect(opts.answerAccRef.current).toBe('');
    });
  });

  /* ========== chunk_reset / stream_rollback ========== */

  describe('chunk_reset event', () => {
    it('resets answer accumulator and sets empty answer text', async () => {
      const answerAccRef = { current: 'existing' };
      const { handler, opts } = await loadHandler({ answerAccRef });
      handler(makeEvent('chunk_reset'));
      expect(answerAccRef.current).toBe('');
      expect(opts.setAnswerText).toHaveBeenCalledWith('');
    });
  });

  describe('stream_rollback event', () => {
    it('resets answer accumulator (same behavior as chunk_reset)', async () => {
      const answerAccRef = { current: 'rollback-content' };
      const { handler, opts } = await loadHandler({ answerAccRef });
      handler(makeEvent('stream_rollback'));
      expect(answerAccRef.current).toBe('');
      expect(opts.setAnswerText).toHaveBeenCalledWith('');
    });
  });

  /* ========== tool event ========== */

  describe('tool event', () => {
    it('sets phase to toolCalling', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool'));
      expect(opts.setPhase).toHaveBeenCalledWith('toolCalling');
    });

    it('clears toolCallInfo when payload has success field', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool', { success: true }));
      expect(opts.setToolCallInfo).toHaveBeenCalledWith(null);
    });

    it('does not clear toolCallInfo when payload has no success field', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool', { data: 'something' }));
      expect(opts.setToolCallInfo).not.toHaveBeenCalled();
    });
  });

  /* ========== tool_call_result event ========== */

  describe('tool_call_result event', () => {
    it('clears toolCallInfo', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_result'));
      expect(opts.setToolCallInfo).toHaveBeenCalledWith(null);
    });
  });

  /* ========== tool_call_request event ========== */

  describe('tool_call_request event', () => {
    it('returns early when tool name is empty', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { tool: '', requestId: 'r1' }));
      expect(opts.setPhase).not.toHaveBeenCalled();
    });

    it('returns early when tool is missing from payload', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { requestId: 'r1' }));
      expect(opts.setPhase).not.toHaveBeenCalled();
    });

    it('sets phase to toolCalling and updates toolCallInfo', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { tool: 'myTool', purpose: 'do stuff', requestId: 'r1' }));
      expect(opts.setPhase).toHaveBeenCalledWith('toolCalling');
      expect(opts.setToolCallInfo).toHaveBeenCalledWith({ tool: 'myTool', purpose: 'do stuff' });
    });

    it('uses default purpose when purpose is empty', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { tool: 'myTool', purpose: '', requestId: 'r1' }));
      expect(opts.setToolCallInfo).toHaveBeenCalledWith({ tool: 'myTool', purpose: '调用 myTool' });
    });

    it('returns early when isOllama is true (no local tool execution)', async () => {
      const { handler, opts } = await loadHandler({ isOllama: true });
      handler(makeEvent('tool_call_request', { tool: 'local/fs_read', purpose: 'read', requestId: 'r1' }));
      expect(opts.setPhase).toHaveBeenCalledWith('toolCalling');
      expect(isClientLocalToolNameMock).not.toHaveBeenCalled();
    });

    it('returns early when tool is not a client local tool', async () => {
      isClientLocalToolNameMock.mockReturnValue(false);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { tool: 'remote/api', purpose: 'call', requestId: 'r1' }));
      expect(isClientLocalToolNameMock).toHaveBeenCalledWith('remote/api');
      // Should not reach setAuthPending or resolveMihtnelisLocalToolResult
      expect(opts.setAuthPending).not.toHaveBeenCalled();
      expect(resolveMihtnelisLocalToolResultMock).not.toHaveBeenCalled();
    });

    it('returns early when tool is local but requestId is empty', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', { tool: 'local/fs_read', purpose: 'read', requestId: '' }));
      expect(opts.setAuthPending).not.toHaveBeenCalled();
      expect(resolveMihtnelisLocalToolResultMock).not.toHaveBeenCalled();
    });

    it('sets authPending when authorizationRequired is true', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/exec',
        purpose: 'run command',
        requestId: 'req-1',
        authorizationRequired: true,
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'tool',
        requestId: 'req-1',
        description: 'run command',
        tool: 'local/exec',
        argumentsPayload: {},
      });
    });

    it('sets authPending when tool is high-risk even without explicit authorizationRequired', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      isHighRiskLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/fs_delete',
        purpose: 'delete file',
        requestId: 'req-2',
      }));
      expect(isHighRiskLocalToolNameMock).toHaveBeenCalledWith('local/fs_delete');
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'tool',
        requestId: 'req-2',
        description: 'delete file',
        tool: 'local/fs_delete',
        argumentsPayload: {},
      });
    });

    it('uses authMessage over purpose when both are provided', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/exec',
        purpose: 'do stuff',
        requestId: 'req-3',
        authorizationRequired: true,
        message: 'Custom auth message',
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'tool',
        requestId: 'req-3',
        description: 'Custom auth message',
        tool: 'local/exec',
        argumentsPayload: {},
      });
    });

    it('uses default description when both authMessage and purpose are empty', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/exec',
        purpose: '',
        requestId: 'req-4',
        authorizationRequired: true,
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'tool',
        requestId: 'req-4',
        description: '工具 local/exec 请求授权',
        tool: 'local/exec',
        argumentsPayload: {},
      });
    });

    it('parses arguments payload correctly', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const args = { path: '/tmp', recursive: true };
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/exec',
        purpose: 'run',
        requestId: 'req-5',
        authorizationRequired: true,
        arguments: args,
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith(expect.objectContaining({
        argumentsPayload: args,
      }));
    });

    it('defaults arguments to {} when not an object', async () => {
      isClientLocalToolNameMock.mockReturnValue(true);
      const { handler, opts } = await loadHandler();
      handler(makeEvent('tool_call_request', {
        tool: 'local/exec',
        purpose: 'run',
        requestId: 'req-6',
        authorizationRequired: true,
        arguments: 'not-an-object',
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith(expect.objectContaining({
        argumentsPayload: {},
      }));
    });

    describe('auto-execution (no auth needed)', () => {
      it('executes tool via window.api.executeAgentLocalTool and resolves result', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);

        const execResult = { success: true, result: { data: 42 }, durationMs: 100 };
        const executeAgentLocalTool = vi.fn(async () => execResult);
        ((globalThis as Record<string, Record<string, unknown>>).window).api = { executeAgentLocalTool };

        const { handler } = await loadHandler({ isOllama: false });

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-auto',
          arguments: { path: '/tmp/test.txt' },
        }));

        // The execution is async (fire-and-forget), so wait for it
        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });

        expect(executeAgentLocalTool).toHaveBeenCalledWith({
          tool: 'local/fs_read',
          arguments: { path: '/tmp/test.txt' },
          workspaces: ['/workspace'],
        });

        expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalledWith({
          token: 'test-token',
          requestId: 'req-auto',
          success: true,
          result: { data: 42 },
          error: '',
          durationMs: 100,
        });
      });

      it('sends error resolution when window.api.executeAgentLocalTool is unavailable', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);
        ((globalThis as Record<string, Record<string, unknown>>).window).api = {};

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-noapi',
        }));

        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });

        expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalledWith({
          token: 'test-token',
          requestId: 'req-noapi',
          success: false,
          result: {},
          error: 'LOCAL_RUNTIME_UNAVAILABLE',
          durationMs: 0,
        });
      });

      it('sends error resolution when window.api is undefined', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);
        ((globalThis as Record<string, Record<string, unknown>>).window).api = undefined;

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-undef',
        }));

        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });

        expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalledWith({
          token: 'test-token',
          requestId: 'req-undef',
          success: false,
          result: {},
          error: 'LOCAL_RUNTIME_UNAVAILABLE',
          durationMs: 0,
        });
      });

      it('handles executor returning failure result', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);

        const execResult = { success: false, result: {}, error: 'FILE_NOT_FOUND', durationMs: 50 };
        const executeAgentLocalTool = vi.fn(async () => execResult);
        ((globalThis as Record<string, Record<string, unknown>>).window).api = { executeAgentLocalTool };

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-fail',
        }));

        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });

        expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalledWith({
          token: 'test-token',
          requestId: 'req-fail',
          success: false,
          result: {},
          error: 'FILE_NOT_FOUND',
          durationMs: 50,
        });
      });

      it('handles executor returning nullish result gracefully', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);

        const executeAgentLocalTool = vi.fn(async () => null);
        ((globalThis as Record<string, Record<string, unknown>>).window).api = { executeAgentLocalTool };

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-null',
        }));

        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });

        expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalledWith({
          token: 'test-token',
          requestId: 'req-null',
          success: false,
          result: undefined,
          error: '',
          durationMs: 0,
        });
      });

      it('silently catches executor exceptions', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);

        const executeAgentLocalTool = vi.fn(async () => { throw new Error('boom'); });
        ((globalThis as Record<string, Record<string, unknown>>).window).api = { executeAgentLocalTool };

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-throw',
        }));

        // Should not throw, should not resolve
        await vi.waitFor(() => {
          expect(executeAgentLocalTool).toHaveBeenCalled();
        });

        expect(resolveMihtnelisLocalToolResultMock).not.toHaveBeenCalled();
      });

      it('silently catches resolveMihtnelisLocalToolResult exceptions', async () => {
        isClientLocalToolNameMock.mockReturnValue(true);
        isHighRiskLocalToolNameMock.mockReturnValue(false);

        const executeAgentLocalTool = vi.fn(async () => ({ success: true, result: {}, durationMs: 0 }));
        ((globalThis as Record<string, Record<string, unknown>>).window).api = { executeAgentLocalTool };
        resolveMihtnelisLocalToolResultMock.mockRejectedValueOnce(new Error('network fail'));

        const { handler } = await loadHandler();

        handler(makeEvent('tool_call_request', {
          tool: 'local/fs_read',
          purpose: 'read file',
          requestId: 'req-catch',
        }));

        // Should not throw
        await vi.waitFor(() => {
          expect(resolveMihtnelisLocalToolResultMock).toHaveBeenCalled();
        });
      });
    });
  });

  /* ========== web_access_request event ========== */

  describe('web_access_request event', () => {
    it('sets authPending with type web when requestId and url are valid', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_request', {
        requestId: 'wr-1',
        url: 'https://example.com',
        message: 'Allow access?',
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'web',
        requestId: 'wr-1',
        description: 'Allow access?',
      });
    });

    it('uses default description when message is empty', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_request', {
        requestId: 'wr-2',
        url: 'https://example.com',
      }));
      expect(opts.setAuthPending).toHaveBeenCalledWith({
        type: 'web',
        requestId: 'wr-2',
        description: '请求访问: https://example.com',
      });
    });

    it('returns early when requestId is empty', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_request', { requestId: '', url: 'https://example.com' }));
      expect(opts.setAuthPending).not.toHaveBeenCalled();
    });

    it('returns early when url is empty', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_request', { requestId: 'wr-3', url: '' }));
      expect(opts.setAuthPending).not.toHaveBeenCalled();
    });

    it('returns early when requestId is missing', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_request', { url: 'https://example.com' }));
      expect(opts.setAuthPending).not.toHaveBeenCalled();
    });
  });

  /* ========== web_access_resolved event ========== */

  describe('web_access_resolved event', () => {
    it('clears authPending when it has type web', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_resolved'));
      expect(opts.setAuthPending).toHaveBeenCalledWith(expect.any(Function));

      // Test the functional updater
      const updater = (opts.setAuthPending as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(updater({ type: 'web', requestId: 'r', description: 'd' })).toBeNull();
    });

    it('keeps authPending unchanged when it has type tool', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_resolved'));
      const updater = (opts.setAuthPending as ReturnType<typeof vi.fn>).mock.calls[0][0];
      const toolPending: AuthPending = { type: 'tool', requestId: 'r', description: 'd' };
      expect(updater(toolPending)).toBe(toolPending);
    });

    it('keeps authPending unchanged when it is null', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('web_access_resolved'));
      const updater = (opts.setAuthPending as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(updater(null)).toBeNull();
    });
  });

  /* ========== error event ========== */

  describe('error event', () => {
    it('sets phase to error and sets error message', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('error', { message: 'Something went wrong' }));
      expect(opts.setPhase).toHaveBeenCalledWith('error');
      expect(opts.setErrorMsg).toHaveBeenCalledWith('Something went wrong');
    });

    it('uses default message for non-string payload.message', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('error', { message: 42 }));
      expect(opts.setErrorMsg).toHaveBeenCalledWith('未知错误');
    });

    it('uses default message when payload is missing', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('error'));
      expect(opts.setPhase).toHaveBeenCalledWith('error');
      expect(opts.setErrorMsg).toHaveBeenCalledWith('未知错误');
    });
  });

  /* ========== final event ========== */

  describe('final event', () => {
    it('sets phase to done', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('final'));
      expect(opts.setPhase).toHaveBeenCalledWith('done');
    });

    it('extracts traceId from payload.traceId', async () => {
      const traceIdRef = { current: '' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceId: 'trace-abc' }));
      expect(traceIdRef.current).toBe('trace-abc');
    });

    it('falls back to payload.traceid (lowercase)', async () => {
      const traceIdRef = { current: '' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceid: 'trace-lower' }));
      expect(traceIdRef.current).toBe('trace-lower');
    });

    it('falls back to payload.trace_id (snake_case)', async () => {
      const traceIdRef = { current: '' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { trace_id: 'trace-snake' }));
      expect(traceIdRef.current).toBe('trace-snake');
    });

    it('prefers traceId over other variants', async () => {
      const traceIdRef = { current: '' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceId: 'primary', traceid: 'lower', trace_id: 'snake' }));
      expect(traceIdRef.current).toBe('primary');
    });

    it('does not overwrite traceIdRef when traceId is empty', async () => {
      const traceIdRef = { current: 'existing' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceId: '' }));
      expect(traceIdRef.current).toBe('existing');
    });

    it('does not overwrite traceIdRef when traceId is whitespace', async () => {
      const traceIdRef = { current: 'existing' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceId: '   ' }));
      expect(traceIdRef.current).toBe('existing');
    });

    it('trims whitespace from traceId', async () => {
      const traceIdRef = { current: '' };
      const { handler } = await loadHandler({ traceIdRef });
      handler(makeEvent('final', { traceId: '  trace-padded  ' }));
      expect(traceIdRef.current).toBe('trace-padded');
    });
  });

  /* ========== unknown event type ========== */

  describe('unknown event type', () => {
    it('does nothing for unrecognized event types', async () => {
      const { handler, opts } = await loadHandler();
      handler(makeEvent('unknown_type', { data: 'test' }));
      expect(opts.setPhase).not.toHaveBeenCalled();
      expect(opts.setAnswerText).not.toHaveBeenCalled();
      expect(opts.setThinkText).not.toHaveBeenCalled();
      expect(opts.setErrorMsg).not.toHaveBeenCalled();
      expect(opts.setAuthPending).not.toHaveBeenCalled();
      expect(opts.setToolCallInfo).not.toHaveBeenCalled();
    });
  });

  /* ========== consecutive events ========== */

  describe('consecutive events', () => {
    it('accumulates multiple think chunks', async () => {
      const thinkAccRef = { current: '' };
      const { handler, opts } = await loadHandler({ thinkAccRef });
      handler(makeEvent('think', { text: 'Hello ' }));
      handler(makeEvent('think', { text: 'world' }));
      expect(thinkAccRef.current).toBe('Hello world');
      expect(opts.setThinkText).toHaveBeenCalledTimes(2);
    });

    it('accumulates multiple answer chunks', async () => {
      const answerAccRef = { current: '' };
      const { handler, opts } = await loadHandler({ answerAccRef });
      handler(makeEvent('chunk', { text: 'Part 1. ' }));
      handler(makeEvent('chunk', { text: 'Part 2.' }));
      expect(answerAccRef.current).toBe('Part 1. Part 2.');
    });

    it('resets then re-accumulates after chunk_reset', async () => {
      const answerAccRef = { current: '' };
      const { handler } = await loadHandler({ answerAccRef });
      handler(makeEvent('chunk', { text: 'before' }));
      expect(answerAccRef.current).toBe('before');
      handler(makeEvent('chunk_reset'));
      expect(answerAccRef.current).toBe('');
      handler(makeEvent('chunk', { text: 'after' }));
      expect(answerAccRef.current).toBe('after');
    });
  });
});
