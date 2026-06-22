// Adapter registry — slug → Adapter
import type { Adapter } from '../types.js';
import ovhcloud from './ovhcloud.js';
import llm7 from './llm7.js';
import pollinations from './pollinations.js';
import cerebras from './cerebras.js';
import groq from './groq.js';
import nvidiaNim from './nvidia-nim.js';
import googleAistudio from './google-aistudio.js';
import cohere from './cohere.js';
import githubModels from './github-models.js';
import cloudflareWorkersAi from './cloudflare-workers-ai.js';
import huggingface from './huggingface.js';
import mistral from './mistral.js';
import sambanova from './sambanova.js';
import openrouter from './openrouter.js';
import zai from './zai.js';
import siliconflow from './siliconflow.js';
import aionLabs from './aion-labs.js';
import ollamaCloud from './ollama-cloud.js';
import modelscope from './modelscope.js';
import kiloCode from './kilo-code.js';

export const adapters: Record<string, Adapter> = {
  ovhcloud,
  llm7,
  pollinations,
  cerebras,
  groq,
  'nvidia-nim': nvidiaNim,
  'google-aistudio': googleAistudio,
  cohere,
  'github-models': githubModels,
  'cloudflare-workers-ai': cloudflareWorkersAi,
  huggingface,
  mistral,
  sambanova,
  openrouter,
  zai,
  siliconflow,
  'aion-labs': aionLabs,
  'ollama-cloud': ollamaCloud,
  modelscope,
  'kilo-code': kiloCode,
};
