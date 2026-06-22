// Adapter factory. Most providers are OpenAI-compatible — they need only a
// base URL + a Bearer token. A few have quirks: Cloudflare needs account_id
// substitution, Ollama Cloud has its own /api/chat schema, Cohere uses a
// compatibility endpoint identical to OpenAI's.
import type { Adapter } from '../types.js';

export function bearerAdapter(slug: string): Adapter {
  return {
    slug,
    isOpenAiCompatible: true,
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    }),
  };
}

export function anonymousAdapter(slug: string): Adapter {
  return {
    slug,
    isOpenAiCompatible: true,
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
  };
}
