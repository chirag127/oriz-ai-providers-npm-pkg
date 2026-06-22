import { describe, it, expect } from 'vitest';
import { buildChain, runFallback, pickModel, isRetryable } from '../fallback.js';
import { getBundled } from '../data-loader.js';
import type { DataBundle } from '../types.js';

const data: DataBundle = getBundled();

describe('buildChain', () => {
  it('returns the default priority order when no preferProvider', () => {
    const chain = buildChain(data, { task: 'default' });
    expect(chain[0]).toBe('ovhcloud');
    expect(chain).toContain('groq');
  });

  it('puts preferProvider first', () => {
    const chain = buildChain(data, { task: 'default', preferProvider: 'cerebras' });
    expect(chain[0]).toBe('cerebras');
    expect(chain.filter(s => s === 'cerebras')).toHaveLength(1);
  });
});

describe('pickModel', () => {
  it('picks first model for a provider when none requested', () => {
    const m = pickModel(data, 'groq');
    expect(m).toBeTruthy();
    expect(m).toContain('llama');
  });

  it('returns requested model verbatim', () => {
    expect(pickModel(data, 'groq', 'foo/bar')).toBe('foo/bar');
  });
});

describe('isRetryable', () => {
  it('429 and 5xx are retryable; 400/401 are not', () => {
    expect(isRetryable(429)).toBe(true);
    expect(isRetryable(500)).toBe(true);
    expect(isRetryable(503)).toBe(true);
    expect(isRetryable(400)).toBe(false);
    expect(isRetryable(401)).toBe(false);
  });
});

describe('runFallback', () => {
  it('happy path — first provider returns', async () => {
    const fetchMock = async (_url: any, _init: any) => ({
      ok: true,
      status: 200,
      json: async () => ({
        choices: [{ message: { content: 'hi from ovh' } }],
        usage: { total_tokens: 4 },
      }),
    }) as any;
    const r = await runFallback({
      data,
      messages: [{ role: 'user', content: 'hi' }],
      fetchImpl: fetchMock,
      env: {},
    });
    expect(r.text).toBe('hi from ovh');
    expect(r.provider).toBe('ovhcloud');
    expect(r.tokensUsed).toBe(4);
  });

  it('falls back on 429 to next provider', async () => {
    let calls = 0;
    const fetchMock = async (_url: any, _init: any) => {
      calls++;
      if (calls === 1) return { ok: false, status: 429, json: async () => ({}) } as any;
      return {
        ok: true,
        status: 200,
        json: async () => ({ choices: [{ message: { content: 'hi from llm7' } }] }),
      } as any;
    };
    const r = await runFallback({
      data,
      messages: [{ role: 'user', content: 'hi' }],
      fetchImpl: fetchMock,
      env: {},
    });
    expect(calls).toBeGreaterThanOrEqual(2);
    expect(r.provider).toBe('llm7');
    expect(r.text).toBe('hi from llm7');
  });

  it('throws when all providers fail', async () => {
    const fetchMock = async () => ({ ok: false, status: 500, json: async () => ({}) }) as any;
    await expect(
      runFallback({
        data,
        messages: [{ role: 'user', content: 'hi' }],
        fetchImpl: fetchMock,
        env: {},
      })
    ).rejects.toThrow(/All providers failed/);
  });
});
