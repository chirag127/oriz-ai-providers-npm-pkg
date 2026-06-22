import type { Adapter } from '../types.js';
// Cloudflare's REST URL contains {account_id}. The fallback driver substitutes
// process.env.CLOUDFLARE_ACCOUNT_ID before fetch().
const adapter: Adapter = {
  slug: 'cloudflare-workers-ai',
  isOpenAiCompatible: true,
  buildHeaders: (apiKey) => ({
    'Content-Type': 'application/json',
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
  }),
};
export default adapter;
