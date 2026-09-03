import { aiConfig } from './config/ai.config';

/** A minimal, provider-agnostic contract every agent depends on. */
export interface AIClient {
  complete(prompt: string): Promise<string>;
}

/**
 * The framework ships with no live LLM call wired up on purpose — there is
 * no committed API key, and every agent's output is meant to be a
 * human-reviewed recommendation (see README "Human-in-the-Loop"), not
 * something that should silently run unattended in CI. Calling an agent
 * without AI_API_KEY configured fails loudly and explains what to do,
 * rather than returning fabricated output.
 */
export class UnconfiguredAIClient implements AIClient {
  async complete(): Promise<string> {
    throw new Error(
      'No AI provider is configured. Set AI_API_KEY (and optionally AI_PROVIDER / AI_MODEL) in .env, ' +
        'then implement a real provider call in ai/AIClient.ts (e.g. the Anthropic or OpenAI SDK).',
    );
  }
}

/**
 * Returns the configured AIClient. Currently always returns the
 * unconfigured stub — swap in a real implementation here (constructed from
 * aiConfig) once a provider is actually wired up.
 */
export function createAIClient(): AIClient {
  if (!aiConfig.enabled) {
    return new UnconfiguredAIClient();
  }

  // Real provider wiring goes here, e.g.:
  //   return new AnthropicAIClient(aiConfig);
  return new UnconfiguredAIClient();
}
