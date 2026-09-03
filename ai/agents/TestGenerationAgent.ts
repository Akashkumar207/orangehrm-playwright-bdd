import path from 'node:path';
import { createAIClient, type AIClient } from '../AIClient';
import { renderPrompt } from '../PromptTemplate';

const PROMPT_PATH = path.join(__dirname, '../prompts/test-generation.prompt.md');

export interface TestGenerationRequest {
  requirement: string;
  acceptanceCriteria: string[];
}

export interface TestGenerationResult {
  /** Draft Gherkin text — a human reviews and edits this before it becomes a real .feature file. */
  suggestedFeature: string;
}

/**
 * Drafts a Gherkin feature from a plain-English requirement. It never
 * writes to features/ itself: the output is a starting point for a human
 * to review, edit, and save — see README "Human-in-the-Loop" for why an
 * agent must not become production test automation unattended.
 */
export class TestGenerationAgent {
  constructor(private readonly client: AIClient = createAIClient()) {}

  async generate(request: TestGenerationRequest): Promise<TestGenerationResult> {
    const prompt = renderPrompt(PROMPT_PATH, {
      requirement: request.requirement,
      acceptanceCriteria: request.acceptanceCriteria.map((criterion) => `- ${criterion}`).join('\n'),
    });

    const suggestedFeature = await this.client.complete(prompt);
    return { suggestedFeature };
  }
}
