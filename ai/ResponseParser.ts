/**
 * Extracts `KEY: value` lines from a model response into an object, for
 * agents that ask the model to reply in a fixed line-based format (see the
 * "Output format" section of each ai/prompts/*.prompt.md file). A key
 * missing from the response is simply absent from the result — callers
 * decide how to handle that, they never receive a fabricated value.
 */
export function parseFields(response: string, keys: string[]): Partial<Record<string, string>> {
  const result: Partial<Record<string, string>> = {};

  for (const key of keys) {
    const match = new RegExp(`^${key}:\\s*(.+)$`, 'im').exec(response);
    if (match) {
      result[key] = match[1].trim();
    }
  }

  return result;
}
