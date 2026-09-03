import 'dotenv/config';

/**
 * Configuration for the Agentic AI layer. Every agent is optional — the
 * test framework runs completely fine with none of this configured. It
 * only activates when someone deliberately sets AI_API_KEY to investigate
 * a failure, draft a feature from a requirement, etc.
 */
export const aiConfig = {
  provider: process.env.AI_PROVIDER ?? 'anthropic',
  apiKey: process.env.AI_API_KEY,
  model: process.env.AI_MODEL ?? 'claude-sonnet-5',
  enabled: Boolean(process.env.AI_API_KEY),
};
