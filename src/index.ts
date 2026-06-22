// @chirag127/oriz-ai-providers v0.1.0
// Thin wrapper around 20 free LLM APIs with priority-based fallback.
import type {
  ChatMessage,
  CompleteOptions,
  ChatOptions,
  EmbedOptions,
  AiResult,
  EmbedResult,
} from './types.js';
import { loadData } from './data-loader.js';
import { runFallback } from './fallback.js';

export const __pkg = '@chirag127/oriz-ai-providers' as const;
export const __version = '0.1.0' as const;

export type {
  ChatMessage,
  CompleteOptions,
  ChatOptions,
  EmbedOptions,
  AiResult,
  EmbedResult,
  Provider,
  Model,
  Priority,
  DataBundle,
  Adapter,
} from './types.js';

export { loadData } from './data-loader.js';
export { runFallback, buildChain } from './fallback.js';
export { adapters } from './providers/index.js';

export const ai = {
  async complete(opts: CompleteOptions): Promise<AiResult> {
    const data = await loadData();
    return runFallback({
      data,
      messages: [{ role: 'user', content: opts.prompt }],
      model: opts.model,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
      preferProvider: opts.preferProvider,
      task: opts.task,
    });
  },

  async chat(messages: ChatMessage[], opts: ChatOptions = {}): Promise<AiResult> {
    const data = await loadData();
    return runFallback({
      data,
      messages,
      model: opts.model,
      maxTokens: opts.maxTokens,
      temperature: opts.temperature,
      preferProvider: opts.preferProvider,
      task: opts.task,
    });
  },

  async embed(text: string, opts: EmbedOptions = {}): Promise<EmbedResult> {
    const data = await loadData();
    const slug = opts.preferProvider ?? 'huggingface';
    const provider = data.providers.find(p => p.slug === slug);
    if (!provider) throw new Error(`Unknown provider: ${slug}`);
    const envName = data.envVars[slug];
    const apiKey = envName ? process.env[envName] : undefined;
    if (provider.requiresKey && !apiKey) throw new Error(`Missing ${envName} for ${slug}`);
    const model = opts.model ?? 'BAAI/bge-large-en-v1.5';
    const res = await fetch(`${provider.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ input: text, model }),
    });
    if (!res.ok) throw new Error(`Embed failed: HTTP ${res.status}`);
    const json: any = await res.json();
    return {
      embedding: json?.data?.[0]?.embedding ?? [],
      provider: slug,
      model,
    };
  },
};
