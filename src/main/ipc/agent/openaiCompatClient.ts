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
 * @file openaiCompatClient.ts
 * @description 通用 OpenAI 兼容流式 HTTP/HTTPS 客户端，供自定义 API 直连模式使用。
 * @author 鸡哥
 */

import http from 'http';
import https from 'https';

const CHAT_COMPLETIONS_PATH = '/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 120_000;

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatRequest {
  model: string;
  messages: OpenAIChatMessage[];
  stream?: boolean;
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  baseUrl: string;
  apiKey: string;
  signal?: AbortSignal;
}

export interface OpenAIStreamDelta {
  content?: string;
  reasoning_content?: string;
  role?: string;
}

export interface OpenAIStreamChoice {
  index: number;
  delta: OpenAIStreamDelta;
  finish_reason: string | null;
}

export interface OpenAIStreamChunk {
  id?: string;
  object?: string;
  model?: string;
  choices: OpenAIStreamChoice[];
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface OpenAIStreamCallbacks {
  onChunk?: (text: string) => void;
  onThinkChunk?: (text: string) => void;
  onDone?: (fullText: string, usage?: OpenAIStreamChunk['usage']) => void;
  onError?: (error: Error) => void;
}

/**
 * 解析 baseUrl，确定正确的 completions 路径。
 * 如果 baseUrl 已包含路径（如 /v1），则追加 /chat/completions。
 */
function resolveCompletionsUrl(baseUrl: string): URL {
  const trimmed = baseUrl.replace(/\/+$/, '');
  if (trimmed.endsWith('/chat/completions')) {
    return new URL(trimmed);
  }
  if (trimmed.endsWith('/v1')) {
    return new URL(trimmed + '/chat/completions');
  }
  // 默认追加 /v1/chat/completions
  return new URL(trimmed + CHAT_COMPLETIONS_PATH);
}

/**
 * 向 OpenAI 兼容 API 发起流式 Chat Completion 请求。
 * 支持 http 和 https 协议，支持 API Key 认证。
 */
export function streamOpenAIChat(
  request: OpenAIChatRequest,
  callbacks: OpenAIStreamCallbacks,
): { abort: () => void } {
  const url = resolveCompletionsUrl(request.baseUrl);
  const isHttps = url.protocol === 'https:';
  const httpModule = isHttps ? https : http;
  const defaultPort = isHttps ? '443' : '80';

  const payload = JSON.stringify({
    model: request.model,
    messages: request.messages,
    stream: request.stream !== false,
    stream_options: request.stream !== false ? { include_usage: true } : undefined,
    temperature: request.temperature,
    top_p: request.top_p,
    max_tokens: request.max_tokens,
  });

  let aborted = false;
  let fullText = '';
  let lastUsage: OpenAIStreamChunk['usage'] | undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'text/event-stream',
  };
  if (request.apiKey) {
    headers['Authorization'] = `Bearer ${request.apiKey}`;
  }

  const req = httpModule.request(
    {
      hostname: url.hostname,
      port: url.port || defaultPort,
      path: url.pathname + url.search,
      method: 'POST',
      headers,
      timeout: REQUEST_TIMEOUT_MS,
    },
    (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        let errBody = '';
        res.setEncoding('utf8');
        res.on('data', (chunk: string) => {
          errBody += chunk;
        });
        res.on('end', () => {
          if (!aborted) {
            callbacks.onError?.(
              new Error(`API 请求失败 (${res.statusCode}): ${errBody || 'unknown error'}`),
            );
          }
        });
        return;
      }

      let buffer = '';
      res.setEncoding('utf8');

      res.on('data', (chunk: string) => {
        if (aborted) return;
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          const dataPrefix = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed;
          if (dataPrefix === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(dataPrefix) as OpenAIStreamChunk;
            if (parsed.usage) {
              lastUsage = parsed.usage;
            }
            const delta = parsed.choices?.[0]?.delta;
            if (delta?.reasoning_content) {
              callbacks.onThinkChunk?.(delta.reasoning_content);
            }
            if (delta?.content) {
              fullText += delta.content;
              callbacks.onChunk?.(delta.content);
            }
            if (parsed.choices?.[0]?.finish_reason) {
              // stream complete
            }
          } catch {
            // 跳过无法解析的行
          }
        });
      });

      res.on('end', () => {
        if (aborted) return;
        if (buffer.trim()) {
          const dataPrefix = buffer.trim().startsWith('data: ')
            ? buffer.trim().slice(6)
            : buffer.trim();
          if (dataPrefix !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataPrefix) as OpenAIStreamChunk;
              if (parsed.usage) lastUsage = parsed.usage;
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.reasoning_content) {
                callbacks.onThinkChunk?.(delta.reasoning_content);
              }
              if (delta?.content) {
                fullText += delta.content;
                callbacks.onChunk?.(delta.content);
              }
            } catch {
              // ignore
            }
          }
        }
        callbacks.onDone?.(fullText, lastUsage);
      });

      res.on('error', (err) => {
        if (!aborted) {
          callbacks.onError?.(err);
        }
      });
    },
  );

  req.on('error', (err) => {
    if (!aborted) {
      callbacks.onError?.(err);
    }
  });

  req.on('timeout', () => {
    req.destroy();
    if (!aborted) {
      callbacks.onError?.(new Error('API 请求超时'));
    }
  });

  if (request.signal) {
    request.signal.addEventListener('abort', () => {
      aborted = true;
      req.destroy();
    });
  }

  req.write(payload);
  req.end();

  return {
    abort: (): void => {
      aborted = true;
      req.destroy();
    },
  };
}
