import { beforeEach, describe, expect, it, vi } from 'vitest';

const { handleMock } = vi.hoisted(() => ({
  handleMock: vi.fn(),
}));

const {
  pingOllamaMock,
  listOllamaModelsMock,
  detectOllamaBaseUrlMock,
  orchestrateOllamaChatMock,
  orchestrateCustomDirectChatMock,
} = vi.hoisted(() => ({
  pingOllamaMock: vi.fn(),
  listOllamaModelsMock: vi.fn(),
  detectOllamaBaseUrlMock: vi.fn(),
  orchestrateOllamaChatMock: vi.fn(),
  orchestrateCustomDirectChatMock: vi.fn(),
}));

vi.mock('electron', () => ({
  ipcMain: {
    handle: handleMock,
  },
}));

vi.mock('../ollamaClient', () => ({
  pingOllama: pingOllamaMock,
  listOllamaModels: listOllamaModelsMock,
  detectOllamaBaseUrl: detectOllamaBaseUrlMock,
}));

vi.mock('../ollamaOrchestrator', () => ({
  orchestrateOllamaChat: orchestrateOllamaChatMock,
}));

vi.mock('../customDirectOrchestrator', () => ({
  orchestrateCustomDirectChat: orchestrateCustomDirectChatMock,
}));

import { registerAgentIpcHandlers } from '../index';
import { registerAgentLocalToolIpcHandlers } from '../localToolIpc';
import { registerOllamaIpcHandlers } from '../ollamaIpc';

describe('agent ipc handlers', () => {
  const handleHandlers = new Map<string, (...args: unknown[]) => unknown>();

  beforeEach(() => {
    handleHandlers.clear();
    handleMock.mockReset();
    pingOllamaMock.mockReset();
    listOllamaModelsMock.mockReset();
    detectOllamaBaseUrlMock.mockReset();
    orchestrateOllamaChatMock.mockReset();
    orchestrateCustomDirectChatMock.mockReset();

    handleMock.mockImplementation((channel: string, handler: (...args: unknown[]) => unknown) => {
      handleHandlers.set(channel, handler);
    });
  });

  it('handles agent local tool execute success and error', async () => {
    const executeAgentLocalTool = vi.fn().mockResolvedValue({
      success: true,
      result: { ok: 1 },
      error: '',
      durationMs: 8,
    });

    registerAgentLocalToolIpcHandlers({ executeAgentLocalTool });

    const handler = handleHandlers.get('agent:local-tool:execute');
    await expect(handler?.({}, { tool: 'x' })).resolves.toEqual({
      success: true,
      result: { ok: 1 },
      error: '',
      durationMs: 8,
    });

    executeAgentLocalTool.mockRejectedValueOnce(new Error('execute failed'));
    await expect(handler?.({}, { tool: 'x' })).resolves.toEqual({
      success: false,
      result: {},
      error: 'execute failed',
      durationMs: 0,
    });
  });

  it('registers both local-tool and ollama handler groups via entrypoint', () => {
    registerAgentIpcHandlers({
      executeAgentLocalTool: vi.fn().mockResolvedValue({
        success: true,
        result: {},
        error: '',
        durationMs: 1,
      }),
    });

    expect(handleHandlers.has('agent:local-tool:execute')).toBe(true);
    expect(handleHandlers.has('ollama:ping')).toBe(true);
    expect(handleHandlers.has('ollama:chat:start')).toBe(true);
    expect(handleHandlers.has('customDirect:chat:start')).toBe(true);
  });

  it('returns fallbacks when ollama base handlers throw', async () => {
    registerOllamaIpcHandlers({
      executeAgentLocalTool: vi.fn(),
    });

    const pingHandler = handleHandlers.get('ollama:ping');
    const modelsHandler = handleHandlers.get('ollama:models');
    const detectHandler = handleHandlers.get('ollama:detectBaseUrl');

    pingOllamaMock.mockResolvedValueOnce(true).mockRejectedValueOnce(new Error('down'));
    await expect(pingHandler?.({}, 'http://localhost:11434')).resolves.toBe(true);
    await expect(pingHandler?.({}, 'http://localhost:11434')).resolves.toBe(false);

    listOllamaModelsMock.mockResolvedValueOnce(['qwen']).mockRejectedValueOnce(new Error('down'));
    await expect(modelsHandler?.({}, 'http://localhost:11434')).resolves.toEqual(['qwen']);
    await expect(modelsHandler?.({}, 'http://localhost:11434')).resolves.toEqual([]);

    detectOllamaBaseUrlMock.mockResolvedValueOnce('http://127.0.0.1:11434').mockRejectedValueOnce(new Error('down'));
    await expect(detectHandler?.({})).resolves.toBe('http://127.0.0.1:11434');
    await expect(detectHandler?.({})).resolves.toBeNull();
  });

  it('starts chat orchestration and supports abort lifecycle', async () => {
    const executeLocalTool = vi.fn();
    registerOllamaIpcHandlers({ executeAgentLocalTool: executeLocalTool });

    const sender = {
      isDestroyed: vi.fn(() => false),
      send: vi.fn(),
    };

    const startHandler = handleHandlers.get('ollama:chat:start');
    const abortHandler = handleHandlers.get('ollama:chat:abort');

    orchestrateOllamaChatMock.mockRejectedValueOnce(new Error('orchestrator boom'));

    expect(
      startHandler?.(
        { sender },
        's1',
        {
          model: 'qwen2.5',
          systemPrompt: 'system',
          userMessage: 'hi',
        },
      ),
    ).toEqual({ started: true, sessionId: 's1' });

    await Promise.resolve();
    await Promise.resolve();

    expect(sender.send).toHaveBeenCalledWith(
      'ollama:chat:event:s1',
      expect.objectContaining({
        type: 'error',
        payload: expect.objectContaining({
          code: 'ORCHESTRATOR_ERROR',
          message: 'orchestrator boom',
        }),
      }),
    );

    orchestrateOllamaChatMock.mockImplementationOnce(() => new Promise(() => {}));
    startHandler?.(
      { sender },
      's2',
      {
        model: 'qwen2.5',
        systemPrompt: 'system',
        userMessage: 'hi',
      },
    );

    expect(abortHandler?.({}, 's2')).toEqual({ aborted: true });
    expect(abortHandler?.({}, 's2')).toEqual({ aborted: false });

    expect(orchestrateOllamaChatMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'qwen2.5',
        signal: expect.any(Object),
      }),
      expect.objectContaining({
        executeLocalTool,
      }),
    );
  });

  it('starts custom direct chat orchestration', () => {
    registerOllamaIpcHandlers({
      executeAgentLocalTool: vi.fn(),
    });

    orchestrateCustomDirectChatMock.mockResolvedValueOnce(undefined);

    const customStartHandler = handleHandlers.get('customDirect:chat:start');
    const sender = {
      isDestroyed: vi.fn(() => false),
      send: vi.fn(),
    };

    expect(
      customStartHandler?.(
        { sender },
        'cd1',
        {
          model: 'minimax-2.5',
          systemPrompt: 'system',
          userMessage: 'hello',
          baseUrl: 'https://api.example.com',
          apiKey: 'k',
          temperature: 0.5,
        },
      ),
    ).toEqual({ started: true, sessionId: 'cd1' });

    expect(orchestrateCustomDirectChatMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'minimax-2.5',
        apiKey: 'k',
        baseUrl: 'https://api.example.com',
      }),
      expect.objectContaining({
        executeLocalTool: expect.any(Function),
      }),
    );
  });
});
