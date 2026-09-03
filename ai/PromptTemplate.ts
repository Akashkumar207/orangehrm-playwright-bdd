import fs from 'node:fs';

/** Loads a prompt template file and fills in every `{{placeholder}}` token. */
export function renderPrompt(templatePath: string, values: Record<string, string>): string {
  const template = fs.readFileSync(templatePath, 'utf-8');
  return Object.entries(values).reduce((text, [key, value]) => text.split(`{{${key}}}`).join(value), template);
}
