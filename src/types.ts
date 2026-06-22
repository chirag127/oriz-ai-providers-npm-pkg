// @chirag127/oriz-ai-providers — shared types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompleteOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  preferProvider?: string;
  fallback?: boolean;
  task?: 'default' | 'highVolume' | 'reasoning' | 'vision' | 'code';
}

export interface ChatOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  preferProvider?: string;
  fallback?: boolean;
  task?: 'default' | 'highVolume' | 'reasoning' | 'vision' | 'code';
}

export interface EmbedOptions {
  model?: string;
  preferProvider?: string;
}

export interface AiResult {
  text: string;
  provider: string;
  model: string;
  tokensUsed?: number;
}

export interface EmbedResult {
  embedding: number[];
  provider: string;
  model: string;
}

export interface Provider {
  slug: string;
  name: string;
  country: string;
  baseUrl: string;
  signupUrl: string;
  requiresKey: boolean;
  requiresPhoneVerification: boolean;
  requiresCard: boolean;
  dataUsedForTraining: boolean;
}

export interface Model {
  slug: string;
  provider: string;
  contextWindow: number;
  maxOutput: number;
  modality: 'text' | 'multimodal' | 'code';
  rateLimit: { rpm: number | null; rpd: number | null; tpd: number | null };
  family: string;
}

export interface Priority {
  default: string[];
  highVolume: string[];
  reasoning: string[];
  vision: string[];
  code: string[];
}

export interface DataBundle {
  providers: Provider[];
  models: Model[];
  priority: Priority;
  envVars: Record<string, string>;
}

export interface Adapter {
  slug: string;
  buildHeaders(apiKey: string | undefined): Record<string, string>;
  isOpenAiCompatible: boolean;
}
