# @chirag127/oriz-ai-providers

Thin wrapper around **20 free LLM APIs** with priority-based fallback. OpenAI SDK-compatible.

[![npm](https://img.shields.io/npm/v/@chirag127/oriz-ai-providers.svg)](https://www.npmjs.com/package/@chirag127/oriz-ai-providers)
[![CI](https://github.com/chirag127/oriz-ai-providers-npm-pkg/actions/workflows/ci.yml/badge.svg)](https://github.com/chirag127/oriz-ai-providers-npm-pkg/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Install

```bash
pnpm add @chirag127/oriz-ai-providers
```

## Quick example

```ts
import { ai } from '@chirag127/oriz-ai-providers';

// Single-prompt completion
const r = await ai.complete({ prompt: 'Rewrite for Twitter: ...', maxTokens: 280 });
console.log(r.text, '— from', r.provider, r.model);

// Multi-turn chat
const r2 = await ai.chat([
  { role: 'system', content: 'You are concise.' },
  { role: 'user', content: 'What is Cerebras?' },
]);

// Embeddings
const e = await ai.embed('hello world');
```

## Providers

| # | Provider | Anon? | Notes |
|---|---|---|---|
| 1 | OVHcloud AI Endpoints | yes | 2 RPM/IP, EU-hosted |
| 2 | LLM7.io | yes | 30 RPM/IP, 30+ models |
| 3 | Pollinations | yes | gpt-oss-20b |
| 4 | Cerebras | no | 30 RPM + 1M TPD, ultra-fast |
| 5 | Groq | no | 30 RPM + 1K RPD, llama-3.3-70b |
| 6 | NVIDIA NIM | no | 40 RPM, phone verify |
| 7 | Google AI Studio | no | Gemini 2.5 |
| 8 | Cohere | no | Command A+ |
| 9 | GitHub Models | no | GPT-4.1 / o4-mini |
| 10 | Cloudflare Workers AI | no | 10K neurons/day |
| 11 | HuggingFace Router | no | Thousands of models |
| 12 | Mistral La Plateforme | no | Mistral Medium 3.5 / Codestral |
| 13 | SambaNova | no | DeepSeek V3.1 + Llama 3.3 70B |
| 14 | OpenRouter | no | 20 RPM + 200 RPD :free |
| 15 | Z.AI (Zhipu) | no | GLM-4.7-Flash |
| 16 | SiliconFlow | no | Qwen3-8B |
| 17 | Aion Labs | no | 15 RPM + 20K TPD |
| 18 | Ollama Cloud | no | NOT OpenAI-compatible (skipped in v0.1) |
| 19 | ModelScope | no | 2K RPD, Alibaba real-name |
| 20 | Kilo Code | no | Auto-router free models |

## Priority chain

Default order (highest first) — comes from [`priority.json`](https://github.com/chirag127/oriz-ai-providers-data/blob/main/priority.json) in the data repo:

```
ovhcloud → llm7 → pollinations → cerebras → groq → nvidia-nim →
openrouter → google-aistudio → cloudflare-workers-ai → github-models →
sambanova → huggingface → mistral → cohere → zai → siliconflow →
modelscope → aion-labs → kilo-code → ollama-cloud
```

Override per-call: `ai.complete({ prompt, preferProvider: 'cerebras' })`.

Task-tuned chains: `task: 'highVolume' | 'reasoning' | 'vision' | 'code'`.

## Environment variables

Each provider has a single env var (see [`env-vars.json`](https://github.com/chirag127/oriz-ai-providers-data/blob/main/env-vars.json)):

```
OVHCLOUD_AI_KEY            (optional — anonymous works)
LLM7_API_KEY               (optional — anonymous works)
CEREBRAS_API_KEY
GROQ_API_KEY
NVIDIA_NIM_KEY
GOOGLE_AI_STUDIO_KEY
COHERE_API_KEY
GITHUB_MODELS_TOKEN
CLOUDFLARE_AI_TOKEN + CLOUDFLARE_ACCOUNT_ID
HUGGINGFACE_TOKEN
MISTRAL_API_KEY
SAMBANOVA_API_KEY
OPENROUTER_API_KEY
ZAI_API_KEY
SILICONFLOW_API_KEY
AION_LABS_KEY
OLLAMA_CLOUD_KEY
MODELSCOPE_TOKEN
KILO_CODE_TOKEN
```

Set whichever ones you have — providers without a key are skipped in the fallback chain.

## Contributing

Code lives here. Provider / model / rate-limit data lives in [`chirag127/oriz-ai-providers-data`](https://github.com/chirag127/oriz-ai-providers-data) (CC0-licensed).

- To add a provider: open a PR on the data repo with a new entry in `providers.json` + `models.json` + `env-vars.json` + (optionally) `priority.json`. Then open a PR here with a new `src/providers/<slug>.ts` adapter (usually 2 lines via the factory).
- To fix a rate limit: PR the data repo only — no code release needed.

## License

MIT. See [LICENSE](./LICENSE).
