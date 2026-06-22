import type { Adapter } from '../types.js';
// Ollama Cloud is NOT OpenAI-compatible — uses /api/chat with `{model, messages, stream}`.
// The fallback driver checks isOpenAiCompatible=false and routes through a
// dedicated Ollama call path (not implemented in v0.1.0; provider is registered
// for slug-only completeness).
const adapter: Adapter = {
  slug: 'ollama-cloud',
  isOpenAiCompatible: false,
  buildHeaders: (apiKey) => ({
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }),
};
export default adapter;
