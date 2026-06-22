// Fallback driver — pick highest-priority provider with a configured env var,
// call its OpenAI-compatible chat/completions endpoint, retry next on 429/5xx.
import type { ChatMessage, AiResult, DataBundle } from './types.js';
import { adapters } from './providers/index.js';

export interface FallbackOpts {
  data: DataBundle;
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  preferProvider?: string;
  task?: 'default' | 'highVolume' | 'reasoning' | 'vision' | 'code';
  env?: Record<string, string | undefined>;
  fetchImpl?: typeof fetch;
}

export function buildChain(data: DataBundle, opts: Pick<FallbackOpts, 'preferProvider' | 'task'>): string[] {
  const task = opts.task ?? 'default';
  const base = data.priority[task] ?? data.priority.default;
  if (!opts.preferProvider) return base;
  return [opts.preferProvider, ...base.filter(s => s !== opts.preferProvider)];
}

export function pickModel(data: DataBundle, providerSlug: string, requested?: string): string | undefined {
  if (requested) return requested;
  const m = data.models.find(m => m.provider === providerSlug);
  return m?.slug;
}

export function isRetryable(status: number): boolean {
  return status === 429 || status >= 500;
}

export async function runFallback(opts: FallbackOpts): Promise<AiResult> {
  const env = opts.env ?? (typeof process !== 'undefined' ? process.env : {});
  const f = opts.fetchImpl ?? fetch;
  const chain = buildChain(opts.data, opts);
  const errors: string[] = [];

  for (const slug of chain) {
    const provider = opts.data.providers.find(p => p.slug === slug);
    const adapter = adapters[slug];
    if (!provider || !adapter) continue;
    const envName = opts.data.envVars[slug];
    const apiKey = envName ? env[envName] : undefined;
    if (provider.requiresKey && !apiKey) {
      errors.push(`${slug}: missing ${envName}`);
      continue;
    }
    if (!adapter.isOpenAiCompatible) {
      errors.push(`${slug}: not OpenAI-compatible (skipped in v0.1)`);
      continue;
    }
    const model = pickModel(opts.data, slug, opts.model);
    if (!model) { errors.push(`${slug}: no model`); continue; }

    let url = `${provider.baseUrl}/chat/completions`;
    if (slug === 'cloudflare-workers-ai') {
      const accountId = env.CLOUDFLARE_ACCOUNT_ID;
      if (!accountId) { errors.push('cloudflare-workers-ai: missing CLOUDFLARE_ACCOUNT_ID'); continue; }
      url = url.replace('{account_id}', accountId);
    }

    try {
      const res = await f(url, {
        method: 'POST',
        headers: adapter.buildHeaders(apiKey),
        body: JSON.stringify({
          model,
          messages: opts.messages,
          max_tokens: opts.maxTokens,
          temperature: opts.temperature,
        }),
      });
      if (!res.ok) {
        errors.push(`${slug}: HTTP ${res.status}`);
        if (isRetryable(res.status)) continue;
        continue;
      }
      const json: any = await res.json();
      const text = json?.choices?.[0]?.message?.content ?? '';
      return {
        text,
        provider: slug,
        model,
        tokensUsed: json?.usage?.total_tokens,
      };
    } catch (e: any) {
      errors.push(`${slug}: ${e?.message ?? String(e)}`);
      continue;
    }
  }
  throw new Error(`All providers failed:\n${errors.join('\n')}`);
}
