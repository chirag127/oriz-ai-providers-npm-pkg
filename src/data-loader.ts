// Fetch + cache provider/model/priority/env-var data from the data repo.
// Cached 24h in-memory. Bundled fallback data ships with the package so
// the loader never fails offline.
import type { DataBundle, Provider, Model, Priority } from './types.js';
import bundledProviders from './data/providers.json' with { type: 'json' };
import bundledModels from './data/models.json' with { type: 'json' };
import bundledPriority from './data/priority.json' with { type: 'json' };
import bundledEnvVars from './data/env-vars.json' with { type: 'json' };

const DATA_BASE =
  'https://raw.githubusercontent.com/chirag127/oriz-ai-providers-data/main';
const TTL_MS = 24 * 60 * 60 * 1000;

let cached: { at: number; data: DataBundle } | null = null;

const bundled: DataBundle = {
  providers: bundledProviders as Provider[],
  models: bundledModels as Model[],
  priority: bundledPriority as Priority,
  envVars: bundledEnvVars as Record<string, string>,
};

export async function loadData(opts: { force?: boolean } = {}): Promise<DataBundle> {
  if (!opts.force && cached && Date.now() - cached.at < TTL_MS) return cached.data;
  try {
    const [providers, models, priority, envVars] = await Promise.all([
      fetch(`${DATA_BASE}/providers.json`).then(r => r.json()),
      fetch(`${DATA_BASE}/models.json`).then(r => r.json()),
      fetch(`${DATA_BASE}/priority.json`).then(r => r.json()),
      fetch(`${DATA_BASE}/env-vars.json`).then(r => r.json()),
    ]);
    cached = { at: Date.now(), data: { providers, models, priority, envVars } };
    return cached.data;
  } catch {
    // Offline / fetch failed → use bundled snapshot
    cached = { at: Date.now(), data: bundled };
    return bundled;
  }
}

export function getBundled(): DataBundle {
  return bundled;
}
